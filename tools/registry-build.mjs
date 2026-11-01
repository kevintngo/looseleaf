#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { REPO_ROOT, SCHEMA_DIR, addressToName } from './registry/config.mjs'
import { runRegistryBuild } from './registry/build.mjs'
import { SCHEMA_IDS } from './registry/jsonschema.mjs'

const argv = process.argv.slice(2)
const flags = new Set()
const values = {}
const VALUE_FLAGS = new Set(['--root', '--registry', '--out', '--url', '--deps', '--namespace', '--theme-dep', '--pins', '--explain'])
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '-h' || a === '--help') {
    console.log(readUsage())
    process.exit(0)
  }
  if (a === '-q') flags.add('--quiet')
  else if (VALUE_FLAGS.has(a)) values[a] = argv[++i]
  else if (a.startsWith('--') && a.includes('=') && VALUE_FLAGS.has(a.split('=')[0])) values[a.split('=')[0]] = a.slice(a.indexOf('=') + 1)
  else if (a.startsWith('-')) flags.add(a)
  else {
    console.error(`unexpected argument "${a}" (try --help)`)
    process.exit(2)
  }
}
for (const f of flags) {
  if (!['--check', '--fail-stale', '--json', '--quiet', '--no-build', '--no-targets', '--refresh-schema', '--stable-directives', '--list'].includes(f)) {
    console.error(`unknown option ${f} (try --help)`)
    process.exit(2)
  }
}

function readUsage() {
  return [
    'usage: node tools/registry-build.mjs [--check] [--root dir] [--registry file] [--out dir] [--url base]',
    '                                     [--deps url|namespace|name] [--namespace @ns] [--theme-dep all|none] [--pins on|off]',
    '                                     [--no-targets] [--stable-directives] [--no-build] [--fail-stale] [--explain item] [--list] [--refresh-schema] [--json] [-q]',
    'see the header of tools/registry-build.mjs and notes/registry.md',
  ].join('\n')
}

if (flags.has('--refresh-schema')) {
  for (const [id, file] of Object.entries(SCHEMA_IDS)) {
    const res = await fetch(id)
    if (!res.ok) {
      console.error(`[registry] could not fetch ${id}: HTTP ${res.status}`)
      process.exit(1)
    }
    const text = await res.text()
    JSON.parse(text)
    writeFileSync(path.join(SCHEMA_DIR, file), text.endsWith('\n') ? text : `${text}\n`)
    console.log(`[registry] updated tools/schema/${file} from ${id}`)
  }
  process.exit(0)
}

const explain = values['--explain']
const list = flags.has('--list')
const quiet = flags.has('--quiet') || flags.has('--json') || Boolean(explain) || list
const log = quiet ? () => {} : (m) => console.log(`[registry] ${m}`)

let result
try {
  result = await runRegistryBuild({
    root: values['--root'] ? path.resolve(values['--root']) : REPO_ROOT,
    registryFile: values['--registry'] ? path.resolve(values['--registry']) : undefined,
    outDir: values['--out'] ? path.resolve(values['--out']) : undefined,
    url: values['--url'],
    deps: values['--deps'],
    namespace: values['--namespace'],
    themeDep: values['--theme-dep'],
    pins: values['--pins'],
    targets: !flags.has('--no-targets'),
    stableDirectives: flags.has('--stable-directives') || undefined,
    build: explain || list ? false : !flags.has('--no-build'),
    check: flags.has('--check') || Boolean(explain) || list,
    log,
  })
} catch (e) {
  console.error(`[registry] ${e.stack ?? e}`)
  process.exit(1)
}

function printList() {
  const short = (n) => n.replace(/^https?:\/\/.*\/(.+)\.json$/, '$1').replace(/^@[^/]+\//, '')
  const rows = result.registry.items.map((i) => {
    const src = result.scan?.items.get(i.name)
    const kb = src ? src.files.reduce((n, f) => n + Buffer.byteLength(f.content), 0) / 1024 : 0
    const needs = (i.registryDependencies ?? []).map(short).filter((n) => n !== 'looseleaf-theme')
    return [i.name, i.type.replace('registry:', ''), String(i.files?.length ?? 0), kb ? kb.toFixed(1) : '-', (i.dependencies ?? []).join(' ') || '-', needs.join(' ') || '-']
  })
  const head = ['item', 'type', 'files', 'KB', 'npm', 'needs']
  const widths = head.map((h, c) => Math.max(h.length, ...rows.map((r) => r[c].length)))
  const line = (r) => r.map((cell, c) => (c === r.length - 1 ? cell : cell.padEnd(widths[c]))).join('  ')
  console.log([line(head), ...rows.map(line)].join('\n'))
  for (const w of result.warnings) console.warn(`warning: ${w}`)
  for (const e of result.errors) console.error(`ERROR: ${e}`)
  console.log(`\n${rows.length} items${result.errors.length ? `, ${result.errors.length} error(s)` : ''}. "needs" leaves out looseleaf-theme, which every ui item and block depends on.`)
  process.exitCode = result.errors.length ? 1 : 0
}

function printExplain() {
  const items = new Map(result.registry.items.map((i) => [i.name, i]))
  if (!items.has(explain)) {
    console.error(`[registry] no item "${explain}". Items: ${[...items.keys()].join(', ')}`)
    process.exitCode = 1
    return
  }
  const order = []
  const walk = (name) => {
    if (order.includes(name) || !items.has(name)) return
    order.push(name)
    for (const d of items.get(name).registryDependencies ?? []) walk(addressToName(d, result.cfg))
  }
  walk(explain)
  const closure = order.map((n) => items.get(n))
  const files = closure.flatMap((i) => (i.files ?? []).map((f) => `${(f.target ?? f.path).padEnd(46)} ${f.path.padEnd(42)} (${i.name})`))
  const npm = [...new Set(closure.flatMap((i) => [...(i.dependencies ?? []), ...(i.devDependencies ?? [])]))].sort()
  const cssBits = closure.filter((i) => i.cssVars || i.css).map((i) => `${i.name}: cssVars ${Object.entries(i.cssVars ?? {}).map(([k, v]) => `${k}=${Object.keys(v).length}`).join(' ') || '-'}, css rules ${Object.keys(i.css ?? {}).length}`)
  console.log(`shadcn add ${explain}  (${items.get(explain).type})\n`)
  console.log(`registry items (${closure.length}): ${order.join(', ')}\n`)
  console.log(`files (${files.length}):\n  ${files.join('\n  ') || '(none)'}\n`)
  console.log(`npm packages (${npm.length}): ${npm.join(', ') || '(none)'}\n`)
  console.log(`css merged into the project stylesheet:\n  ${cssBits.join('\n  ') || '(none)'}`)
  for (const w of result.warnings.filter((x) => x.startsWith(`${explain}:`))) console.warn(`warning: ${w}`)
  for (const e of result.errors) console.error(`ERROR: ${e}`)
  process.exitCode = result.errors.length ? 1 : 0
}

function printReport() {
  const staleIsError = flags.has('--fail-stale')
  const failed = !result.ok || (staleIsError && result.stale.length > 0)
  if (flags.has('--json')) {
    console.log(JSON.stringify({ ok: !failed, items: result.items, errors: result.errors, warnings: result.warnings, stale: result.stale, sizes: result.sizes }, null, 2))
  } else {
    const LIMIT = 40
    const show = (entries, print) => {
      for (const m of entries.slice(0, LIMIT)) print(m)
      if (entries.length > LIMIT) print(`… ${entries.length - LIMIT} more (run with --json to see all)`)
    }
    show(result.warnings, (m) => console.warn(`[registry] warning: ${m}`))
    show(result.errors, (m) => console.error(`[registry] ERROR: ${m}`))
    if (result.stale.length) {
      const label = staleIsError ? 'ERROR' : 'note'
      const shown = result.stale.length > 6 ? `${result.stale.slice(0, 6).join(', ')}, … ${result.stale.length - 6} more (${result.stale.length} in all)` : result.stale.join(', ')
      console[staleIsError ? 'error' : 'log'](`[registry] ${label}: out of date, run \`npm run registry:build\`: ${shown}`)
    }
    if (!quiet || failed) {
      const byType = {}
      for (const i of result.items) byType[i.type] = (byType[i.type] ?? 0) + 1
      const kb = Object.values(result.sizes).reduce((a, b) => a + b, 0) / 1024
      const summary = Object.entries(byType).map(([t, n]) => `${n} ${t.replace('registry:', '')}`).join(', ') || 'no items'
      console.log(`[registry] ${failed ? 'FAILED' : 'ok'}: ${summary}${kb ? `, ${kb.toFixed(0)} KB of JSON` : ''}${result.patched ? `, ${result.patched} item(s) post-processed` : ''}`)
    }
  }
  process.exitCode = failed ? 1 : 0
}

if (list) printList()
else if (explain) printExplain()
else printReport()
