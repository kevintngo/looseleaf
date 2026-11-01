import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { REPO_ROOT, addressToName } from './config.mjs'
import { classifySpecifier, isCodeFile, scanImports } from './parse.mjs'
import { validateRegistry, validateRegistryItem } from './jsonschema.mjs'

const KB = 1024
export const SIZE_WARN = 400 * KB
export const SIZE_FAIL = 5 * 1024 * KB

export function aliasKeyForFile(file) {
  const t = file.target
  let key
  if (t?.startsWith('@ui/')) key = `components/ui/${t.slice(4)}`
  else if (t?.startsWith('@lib/')) key = `lib/${t.slice(5)}`
  else if (t?.startsWith('@hooks/')) key = `hooks/${t.slice(7)}`
  else if (t?.startsWith('@components/')) key = `components/${t.slice(12)}`
  else key = (t ?? file.path).replace(/^src\//, '')
  return key.replace(/\.(tsx?|jsx?|mjs|mts)$/, '')
}

let zodSchemas
async function loadCliSchemas() {
  if (zodSchemas !== undefined) return zodSchemas
  try {
    zodSchemas = await import(pathToFileURL(path.join(REPO_ROOT, 'node_modules', 'shadcn', 'dist', 'schema', 'index.js')).href)
  } catch {
    zodSchemas = null
  }
  return zodSchemas
}

export async function validateBuilt({ outDir, cfg }) {
  const errors = []
  const warnings = []
  const items = new Map()
  const sizes = {}

  const catalogFile = path.join(outDir, 'registry.json')
  if (!existsSync(catalogFile)) return { errors: [`${catalogFile} is missing (did shadcn build run?)`], warnings, items, sizes }
  const catalog = JSON.parse(readFileSync(catalogFile, 'utf8'))
  errors.push(...validateRegistry(catalog).map((e) => `registry.json ${e}`))

  const cli = await loadCliSchemas()
  if (cli) {
    const r = cli.registrySchema.safeParse(catalog)
    if (!r.success) errors.push(...r.error.issues.map((i) => `registry.json (shadcn zod) ${i.path.join('.')}: ${i.message}`))
  } else warnings.push('shadcn/schema could not be imported; skipped the CLI-side (zod) validation')

  for (const entry of catalog.items ?? []) {
    const file = path.join(outDir, `${entry.name}.json`)
    if (!existsSync(file)) {
      errors.push(`${entry.name}: ${path.basename(file)} was not built`)
      continue
    }
    const raw = readFileSync(file, 'utf8')
    sizes[entry.name] = Buffer.byteLength(raw)
    let item
    try {
      item = JSON.parse(raw)
    } catch (e) {
      errors.push(`${entry.name}.json: invalid JSON (${e.message})`)
      continue
    }
    items.set(entry.name, item)
    errors.push(...validateRegistryItem(item).map((e) => `${entry.name}.json ${e}`))
    if (cli) {
      const r = cli.registryItemSchema.safeParse(item)
      if (!r.success) errors.push(...r.error.issues.map((i) => `${entry.name}.json (shadcn zod) ${i.path.join('.')}: ${i.message}`))
    }
    if (sizes[entry.name] > SIZE_FAIL) errors.push(`${entry.name}.json is ${(sizes[entry.name] / KB / 1024).toFixed(1)} MB (limit ${SIZE_FAIL / KB / 1024} MB); split the item or shrink the textures`)
    else if (sizes[entry.name] > SIZE_WARN) warnings.push(`${entry.name}.json is ${Math.round(sizes[entry.name] / KB)} KB (consider splitting or shrinking baked textures)`)
    if (item.name !== entry.name) errors.push(`${entry.name}.json: name inside the file is "${item.name}"`)
  }

  for (const item of items.values()) {
    for (const f of item.files ?? []) {
      if (typeof f.content !== 'string' || f.content.length === 0) errors.push(`${item.name}: ${f.path} has no content`)
      else if (f.content.includes('\u0000')) errors.push(`${item.name}: ${f.path} contains NUL bytes (binary); registry files must be text`)
      if (/^([a-zA-Z]:)?[\\/]/.test(f.path) || f.path.split(/[\\/]/).includes('..')) errors.push(`${item.name}: unsafe file path ${f.path}`)
    }
  }

  const deps = new Map()
  for (const item of items.values()) {
    const local = []
    for (const addr of item.registryDependencies ?? []) {
      const name = addressToName(addr, cfg)
      if (name === null) {
        warnings.push(`${item.name}: registryDependency "${addr}" does not point at this registry (base ${cfg.registryUrl}, mode ${cfg.depsMode})`)
      } else if (!items.has(name)) {
        errors.push(`${item.name}: registryDependency "${addr}" names "${name}", which is not an item of this registry`)
      } else local.push(name)
    }
    deps.set(item.name, local)
  }
  const state = new Map()
  const stack = []
  const visit = (n) => {
    if (state.get(n) === 2) return
    if (state.get(n) === 1) {
      warnings.push(`registryDependencies cycle: ${[...stack.slice(stack.indexOf(n)), n].join(' -> ')} (the CLI copes, but the items can only be installed together)`)
      return
    }
    state.set(n, 1)
    stack.push(n)
    for (const d of deps.get(n) ?? []) visit(d)
    stack.pop()
    state.set(n, 2)
  }
  for (const n of deps.keys()) visit(n)

  if (items.has('looseleaf')) {
    const inUmbrella = new Set()
    const collect = (n) => {
      if (inUmbrella.has(n)) return
      inUmbrella.add(n)
      for (const d of deps.get(n) ?? []) collect(d)
    }
    collect('looseleaf')
    const left = [...items.values()].filter((i) => !inUmbrella.has(i.name) && i.name !== 'looseleaf-blocks' && i.type !== 'registry:block' && i.name !== 'utils').map((i) => i.name)
    if (left.length) errors.push(`the looseleaf umbrella does not install: ${left.join(', ')}`)
  }

  if (items.has('looseleaf-blocks')) {
    const inBlocks = new Set(deps.get('looseleaf-blocks') ?? [])
    const left = [...items.values()].filter((i) => i.type === 'registry:block' && i.name !== 'looseleaf-blocks' && !inBlocks.has(i.name)).map((i) => i.name)
    if (left.length) errors.push(`the looseleaf-blocks umbrella does not install: ${left.join(', ')}`)
  }

  const closureOf = (name, seen = new Set()) => {
    if (seen.has(name)) return seen
    seen.add(name)
    for (const d of deps.get(name) ?? []) closureOf(d, seen)
    return seen
  }
  for (const item of items.values()) {
    const closure = [...closureOf(item.name)].map((n) => items.get(n)).filter(Boolean)
    const keys = new Set()
    const packages = new Set()
    for (const c of closure) {
      for (const f of c.files ?? []) keys.add(aliasKeyForFile(f))
      for (const p of [...(c.dependencies ?? []), ...(c.devDependencies ?? [])]) packages.add(p.replace(/(?<=.)@[^@/]+$/, ''))
      for (const f of c.font ? [c.font] : []) if (f.dependency) packages.add(f.dependency)
    }
    for (const f of item.files ?? []) {
      if (!isCodeFile(f.path) || typeof f.content !== 'string') continue
      for (const imp of scanImports(f.content, f.path)) {
        const c = classifySpecifier(imp.spec)
        const where = `${item.name}: ${f.path} imports "${imp.spec}"`
        if (c.kind === 'alias') {
          const key = c.path.replace(/\.(tsx?|jsx?|mjs)$/, '')
          if (/^registry(\/|$)/.test(key)) errors.push(`${where} (leftover @/registry import)`)
          else if (key === 'lib/utils') continue
          else if (!keys.has(key) && !keys.has(key.replace(/\/index$/, '')) && !keys.has(`${key}/index`)) {
            errors.push(`${where}, but neither ${item.name} nor its registryDependencies ship that file`)
          }
        } else if (c.kind === 'package') {
          if (!packages.has(c.name)) errors.push(`${where}, but package "${c.name}" is not in dependencies of ${item.name} or its registryDependencies`)
        } else if (c.kind === 'other') {
          errors.push(`${where}: not a resolvable module`)
        }
      }
    }
  }

  for (const item of items.values()) {
    for (const [group, vars] of Object.entries(item.cssVars ?? {})) {
      for (const [k, v] of Object.entries(vars)) {
        if (typeof v !== 'string' || !v.trim()) errors.push(`${item.name}: cssVars.${group}.${k} must be a non-empty string`)
      }
    }
    for (const key of Object.keys(item.css ?? {})) {
      if (/^@import\s+["']?\.{1,2}\//.test(key)) errors.push(`${item.name}: css ${key} imports a local file that is not shipped`)
    }
    if (item.type === 'registry:font' && !/^--[a-z0-9-]+$/.test(item.font?.variable ?? '')) errors.push(`${item.name}: font.variable must look like --font-hand`)
  }

  return { errors, warnings, items, sizes }
}

export function diffOutputs(freshDir, currentDir) {
  const list = (d) => (existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.json') && statSync(path.join(d, f)).isFile()) : [])
  const fresh = new Set(list(freshDir))
  const current = new Set(list(currentDir))
  const stale = []
  for (const f of fresh) {
    if (!current.has(f)) stale.push(`${f} (missing)`)
    else if (readFileSync(path.join(freshDir, f), 'utf8') !== readFileSync(path.join(currentDir, f), 'utf8')) stale.push(`${f} (differs)`)
  }
  for (const f of current) if (!fresh.has(f)) stale.push(`${f} (no longer produced)`)
  return stale.sort()
}
