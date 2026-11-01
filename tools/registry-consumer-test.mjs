#!/usr/bin/env node
import http from 'node:http'
import { createHash } from 'node:crypto'
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import postcss from 'postcss'
import { DEFAULT_PINS, REPO_ROOT, SHADCN_BIN } from './registry/config.mjs'
import { runRegistryBuild } from './registry/build.mjs'
import { scanImports } from './registry/parse.mjs'
import { plain, runNode, withHeavy } from './registry/run.mjs'

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const opt = (f, d) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : d)
let TREE = path.resolve(opt('--root', path.join(REPO_ROOT, 'tools', 'fixtures', 'tree')))
const ONLY = opt('--only', '') ? new Set(opt('--only', '').toUpperCase().split(',')) : null
const VERBOSE = has('-v') || has('--verbose')
const TMP = path.join(REPO_ROOT, 'lookdev', '_tmp')

const results = []
let currentScenario = ''
function check(cond, msg, detail) {
  results.push({ ok: !!cond, scenario: currentScenario, msg, detail })
  if (!cond || VERBOSE) console.log(`  ${cond ? 'pass' : 'FAIL'}  ${msg}${!cond && detail ? `\n        ${String(detail).split('\n').slice(0, 14).join('\n        ')}` : ''}`)
  return !!cond
}
function checkUnlessQuirk(quiet, cond, msg, detail) {
  if (quiet || cond) return check(cond, msg, detail)
  console.log(`  note  ${msg} (did not hold; expected with several "use client" files, see notes/registry.md)\n        ${String(detail).split('\n').slice(0, 6).join('\n        ')}`)
  results.push({ ok: true, scenario: currentScenario, msg: `${msg} [note]`, detail })
  return true
}
const section = (name) => {
  currentScenario = name.split(' ')[0]
  console.log(`\n== ${name}`)
}

const created = []
function mkdirUnique(prefix) {
  mkdirSync(TMP, { recursive: true })
  for (let n = 1; n < 1000; n++) {
    const dir = path.join(TMP, `${prefix}-${n}`)
    try {
      mkdirSync(dir)
      created.push(dir)
      return dir
    } catch (e) {
      if (e.code !== 'EEXIST') throw e
    }
  }
  throw new Error(`no free ${prefix}-<n> directory in ${TMP}`)
}
const read = (p) => readFileSync(p, 'utf8')
function copyTree(from, to) {
  for (const name of ['src', 'package.json', '.env', '.env.local']) if (existsSync(path.join(from, name))) cpSync(path.join(from, name), path.join(to, name), { recursive: true })
}
const write = (p, s) => {
  mkdirSync(path.dirname(p), { recursive: true })
  writeFileSync(p, s)
}
const writeJson = (p, o) => write(p, `${JSON.stringify(o, null, 2)}\n`)

function listFiles(dir, base = dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...listFiles(full, base))
    else out.push(path.relative(base, full).split(path.sep).join('/'))
  }
  return out.sort()
}
const hashTree = (dir) => Object.fromEntries(listFiles(dir).map((f) => [f, createHash('sha1').update(readFileSync(path.join(dir, f))).digest('hex')]))
const isCode = (f) => /\.(tsx?|jsx?|mjs)$/.test(f)

function startServer(mounts) {
  const requests = []
  const unexpected = []
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x')
    requests.push(url.pathname)
    const send = (status, body, type = 'application/json') => {
      res.writeHead(status, { 'content-type': type })
      res.end(body)
    }
    for (const [prefix, dir] of Object.entries(mounts)) {
      if (url.pathname.startsWith(`${prefix}/`)) {
        const rest = url.pathname.slice(prefix.length + 1)
        if (rest.startsWith('colors/')) {
          return send(200, JSON.stringify({ inlineColors: { light: {}, dark: {} }, cssVars: {}, inlineColorsTemplate: '', cssVarsTemplate: '' }))
        }
        if (/^[a-z0-9-]+\.json$/.test(rest) && existsSync(path.join(dir, rest))) return send(200, readFileSync(path.join(dir, rest)))
      }
    }
    unexpected.push(url.pathname)
    send(404, JSON.stringify({ message: `not found: ${url.pathname}` }))
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port, requests, unexpected })))
}

const rootPkg = JSON.parse(read(path.join(REPO_ROOT, 'package.json')))
const versionOf = (name) => rootPkg.dependencies?.[name] ?? rootPkg.devDependencies?.[name] ?? '*'

const SHADCN_CSS = `@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`

const CLASSIC_UTILS = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
const CN_PACKAGE_UTILS = `export { cn } from "cn"\n`

function makeShims(runDir) {
  const bin = path.join(runDir, 'shim-bin')
  mkdirSync(bin, { recursive: true })
  for (const name of ['npm', 'pnpm', 'yarn', 'bun', 'deno', 'npx']) {
    const file = path.join(bin, name)
    writeFileSync(file, `#!/bin/sh\nprintf '%s %s\\n' "${name}" "$*" >> "$LL_SHIM_LOG"\nif [ "$LL_SHIM_MODE" = ok ]; then exit 0; fi\necho "${name} must not run in an offline test" >&2\nexit 1\n`)
    chmodSync(file, 0o755)
  }
  return bin
}

function makeConsumer(c) {
  const dir = mkdirUnique('consumer')
  const srcRoot = c.srcRoot ?? 'src'
  const deps = c.deps === null ? {} : Object.fromEntries(['react', 'react-dom', 'tailwindcss', ...(c.deps ?? [])].map((d) => [d, versionOf(d)]))
  writeJson(path.join(dir, 'package.json'), { name: c.name, private: true, type: 'module', version: '0.0.0', dependencies: { ...deps, ...(c.extraDeps ?? {}) } })
  for (const [file, text] of Object.entries(c.extra ?? { 'vite.config.ts': 'export default {}\n' })) write(path.join(dir, file), text)
  writeJson(path.join(dir, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2023', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      moduleResolution: 'Bundler',
      jsx: 'react-jsx',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      isolatedModules: true,
      types: [],
      paths: { '@/*': [srcRoot ? `./${srcRoot}/*` : './*'] },
      ...(c.tsOptions ?? {}),
    },
    include: [c.tsInclude ?? srcRoot ?? '.'],
  })
  writeJson(path.join(dir, 'components.json'), {
    $schema: 'https://ui.shadcn.com/schema.json',
    style: 'new-york',
    rsc: c.rsc ?? false,
    tsx: true,
    tailwind: { config: '', css: c.cssPath, baseColor: 'neutral', cssVariables: true, prefix: '' },
    iconLibrary: 'lucide',
    aliases: c.aliases,
    ...(c.registries ? { registries: c.registries } : {}),
  })
  write(path.join(dir, c.cssPath), c.css)
  if (c.utilsSource !== null) write(path.join(dir, c.utilsFile), c.utilsSource)
  return { dir, srcRoot, ...c }
}

function placeOf(consumer, target) {
  const m = /^@(ui|lib|hooks|components)\/(.+)$/.exec(target)
  if (!m) throw new Error(`unexpected target ${target}`)
  return path.join(consumer.dir, consumer.places[m[1]], m[2])
}
function resolveAlias(consumer, spec) {
  if (!spec.startsWith('@/')) return null
  const base = path.join(consumer.dir, consumer.srcRoot, spec.slice(2))
  const isFile = (p) => existsSync(p) && statSync(p).isFile()
  return [base, ...['.ts', '.tsx', '.js', '.css'].map((e) => base + e), ...['.ts', '.tsx'].map((e) => path.join(base, `index${e}`))].find(isFile) ?? null
}

let ctx
async function cli(consumer, argv, { shim = 'fail' } = {}) {
  const shimLog = path.join(consumer.dir, '..', `${path.basename(consumer.dir)}.shim.log`)
  if (!created.includes(shimLog)) created.push(shimLog)
  writeFileSync(shimLog, '')
  const dead = 'http://127.0.0.1:9'
  const env = {
    ...process.env,
    PATH: `${ctx.shimBin}${path.delimiter}${process.env.PATH}`,
    LL_SHIM_LOG: shimLog,
    LL_SHIM_MODE: shim,
    REGISTRY_URL: `http://127.0.0.1:${ctx.port}/r`,
    HTTP_PROXY: dead,
    HTTPS_PROXY: dead,
    http_proxy: dead,
    https_proxy: dead,
    NO_PROXY: '127.0.0.1,localhost',
    no_proxy: '127.0.0.1,localhost',
    CI: '1',
    NO_COLOR: '1',
    FORCE_COLOR: '0',
    NODE_NO_WARNINGS: '1',
    npm_config_user_agent: 'npm/10.9.0 node/v24.0.0',
  }
  delete env.npm_execpath
  const r = await runNode([SHADCN_BIN, ...argv, '--cwd', consumer.dir], { cwd: consumer.dir, env, timeoutMs: 180_000 })
  const shimCalls = read(shimLog).split('\n').filter(Boolean)
  return { ...r, out: plain(r.stdout + r.stderr), shimCalls }
}
let BUILT = {}
const isPinned = (d) => /(?<=.)@[^@/]+$/.test(d)
const bareName = (d) => d.replace(/(?<=.)@[^@/]+$/, '')
const nameOfArg = (a) => String(a).replace(/^.*\//, '').replace(/\.json$/, '')
function pinnedIn(name) {
  return [...new Set(closureOf(BUILT, name).flatMap((i) => i?.dependencies ?? []).filter(isPinned))].sort()
}
const askedPackages = (calls) => new Set(calls.flatMap((l) => l.split(/\s+/).slice(1).filter((t) => t && !t.startsWith('-') && !['install', 'add', 'i'].includes(t))))
async function shadcn(consumer, args, { overwrite = false, shim, ...opts } = {}) {
  const pins = args[0] && BUILT[nameOfArg(args[0])] ? pinnedIn(nameOfArg(args[0])) : []
  const r = await cli(consumer, ['add', ...args, '--yes', ...(overwrite ? ['--overwrite'] : [])], { shim: shim ?? (pins.length ? 'ok' : 'fail'), ...opts })
  return { ...r, pins, asked: askedPackages(r.shimCalls) }
}
const pkgCallsOk = (r) => r.asked.size === r.pins.length && r.pins.every((p) => r.asked.has(p))
const pkgCallsMsg = (r, what = 'the package manager') => (r.pins.length ? `${what} was asked for exactly the pinned packages (${r.pins.join(' ')}), nothing else` : `${what} was not invoked (dependencies pre-seeded)`)

function analyzeCss(text) {
  const root = postcss.parse(text)
  const top = root.nodes
  const decls = (node) => {
    const list = node.nodes.filter((d) => d.type === 'decl')
    const map = Object.fromEntries(list.map((d) => [d.prop, d.value]))
    return { map, dupes: list.length - Object.keys(map).length }
  }
  const rule = (sel, parent = top) => parent.filter((n) => n.type === 'rule' && n.selector === sel)
  const at = (name, params, parent = top) => parent.filter((n) => n.type === 'atrule' && n.name === name && (params === undefined || n.params === params))
  return { root, top, decls, rule, at, imports: at('import').map((n) => n.params) }
}

const customVariants = (css, name) => css.at('custom-variant').filter((n) => n.params.split(/[\s(]/)[0] === name)

const normCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1').trim()

let tw = null
let lightning = null
const flatten = (css) => (lightning ? lightning.transform({ filename: 'x.css', code: Buffer.from(css), include: lightning.Features.Nesting }).code.toString() : css)
async function loadTailwind() {
  try {
    lightning = createRequire(path.join(REPO_ROOT, 'package.json'))('lightningcss')
  } catch {}
  try {
    const req = createRequire(path.join(REPO_ROOT, 'package.json'))
    return await import(pathToFileURL(req.resolve('@tailwindcss/node')).href)
  } catch {
    return null
  }
}

function candidateClasses(built) {
  const out = new Set()
  const theme = built['looseleaf-theme']
  for (const k of Object.keys(theme?.cssVars?.theme ?? {})) {
    let m
    if ((m = /^color-(.+)$/.exec(k))) ['bg', 'text', 'border', 'ring', 'fill', 'stroke'].forEach((p) => out.add(`${p}-${m[1]}`))
    else if ((m = /^(font|animate|shadow|text|radius|ease|tracking|leading)-(.+)$/.exec(k))) out.add(`${m[1] === 'radius' ? 'rounded' : m[1]}-${m[2]}`)
  }
  const visit = (obj) => {
    for (const [k, v] of Object.entries(obj ?? {})) {
      let m
      if ((m = /^@utility (.+)$/.exec(k))) out.add(m[1].endsWith('-*') ? `${m[1].slice(0, -2)}-3` : m[1])
      else if (k.startsWith('@')) visit(v)
      else for (const cls of k.matchAll(/\.([A-Za-z_][\w-]*)/g)) out.add(cls[1])
    }
  }
  visit(theme?.css)
  out.delete('dark')
  for (const f of Object.values(built).filter((i) => i.type === 'registry:font')) out.add(`font-${f.font.variable.replace(/^--font-/, '')}`)
  return [...out]
}

const classesOf = (selector) => [...selector.matchAll(/\.((?:\\.|[\w-])+)/g)].map((m) => m[1].replace(/\\/g, ''))
function ruleTable(cssText, classes) {
  const table = {}
  const wanted = new Set(classes)
  postcss.parse(cssText).walkRules((r) => {
    if (r.parent?.type === 'atrule' && r.parent.name === 'keyframes') return
    if (!classesOf(r.selector).some((c) => wanted.has(c))) return
    const ctxs = []
    for (let p = r.parent; p && p.type === 'atrule'; p = p.parent) if (p.name !== 'layer') ctxs.push(`@${p.name} ${p.params}`)
    const key = `${ctxs.reverse().join(' ')} ${r.selector}`.trim()
    table[key] = normCss(r.nodes.filter((d) => d.type === 'decl').map((d) => `${d.prop}:${d.value}`).join(';'))
  })
  return table
}

async function tailwindEquivalence(consumer, cssFile, built, { skipVars = new Set() } = {}) {
  if (!tw) return
  try {
    const cands = candidateClasses(built)
    const srcCss = read(path.join(TREE, 'src/styles/looseleaf.css'))
    const mine = flatten(await (await tw.compile(read(path.join(consumer.dir, cssFile)), { base: consumer.dir, onDependency() {} })).build(cands))
    const orig = flatten(await (await tw.compile(srcCss, { base: path.join(TREE, 'src/styles'), onDependency() {} })).build(cands))
    check(true, `merged CSS of ${consumer.name} compiles under Tailwind (${cands.length} candidate classes)`)
    const tMine = ruleTable(mine, cands)
    const tOrig = ruleTable(orig, cands)
    const keys = Object.keys(tOrig)
    check(keys.length >= 3, `the source stylesheet yields ${keys.length} rules for the candidate classes`, cands.join(' '))
    const differ = keys.filter((k) => tMine[k] !== tOrig[k])
    check(differ.length === 0, 'consumer CSS produces identical rules for every candidate class', differ.map((k) => `${k}\n   source:   ${tOrig[k]}\n   consumer: ${tMine[k]}`).join('\n'))
    const kf = (x) => [...x.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]).sort().join(',')
    check(kf(mine) === kf(orig), 'the same @keyframes are emitted for the animations in use', `${kf(mine)} vs ${kf(orig)}`)
    const varsOf = (x, sel) => {
      const m = {}
      postcss.parse(x).walkRules(sel, (r) => r.walkDecls(/^--/, (d) => (m[d.prop] = normCss(d.value))))
      return m
    }
    for (const sel of [':root', '.dark']) {
      const vm = varsOf(mine, sel)
      const vo = varsOf(orig, sel)
      if (sel === '.dark' && Object.keys(vo).length === 0) {
        if (VERBOSE) console.log('  note  the source stylesheet has no .dark block: comparison skipped')
        continue
      }
      const wrong = Object.keys(vo).filter((k) => !skipVars.has(k) && vm[k] !== vo[k])
      check(wrong.length === 0 && Object.keys(vo).length > 0, `${sel} custom properties equal the source after merging${skipVars.size ? ' (except the ones the project already had)' : ''}`, wrong.map((k) => `${k}: ${vo[k]} vs ${vm[k]}`).join('\n'))
    }
  } catch (e) {
    check(false, 'Tailwind compile of the merged CSS', e.stack ?? e)
  }
}

async function tailwindOnInstalled(consumer, cssFile, label) {
  if (!tw) return
  try {
    const { Scanner } = createRequire(path.join(REPO_ROOT, 'package.json'))('@tailwindcss/oxide')
    const cands = new Scanner({ sources: [{ base: path.join(consumer.dir, consumer.srcRoot || '.'), pattern: '**/*', negated: false }] }).scan()
    check(cands.length > 50, `${label}: Tailwind's scanner finds the classes of the installed files (${cands.length} candidates)`)
    const srcCss = read(path.join(TREE, 'src/styles/looseleaf.css'))
    const mine = flatten(await (await tw.compile(read(path.join(consumer.dir, cssFile)), { base: consumer.dir, onDependency() {} })).build(cands))
    const orig = flatten(await (await tw.compile(srcCss, { base: path.join(TREE, 'src/styles'), onDependency() {} })).build(cands))
    check(mine.length > 2000, `${label}: the merged CSS compiles under Tailwind for those classes (${Math.round(mine.length / 1024)} KB of CSS)`)
    const tMine = ruleTable(mine, cands)
    const tOrig = ruleTable(orig, cands)
    const keys = Object.keys(tOrig)
    check(keys.length >= 5, `${label}: the source stylesheet yields ${keys.length} rules for the installed classes`)
    const differ = keys.filter((k) => tMine[k] !== tOrig[k])
    check(differ.length === 0, `${label}: the consumer builds the same rules as the source for every installed class`, differ.slice(0, 8).map((k) => `${k}\n   source:   ${tOrig[k]}\n   consumer: ${tMine[k]}`).join('\n'))
    const theme = BUILT['looseleaf-theme']
    const utilities = Object.keys(theme?.css ?? {}).filter((k) => /^@utility [\w-]+$/.test(k)).map((k) => k.slice(9))
    const used = utilities.filter((u) => cands.includes(u))
    const missing = used.filter((u) => !new RegExp(`\\.${u}\\b`).test(mine))
    check(missing.length === 0, `${label}: every theme @utility the installed files use is in the build (${used.length} used)`, missing.join(', '))
  } catch (e) {
    check(false, `${label}: Tailwind build of the installed classes`, e.stack ?? e)
  }
}

const importsOf = (file) => scanImports(read(file), file).map((i) => i.spec)

async function typecheck(consumer) {
  const r = await runNode([path.join(REPO_ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', path.join(consumer.dir, 'tsconfig.json'), '--noEmit'], { cwd: consumer.dir, timeoutMs: 240_000 })
  return { ok: r.code === 0, out: plain(r.stdout + r.stderr).trim() }
}

function leftovers(consumer, files) {
  const bad = []
  for (const f of files) {
    if (!/\.(tsx?|css)$/.test(f)) continue
    const text = read(path.join(consumer.dir, f))
    if (/@\/registry|#registry|\/registry\/(new-york|default)/.test(text)) bad.push(`${f}: registry import left`)
    if (/["'`]@\/blocks\//.test(text)) bad.push(`${f}: unrewritten @/blocks/ import`)
    if (/["'`]@(ui|lib|hooks|components)\//.test(text)) bad.push(`${f}: a target placeholder leaked into the content`)
  }
  return bad
}

function checkAliasImportsResolve(consumer, files, label) {
  const dangling = []
  for (const f of files.filter(isCode)) {
    for (const spec of importsOf(path.join(consumer.dir, f))) {
      if (spec.startsWith('@/') && !resolveAlias(consumer, spec)) dangling.push(`${f}: ${spec}`)
    }
  }
  check(dangling.length === 0, `${label}: every @/ import in the installed files resolves to a file in the project`, dangling.join('\n'))
}

function writeDemo(consumer, built, { blocks = true } = {}) {
  const lines = ['export {}']
  const uses = []
  let i = 0
  const importNs = (spec) => {
    const id = `M${i++}`
    lines.unshift(`import * as ${id} from "${spec}"`)
    uses.push(id)
  }
  for (const it of Object.values(built)) {
    if (!it.files?.length || !it.files.every((f) => existsSync(placeOf(consumer, f.target)))) continue
    if (it.type === 'registry:ui') importNs(`${consumer.aliases.ui}/${it.name}`)
    else if (it.type === 'registry:hook') importNs(`${consumer.aliases.hooks}/${it.name}`)
    else if (blocks && it.type === 'registry:block' && it.files?.length) {
      const entry = it.files.find((f) => /\/index\.tsx?$/.test(f.target)) ?? it.files.find((f) => /\/page\.tsx?$/.test(f.target)) ?? it.files[0]
      const rel = entry.target.replace(/^@components\/blocks\/[^/]+\/?/, '').replace(/\.tsx?$/, '')
      importNs(`${consumer.aliases.components}/blocks/${it.name}${rel === 'index' ? '' : `/${rel}`}`)
    }
  }
  lines.push(`void [${uses.join(', ')}]`, '')
  write(path.join(consumer.dir, consumer.srcRoot || '.', consumer.srcRoot ? 'demo.tsx' : 'app/demo.tsx'), lines.join('\n'))
}

function closureOf(built, name, seen = new Set()) {
  if (seen.has(name) || !built[name]) return [...seen].map((n) => built[n])
  seen.add(name)
  for (const d of built[name].registryDependencies ?? []) closureOf(built, d.replace(/^.*\//, '').replace(/\.json$/, ''), seen)
  return [...seen].map((n) => built[n])
}

async function main() {
  if (has('--real-css')) {
    const copy = mkdirUnique('real-css-tree')
    copyTree(TREE, copy)
    for (const f of ['looseleaf.css', 'fonts.css']) if (existsSync(path.join(REPO_ROOT, 'src/styles', f))) cpSync(path.join(REPO_ROOT, 'src/styles', f), path.join(copy, 'src/styles', f))
    TREE = copy
  }
  console.log(`[consumer-test] tree ${path.relative(REPO_ROOT, TREE) || '.'}${has('--real-css') ? ' (fixture components + the real stylesheet)' : ''}`)
  const runDir = mkdirUnique('registry-test')
  ctx = { shimBin: makeShims(runDir) }

  const rDir = path.join(runDir, 'r')
  const nsDir = path.join(runDir, 'ns')
  mkdirSync(rDir, { recursive: true })
  mkdirSync(nsDir, { recursive: true })
  const mounts = { '/r': rDir, '/ns': nsDir }
  const srv = await startServer(mounts)
  Object.assign(ctx, { port: srv.port, requests: srv.requests, unexpected: srv.unexpected })
  const base = `http://127.0.0.1:${srv.port}`

  console.log('[consumer-test] building the registry (deps=url) and (deps=namespace) …')
  const stable = has('--stable-directives')
  const buildOpts = { root: TREE, registryFile: path.join(runDir, 'registry.json'), log: () => {}, stableDirectives: stable }
  const b1 = await runRegistryBuild({ ...buildOpts, outDir: rDir, url: `${base}/r`, deps: 'url' })
  const b2 = await runRegistryBuild({ ...buildOpts, registryFile: path.join(runDir, 'registry-ns.json'), outDir: nsDir, url: `${base}/ns`, deps: 'namespace', namespace: '@looseleaf' })
  section('build')
  check(b1.ok, 'registry builds (deps=url)', b1.errors.join('\n'))
  check(b2.ok, 'registry builds (deps=namespace)', b2.errors.join('\n'))
  if (!b1.ok || !b2.ok) return finish(srv)

  const built = Object.fromEntries(readdirSync(rDir).filter((f) => f.endsWith('.json') && f !== 'registry.json').map((f) => [f.slice(0, -5), JSON.parse(read(path.join(rDir, f)))]))
  const items = Object.values(built)
  const names = Object.keys(built)
  const pkgs = [...new Set(items.flatMap((i) => [...(i.dependencies ?? []), ...(i.devDependencies ?? []), ...(i.font?.dependency ? [i.font.dependency] : [])]).map(bareName))]
  BUILT = built
  const uiItems = items.filter((i) => i.type === 'registry:ui')
  const hookItems = items.filter((i) => i.type === 'registry:hook')
  const libItems = items.filter((i) => i.type === 'registry:lib' && i.name !== 'utils')
  const blockItems = items.filter((i) => i.type === 'registry:block' && i.files?.length)
  const fontItems = items.filter((i) => i.type === 'registry:font')
  const theme = built['looseleaf-theme']
  {
    const bytes = readdirSync(rDir).filter((f) => f.endsWith('.json') && f !== 'registry.json').reduce((n, f) => n + statSync(path.join(rDir, f)).size, 0)
    const biggest = Object.entries(built).map(([n, i]) => [n, Buffer.byteLength(JSON.stringify(i))]).sort((a, b) => b[1] - a[1])[0]
    const pinsUsed = [...new Set(items.flatMap((i) => i.dependencies ?? []).filter(isPinned))].sort()
    console.log(`[consumer-test] registry: ${items.length} items (${uiItems.length} ui, ${blockItems.length} blocks, ${hookItems.length} hooks, ${libItems.length} lib, ${fontItems.length} fonts), ${Math.round(bytes / 1024)} KB of JSON, largest ${biggest?.[0]} ${Math.round((biggest?.[1] ?? 0) / 1024)} KB, pins ${pinsUsed.join(' ') || 'none'}`)
  }
  const dependsOn = (a, b) => (a.registryDependencies ?? []).some((d) => d.replace(/^.*\//, '').replace(/\.json$/, '') === b.name)
  const parent = uiItems.find((p) => uiItems.some((d) => dependsOn(p, d)))
  const dep = parent ? uiItems.find((d) => dependsOn(parent, d)) : undefined
  const first = dep ?? uiItems.find((i) => i.name === 'button') ?? uiItems[0]
  const blk = blockItems[0]
  const directiveFiles = items.flatMap((i) => i.files ?? []).filter((f) => isCode(f.path) && /^\s*["']use client["']/.test(f.content))
  const quiet = stable || directiveFiles.length <= 1
  if (!quiet) console.log(`[consumer-test] note: ${directiveFiles.length} files start with "use client"; incremental-install assertions are relaxed (use --stable-directives for the strict run)`)

  tw = has('--no-tailwind') ? null : await loadTailwind()
  const want = (s) => (!ONLY || ONLY.has(s)) && (first || s === 'G')
  const registriesFor = (mount) => ({ '@looseleaf': `${base}/${mount}/{name}.json` })
  const A_ALIASES = { components: '@/components', utils: '@/lib/utils', ui: '@/components/ui', lib: '@/lib', hooks: '@/hooks' }
  const A_PLACES = { components: 'src/components', ui: 'src/components/ui', lib: 'src/lib', hooks: 'src/hooks' }
  const consumerA = (over = {}) => makeConsumer({ name: 'consumer-a', aliases: A_ALIASES, places: A_PLACES, cssPath: 'src/index.css', css: SHADCN_CSS, utilsFile: 'src/lib/utils.ts', utilsSource: CLASSIC_UTILS, registries: registriesFor('r'), deps: pkgs, ...over })
  const installedTargets = (consumer, item) => item.files.map((f) => ({ f, at: placeOf(consumer, f.target) }))

  if (want('A')) {
    section('A standard aliases, shadcn-init CSS, namespace install')
    const A = consumerA({ utilsSource: CN_PACKAGE_UTILS })
    const before = hashTree(A.dir)
    const r1 = await shadcn(A, [`@looseleaf/${first.name}`])
    check(r1.code === 0, `add @looseleaf/${first.name} exits 0`, r1.out)
    check(pkgCallsOk(r1), pkgCallsMsg(r1), r1.shimCalls.join('\n'))
    const added = Object.keys(hashTree(A.dir)).filter((f) => !(f in before))
    const closure = closureOf(built, first.name).filter((i) => i.type !== 'registry:font' && i.files?.length)
    for (const it of closure) for (const { f, at } of installedTargets(A, it)) check(existsSync(at), `${it.name}: ${f.target} installed at ${path.relative(A.dir, at)}`)
    for (const it of closure.filter((i) => i.type === 'registry:ui')) {
      for (const f of it.files.filter((x) => x.type === 'registry:lib')) check(existsSync(placeOf(A, f.target)), `${it.name} brought its recipe ${f.target}`)
    }
    const expectedCount = closure.reduce((n, i) => n + i.files.length, 0)
    check(added.filter((f) => f.startsWith('src/') && f !== 'src/index.css').length === expectedCount, `exactly the ${expectedCount} files of the item closure were added (nothing unrelated)`, added.join('\n'))
    check(JSON.stringify(JSON.parse(read(path.join(A.dir, 'package.json'))).dependencies) === JSON.stringify(Object.fromEntries(['react', 'react-dom', 'tailwindcss', ...pkgs].map((d) => [d, versionOf(d)]))), 'package.json dependencies untouched')

    const installedFirst = placeOf(A, first.files[0].target)
    check(!/@\/registry/.test(read(installedFirst)), 'no @/registry import in the component')
    for (const spec of importsOf(path.join(TREE, first.files[0].path)).filter((s) => /^@\/(components|lib|hooks)\//.test(s))) {
      check(importsOf(installedFirst).includes(spec), `${first.name} keeps ${spec} for the default aliases`)
    }
    const clientFiles = added.filter((f) => isCode(f) && /^\s*["']use client["']/.test(existsSync(path.join(TREE, f)) ? read(path.join(TREE, f)) : ''))
    if (clientFiles.length) {
      const kept = clientFiles.filter((f) => /^\s*["']use client["']/.test(read(path.join(A.dir, f))))
      if (stable) check(kept.length === clientFiles.length, `"use client" is kept in all ${clientFiles.length} directive files (stable directives)`, kept.join(', '))
      else check(kept.length < clientFiles.length, `"use client" is stripped from at least one of ${clientFiles.length} directive files for a non-RSC project (kept in ${kept.length})`, kept.join(', '))
    }

    if (theme) {
      const css = analyzeCss(read(path.join(A.dir, 'src/index.css')))
      const themes = css.at('theme', 'inline')
      check(themes.length === 1, 'exactly one `@theme inline` block', `found ${themes.length}`)
      const themeMap = themes[0] ? css.decls(themes[0]).map : {}
      for (const [k, v] of Object.entries(theme.cssVars?.theme ?? {})) check(themeMap[`--${k}`] === v, `@theme inline has --${k}`, themeMap[`--${k}`])
      for (const f of fontItems) {
        check(themeMap[f.font.variable] === f.font.family, `font wired: ${f.font.variable}: ${f.font.family}`, themeMap[f.font.variable])
        check(css.imports.includes(`"${f.font.dependency}"`), `font wired: @import "${f.font.dependency}"`)
        for (const k of Object.keys(f.css ?? {})) check(css.imports.includes(k.replace(/^@import /, '')), `font wired: ${k}`)
      }
      const mono = fontItems.find((f) => f.font.variable === '--font-mono')
      if (mono?.font.selector) {
        const baseLayer = css.at('layer', 'base')[0]
        const monoRule = baseLayer ? css.rule(mono.font.selector, baseLayer.nodes)[0] : undefined
        check(monoRule?.nodes.some((n) => n.type === 'atrule' && n.name === 'apply' && n.params === 'font-mono'), `font-mono is applied to "${mono.font.selector}" only`)
        check(!/(^|\n)\s*html\s*\{[^}]*font-mono/.test(css.root.toString()), 'font-mono is not applied to <html>')
      }
      for (const [name, body] of Object.entries(theme.css ?? {}).filter(([k]) => k.startsWith('@keyframes '))) {
        const kf = themes[0]?.nodes.filter((n) => n.type === 'atrule' && n.name === 'keyframes' && n.params === name.slice(11)) ?? []
        check(kf.length === 1, `${name} lives once inside @theme inline`, `found ${kf.length}`)
        check(kf[0] && Object.keys(body).length === kf[0].nodes.length, `${name} has all ${Object.keys(body).length} steps`)
      }
      const rootDecls = css.rule(':root')[0] ? css.decls(css.rule(':root')[0]) : { map: {}, dupes: 0 }
      const darkDecls = css.rule('.dark')[0] ? css.decls(css.rule('.dark')[0]) : { map: {}, dupes: 0 }
      check(rootDecls.dupes === 0 && darkDecls.dupes === 0, ':root and .dark have no duplicated declarations')
      const original = analyzeCss(SHADCN_CSS)
      const origLight = original.decls(original.rule(':root')[0]).map
      const origDark = original.decls(original.rule('.dark')[0]).map
      for (const [k, v] of Object.entries(theme.cssVars?.light ?? {})) {
        if (`--${k}` in origLight) check(rootDecls.map[`--${k}`] === origLight[`--${k}`], `a component install keeps the project's own --${k}`, `${rootDecls.map[`--${k}`]} (theme says ${v})`)
        else check(rootDecls.map[`--${k}`] === v, `:root gains --${k}`, rootDecls.map[`--${k}`])
      }
      for (const [k, v] of Object.entries(theme.cssVars?.dark ?? {})) {
        if (`--${k}` in origDark) check(darkDecls.map[`--${k}`] === origDark[`--${k}`], `a component install keeps the project's own dark --${k}`, `${darkDecls.map[`--${k}`]} (theme says ${v})`)
        else check(darkDecls.map[`--${k}`] === v, `.dark gains --${k}`, darkDecls.map[`--${k}`])
      }
      for (const [sel, body] of Object.entries(theme.css ?? {})) {
        if (sel === ':root' || sel === '.dark') {
          const got = sel === ':root' ? rootDecls.map : darkDecls.map
          for (const [k, v] of Object.entries(body)) check(got[k] === v, `${sel} has ${k} (non-colour token)`, got[k])
        } else if (sel.startsWith('@utility ')) {
          check(css.at('utility', sel.slice(9)).length === 1, `${sel} present once`)
        } else if (sel.startsWith('@custom-variant ')) {
          const name = sel.slice('@custom-variant '.length).split(/[\s(]/)[0]
          check(customVariants(css, name).length === 1, `exactly one @custom-variant ${name} (deduplicated against the project's own)`, String(customVariants(css, name).length))
        } else if (sel.startsWith('@import ')) {
          check(css.imports.filter((i) => i === sel.slice(8)).length === 1, `${sel} present once`)
        } else if (!sel.startsWith('@')) {
          check(css.rule(sel).length === 1, `rule ${sel} present once`)
        }
      }
      const bodyRule = css.rule('body', css.at('layer', 'base')[0]?.nodes ?? [])[0]
      const apply = bodyRule?.nodes.find((n) => n.type === 'atrule' && n.name === 'apply')?.params ?? ''
      check(/bg-background/.test(apply) && /text-foreground/.test(apply), '@layer base body keeps the project @apply and gains ours', apply)
      check(css.at('layer', 'base').length === 1, 'still one @layer base')
      check(css.imports.filter((i) => i === '"tailwindcss"').length === 1 && css.imports.filter((i) => i === '"tw-animate-css"').length === 1, 'tailwindcss and tw-animate-css imported once')
      await tailwindEquivalence(A, 'src/index.css', built, { skipVars: new Set([...Object.keys(origLight), ...Object.keys(origDark)]) })
    }

    if (parent && dep) {
      const r2 = await shadcn(A, [`@looseleaf/${parent.name}`])
      check(r2.code === 0, `add @looseleaf/${parent.name} exits 0`, r2.out)
      check(pkgCallsOk(r2), pkgCallsMsg(r2, 'still: the package manager'))
      check(existsSync(placeOf(A, parent.files[0].target)), `${parent.name} installed`)
      check(importsOf(placeOf(A, parent.files[0].target)).includes(`@/components/ui/${dep.name}`), `${parent.name} imports @/components/ui/${dep.name}`)
      checkUnlessQuirk(quiet, !/would you like to overwrite|already exists\./i.test(r2.out) && /Created 1 file|Skipped \d+ files?/.test(r2.out), `${dep.name} was skipped as identical, nothing was re-prompted`, r2.out)
    }

    const snapshot = hashTree(A.dir)
    const again = parent ?? first
    const r3 = await shadcn(A, [`@looseleaf/${again.name}`])
    check(r3.code === 0 && JSON.stringify(hashTree(A.dir)) === JSON.stringify(snapshot), 'installing the same item again changes nothing (files and CSS byte-identical)', r3.out)

    if (blk) {
      const r4 = await shadcn(A, [`@looseleaf/${blk.name}`], { overwrite: !quiet })
      check(r4.code === 0, `add @looseleaf/${blk.name} (block) exits 0`, r4.out)
      check(pkgCallsOk(r4), pkgCallsMsg(r4), r4.shimCalls.join('\n'))
      for (const { f, at } of installedTargets(A, blk)) check(existsSync(at), `block file ${f.target} installed at ${path.relative(A.dir, at)}`, r4.out.slice(-1200))
      for (const f of blk.files.filter((x) => isCode(x.path))) {
        const srcSpecs = importsOf(path.join(TREE, f.path)).filter((s) => s.startsWith(`@/blocks/${blk.name}`))
        const got = importsOf(placeOf(A, f.target))
        for (const s of srcSpecs) check(got.includes(s.replace('@/blocks/', '@/components/blocks/')), `${path.basename(f.path)}: ${s} became ${s.replace('@/blocks/', '@/components/blocks/')}`, got.join(', '))
      }
      if (blk.docs) checkUnlessQuirk(quiet, r4.out.includes(blk.docs.split('\n')[0]), 'block docs are printed after install', r4.out.slice(-400))
    }

    writeDemo(A, built)
    const files = listFiles(A.dir).filter((f) => f.startsWith('src/'))
    const left = leftovers(A, files)
    check(left.length === 0, 'no leftover @/registry, @/blocks or target-placeholder text in any installed file', left.join('\n'))
    checkAliasImportsResolve(A, files, 'consumer A')
    if (!has('--no-typecheck')) {
      const t = await typecheck(A)
      check(t.ok, 'TypeScript accepts the installed files (consumer A)', t.out)
    }
    check(srv.unexpected.length === 0, 'the CLI only asked the local server for registry files', srv.unexpected.join(', '))
  }

  if (want('B')) {
    section('B exotic aliases (ui at @/ui/paper), umbrella by URL, block by file path')
    const B_ALIASES = { components: '@/ui', utils: '@/shared/lib/utils', ui: '@/ui/paper', lib: '@/shared/lib', hooks: '@/shared/hooks' }
    const B_PLACES = { components: 'src/ui', ui: 'src/ui/paper', lib: 'src/shared/lib', hooks: 'src/shared/hooks' }
    const B = makeConsumer({ name: 'consumer-b', aliases: B_ALIASES, places: B_PLACES, cssPath: 'src/styles/app.css', css: '@import "tailwindcss";\n', utilsFile: 'src/shared/lib/utils.ts', utilsSource: CLASSIC_UTILS, registries: registriesFor('r'), deps: pkgs })
    const utilsBefore = read(path.join(B.dir, 'src/shared/lib/utils.ts'))
    const r1 = await shadcn(B, [`${base}/r/looseleaf.json`])
    check(r1.code === 0, 'add <url>/looseleaf.json (umbrella style) exits 0', r1.out)
    check(pkgCallsOk(r1), pkgCallsMsg(r1), r1.shimCalls.join('\n'))
    for (const it of [...uiItems, ...hookItems, ...libItems]) for (const { f, at } of installedTargets(B, it)) check(existsSync(at), `${it.name}: ${f.target} landed at ${path.relative(B.dir, at)}`)
    check(!existsSync(path.join(B.dir, 'src/components')), 'nothing was written to src/components (the default location)')
    check(read(path.join(B.dir, 'src/shared/lib/utils.ts')) === utilsBefore, "the project's utils file was not touched")
    if (blk) check(!existsSync(path.join(B.dir, 'src/ui/blocks')), 'the umbrella does not install blocks')

    const installed = listFiles(B.dir).filter((f) => f.startsWith('src/') && isCode(f))
    const stale = []
    for (const f of installed) for (const s of importsOf(path.join(B.dir, f))) if (/^@\/(components|lib|hooks)(\/|$)/.test(s)) stale.push(`${f}: ${s}`)
    check(stale.length === 0, 'no installed file still uses the default @/components, @/lib or @/hooks roots', stale.join('\n'))
    const cnUser = uiItems.find((i) => importsOf(path.join(TREE, i.files[0].path)).includes('@/lib/utils'))
    if (cnUser) check(importsOf(placeOf(B, cnUser.files[0].target)).includes('@/shared/lib/utils'), `cn is imported from the project's own utils alias (${cnUser.name})`, importsOf(placeOf(B, cnUser.files[0].target)).join(', '))
    const inkUser = uiItems.find((i) => importsOf(path.join(TREE, i.files[0].path)).some((s) => s === '@/lib/ink' || s.startsWith('@/lib/ink/')))
    if (inkUser) check(importsOf(placeOf(B, inkUser.files[0].target)).some((s) => s.startsWith('@/shared/lib/ink')), `ink is imported through @/shared/lib/ink (${inkUser.name})`)
    if (parent && dep) check(importsOf(placeOf(B, parent.files[0].target)).includes(`@/ui/paper/${dep.name}`), `${parent.name} imports ${dep.name} through @/ui/paper`)

    if (theme) {
      const css = analyzeCss(read(path.join(B.dir, 'src/styles/app.css')))
      const rd = css.rule(':root')[0] ? css.decls(css.rule(':root')[0]).map : {}
      check(Object.entries(theme.cssVars?.light ?? {}).every(([k, v]) => rd[`--${k}`] === v), 'umbrella (registry:style) writes every light token into a fresh :root')
      check(customVariants(css, 'dark').length === 1, 'the shadcn dark custom variant was added once')
      check(css.at('theme', 'inline').length === 1, 'one @theme inline block')
    }

    if (blk) {
      const r2 = await shadcn(B, [path.join(rDir, `${blk.name}.json`)], { overwrite: !quiet })
      check(r2.code === 0, `add <local file>/${blk.name}.json exits 0 (its registryDependencies are URLs)`, r2.out)
      check(pkgCallsOk(r2), pkgCallsMsg(r2), r2.shimCalls.join('\n'))
      for (const { f, at } of installedTargets(B, blk)) check(existsSync(at), `block file ${f.target} landed at ${path.relative(B.dir, at)} (components alias)`)
      for (const f of blk.files.filter((x) => isCode(x.path))) {
        const got = importsOf(placeOf(B, f.target))
        for (const s of importsOf(path.join(TREE, f.path)).filter((x) => x.startsWith(`@/blocks/${blk.name}`))) check(got.includes(s.replace('@/blocks/', '@/ui/blocks/')), `${path.basename(f.path)}: ${s} follows the components alias`, got.join(', '))
        for (const s of importsOf(path.join(TREE, f.path)).filter((x) => x.startsWith('@/components/ui/'))) check(got.includes(s.replace('@/components/ui/', '@/ui/paper/')), `${path.basename(f.path)}: ${s} follows the ui alias`, got.join(', '))
      }
    }

    writeDemo(B, built)
    const files = listFiles(B.dir).filter((f) => f.startsWith('src/'))
    const left = leftovers(B, files)
    check(left.length === 0, 'no leftover registry text in any installed file (B)', left.join('\n'))
    checkAliasImportsResolve(B, files, 'consumer B')
    if (!has('--no-typecheck')) {
      const t = await typecheck(B)
      check(t.ok, 'TypeScript accepts the installed files with the exotic aliases (consumer B)', t.out)
    }
  }

  if (want('C')) {
    section('C registry built with --deps namespace')
    const target = parent ?? first
    const C = consumerA({ name: 'consumer-c', registries: registriesFor('ns'), utilsSource: CLASSIC_UTILS })
    const nsItem = JSON.parse(read(path.join(nsDir, `${target.name}.json`)))
    check((target.registryDependencies ?? []).every((d) => /^https?:\/\//.test(d)), 'url-mode item lists URL dependencies', (target.registryDependencies ?? []).join(', '))
    check((nsItem.registryDependencies ?? []).length > 0 && nsItem.registryDependencies.every((d) => d.startsWith('@looseleaf/')), 'namespace-mode item lists @looseleaf/… dependencies', (nsItem.registryDependencies ?? []).join(', '))
    const r = await shadcn(C, [`@looseleaf/${target.name}`])
    check(r.code === 0, `add @looseleaf/${target.name} exits 0`, r.out)
    for (const it of closureOf(built, target.name).filter((i) => i.type !== 'registry:font' && i.files?.length)) for (const { f, at } of installedTargets(C, it)) check(existsSync(at), `${it.name}: ${f.target} installed transitively`)
    const noNs = consumerA({ name: 'consumer-c2', registries: undefined, utilsSource: CLASSIC_UTILS })
    const r2 = await shadcn(noNs, [`${base}/ns/${target.name}.json`])
    check(r2.code !== 0 && /looseleaf|registr/i.test(r2.out), 'namespace-mode items need the namespace registered (they fail clearly without it)', r2.out.slice(0, 400))
  }

  if (want('D') && theme) {
    section('D umbrella (registry:style) overwrites tokens, component installs do not')
    const D = consumerA({ name: 'consumer-d', utilsSource: CLASSIC_UTILS })
    const r = await shadcn(D, ['@looseleaf/looseleaf'])
    check(r.code === 0, 'add @looseleaf/looseleaf exits 0', r.out)
    check(pkgCallsOk(r), pkgCallsMsg(r), r.shimCalls.join('\n'))
    const css = analyzeCss(read(path.join(D.dir, 'src/index.css')))
    const rd = css.decls(css.rule(':root')[0]).map
    const dd = css.decls(css.rule('.dark')[0]).map
    const lightDiffers = Object.entries(theme.cssVars?.light ?? {}).filter(([k, v]) => rd[`--${k}`] !== v)
    const darkDiffers = Object.entries(theme.cssVars?.dark ?? {}).filter(([k, v]) => dd[`--${k}`] !== v)
    check(lightDiffers.length === 0, ':root tokens were overwritten with the Looseleaf palette', lightDiffers.map(([k, v]) => `--${k}: want ${v}, has ${rd[`--${k}`]}`).join('\n'))
    check(darkDiffers.length === 0, '.dark tokens were overwritten with the Looseleaf palette', darkDiffers.map(([k, v]) => `--${k}: want ${v}, has ${dd[`--${k}`]}`).join('\n'))
    const doc = built.looseleaf.docs.split('\n')[0]
    check(r.out.includes(doc), 'umbrella docs are printed', r.out.slice(-600))
    for (const it of [...uiItems, ...hookItems, ...libItems]) for (const { f, at } of installedTargets(D, it)) check(existsSync(at), `${it.name}: ${f.target} installed`)
    await tailwindEquivalence(D, 'src/index.css', built)
    writeDemo(D, built, { blocks: false })
    if (!has('--no-typecheck')) {
      const t = await typecheck(D)
      check(t.ok, 'TypeScript accepts the umbrella install (consumer D)', t.out)
    }
  }

  if (want('E')) {
    section('E dependency list (the package-manager shim records the request instead of installing)')
    const PIN_SPECS = new Set(Object.entries(DEFAULT_PINS).map(([n, r]) => `${n}@${r}`))
    const requested = async (label, name, consumerName) => {
      const E = consumerA({ name: consumerName, deps: null, utilsSource: CLASSIC_UTILS })
      const r = await shadcn(E, [`@looseleaf/${name}`], { shim: 'ok', overwrite: false })
      check(r.code === 0, `add @looseleaf/${name} into a project with an empty package.json exits 0`, r.out)
      const asked = r.asked
      const expected = new Set(closureOf(built, name).flatMap((i) => [...(i.dependencies ?? []), ...(i.devDependencies ?? [])]))
      const missing = [...expected].filter((p) => !asked.has(p))
      const extra = [...asked].filter((p) => !expected.has(p))
      check(r.shimCalls.length > 0, `${label}: the CLI asked the package manager to install the item dependencies`, r.out)
      check(missing.length === 0, `${label}: every dependency of the item closure is requested`, missing.join(', '))
      check(extra.length === 0, `${label}: nothing else is requested`, extra.join(', '))
      check(!asked.has('react') && !asked.has('react-dom'), `${label}: react and react-dom are never requested`)
      const versioned = [...asked].filter(isPinned)
      check(versioned.every((p) => PIN_SPECS.has(p)), `${label}: only the configured pins carry a version`, versioned.join(' '))
      check(versioned.length === new Set(pinnedIn(name)).size, `${label}: every pinned package of the closure is requested with its range`, `${versioned.join(' ')} vs ${pinnedIn(name).join(' ')}`)
      return r
    }
    await requested(first.name, first.name, 'consumer-e')
    const pinnedBlock = blockItems.find((b) => pinnedIn(b.name).length)
    if (pinnedBlock) {
      const r = await requested(pinnedBlock.name, pinnedBlock.name, 'consumer-e2')
      check(pinnedIn(pinnedBlock.name).every((p) => pinnedBlock.docs.includes(p)), `${pinnedBlock.name}: its docs name every pinned package`, pinnedBlock.docs)
      void r
    }
  }

  if (want('F') && theme) {
    section('F Next.js app router (no src directory, rsc): placement, "use client", next/font wiring')
    const F = makeConsumer({
      name: 'consumer-f',
      aliases: A_ALIASES,
      places: { components: 'components', ui: 'components/ui', lib: 'lib', hooks: 'hooks' },
      srcRoot: '',
      cssPath: 'app/globals.css',
      css: SHADCN_CSS,
      utilsFile: 'lib/utils.ts',
      utilsSource: CLASSIC_UTILS,
      registries: registriesFor('r'),
      deps: pkgs,
      rsc: true,
      tsInclude: 'app',
      extraDeps: { next: '16.0.0' },
      extra: {
        'next.config.mjs': 'export default {}\n',
        'app/layout.tsx': `import "./globals.css"\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  )\n}\n`,
      },
    })
    const r = await shadcn(F, [`@looseleaf/${first.name}`])
    check(r.code === 0, `add @looseleaf/${first.name} into a Next.js project exits 0`, r.out)
    check(pkgCallsOk(r), pkgCallsMsg(r), r.shimCalls.join('\n'))
    check(!existsSync(path.join(F.dir, 'src')), 'no src/ directory was invented')
    for (const it of closureOf(built, first.name).filter((i) => i.type !== 'registry:font' && i.files?.length)) for (const { f, at } of installedTargets(F, it)) check(existsSync(at), `${it.name}: ${f.target} landed at ${path.relative(F.dir, at)}`)
    const clientItem = uiItems.find((i) => /^\s*["']use client["']/.test(read(path.join(TREE, i.files[0].path))))
    if (clientItem) {
      await shadcn(F, [`@looseleaf/${clientItem.name}`])
      check(/^\s*["']use client["']/.test(read(placeOf(F, clientItem.files[0].target))), `"use client" is kept for an RSC project (${clientItem.name})`)
    }
    const layout = read(path.join(F.dir, 'app/layout.tsx'))
    check(/from ["']next\/font\/google["']/.test(layout), 'layout.tsx imports from next/font/google', layout)
    for (const f of fontItems) {
      check(new RegExp(`\\b${f.font.import}\\b`).test(layout), `layout.tsx uses ${f.font.import}`)
      check(new RegExp(`variable:\\s*'${f.font.variable}'`).test(layout), `layout.tsx sets variable ${f.font.variable}`)
    }
    check(/<html[^>]*className=\{cn\(/.test(layout) && (layout.match(/\.variable/g) ?? []).length >= fontItems.length, '<html> className gets every font .variable', layout)
    check(!/<html[^>]*font-mono/.test(layout), 'font-mono is not put on <html>', layout)
    const parsed = scanImports(layout, 'layout.tsx')
    check(parsed.some((i) => i.spec === 'next/font/google') && parsed.some((i) => i.spec.endsWith('/lib/utils')), 'layout.tsx still parses and imports cn from the utils alias', JSON.stringify(parsed))
    const css = analyzeCss(read(path.join(F.dir, 'app/globals.css')))
    const themeMap = css.decls(css.at('theme', 'inline')[0]).map
    for (const f of fontItems) check(themeMap[f.font.variable] === `var(${f.font.variable})`, `@theme inline ${f.font.variable} defers to the next/font variable`, themeMap[f.font.variable])
  }

  if (want('G')) {
    section('G registry add / search / view / --dry-run against the built registry')
    const G = consumerA({ name: 'consumer-g', registries: undefined, utilsSource: CLASSIC_UTILS })
    const ra = await cli(G, ['registry', 'add', `@looseleaf=${base}/r/{name}.json`])
    check(ra.code === 0, 'shadcn registry add @looseleaf=<url>/{name}.json exits 0', ra.out)
    const cj = JSON.parse(read(path.join(G.dir, 'components.json')))
    check(cj.registries?.['@looseleaf'] === `${base}/r/{name}.json`, 'components.json now has the @looseleaf registry', JSON.stringify(cj.registries))
    const listed = []
    let rs
    for (let offset = 0; offset < 2000; offset += 100) {
      rs = await cli(G, ['search', '@looseleaf', '--json', '--limit', '100', '--offset', String(offset)])
      let page
      try {
        page = JSON.parse(rs.stdout)
      } catch {}
      if (!page?.items) break
      listed.push(...page.items.map((i) => i.name))
      if (!page.pagination?.hasMore) break
    }
    check(rs.code === 0 && names.every((n) => listed.includes(n)), `shadcn search @looseleaf lists every item of the registry (${listed.length} of ${names.length})`, `missing: ${names.filter((n) => !listed.includes(n)).join(',')}\n${rs.out.slice(0, 300)}`)
    if (built.utils) {
      const H = consumerA({ name: 'consumer-h', utilsSource: null, deps: null })
      const ru = await shadcn(H, [`${base}/r/utils.json`], { shim: 'ok' })
      check(ru.code === 0 && existsSync(path.join(H.dir, 'src/lib/utils.ts')), 'the utils item installs src/lib/utils.ts for projects that skipped `shadcn init`', ru.out)
      check(/export function cn\(/.test(readFileSync(path.join(H.dir, 'src/lib/utils.ts'), 'utf8')), 'and it exports cn()')
      const asked = ru.shimCalls.join(' ')
      check(/clsx/.test(asked) && /tailwind-merge/.test(asked), 'and requests clsx and tailwind-merge', asked)
    }
    if (first) {
      const rv = await cli(G, ['view', `@looseleaf/${first.name}`])
      let viewed
      try {
        viewed = JSON.parse(rv.stdout)
      } catch {}
      const item = Array.isArray(viewed) ? viewed[0] : viewed
      check(item?.name === first.name && item.files?.[0]?.content?.length > 0, `shadcn view @looseleaf/${first.name} prints the item with its file content`, rv.out.slice(0, 300))
      const dry = await cli(G, ['add', `@looseleaf/${first.name}`, '--dry-run', '--yes'])
      check(dry.code === 0 && !existsSync(placeOf(G, first.files[0].target)), '--dry-run resolves the item without writing files', dry.out.slice(0, 300))
    }
  }

  const smokeNames = ['button', 'dialog'].filter((n) => built[n])
  const smokeBlock = built['login-01'] ?? built.login ?? blk
  if (want('I') && smokeNames.length === 2 && smokeBlock && theme) {
    section('I smoke: button + dialog + a login block in a Vite-shaped project (stock tsconfig, Tailwind build of the installed classes)')
    const VITE_TS = {
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      useDefineForClassFields: true,
      types: ['vite/client'],
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      moduleDetection: 'force',
      noUnusedLocals: true,
      noUnusedParameters: true,
      erasableSyntaxOnly: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedSideEffectImports: true,
    }
    const unexpectedBefore = srv.unexpected.length
    const I = consumerA({ name: 'consumer-i', tsOptions: VITE_TS, utilsSource: CLASSIC_UTILS })
    const wanted = [...smokeNames, smokeBlock.name]
    for (const name of wanted) {
      const r = await shadcn(I, [`@looseleaf/${name}`], { overwrite: !quiet })
      check(r.code === 0, `add @looseleaf/${name} exits 0`, r.out)
      check(pkgCallsOk(r), pkgCallsMsg(r), r.shimCalls.join('\n'))
    }
    for (const name of wanted) for (const { f, at } of installedTargets(I, built[name])) check(existsSync(at), `${name}: ${f.target} installed`)
    const isPage = smokeBlock.files.some((f) => /\/page\.tsx$/.test(f.target))
    const blockImport = isPage ? `import BlockPage from "@/components/blocks/${smokeBlock.name}/page"` : `import { LoginBlock as BlockPage } from "@/components/blocks/${smokeBlock.name}"`
    const blockJsx = isPage ? '<BlockPage as="div" />' : '<BlockPage />'
    write(
      path.join(I.dir, 'src/App.tsx'),
      [
        'import { Button } from "@/components/ui/button"',
        'import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"',
        blockImport,
        '',
        'export default function App() {',
        '  return (',
        '    <div className="min-h-svh bg-background p-6 text-foreground">',
        `      <Button${/\boutline\s*:/.test(read(placeOf(I, built.button.files[0].target))) ? ' variant="outline" size="sm"' : ''}>Save</Button>`,
        '      <Dialog>',
        '        <DialogTrigger asChild>',
        '          <Button>Open</Button>',
        '        </DialogTrigger>',
        '        <DialogContent>Hello</DialogContent>',
        '      </Dialog>',
        `      ${blockJsx}`,
        '    </div>',
        '  )',
        '}',
        '',
      ].join('\n')
    )
    write(path.join(I.dir, 'src/main.tsx'), 'import { createRoot } from "react-dom/client"\n\nimport "./index.css"\nimport App from "./App.tsx"\n\ncreateRoot(document.body).render(<App />)\n')
    const files = listFiles(I.dir).filter((f) => f.startsWith('src/'))
    const left = leftovers(I, files)
    check(left.length === 0, 'no leftover registry text in any installed file (I)', left.join('\n'))
    checkAliasImportsResolve(I, files, 'consumer I')
    if (!has('--no-typecheck')) {
      const t = await typecheck(I)
      check(t.ok, `TypeScript accepts the app and ${files.filter(isCode).length} installed source files under the stock Vite tsconfig (consumer I)`, t.out.split('\n').slice(0, 30).join('\n'))
    }
    await tailwindOnInstalled(I, 'src/index.css', 'consumer I')
    check(srv.unexpected.length === unexpectedBefore, 'the CLI only asked the local server for registry files (I)', srv.unexpected.slice(unexpectedBefore).join(', '))
  }

  const recipeFile = uiItems.find((i) => i.name === 'button')?.files.find((f) => /recipes\/button-ink\.ts$/.test(f.path))
  if (want('H') && recipeFile) {
    section('H the CLI re-resolves imports by base name: the scanner predicts it (recipes are <slug>-ink.ts for this reason)')
    const hz = mkdirUnique('hazard-tree')
    copyTree(TREE, hz)
    renameSync(path.join(hz, 'src/lib/ink/recipes/button-ink.ts'), path.join(hz, 'src/lib/ink/recipes/button.ts'))
    write(path.join(hz, 'src/components/ui/button.tsx'), read(path.join(hz, 'src/components/ui/button.tsx')).replace('@/lib/ink/recipes/button-ink', '@/lib/ink/recipes/button'))
    const hzOut = path.join(runDir, 'hz')
    mkdirSync(hzOut, { recursive: true })
    mounts['/hz'] = hzOut
    const common = { root: hz, registryFile: path.join(runDir, 'registry-hz.json'), log: () => {}, url: `${base}/hz`, deps: 'url' }
    const refused = await runRegistryBuild({ ...common, outDir: path.join(runDir, 'hz-unused'), build: false })
    check(refused.errors.some((e) => /button\.tsx.*re-resolves "@\/lib\/ink\/recipes\/button" to "@\/components\/ui\/button"/.test(e)), 'the scanner predicts the CLI rewrite and refuses to build recipes/button.ts next to ui/button.tsx', refused.errors.join('\n'))
    const bh = await runRegistryBuild({ ...common, outDir: hzOut, cliHazard: 'off' })
    check(bh.ok, 'the same tree builds with the check switched off', bh.errors.join('\n'))
    if (bh.ok) {
      const H = consumerA({ name: 'consumer-h-hazard', registries: { '@looseleaf': `${base}/hz/{name}.json` }, utilsSource: CLASSIC_UTILS })
      const r = await shadcn(H, ['@looseleaf/button'])
      check(r.code === 0, 'add @looseleaf/button (hazard tree) exits 0', r.out)
      const installed = path.join(H.dir, 'src/components/ui/button.tsx')
      check(existsSync(path.join(H.dir, 'src/lib/ink/recipes/button.ts')), 'the recipe was installed next to the component')
      const spec = existsSync(installed) ? importsOf(installed).find((x) => /recipes\/button$|components\/ui\/button$/.test(x)) : undefined
      if (spec === '@/components/ui/button') check(true, 'confirmed with the real CLI: "@/lib/ink/recipes/button" became "@/components/ui/button" (.tsx outranks .ts by base name)')
      else if (spec === '@/lib/ink/recipes/button') console.log('  note  this shadcn CLI no longer re-resolves imports by base name: the <slug>-ink.ts naming rule and the check in tools/registry/scan.mjs can be relaxed')
      else check(false, 'the button import is one of the two known outcomes', String(spec))
    }
  }

  return finish(srv)
}

async function finish(srv) {
  await new Promise((r) => srv.server.close(r))
  const failed = results.filter((r) => !r.ok)
  console.log(`\n[consumer-test] ${results.length - failed.length}/${results.length} checks passed`)
  if (failed.length) {
    console.log('failed:')
    for (const f of failed) console.log(`  [${f.scenario}] ${f.msg}`)
  }
  const keep = has('--keep') || (failed.length > 0 && !has('--clean'))
  if (keep) {
    console.log(`[consumer-test] kept for inspection: ${[...new Set(created)].filter((d) => existsSync(d) && !d.endsWith('.log')).map((d) => path.relative(REPO_ROOT, d)).join(', ')}`)
  } else {
    for (const d of created) rmSync(d, { recursive: true, force: true })
    console.log('[consumer-test] cleaned up')
  }
  return failed.length === 0 && results.length > 0
}

process.once('SIGINT', () => {
  for (const d of created) rmSync(d, { recursive: true, force: true })
  process.exit(130)
})

const ok = await withHeavy(main).catch((e) => {
  console.error(e.stack ?? e)
  return false
})
process.exit(ok ? 0 : 1)
