import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { REPO_ROOT, SHADCN_BIN, resolveConfig } from './config.mjs'
import { validateRegistry } from './jsonschema.mjs'
import { isCodeFile } from './parse.mjs'
import { plain, runNode, withHeavy } from './run.mjs'
import { buildRegistry, scanTree } from './scan.mjs'
import { diffOutputs, validateBuilt } from './validate.mjs'

const stringify = (obj) => `${JSON.stringify(obj, null, 2)}\n`

export function patchBuiltContent(outDir, { stableDirectives = false } = {}) {
  let patched = 0
  for (const file of readdirSync(outDir)) {
    if (!file.endsWith('.json') || file === 'registry.json') continue
    const full = path.join(outDir, file)
    const item = JSON.parse(readFileSync(full, 'utf8'))
    let changed = false
    for (const f of item.files ?? []) {
      if (typeof f.content !== 'string' || !isCodeFile(f.path)) continue
      let next = f.content.replace(/(["'`])@\/blocks\//g, '$1@/components/blocks/')
      if (stableDirectives) next = next.replace(/^((?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*)(["'])use client\2(?![\w;])/, '$1$2use client$2;')
      if (next !== f.content) {
        f.content = next
        changed = true
      }
    }
    if (changed) {
      writeFileSync(full, stringify(item))
      patched++
    }
  }
  return patched
}

function clearJson(dir) {
  if (!existsSync(dir)) return
  for (const f of readdirSync(dir)) if (f.endsWith('.json')) rmSync(path.join(dir, f), { force: true })
}

export async function runRegistryBuild(o = {}) {
  const log = o.log ?? (() => {})
  const root = path.resolve(o.root ?? REPO_ROOT)
  const cfg = resolveConfig({ root, url: o.url, deps: o.deps, namespace: o.namespace, themeDep: o.themeDep, pins: o.pins })
  const targets = o.targets !== false
  const result = { ok: false, root, cfg, errors: [], warnings: [], items: [], registry: null, scan: null, registryFile: null, outDir: null, stale: [], patched: 0, sizes: {} }

  const scan = scanTree(root, cfg, { targets, cliHazard: o.cliHazard })
  result.scan = scan
  const { registry, warnings, errors } = buildRegistry(scan, root, cfg, { targets })
  result.registry = registry
  result.warnings.push(...warnings)
  result.errors.push(...errors)
  result.errors.push(...validateRegistry(registry).map((e) => `generated registry.json ${e}`))
  result.items = registry.items.map((i) => ({ name: i.name, type: i.type, files: i.files?.length ?? 0 }))
  if (result.errors.length) return result

  const tmp = o.check ? path.join(REPO_ROOT, 'lookdev', '_tmp', `registry-check-${process.pid}`) : null
  const registryFile = path.resolve(tmp ? path.join(tmp, 'registry.json') : (o.registryFile ?? path.join(root, 'registry.json')))
  const outDir = path.resolve(tmp ? path.join(tmp, 'r') : (o.outDir ?? path.join(root, 'public', 'r')))
  result.registryFile = registryFile
  result.outDir = outDir
  const wanted = stringify(registry)

  try {
    if (o.check) {
      const onDisk = path.resolve(o.registryFile ?? path.join(root, 'registry.json'))
      if (!existsSync(onDisk)) result.stale.push(`${path.relative(root, onDisk)} (missing)`)
      else if (readFileSync(onDisk, 'utf8') !== wanted) result.stale.push(`${path.relative(root, onDisk)} (differs)`)
    }
    mkdirSync(path.dirname(registryFile), { recursive: true })
    writeFileSync(registryFile, wanted)
    log(`wrote ${path.relative(REPO_ROOT, registryFile) || registryFile} (${registry.items.length} items)`)

    if (o.build === false) {
      result.ok = true
      return result
    }

    mkdirSync(outDir, { recursive: true })
    clearJson(outDir)
    const built = await withHeavy(() => runNode([SHADCN_BIN, 'build', registryFile, '--cwd', root, '--output', outDir]))
    if (built.code !== 0) {
      result.errors.push(`shadcn build failed (exit ${built.code}${built.timedOut ? ', timed out' : ''}):\n${plain(built.stdout + built.stderr).trim().split('\n').slice(-25).join('\n')}`)
      return result
    }
    result.patched = patchBuiltContent(outDir, { stableDirectives: o.stableDirectives ?? Boolean(process.env.LOOSELEAF_STABLE_DIRECTIVES) })

    const v = await validateBuilt({ outDir, cfg })
    result.errors.push(...v.errors)
    result.warnings.push(...v.warnings)
    result.sizes = v.sizes

    if (o.check) {
      const current = path.resolve(o.outDir ?? path.join(root, 'public', 'r'))
      const stale = diffOutputs(outDir, current)
      result.stale.push(...stale.map((s) => `${path.relative(root, current)}/${s}`))
    }
    result.ok = result.errors.length === 0
    return result
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true })
  }
}

export function copyBuilt(from, to) {
  mkdirSync(to, { recursive: true })
  cpSync(from, to, { recursive: true })
}
