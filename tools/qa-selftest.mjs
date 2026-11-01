#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT, c, collectFiles, globToRegExp, parseArgs, readText } from './lib/util.mjs'
import { ColorError, contrastRatio, parseColor, toHex, toSrgb } from './lib/color.mjs'
import { customPropertyDecls, parseCss, varRefs } from './lib/css.mjs'
import { splitVariants, structuralProblem } from './lib/tw.mjs'
import { RULES } from './lint-house.mjs'

const { flags } = parseArgs(process.argv.slice(2), { bool: ['verbose'] })
const GOOD = 'tools/fixtures/good'
const BAD = 'tools/fixtures/bad'
const FIXTURE_PAIRS = ['--pairs', 'tools/fixtures/contrast-pairs.default.json']
const TMP = path.join(PROJECT_ROOT, 'lookdev', '_tmp', 'qa-selftest')

const results = []
async function check(name, fn) {
  try {
    await fn()
    results.push({ name, ok: true })
    if (flags.verbose) console.log(`${c.green('✔')} ${name}`)
  } catch (e) {
    results.push({ name, ok: false, error: e })
    console.log(`${c.red('✖')} ${name}\n    ${String(e.message ?? e).split('\n').join('\n    ')}`)
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}
function eq(actual, expected, what) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}
function tool(script, args = []) {
  const r = spawnSync(process.execPath, [path.join('tools', script), ...args], { cwd: PROJECT_ROOT, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } })
  let json = null
  try {
    json = JSON.parse(r.stdout)
  } catch {
  }
  return { code: r.status, out: r.stdout, err: r.stderr, json }
}
function mkTree(name, files) {
  const root = path.join(TMP, name)
  fs.rmSync(root, { recursive: true, force: true })
  fs.mkdirSync(root, { recursive: true })
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
    fs.writeFileSync(path.join(root, rel), text)
  }
  return path.relative(PROJECT_ROOT, root)
}

await check('color: WCAG maths (black/white 21, #777/white 4.478, napkin ink on paper 14.06)', () => {
  const g = (s) => toSrgb(parseColor(s))
  assert(Math.abs(contrastRatio(g('#000'), g('#fff')) - 21) < 0.001, 'black on white should be 21')
  assert(Math.abs(contrastRatio(g('#777777'), g('#ffffff')) - 4.478) < 0.005, '#777 on white should be 4.478')
  assert(Math.abs(contrastRatio(g('#2a2420'), g('#f8f5ee')) - 14.06) < 0.01, 'ink on paper should be 14.06')
})

await check('color: parsers agree with lightningcss (hex, rgb, hsl, hwb, lab, lch, oklab, oklch, p3, xyz, color-mix)', async () => {
  let lightning
  try {
    lightning = await import('lightningcss')
  } catch {
    return
  }
  const samples = [
    '#f8f5ee', 'rgb(42 36 32)', 'rgb(10% 20% 30% / 50%)', 'hsl(200 50% 40%)', 'hwb(200 10% 20%)', 'oklch(0.7 0.1 30)', 'oklch(0.145 0 0)', 'oklab(0.6 0.1 0.05)',
    'lab(50% 40 59.5)', 'lch(52.2% 72.2 50)', 'color(srgb 0.2 0.4 0.6)', 'color(display-p3 0.9 0.3 0.2)', 'color(xyz-d65 0.3 0.4 0.5)',
    'color-mix(in oklab, #fff 50%, #000)', 'color-mix(in oklch, oklch(0.6 0.2 30), oklch(0.7 0.1 300))', 'color-mix(in srgb, #2a2420 70%, transparent)',
    'color-mix(in hsl, red 20%, blue)', 'color-mix(in oklab, #b23a28 30%, #f8f5ee)', 'oklch(0.5 0.2 240)', 'oklch(0.577 0.245 27.325)',
  ]
  const bytes = (hex) => {
    const h = hex.replace('#', '')
    const f = h.length <= 4 ? [...h].map((x) => x + x).join('') : h
    return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16))
  }
  for (const s of samples) {
    const code = lightning.transform({ filename: 'a.css', code: Buffer.from(`.a{color:${s}}`), targets: { chrome: 80 << 16 } }).code.toString()
    const oracle = /color:\s*(#[0-9a-f]+)/.exec(code)?.[1]
    assert(oracle, `oracle gave no hex for ${s}`)
    const mine = toHex(toSrgb(parseColor(s)))
    const a = bytes(mine)
    const b = bytes(oracle)
    const tol = /oklch\(0\.5 0\.2 240\)|0\.577 0\.245/.test(s) ? 6 : 1
    assert(a.every((v, i) => Math.abs(v - b[i]) <= tol), `${s}: mine ${mine} vs lightningcss ${oracle}`)
  }
})

await check('color: unsupported syntax throws ColorError (relative colour, var, currentColor)', () => {
  for (const bad of ['oklch(from #fff l c h)', 'var(--x)', 'currentColor', 'rgb(calc(1+1) 0 0)', '#12', 'notacolor']) {
    let threw = false
    try {
      parseColor(bad)
    } catch (e) {
      threw = e instanceof ColorError
    }
    assert(threw, `${bad} should throw ColorError`)
  }
})

await check('css reader: nesting, comments, data URIs with ";", var() refs, line numbers', () => {
  const tree = parseCss(`/* c { --no: 1 } */
:root { --a: #fff; --b: var(--a, red); --img: url(data:image/png;base64,AAAA); }
@theme inline { --color-x: var(--b); }
@layer base { .dark { --a: #000 } @media (min-width: 1px) { :root { --m: 1 } } }
.x { color: var(--nope); & .y { color: var(--a) } }
@utility u { rotate: 1deg }`)
  const names = customPropertyDecls(tree).map((d) => d.prop)
  eq(names.sort(), ['--a', '--a', '--b', '--color-x', '--img', '--m'], 'custom properties')
  const root = tree.children[0]
  eq(root.decls.find((d) => d.prop === '--img').value.startsWith('url(data:image/png;base64'), true, 'data uri kept whole')
  eq(varRefs('calc(var(--a) + var(--b, 2px))'), [{ name: '--a', hasFallback: false }, { name: '--b', hasFallback: true }], 'var refs')
  eq(tree.children[3].line, 5, 'line number of .x')
})

await check('glob + tailwind token helpers', () => {
  const m = (g, p) => globToRegExp(g).test(p)
  assert(m('src/**/*.{ts,tsx}', 'src/a/b/c.tsx') && m('src/**/*.{ts,tsx}', 'src/c.ts') && !m('src/**/*.{ts,tsx}', 'src/c.css'), 'brace + ** glob')
  assert(m('src/components/ui/**', 'src/components/ui/button.tsx') && !m('src/components/ui/*', 'src/components/ui/a/b.tsx'), 'directory globs')
  eq(splitVariants('hover:data-[a:b]:-mt-2!'), { variants: ['hover', 'data-[a:b]'], utility: '-mt-2!' }, 'splitVariants keeps colons inside brackets')
  eq(structuralProblem('w-[calc(100%-2rem]'), '"]" found while "(" is still open', 'unclosed paren in bracket')
  eq(structuralProblem("[&_svg:not([class*='size-'])]:size-4"), null, 'balanced arbitrary variant')
})

// lint-house
await check('lint-house: good fixtures are clean (exit 0, no warnings)', () => {
  const r = tool('lint-house.mjs', ['--root', GOOD, '--json'])
  eq(r.code, 0, 'exit code')
  eq([r.json.errors, r.json.warnings], [0, 0], 'errors/warnings')
  assert(r.json.filesScanned >= 8, 'scanned the fixture files')
})

const badLint = tool('lint-house.mjs', ['--root', BAD, '--json'])
await check('lint-house: bad fixtures exit 1', () => {
  eq(badLint.code, 1, 'exit code')
})

await check('lint-house: every bad file trips exactly the rules it declares with @expect', () => {
  const byFile = new Map()
  for (const d of badLint.json.diagnostics) byFile.set(d.file, new Set([...(byFile.get(d.file) ?? []), d.rule]))
  const files = collectFiles(path.join(PROJECT_ROOT, BAD), ['src/**/*.{ts,tsx}'])
  const problems = []
  for (const rel of files) {
    const text = readText(path.join(PROJECT_ROOT, BAD, rel))
    const m = /^\/\/ @expect([^\n]*)/m.exec(text)
    const expected = new Set((m?.[1] ?? '').split(/\s+/).filter((x) => RULES[x]))
    const got = byFile.get(rel) ?? new Set()
    const missing = [...expected].filter((r) => !got.has(r))
    const extra = [...got].filter((r) => !expected.has(r))
    if (missing.length) problems.push(`${rel}: should report ${missing.join(', ')}`)
    if (extra.length) problems.push(`${rel}: unexpected ${extra.join(', ')}`)
  }
  assert(!problems.length, problems.join('\n'))
})

await check('lint-house: every rule in the catalogue is caught by some bad fixture', () => {
  const seen = new Set(badLint.json.diagnostics.map((d) => d.rule))
  const uncovered = Object.keys(RULES).filter((r) => !seen.has(r))
  assert(!uncovered.length, `no bad fixture triggers: ${uncovered.join(', ')}`)
})

await check('lint-house: escape hatches work (2 suppressed, none leak), and safe patterns are not flagged', () => {
  eq(badLint.json.suppressed, 2, 'suppressed count')
  assert(!badLint.json.diagnostics.some((d) => d.file.endsWith('suppressed.tsx')), 'suppressed.tsx must have no findings')
  const inFile = (name, rules) => badLint.json.diagnostics.filter((d) => d.file.endsWith(name) && rules.includes(d.rule)).map((d) => d.line)
  eq(inFile('bad-random.tsx', ['unseeded-random', 'render-time']), [7, 8, 9, 10], 'only the render-path clock/random calls, not the effect or handler ones')
  eq(inFile('bad-random.tsx', ['no-clock-random']), [13, 14, 16], 'effects and handlers are covered by no-clock-random instead')
  const ssr = badLint.json.diagnostics.filter((d) => d.file.endsWith('bad-ssr.tsx')).map((d) => d.line)
  eq(ssr, [4, 5], 'the typeof-guarded window read must not be reported')
})

await check('lint-house: severities, --strict, --quiet, positional files, --rule', () => {
  const warnOnly = tool('lint-house.mjs', ['--root', BAD, `${BAD}/src/lib/ink/bad-turbulence.ts`])
  eq(warnOnly.code, 0, 'warnings alone exit 0')
  eq(tool('lint-house.mjs', ['--root', BAD, `${BAD}/src/lib/ink/bad-turbulence.ts`, '--strict']).code, 1, '--strict fails on warnings')
  const quiet = tool('lint-house.mjs', ['--root', BAD, '--quiet', `${BAD}/src/components/ui/bad-colors.tsx`])
  assert(!/palette-color/.test(quiet.out) && /hard-coded-color/.test(quiet.out), '--quiet drops warnings')
  const only = tool('lint-house.mjs', ['--root', BAD, '--rule', 'debugger', '--json'])
  eq(only.json.diagnostics.map((d) => d.rule), ['debugger'], '--rule filter')
  eq(tool('lint-house.mjs', ['--root', BAD, `${BAD}/src/nope.tsx`]).code, 2, 'missing file is a usage error')
  eq(tool('lint-house.mjs', ['--bogus']).code, 2, 'unknown flag is a usage error')
})

await check('lint-house: --fix-list prints a checklist with file:line grouping', () => {
  const r = tool('lint-house.mjs', ['--root', BAD, '--fix-list', `${BAD}/src/components/ui/bad-debug.tsx`])
  assert(/FIX LIST — 3 items in 1 file/.test(r.out) && /\[ \] L6\s+console-log/.test(r.out) && /->/.test(r.out), r.out)
})

await check('lint-house: config file overrides work, and the shipped JSON equals the built-in defaults', () => {
  const cfg = mkTree('cfg', {})
  fs.writeFileSync(path.join(PROJECT_ROOT, cfg, 'c.json'), JSON.stringify({ rules: { debugger: 'off', 'console-log': 'warn' }, allow: { rounded: ['rounded-lg'] } }))
  const r = tool('lint-house.mjs', ['--root', BAD, '--config', `${cfg}/c.json`, '--json', `${BAD}/src/components/ui/bad-debug.tsx`, `${BAD}/src/components/ui/bad-rounded.tsx`])
  const rules = r.json.diagnostics.map((d) => `${d.rule}:${d.severity}`)
  assert(!rules.some((x) => x.startsWith('debugger')), 'debugger is off')
  assert(rules.includes('console-log:warn'), 'console-log downgraded to warn')
  assert(!r.json.diagnostics.some((d) => d.rule === 'rounded-class' && d.message.includes('"rounded-lg"')), 'rounded-lg allow-listed')
  eq(tool('lint-house.mjs', ['--print-config']).out, tool('lint-house.mjs', ['--no-config', '--print-config']).out, 'JSON config drifted from DEFAULTS in lint-house.mjs')
  eq(tool('lint-house.mjs', ['--root', BAD, '--config', `${cfg}/missing.json`]).code, 2, 'explicit missing config is an error')
  const bad = path.join(PROJECT_ROOT, cfg, 'bad.json')
  fs.writeFileSync(bad, JSON.stringify({ rules: { 'no-such-rule': 'error' } }))
  eq(tool('lint-house.mjs', ['--root', BAD, '--config', `${cfg}/bad.json`]).code, 2, 'unknown rule in config is an error')
})

await check('lint-house: --rules documents every rule', () => {
  const r = tool('lint-house.mjs', ['--rules'])
  const missing = Object.keys(RULES).filter((id) => !r.out.includes(id))
  assert(!missing.length, `missing from --rules: ${missing.join(', ')}`)
})

await check('check-classes: good fixtures are clean', () => {
  const r = tool('check-classes.mjs', ['--root', GOOD, '--json'])
  eq(r.code, 0, `exit code (${r.err.slice(0, 200)})`)
  eq(r.json.findings, [], 'findings')
  assert(r.json.uniqueTokens > 40, 'checked a realistic number of tokens')
})

const badClasses = tool('check-classes.mjs', ['--root', BAD, '--json'])
await check('check-classes: bad fixtures exit 1 and report every planted typo with the right kind', () => {
  eq(badClasses.code, 1, 'exit code')
  const kinds = Object.fromEntries(badClasses.json.findings.map((f) => [f.token, f.kind]))
  const expected = {
    'gapp-2': 'unknown-utility',
    'gapp-3': 'unknown-utility',
    'items-cneter': 'unknown-utility',
    'tex-sm': 'unknown-utility',
    'text-hand': 'theme-key',
    'font-hand': 'theme-key',
    'bg-primry': 'theme-key',
    'hover:bg-accnt': 'theme-key',
    'text-brand': 'theme-key',
    'focus-visibel:ring-2': 'unknown-variant',
    'data-[state=open]:anmate-in': 'unknown-utility',
    'w-[calc(100%-2rem]': 'malformed',
    'group-data-[state=checked]/inkk:opacity-100': 'orphan-group',
  }
  const wrong = Object.entries(expected).filter(([t, k]) => kinds[t] !== k).map(([t, k]) => `${t}: wanted ${k}, got ${kinds[t] ?? 'nothing'}`)
  assert(!wrong.length, wrong.join('\n'))
})

await check('check-classes: legitimate classes are never reported (markers, css classes, @utility, arbitrary, dynamic)', () => {
  const reported = new Set(badClasses.json.findings.map((f) => f.token))
  const fine = ['toaster', 'll-paper-grain', 'll-tilt', 'not-prose', 'group', 'peer', 'sr-only', 'text-ink', 'w-[calc(100%-2rem)]', 'bg-(--ll-ink)', 'group-hover/ink:opacity-80', 'peer-checked:bg-primary', 'text-foreground/80', 'group/ink']
  const leaked = fine.filter((t) => reported.has(t))
  assert(!leaked.length, `false positives: ${leaked.join(', ')}`)
  assert(![...reported].some((t) => t.startsWith('bg-$') || t === 'bg-' || t === 'bg-ink' || t === 'bg-card'), 'template-literal fragments must be skipped')
})

await check('check-classes: suggestions are useful', () => {
  const sug = Object.fromEntries(badClasses.json.findings.map((f) => [f.token, f.suggestions]))
  assert(sug['items-cneter'].includes('items-center'), 'items-center')
  assert(sug['tex-sm'].includes('text-sm'), 'text-sm')
  assert(sug['bg-primry'].includes('bg-primary'), 'bg-primary')
  assert(sug['focus-visibel:ring-2'].includes('focus-visible:'), 'focus-visible:')
  assert(sug['group-data-[state=checked]/inkk:opacity-100'].includes('group/ink'), 'group/ink')
  assert(sug['gapp-2'].includes('gap-2'), 'gap-2')
})

await check('check-classes: --only restricts reporting but orphan-group detection still sees the whole tree', () => {
  const r = tool('check-classes.mjs', ['--root', BAD, '--json', '--only', 'src/components/ui/bad-tokens.tsx'])
  eq([...new Set(r.json.findings.map((f) => f.file))], ['src/components/ui/bad-tokens.tsx'], 'files reported')
  eq(r.json.findings.map((f) => f.token), ['text-brand'], 'tokens reported')
  const g = tool('check-classes.mjs', ['--root', BAD, '--json', '--only', 'src/components/ui/bad-classes.tsx'])
  assert(g.json.findings.some((f) => f.kind === 'orphan-group'), 'orphan group still found')
})

await check('check-classes: bad stylesheet path falls back to the fixture stylesheet with a notice', () => {
  const root = mkTree('no-css', { 'src/components/ui/x.tsx': 'export const X = () => <div className="flex tex-sm" />\n' })
  const r = tool('check-classes.mjs', ['--root', root, '--json'])
  eq(r.json.usedFallback, true, 'usedFallback')
  eq(r.json.findings.map((f) => f.token), ['tex-sm'], 'still finds the typo')
  const text = tool('check-classes.mjs', ['--root', root])
  assert(/does not exist — using the fixture stylesheet/.test(text.out), text.out)
})

await check('check-classes: a stylesheet that fails to compile is exit 2, not a crash', () => {
  const root = mkTree('broken-css', { 'src/components/ui/x.tsx': 'export const X = () => <div className="flex" />\n', 'src/styles/looseleaf.css': '@import "definitely-not-a-package";\n' })
  const r = tool('check-classes.mjs', ['--root', root])
  eq(r.code, 2, 'exit code')
  assert(/could not compile the stylesheet/.test(r.err), r.err)
})

await check('check-tokens: good fixtures pass every contrast pair in :root and .dark', () => {
  const r = tool('check-tokens.mjs', ['--root', GOOD, '--json', ...FIXTURE_PAIRS])
  eq(r.code, 0, `exit code (${r.out.slice(0, 300)})`)
  eq(r.json.scopes, [':root', '.dark'], 'scopes')
  eq(r.json.references, [], 'references')
  assert(r.json.contrast.length === 44 && r.json.contrast.every((x) => x.status === 'ok'), 'all 44 pair checks ok')
})

const badTokens = tool('check-tokens.mjs', ['--root', BAD, '--json', ...FIXTURE_PAIRS])
await check('check-tokens: bad fixtures exit 1; contrast failures, unresolved and undefined tokens are all reported', () => {
  eq(badTokens.code, 1, 'exit code')
  eq(badTokens.json.scopes, [':root', '[data-theme="forest"]', '.dark'], 'scopes')
  const row = (scope, fg, bg) => badTokens.json.contrast.find((r) => r.scope === scope && r.fg === fg && r.bg === bg)
  eq(row(':root', 'foreground', 'background').status, 'fail', 'foreground/background')
  assert(Math.abs(row(':root', 'foreground', 'background').ratio - 3.23) < 0.01, 'ratio computed')
  eq(row(':root', 'primary-foreground', 'primary').status, 'fail', 'primary-foreground/primary')
  eq(row(':root', 'border', 'background').status, 'fail', 'border/background')
  eq(row('.dark', 'foreground', 'background').status, 'fail', '.dark foreground/background')
  eq(row('[data-theme="forest"]', 'foreground', 'background').status, 'ok', 'forest scope overrides fix foreground')
  eq(row(':root', 'card-foreground', 'card').status, 'unresolved', 'relative colour syntax')
  eq(row(':root', 'muted-foreground', 'background').status, 'unresolved', 'var() to an undefined token')
  const refs = Object.fromEntries(badTokens.json.references.map((r) => [r.name, r.level]))
  for (const name of ['--ll-nope', '--ll-missing-pencil', '--ll-undefined-thing', '--ll-not-a-token', '--color-brand', '--color-primry']) eq(refs[name], 'error', name)
  for (const name of ['--ll-maybe', '--ll-soft']) eq(refs[name], 'warn', `${name} (hidden by a fallback)`)
  for (const name of ['--ll-ink', '--ll-local', '--radix-popover-trigger-width', '--tw-ring-shadow', '--color-ink']) assert(!(name in refs), `${name} must not be reported`)
})

await check('check-tokens: --strict, required pairs, --pairs override, --all', () => {
  const partial = mkTree('tok-partial', { 'src/styles/looseleaf.css': ':root{--background:#fff;--foreground:#000}\n' })
  const pairs = path.join(PROJECT_ROOT, partial, 'pairs.json')
  fs.writeFileSync(pairs, JSON.stringify({ pairs: [{ fg: 'foreground', bg: 'background', min: 7 }, { fg: 'ring', bg: 'background', min: 3 }] }))
  eq(tool('check-tokens.mjs', ['--root', partial, '--pairs', `${partial}/pairs.json`]).code, 0, 'missing optional tokens only skip')
  eq(tool('check-tokens.mjs', ['--root', partial, '--pairs', `${partial}/pairs.json`, '--strict']).code, 1, '--strict fails on missing tokens')
  eq(tool('check-tokens.mjs', ['--root', partial]).code, 1, 'the default pairs require card-foreground/card etc.')
  fs.writeFileSync(pairs, JSON.stringify({ pairs: [{ fg: 'foreground', bg: 'background', min: 22, purpose: 'impossible' }] }))
  eq(tool('check-tokens.mjs', ['--root', partial, '--pairs', `${partial}/pairs.json`]).code, 1, 'min above the possible ratio fails')
  fs.writeFileSync(pairs, JSON.stringify({ pairs: [{ fg: 'nope', bg: 'background', min: 3, required: true }] }))
  eq(tool('check-tokens.mjs', ['--root', partial, '--pairs', `${partial}/pairs.json`]).code, 1, 'required pair with a missing token fails')
  const all = tool('check-tokens.mjs', ['--root', GOOD, '--all'])
  assert(/foreground \/ background\s+#2a2420\s+#f8f5ee\s+14\.06/.test(all.out), '--all shows the table')
})

await check('check-tokens: an arbitrary class that redeclares several pair tokens is treated as a theme scope', () => {
  const root = mkTree('tok-scope', {
    'src/styles/looseleaf.css': ':root{--background:#fff;--foreground:#000;--primary:#00f}\n.sepia{--background:#f4ecd8;--foreground:#c8b8a8;--primary:#7a4a1e}\n.card{--foreground:red}\n',
  })
  const pairs = path.join(PROJECT_ROOT, root, 'pairs.json')
  fs.writeFileSync(pairs, JSON.stringify({ pairs: [{ fg: 'foreground', bg: 'background', min: 7 }] }))
  const r = tool('check-tokens.mjs', ['--root', root, '--pairs', `${root}/pairs.json`, '--json'])
  eq(r.json.scopes, [':root', '.sepia'], 'scopes (.card redeclares only one token)')
  eq(r.code, 1, 'the low-contrast .sepia foreground fails')
  eq(r.json.contrast.map((x) => `${x.scope}:${x.status}`), [':root:ok', '.sepia:fail'], 'per-scope verdicts')
})

await check('check-tokens: alpha fills are composited over the page (border colour that is a translucent ink)', () => {
  const root = mkTree('tok-alpha', {
    'src/styles/looseleaf.css': ':root{--background:#ffffff;--border:rgb(0 0 0 / 50%)}\n',
  })
  const pairs = path.join(PROJECT_ROOT, root, 'pairs.json')
  fs.writeFileSync(pairs, JSON.stringify({ pairs: [{ fg: 'border', bg: 'background', min: 1.5 }] }))
  const r = tool('check-tokens.mjs', ['--root', root, '--pairs', `${root}/pairs.json`, '--json'])
  eq(r.json.contrast[0].fgHex, '#808080', 'composited colour')
  assert(Math.abs(r.json.contrast[0].ratio - 3.95) < 0.01, `ratio ${r.json.contrast[0].ratio}`)
})

for (const [label, files] of [
  ['completely empty root', {}],
  ['empty src/', { 'src/.keep': '' }],
  ['only a package.json', { 'package.json': '{"name":"x"}' }],
  ['one ui file, no package.json / css / meta / examples', { 'src/components/ui/thing.tsx': '"use client"\nimport * as React from "react"\nexport function Thing(p: React.ComponentProps<"div">) { const id = React.useId(); return <div data-slot="thing" id={id} {...p} /> }\n' }],
]) {
  await check(`empty/partial tree (${label}): all three tools exit 0`, () => {
    const root = mkTree(`tree-${label.replace(/\W+/g, '-')}`, files)
    for (const script of ['lint-house.mjs', 'check-classes.mjs', 'check-tokens.mjs']) {
      const r = tool(script, ['--root', root])
      eq(r.code, 0, `${script} exit code (${(r.err || r.out).slice(0, 200)})`)
    }
    const j = tool('lint-house.mjs', ['--root', root, '--json'])
    assert(j.json && j.json.errors === 0, 'lint --json parses')
  })
}

await check('real tree: the three tools run and never crash (exit 0 or 1)', () => {
  for (const script of ['lint-house.mjs', 'check-classes.mjs', 'check-tokens.mjs']) {
    const r = tool(script, [])
    assert(r.code === 0 || r.code === 1, `${script} exited ${r.code}: ${(r.err || r.out).slice(0, 300)}`)
  }
})

await check('big --json output survives a pipe: the tools set process.exitCode, they never process.exit() after console.log', () => {
  const lines = Array.from({ length: 2500 }, (_, i) => `  console.log(${i})`).join('\n')
  const classes = Array.from({ length: 2500 }, (_, i) => `gapp-${i}`).join(' ')
  const root = mkTree('big-json', {
    'src/components/ui/big.tsx': `export function Big() {\n${lines}\n  return <div data-slot="big" className="${classes}" />\n}\n`,
    'src/styles/looseleaf.css': '@import "tailwindcss";\n',
  })
  const lint = tool('lint-house.mjs', ['--root', root, '--json'])
  assert(lint.out.length > 200_000 && lint.json, `lint-house --json: ${lint.out.length} bytes, parsed=${Boolean(lint.json)}`)
  eq(lint.code, 1, 'lint exit code')
  const cls = tool('check-classes.mjs', ['--root', root, '--json'])
  assert(cls.out.length > 65_536 && cls.json, `check-classes --json: ${cls.out.length} bytes, parsed=${Boolean(cls.json)}`)
  eq(cls.code, 1, 'classes exit code')
  const tokens = tool('check-tokens.mjs', ['--json'])
  assert(tokens.json && tokens.json.contrast.length > 100, `check-tokens --json on the real tree: ${tokens.out.length} bytes, parsed=${Boolean(tokens.json)}`)
})

await check('check-tokens --only: reports references of those files only and leaves the palette (contrast) to the palette owner', () => {
  const root = mkTree('tok-only', {
    'src/styles/looseleaf.css': ':root{--background:#fff;--foreground:#eee;--ll-ink:#000}\n',
    'src/components/ui/a.tsx': 'export const A = () => <div style={{ color: "var(--ll-nope-a)" }} />\n',
    'src/components/ui/b.tsx': 'export const B = () => <div style={{ color: "var(--ll-nope-b)" }} />\n',
  })
  const all = tool('check-tokens.mjs', ['--root', root, '--json', ...FIXTURE_PAIRS])
  eq(all.json.references.map((r) => r.name).sort(), ['--ll-nope-a', '--ll-nope-b'], 'all references')
  eq(all.code, 1, 'whole run fails (also on contrast)')
  const only = tool('check-tokens.mjs', ['--root', root, '--json', '--only', 'src/components/ui/a.tsx'])
  eq(only.json.references.map((r) => r.name), ['--ll-nope-a'], 'only a.tsx')
  eq(only.json.contrast, [], 'the contrast table is skipped with --only')
  eq(only.code, 1, 'still fails on its own undefined token')
  const clean = tool('check-tokens.mjs', ['--root', root, '--only', 'src/nothing/**'])
  eq(clean.code, 0, 'no findings in the selected files: exit 0 even though the palette is bad')
  const withContrast = tool('check-tokens.mjs', ['--root', root, '--json', '--only', 'src/nothing/**', '--contrast', ...FIXTURE_PAIRS])
  assert(withContrast.json.contrast.length > 0 && withContrast.code === 1, '--contrast puts the table back')
})

await check('qa.mjs: the whole-tree plan, one heavy slot, exit codes', () => {
  const all = tool('qa.mjs', ['--dry-run']).out.trim().split('\n')
  assert(/^# one heavy slot for the whole run/.test(all[0]), all[0])
  eq(all.length, 7, 'a comment line and six steps')
  assert(/lint-house/.test(all[1]) && /check-classes/.test(all[2]) && /check-tokens/.test(all[3]) && /typescript\/bin\/tsc -p tsconfig\.json --noEmit/.test(all[4]) && /tsc -p tools\/registry\/tsconfig\.shipped\.json --noEmit/.test(all[5]) && /registry-build\.mjs --check --no-build --json/.test(all[6]), 'order')
  assert(!all.some((l) => l.includes('heavy.mjs')), 'steps run inside qa\'s single slot, not each through heavy.mjs')
  eq(tool('qa.mjs', ['a', 'b']).code, 2, 'two slugs is a usage error')
  eq(tool('qa.mjs', ['--only', 'nonsense']).code, 2, 'unknown step is a usage error')
  const missing = tool('qa.mjs', ['definitely-not-a-thing'])
  eq(missing.code, 2, 'a slug with nothing behind it is a usage error, not a green run')
  assert(/nothing found for "definitely-not-a-thing"/.test(missing.err), missing.err)
  eq(tool('qa.mjs', ['--with-tests', '--dry-run']).out.trim().split('\n').pop().includes('vitest.mjs run'), true, '--with-tests appends the whole suite')
})

await check('qa.mjs: a slug is resolved to its own files, tests, docs and smoke; art batches to art-check', async () => {
  const { planSteps, resolveScope, docsProblems, splitTscOutput } = await import('./qa.mjs')
  const rootRel = mkTree('qa-scope', {
    'src/components/ui/thing.tsx': '"use client"\nexport function Thing() { return <div data-slot="thing" /> }\nexport function ThingPart() { return <div data-slot="thing-part" /> }\n',
    'src/docs/meta/thing.ts': 'export default { slug: "thing", title: "Thing", category: "Actions", description: "A thing.", parts: [{ name: "Thing" }], usage: "<Thing />" }\n',
    'src/docs/examples/thing/01-default.tsx': 'export default function E() { return null }\n',
    'src/docs/examples/thing/02-more.tsx': 'export default function E() { return null }\n',
    'src/docs/examples/thing/_helper.tsx': 'export const x = 1\n',
    'src/lib/ink/recipes/thing-ink.ts': 'export const thingInk = 1\n',
    'src/lib/ink/recipes/other.ts': 'export const other = 1\n',
    'src/lib/ink/things/scale.ts': 'export const scale = 1\n',
    'src/hooks/use-thing.ts': 'export const useThing = 1\n',
    'src/blocks/panel/index.tsx': 'export const Panel = 1\n',
    'src/lib/ink/art/icons/marks.ts': 'export const marks = {}\n',
    'src/lib/ink/art/mascot/poses.ts': 'export const poses = {}\n',
    'src/lib/ink/art/mascot/body.ts': 'export const body = {}\n',
    'tests/thing.test.tsx': 'export {}\n',
    'tests/blocks-panel.test.tsx': 'export {}\n',
    'tests/lonely.test.ts': 'export {}\n',
    'notes/art-batches.json': JSON.stringify([
      { batch: 'icons-marks', file: 'src/lib/ink/art/icons/marks.ts', kind: 'icon' },
      { batch: 'mascot-stubby', file: 'src/lib/ink/art/mascot/poses.ts (+ mascot/body.ts, mascot/props.ts)', kind: 'mascot' },
    ]),
  })
  const root = path.join(PROJECT_ROOT, rootRel)
  const ui = resolveScope('thing', root)
  eq([ui.kind, ui.smoke, ui.tests], ['ui', true, ['tests/thing.test.tsx']], 'ui scope')
  assert(ui.files.includes('src/lib/ink/recipes/thing-ink.ts') && ui.files.includes('src/docs/meta/thing.ts') && ui.dirs.includes('src/docs/examples/thing') && !ui.files.some((f) => f.includes('other')), JSON.stringify(ui))
  assert(ui.dirs.includes('src/lib/ink/things'), 'the geometry directory named after the component is in its scope')
  const steps = planSteps({ slug: 'thing', root })
  eq(steps.map((s) => s.id), ['lint', 'classes', 'tokens', 'typecheck', 'shipped', 'docs', 'registry', 'tests'], 'ui steps')
  const t = steps.find((s) => s.id === 'tests')
  eq(t.env, { SMOKE_SLUG: 'thing' }, 'smoke is narrowed to the slug')
  assert(t.cmd.includes('tests/thing.test.tsx') && t.cmd.includes('tests/ssr-smoke.test.tsx') && t.cmd.includes('tests/hydrate-smoke.test.tsx'), 'slug test + smoke files in ONE vitest run')
  eq(planSteps({ slug: 'thing', root, only: ['smoke'] }).find((s) => s.id === 'tests').label, 'vitest ssr + hydration smoke', '--only smoke')
  assert(!planSteps({ slug: 'thing', root, only: ['tests'] }).find((s) => s.id === 'tests').cmd.some((a) => /smoke/.test(a)), '--only tests leaves the smoke out')
  eq(planSteps({ slug: 'thing', root, noTypecheck: true }).find((s) => s.id === 'typecheck').skip, '--no-typecheck', '--no-typecheck')
  eq(planSteps({ slug: 'thing', root, noTypecheck: true }).find((s) => s.id === 'shipped').skip, '--no-typecheck', '--no-typecheck skips the stock-Vite check too')
  eq(planSteps({ slug: 'thing', root }).find((s) => s.id === 'shipped').skip, null, 'a component is shipped source')
  eq(planSteps({ slug: 'lonely', root }).find((s) => s.id === 'shipped')?.skip, 'no shipped source in scope', 'a tests-only slug has nothing shipped')
  eq(resolveScope('use-thing', root).kind, 'hook', 'hook')
  eq(resolveScope('panel', root).kind, 'block', 'block')
  eq(resolveScope('panel', root).tests, ['tests/blocks-panel.test.tsx'], 'a block finds tests/blocks-<slug>.test.tsx (the block briefs name them that way)')
  const plural = path.join(PROJECT_ROOT, mkTree('qa-scope-plural', {
    'src/components/ui/mascot.tsx': '"use client"\nexport function Mascot() { return <div data-slot="mascot" /> }\n',
    'src/lib/ink/art/mascots/poses.ts': 'export const poses = {}\n',
    'notes/art-batches.json': JSON.stringify([{ batch: 'mascot-stubby', file: 'src/lib/ink/art/mascots/poses.ts', kind: 'mascot' }]),
  }))
  eq([resolveScope('mascots', plural).kind, resolveScope('mascots', plural).dirs, resolveScope('mascots', plural).artBatches], ['art', ['src/lib/ink/art/mascots'], ['mascot-stubby']], 'mascots is an art kind')
  eq([resolveScope('mascot', plural).kind, resolveScope('mascot', plural).dirs], ['ui', ['src/lib/ink/art/mascots']], 'the mascot component owns the mascots directory')
  eq(resolveScope('other', root).kind, 'recipe', 'recipe')
  eq(resolveScope('lonely', root).kind, 'tests', 'tests only')
  eq(resolveScope('nope', root), null, 'unknown slug')
  const art = resolveScope('mascot-stubby', root)
  eq([art.kind, art.artBatch, art.files], ['art', 'mascot-stubby', ['src/lib/ink/art/mascot/poses.ts', 'src/lib/ink/art/mascot/body.ts']], 'art scope (props.ts does not exist yet)')
  const artSteps = planSteps({ slug: 'icons-marks', root })
  eq(artSteps.map((s) => s.id), ['lint', 'classes', 'tokens', 'typecheck', 'shipped', 'registry', 'art'], 'art steps: no docs, no vitest')
  eq(artSteps.find((s) => s.id === 'art').skip, 'tools/art-check.mjs does not exist yet', 'skipped while art-check.mjs is missing')
  eq(artSteps.find((s) => s.id === 'art').cmd.slice(2), ['--json', '--batch', 'icons-marks'], 'art-check --json --batch <id>')
  eq(resolveScope('mascot', root).artBatches, ['mascot-stubby'], 'a kind maps to its batches')
  eq(artSteps.find((s) => s.id === 'classes').skip, null === 0 ? null : 'no tsx files in scope', 'no class check for art data')
  const docs = docsProblems(ui, root)
  assert(docs.problems.some((p) => /has 2 example\(s\)/.test(p)) && docs.problems.some((p) => /ThingPart/.test(p)), docs.problems.join('\n'))
  const errs = splitTscOutput('src/a.tsx(3,5): error TS2322: Type x is not y.\n  Type z is not w.\nsrc/b.ts(1,1): error TS1005: oops\n')
  eq(errs.map((e) => [e.file, e.line]), [['src/a.tsx', 3], ['src/b.ts', 1]], 'tsc split')
  assert(errs[0].text.includes('Type z is not w.'), 'continuation kept')
})

await check('qa.mjs: type errors and registry problems are attributed to the files they name (a sibling\'s breakage is a note, yours is a failure)', async () => {
  const { judge, resolveScope } = await import('./qa.mjs')
  const root = mkTree('qa-judge', { 'src/components/ui/mine.tsx': 'export const Mine = 1\n', 'src/components/ui/theirs.tsx': 'export const Theirs = 1\n', 'src/lib/ink/recipes/mine-ink.ts': 'export const x = 1\n' })
  const scope = resolveScope('mine', path.join(PROJECT_ROOT, root))
  const tsc = { id: 'typecheck', attribute: 'tsc' }
  const other = 'src/components/ui/theirs.tsx(3,1): error TS2304: Cannot find name x.\n'
  const own = 'src/lib/ink/recipes/mine-ink.ts(2,7): error TS2322: nope\n  detail line\n'
  let v = judge(tsc, { code: 2, out: other, stdout: other }, scope)
  eq([v.ok, /1 type error\(s\) in other files/.test(v.note)], [true, true], 'a sibling error is a note')
  v = judge(tsc, { code: 2, out: other + own, stdout: other + own }, scope)
  eq(v.ok, false, 'an error in your recipe fails your gate')
  eq(v.lines, ['src/lib/ink/recipes/mine-ink.ts(2,7): error TS2322: nope', '  detail line'], 'only your errors are printed, with continuation lines')
  eq(judge(tsc, { code: 2, out: other, stdout: other }, null).ok, false, 'a whole-tree run fails on any error')
  eq(judge(tsc, { code: 0, out: '', stdout: '' }, scope).ok, true, 'clean')
  const registry = { id: 'registry', attribute: 'registry' }
  const json = JSON.stringify({ items: [{}, {}], errors: ['src/components/ui/theirs.tsx: import "@/x" does not resolve', 'src/components/ui/mine.tsx: package "zod" is not declared'], warnings: ['1 item(s) have no src/docs/meta/<slug>.ts: theirs', 'src/lib/ink/recipes/mine-ink.ts: odd'] })
  v = judge(registry, { code: 1, out: json, stdout: json }, scope)
  eq(v.ok, false, 'a registry error naming your file fails')
  eq(v.lines, ['ERROR src/components/ui/mine.tsx: package "zod" is not declared', 'warning src/lib/ink/recipes/mine-ink.ts: odd'], 'your error and your warning; theirs are not printed')
  const onlyTheirs = JSON.stringify({ items: [{}], errors: ['src/components/ui/theirs.tsx: bad'], warnings: [] })
  v = judge(registry, { code: 1, out: onlyTheirs, stdout: onlyTheirs }, scope)
  eq([v.ok, v.note], [true, '1 registry error(s) in other files, not yours'], 'a sibling registry error is a note')
  eq(judge(registry, { code: 1, out: onlyTheirs, stdout: onlyTheirs }, null).ok, false, 'a whole-tree run fails on any registry error')
  const artReport = JSON.stringify({ ok: false, batches: [
    { batch: 'icons-marks', drawn: ['check', 'x'], planned: 16, problems: [{ level: 'warn', code: 'missing-ids', msg: '14 of 16 ids still to draw' }] },
    { batch: 'icons-status', drawn: ['info'], planned: 16, problems: [{ level: 'error', code: 'path', id: 'info', msg: 'bad path' }] },
  ] })
  const artScope = { artBatches: ['icons-marks'] }
  v = judge({ id: 'art', attribute: 'art' }, { code: 1, out: artReport, stdout: artReport }, artScope)
  eq([v.ok, v.summary], [true, '2/16 ids drawn in 1 batch(es), 1 warning(s)'], 'another batch\'s error is not your failure, missing ids are only a warning')
  v = judge({ id: 'art', attribute: 'art' }, { code: 1, out: artReport, stdout: artReport }, { artBatches: ['icons-status'] })
  eq([v.ok, v.lines], [false, ['ERROR icons-status info [path] bad path']], 'your batch\'s error fails')
  const vt = judge({ id: 'tests' }, { code: 0, out: ' Test Files  2 passed (2)\n      Tests  20 passed (20)\n   Duration  1s\n', stdout: '' }, scope)
  eq(vt.summary, '20 passed (20) · 2 passed (2)', 'vitest summary')
})

fs.rmSync(TMP, { recursive: true, force: true })
const failed = results.filter((r) => !r.ok)
console.log(`\n${failed.length ? c.red(`✖ ${failed.length} of ${results.length} self-checks failed`) : c.green(`✔ all ${results.length} self-checks passed`)}`)
process.exit(failed.length ? 1 : 0)
