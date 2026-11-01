#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { PROJECT_ROOT, c, collectFiles, parseArgs, readJson, readText, toPosix } from './lib/util.mjs'
import { withHeavy } from './registry/run.mjs'
import { readMeta, scanExports } from './registry/parse.mjs'

const NODE = process.execPath
const STEP_IDS = ['lint', 'classes', 'tokens', 'typecheck', 'shipped', 'docs', 'registry', 'art', 'tests', 'smoke']
const ART_KINDS = ['icons', 'doodles', 'stickers', 'mascot', 'mascots', 'props', 'scenes']
const ART_DIR = { icons: 'icons', doodles: 'doodles', stickers: 'stickers', mascot: 'mascots', mascots: 'mascots', props: 'props', scenes: 'scenes' }
const MIN_EXAMPLES = 3

export function resolveScope(slug, root = PROJECT_ROOT) {
  const exists = (rel) => fs.existsSync(path.join(root, rel))
  const isDir = (rel) => exists(rel) && fs.statSync(path.join(root, rel)).isDirectory()
  const scope = { slug, kind: null, files: [], dirs: [], tests: [], smoke: false, artBatch: null, artBatches: [], notes: [] }
  const addFile = (rel) => exists(rel) && !scope.files.includes(rel) && scope.files.push(rel)
  const addDir = (rel) => isDir(rel) && !scope.dirs.includes(rel) && scope.dirs.push(rel)

  let batches = []
  try {
    batches = readJson(path.join(root, 'notes/art-batches.json'), []) ?? []
  } catch {
    scope.notes.push('notes/art-batches.json is not valid JSON')
  }
  const batch = batches.find((b) => b.batch === slug)
  const artDir = (kind) => (isDir(`src/lib/ink/art/${kind}`) ? kind : ART_DIR[kind] ?? kind)
  const batchesOfKind = (kind) => batches.filter((b) => String(b.file ?? '').startsWith(`src/lib/ink/art/${artDir(kind)}/`)).map((b) => b.batch)
  if (batch) {
    scope.kind = 'art'
    scope.artBatch = batch.batch
    scope.artBatches = [batch.batch]
    const field = String(batch.file ?? '')
    const primary = field.match(/src\/lib\/ink\/art\/[\w./-]+\.ts/g) ?? []
    const extras = /\(\+\s*([^)]*)\)/.exec(field)?.[1].split(',').map((x) => x.trim()).filter(Boolean) ?? []
    for (const f of primary) addFile(f)
    for (const f of extras) addFile(f.startsWith('src/') ? f : `src/lib/ink/art/${f}`)
    if (!scope.files.length) scope.notes.push(`batch file ${primary[0] ?? field} does not exist yet`)
    return scope
  }
  const ui = `src/components/ui/${slug}.tsx`
  if (ART_KINDS.includes(slug) && isDir(`src/lib/ink/art/${artDir(slug)}`) && !exists(ui)) {
    scope.kind = 'art'
    scope.artBatch = slug
    scope.artBatches = batchesOfKind(slug)
    addDir(`src/lib/ink/art/${artDir(slug)}`)
    return scope
  }
  if (exists(ui)) {
    scope.kind = 'ui'
    addFile(ui)
    addDir(`src/docs/examples/${slug}`)
    for (const m of [`src/docs/meta/${slug}.ts`, `src/docs/meta/${slug}.tsx`]) addFile(m)
    for (const dir of [`src/lib/ink/${slug}s`, `src/lib/ink/${slug}`]) addDir(dir)
    scope.smoke = true
    if (ART_KINDS.includes(slug) && isDir(`src/lib/ink/art/${artDir(slug)}`)) {
      addDir(`src/lib/ink/art/${artDir(slug)}`)
      scope.artBatch = slug
      scope.artBatches = batchesOfKind(slug)
    }
  } else if (exists(`src/hooks/${slug}.ts`) || exists(`src/hooks/${slug}.tsx`)) {
    scope.kind = 'hook'
    for (const ext of ['.ts', '.tsx']) addFile(`src/hooks/${slug}${ext}`)
  } else if (isDir(`src/blocks/${slug}`)) {
    scope.kind = 'block'
    addDir(`src/blocks/${slug}`)
    for (const f of collectFiles(root, [`src/docs/content/blocks/${slug}.{ts,tsx}`, `src/docs/content/blocks/${slug}.meta.{ts,tsx}`, `src/docs/meta/${slug}.ts`])) addFile(f)
  }
  for (const rel of [`src/lib/ink/recipes/${slug}-ink.ts`, `src/lib/ink/recipes/${slug}.ts`, `src/lib/ink/recipes/${slug}.tsx`]) addFile(rel)
  for (const rel of [`src/lib/ink/recipes/${slug}-ink`, `src/lib/ink/recipes/${slug}`]) addDir(rel)
  if (!scope.kind && (scope.files.length || scope.dirs.length)) scope.kind = 'recipe'
  scope.tests = collectFiles(root, [`tests/${slug}.test.{ts,tsx}`, `tests/${slug}.*.test.{ts,tsx}`, ...(scope.kind === 'block' ? [`tests/blocks-${slug}.test.{ts,tsx}`, `tests/blocks-${slug}.*.test.{ts,tsx}`] : [])])
  if (!scope.kind && scope.tests.length) scope.kind = 'tests'
  return scope.kind ? scope : null
}

const scopePaths = (scope) => [...scope.files, ...scope.dirs.map((d) => `${d}/`)]
const inScope = (scope, file) => scopePaths(scope).some((p) => (p.endsWith('/') ? file.startsWith(p) : file === p))
const mentionsScope = (scope, text) => scopePaths(scope).some((p) => text.includes(p)) || (scope.artBatch == null && new RegExp(`"${scope.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(text))

const script = (name) => path.join('tools', name)
const bin = (rel) => path.join('node_modules', rel)

export function planSteps({ slug = null, only = [], noTypecheck = false, withTests = false, root = PROJECT_ROOT, scope = undefined } = {}) {
  const exists = (rel) => fs.existsSync(path.join(root, rel))
  if (slug && scope === undefined) scope = resolveScope(slug, root)
  const steps = []
  const globsOf = (sc) => [...sc.files, ...sc.dirs.map((d) => `${d}/**`)]
  const tsxScope = scope ? scope.files.some((f) => f.endsWith('.tsx')) || scope.dirs.length > 0 : false

  if (slug && !scope) return []
  const scoped = Boolean(scope)

  steps.push({
    id: 'lint',
    label: 'lint-house',
    cmd: [NODE, script('lint-house.mjs'), ...(scoped ? [...scope.files, ...scope.dirs] : [])],
    skip: scoped && !scope.files.length && !scope.dirs.length ? 'no source files in scope yet' : null,
  })
  steps.push({
    id: 'classes',
    label: 'check-classes',
    cmd: [NODE, script('check-classes.mjs'), ...(scoped ? globsOf(scope).flatMap((g) => ['--only', g]) : [])],
    skip: scoped && !tsxScope ? 'no tsx files in scope' : null,
  })
  steps.push({
    id: 'tokens',
    label: 'check-tokens',
    cmd: [NODE, script('check-tokens.mjs'), ...(scoped ? globsOf(scope).flatMap((g) => ['--only', g]) : [])],
    skip: scoped && !scope.files.length && !scope.dirs.length ? 'no source files in scope yet' : null,
  })
  steps.push({
    id: 'typecheck',
    label: 'typecheck',
    cmd: [NODE, bin('typescript/bin/tsc'), '-p', 'tsconfig.json', '--noEmit', '--pretty', 'false'],
    skip: noTypecheck ? '--no-typecheck' : null,
    attribute: 'tsc',
  })
  const shippedSrc = /^src\/(?:components\/ui|hooks|lib|blocks)\//
  steps.push({
    id: 'shipped',
    label: 'shipped code, stock Vite tsconfig',
    cmd: [NODE, bin('typescript/bin/tsc'), '-p', 'tools/registry/tsconfig.shipped.json', '--noEmit', '--pretty', 'false'],
    skip: noTypecheck ? '--no-typecheck' : scoped && !scope.files.some((f) => shippedSrc.test(f)) && !scope.dirs.some((d) => shippedSrc.test(`${d}/`)) ? 'no shipped source in scope' : null,
    attribute: 'tsc',
  })
  if (scoped && scope.kind === 'ui') steps.push({ id: 'docs', label: 'docs meta + examples + test', inProcess: 'docs' })
  steps.push({
    id: 'registry',
    label: 'registry scan',
    cmd: [NODE, script('registry-build.mjs'), '--check', '--no-build', '--json'],
    skip: scoped && !(scope.files.length || scope.dirs.length) ? 'no source files in scope yet' : null,
    attribute: 'registry',
  })
  if (scoped && scope.artBatch) {
    const artCheck = exists('tools/art-check.mjs')
    const single = scope.artBatches.length === 1
    steps.push({
      id: 'art',
      label: `art-check ${scope.artBatch}`,
      cmd: [NODE, script('art-check.mjs'), '--json', ...(single ? ['--batch', scope.artBatches[0]] : [])],
      skip: artCheck ? null : 'tools/art-check.mjs does not exist yet',
      attribute: 'art',
    })
  }
  if (scoped && (scope.tests.length || scope.smoke)) {
    const testFiles = scope.tests
    const wantSmoke = scope.smoke
    const testStep = {
      id: 'tests',
      label: '',
      cmd: null,
      env: {},
      skip: null,
      testFiles,
      smokeFiles: wantSmoke ? ['tests/ssr-smoke.test.tsx', 'tests/hydrate-smoke.test.tsx', 'tests/drawn-smoke.test.tsx'] : [],
      slug,
      required: scope.kind === 'ui',
    }
    steps.push(testStep)
  } else if (withTests) {
    steps.push({ id: 'tests', label: 'vitest (all)', cmd: [NODE, bin('vitest/vitest.mjs'), 'run'], skip: null, env: {} })
  }

  const pick = only.length ? steps.filter((s) => only.includes(s.id) || (s.id === 'tests' && only.includes('smoke'))) : steps
  return pick.map((s) => (s.id === 'tests' && s.testFiles ? finishTestStep(s, only) : s))
}

function finishTestStep(step, only) {
  const withSlugTests = !only.length || only.includes('tests')
  const withSmoke = !only.length || only.includes('smoke')
  const files = [...(withSlugTests ? step.testFiles : []), ...(withSmoke ? step.smokeFiles.filter((f) => fs.existsSync(path.join(PROJECT_ROOT, f))) : [])]
  const parts = []
  if (withSlugTests && step.testFiles.length) parts.push(step.testFiles.join(' '))
  if (withSmoke && step.smokeFiles.length) parts.push('ssr + hydration smoke')
  const missingTest = withSlugTests && step.required && !step.testFiles.length
  return {
    ...step,
    label: parts.length ? `vitest ${parts.join(' + ')}` : 'vitest',
    cmd: [NODE, bin('vitest/vitest.mjs'), 'run', ...files],
    env: { SMOKE_SLUG: step.slug },
    skip: files.length ? null : missingTest ? null : 'no tests for this slug',
    failWith: missingTest ? `tests/${step.slug}.test.tsx does not exist: every component ships a test (renders, roles/labels, keyboard, axe, ink layers; see notes/qa-tools.md)` : null,
  }
}

export function docsProblems(scope, root = PROJECT_ROOT) {
  const problems = []
  const slug = scope.slug
  const metaRel = scope.files.find((f) => f.startsWith('src/docs/meta/'))
  if (!metaRel) problems.push(`src/docs/meta/${slug}.ts is missing (ComponentDoc: slug, title, category, description, parts, usage)`)
  else {
    const { data, error } = readMeta(readText(path.join(root, metaRel)) ?? '', metaRel)
    if (!data) problems.push(`${metaRel}: ${error}`)
    else {
      if (data.slug !== slug) problems.push(`${metaRel}: slug is ${JSON.stringify(data.slug)}, expected "${slug}"`)
      for (const key of ['title', 'category', 'description', 'usage']) if (typeof data[key] !== 'string' || !data[key].trim()) problems.push(`${metaRel}: "${key}" is missing (a string literal)`)
      if (!Array.isArray(data.parts) || !data.parts.length) problems.push(`${metaRel}: "parts" is empty: list every exported part`)
      else {
        const ui = scope.files.find((f) => f.startsWith('src/components/ui/'))
        const { names, typeOnly } = scanExports(readText(path.join(root, ui)) ?? '', ui)
        const known = new Set([...names, ...typeOnly])
        for (const part of data.parts) if (part?.name && !known.has(part.name)) problems.push(`${metaRel}: part "${part.name}" is not exported by ${ui}`)
        const parts = new Set(data.parts.map((p) => p?.name))
        const missing = names.filter((n) => /^[A-Z][A-Za-z0-9]*[a-z][A-Za-z0-9]*$/.test(n) && !parts.has(n))
        if (missing.length) problems.push(`${metaRel}: exported but not documented in parts: ${missing.join(', ')}`)
      }
    }
  }
  const examples = collectFiles(root, [`src/docs/examples/${slug}/*.tsx`]).filter((f) => !path.posix.basename(f).startsWith('_'))
  if (examples.length < MIN_EXAMPLES) problems.push(`src/docs/examples/${slug}/ has ${examples.length} example(s), the minimum is ${MIN_EXAMPLES} (default, the interesting variants, one composed real-world use)`)
  if (!scope.tests.length) problems.push(`tests/${slug}.test.tsx is missing`)
  const notes = []
  if (!fs.existsSync(path.join(root, `tools/lookdev/specimens/${slug}.ts`)) && !fs.existsSync(path.join(root, `lookdev/components/${slug}.png`))) {
    notes.push(`no look-dev evidence yet: tools/lookdev/specimens/${slug}.ts -> lookdev/components/${slug}.png (view it with the Read tool)`)
  }
  return { problems, examples: examples.length, notes }
}

function run(cmd, { inherit = false, env = {} }) {
  return new Promise((resolve) => {
    const started = Date.now()
    const childEnv = { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', ...env }
    if (!childEnv.NODE_OPTIONS) childEnv.NODE_OPTIONS = '--max-old-space-size=2048'
    childEnv.PATH = `${path.join(PROJECT_ROOT, 'node_modules', '.bin')}${path.delimiter}${childEnv.PATH ?? ''}`
    const child = spawn(cmd[0], cmd.slice(1), { cwd: PROJECT_ROOT, stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'], env: childEnv })
    let out = ''
    let stdout = ''
    child.stdout?.on('data', (d) => {
      out += d
      stdout += d
    })
    child.stderr?.on('data', (d) => (out += d))
    child.on('close', (code) => resolve({ code: code ?? 1, out, stdout, ms: Date.now() - started }))
    child.on('error', (e) => resolve({ code: 1, out: String(e), stdout: '', ms: Date.now() - started }))
  })
}

export function splitTscOutput(out) {
  const errors = []
  for (const line of out.split('\n')) {
    const m = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/.exec(line)
    if (m) errors.push({ file: toPosix(m[1]), line: Number(m[2]), text: line })
    else if (errors.length && /^\s/.test(line)) errors[errors.length - 1].text += `\n${line}`
  }
  return errors
}

const short = (s, n = 110) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

export function judge(step, result, scope) {
  const lines = result.out.trim().split('\n').filter(Boolean)
  const summary = lines[lines.length - 1] ?? ''
  if (step.attribute === 'tsc' && scope) {
    const errors = splitTscOutput(result.out)
    if (result.code !== 0 && !errors.length) return { ok: false, lines, note: '' }
    const mine = errors.filter((e) => inScope(scope, e.file))
    const others = errors.filter((e) => !inScope(scope, e.file))
    const note = others.length ? `${others.length} type error(s) in other files, not yours: ${[...new Set(others.map((e) => e.file))].slice(0, 4).join(', ')}` : ''
    return { ok: mine.length === 0, lines: mine.flatMap((e) => e.text.split('\n')), note, summary: mine.length ? '' : others.length ? 'your files are clean' : 'clean' }
  }
  if (step.attribute === 'registry') {
    let json = null
    try {
      json = JSON.parse(result.stdout)
    } catch {
      return { ok: result.code === 0, lines, note: '' }
    }
    const errors = json.errors ?? []
    const mine = scope ? errors.filter((e) => mentionsScope(scope, e)) : errors
    const others = errors.length - mine.length
    const warnings = (json.warnings ?? []).filter((w) => (scope ? mentionsScope(scope, w) : true))
    return {
      ok: mine.length === 0,
      lines: [...mine.map((e) => `ERROR ${e}`), ...warnings.map((w) => `warning ${w}`)],
      note: others ? `${others} registry error(s) in other files, not yours` : '',
      summary: `${json.items?.length ?? 0} registry items${warnings.length ? `, ${warnings.length} warning(s)` : ''}`,
    }
  }
  if (step.attribute === 'art') {
    let json = null
    try {
      json = JSON.parse(result.stdout)
    } catch {
      return { ok: result.code === 0, lines, summary }
    }
    const mine = (json.batches ?? []).filter((b) => (scope?.artBatches?.length ? scope.artBatches.includes(b.batch) : true))
    const problems = mine.flatMap((b) => (b.problems ?? []).map((p) => ({ ...p, batch: b.batch })))
    const errors = problems.filter((p) => p.level === 'error')
    const warns = problems.filter((p) => p.level !== 'error')
    const fmt = (p) => `${p.level === 'error' ? 'ERROR' : 'warning'} ${p.batch}${p.id ? ` ${p.id}` : ''} [${p.code}] ${p.msg}`
    const drawn = mine.reduce((n, b) => n + (b.drawn?.length ?? 0), 0)
    const planned = mine.reduce((n, b) => n + (b.planned ?? 0), 0)
    return {
      ok: errors.length === 0,
      lines: [...errors.map(fmt), ...warns.map(fmt)],
      summary: `${drawn}/${planned} ids drawn in ${mine.length} batch(es)${warns.length ? `, ${warns.length} warning(s)` : ''}`,
    }
  }
  if (step.id === 'tests') {
    const tests = /^\s*Tests\s+(.+)$/m.exec(result.out)?.[1]
    const files = /^\s*Test Files\s+(.+)$/m.exec(result.out)?.[1]
    return { ok: result.code === 0, lines, summary: tests ? `${tests}${files ? ` · ${files}` : ''}` : summary }
  }
  return { ok: result.code === 0, lines, summary: summary.replace(/^[✔✖]\s*/, '') }
}

async function main() {
  const { flags, positionals, errors } = parseArgs(process.argv.slice(2), {
    bool: ['no-typecheck', 'with-tests', 'fail-fast', 'verbose', 'dry-run', 'help'],
    list: ['only'],
  })
  const usage = `usage: node tools/qa.mjs [slug] [--only ${STEP_IDS.join(',')}] [--no-typecheck] [--with-tests] [--fail-fast] [--verbose] [--dry-run]`
  const badOnly = flags.only.filter((x) => !STEP_IDS.includes(x))
  if (errors.length || badOnly.length || flags.help || positionals.length > 1) {
    if (errors.length) console.error(errors.join('\n'))
    if (badOnly.length) console.error(`unknown step(s): ${badOnly.join(', ')}`)
    console.error(usage)
    process.exitCode = flags.help ? 0 : 2
    return
  }
  const slug = positionals[0]?.replace(/\.tsx?$/, '').replace(/^.*\//, '')
  const scope = slug ? resolveScope(slug) : null
  if (slug && !scope) {
    console.error(`qa: nothing found for "${slug}": no src/components/ui/${slug}.tsx, hook, block, recipe, art batch or tests/${slug}.test.tsx`)
    process.exitCode = 2
    return
  }
  const steps = planSteps({ slug, scope, only: flags.only, noTypecheck: flags['no-typecheck'], withTests: flags['with-tests'] })
  if (!steps.length) {
    console.error('qa: no steps selected')
    process.exitCode = 2
    return
  }
  if (flags['dry-run']) {
    console.log(`# one heavy slot for the whole run${scope ? ` · ${scope.kind} "${slug}": ${scopePaths(scope).join(' ') || '(no files yet)'}` : ''}`)
    for (const s of steps) {
      const what = s.inProcess ? `(in process) ${s.label}` : s.cmd.map((p) => (p === NODE ? 'node' : p)).join(' ')
      const env = s.env && Object.keys(s.env).length ? `${Object.entries(s.env).map(([k, v]) => `${k}=${v}`).join(' ')} ` : ''
      console.log(`${s.skip ? `# skipped (${s.skip}) ` : ''}${env}${what}`)
    }
    return
  }

  const started = Date.now()
  const ok = await withHeavy(async () => {
    console.log(c.bold(`qa${slug ? ` · ${slug}` : ''}${scope ? c.dim(` (${scope.kind})`) : ''}`))
    const results = []
    for (const step of steps) {
      if (step.skip) {
        results.push({ ...step, status: 'skip' })
        console.log(`${c.dim('-')} ${step.label.padEnd(34)} ${c.dim(`skipped (${step.skip})`)}`)
        continue
      }
      if (flags.verbose) console.log(c.bold(`\n▶ ${step.label}`))
      let verdict
      let ms = 0
      if (step.inProcess === 'docs') {
        const t0 = Date.now()
        const d = docsProblems(scope)
        ms = Date.now() - t0
        verdict = { ok: d.problems.length === 0, lines: d.problems, summary: `meta ok, ${d.examples} examples, test present`, note: d.notes.join('; ') }
      } else if (step.failWith) {
        verdict = { ok: false, lines: [step.failWith], summary: '' }
      } else {
        const inherit = flags.verbose && !step.attribute
        const r = await run(step.cmd, { inherit, env: step.env })
        ms = r.ms
        verdict = inherit ? { ok: r.code === 0, lines: [], summary: '' } : judge(step, r, scope)
        if (flags.verbose && step.attribute === 'tsc' && r.out.trim()) console.log(r.out.trim())
      }
      results.push({ ...step, status: verdict.ok ? 'ok' : 'fail' })
      const tail = verdict.ok ? c.dim(short(verdict.summary ?? '')) : ''
      console.log(`${verdict.ok ? c.green('✔') : c.red('✖')} ${step.label.padEnd(34)} ${c.dim(`${(ms / 1000).toFixed(1)}s`)} ${tail}`)
      if (verdict.ok && verdict.note) console.log(`    ${c.dim(verdict.note)}`)
      if (!verdict.ok) {
        console.log(verdict.lines.slice(-70).map((l) => `    ${l}`).join('\n'))
        if (verdict.note) console.log(`    ${c.dim(verdict.note)}`)
        if (flags['fail-fast']) break
      } else if (verdict.lines?.length && (step.attribute === 'registry' || step.attribute === 'art')) {
        console.log(verdict.lines.slice(0, 12).map((l) => `    ${c.yellow(l)}`).join('\n'))
      }
    }
    const failed = results.filter((r) => r.status === 'fail')
    console.log(failed.length ? c.red(`\n✖ qa failed: ${failed.map((f) => f.label).join(', ')}`) : c.green(`\n✔ qa passed`) + c.dim(` in ${((Date.now() - started) / 1000).toFixed(1)}s`))
    return failed.length === 0
  })
  process.exitCode = ok ? 0 : 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
