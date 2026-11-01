#!/usr/bin/env node
import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import test from 'node:test'
import { REPO_ROOT, addressToName, itemAddress, resolveConfig } from './registry/config.mjs'
import { runRegistryBuild } from './registry/build.mjs'
import { convertCss, isColorValue, splitTopLevel } from './registry/css.mjs'
import { validate, validateRegistry, validateRegistryItem } from './registry/jsonschema.mjs'
import { classifySpecifier, readMeta, scanImports } from './registry/parse.mjs'
import { buildRegistry, scanTree } from './registry/scan.mjs'
import { validateBuilt } from './registry/validate.mjs'

const FIXTURE = path.join(REPO_ROOT, 'tools', 'fixtures', 'tree')
const SCRATCH = path.join(REPO_ROOT, 'lookdev', '_tmp', `registry-selftest-${process.pid}`)
mkdirSync(SCRATCH, { recursive: true })
process.on('exit', () => rmSync(SCRATCH, { recursive: true, force: true }))

const cfg = resolveConfig({ root: FIXTURE, env: {} })
const read = (p) => readFileSync(p, 'utf8')
const write = (p, s) => {
  mkdirSync(path.dirname(p), { recursive: true })
  writeFileSync(p, s)
}
let n = 0
function copyTree() {
  const dir = path.join(SCRATCH, `tree-${++n}`)
  cpSync(FIXTURE, dir, { recursive: true, filter: (src) => !/[\\/](public|registry\.json)$/.test(src) })
  return dir
}
const scanAndBuild = (root, opts = {}) => {
  const scan = scanTree(root, cfg, opts)
  return { scan, ...buildRegistry(scan, root, cfg, opts) }
}

test('specifier classification', () => {
  assert.deepEqual(classifySpecifier('./x'), { kind: 'relative' })
  assert.deepEqual(classifySpecifier('@/lib/ink'), { kind: 'alias', path: 'lib/ink' })
  assert.deepEqual(classifySpecifier('radix-ui/internal'), { kind: 'package', name: 'radix-ui' })
  assert.deepEqual(classifySpecifier('@fontsource/kalam/700.css'), { kind: 'package', name: '@fontsource/kalam' })
  assert.equal(classifySpecifier('react/jsx-runtime').kind, 'implicit')
  assert.equal(classifySpecifier('node:fs').kind, 'builtin')
  assert.equal(classifySpecifier('path').kind, 'builtin')
  assert.equal(classifySpecifier('virtual:x').kind, 'other')
})

test('import scanner: kinds of import, comments and strings do not fool it', () => {
  const src = `
    // import nope from "comment"
    /* import nope2 from "block" */
    import a from "a-pkg"
    import type { T } from "type-only"
    import { type U, V } from "mixed"
    import * as ns from '@scope/pkg/sub'
    import "side-effect"
    export { z } from "./re-export"
    export * from "star"
    export type { Q } from "type-export"
    const s = "import nope3 from 'string'"
    const t = \`import nope4 from "template"\`
    const lazy = () => import("dyn")
    const r = require("cjs")
    type X = import("type-import").Foo
    export function App() { return <p>Don't stop: "import x from 'jsx-text'"</p> }
  `
  const got = scanImports(src, 'x.tsx')
  const specs = got.map((g) => g.spec).sort()
  assert.deepEqual(specs, ['./re-export', '@scope/pkg/sub', 'a-pkg', 'cjs', 'dyn', 'mixed', 'side-effect', 'star', 'type-export', 'type-import', 'type-only'])
  assert.equal(got.find((g) => g.spec === 'type-only').typeOnly, true)
  assert.equal(got.find((g) => g.spec === 'mixed').typeOnly, false)
})

test('import scanner agrees with ts-morph on real shadcn sources and the fixtures (babel and regex fallback)', async (t) => {
  let tsMorph
  try {
    tsMorph = createRequire(path.join(REPO_ROOT, 'node_modules', 'shadcn', 'package.json'))('ts-morph')
  } catch {
    return t.skip('ts-morph not available')
  }
  const files = []
  const walk = (dir) => {
    if (!existsSync(dir)) return
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else if (/\.(tsx?|jsx?)$/.test(e.name) && !/\.d\.ts$/.test(e.name)) files.push(full)
    }
  }
  walk(path.join(REPO_ROOT, '.upstream', 'shadcn', 'src'))
  walk(path.join(FIXTURE, 'src'))
  assert.ok(files.length > 0)
  const project = new tsMorph.Project({ useInMemoryFileSystem: true, compilerOptions: { jsx: 4 } })
  const oracle = (file) => {
    const sf = project.createSourceFile(`/${path.basename(file)}`, read(file), { overwrite: true })
    const out = new Set()
    for (const d of sf.getImportDeclarations()) out.add(d.getModuleSpecifierValue())
    for (const d of sf.getExportDeclarations()) if (d.getModuleSpecifierValue()) out.add(d.getModuleSpecifierValue())
    return [...out].sort()
  }
  const fallback = await import('./registry/parse.mjs?fallback')
  process.env.LL_NO_BABEL = '1'
  try {
    for (const f of files) {
      const want = oracle(f)
      const babel = [...new Set(scanImports(read(f), f).filter((i) => i.kind === 'import' || i.kind === 'export').map((i) => i.spec))].sort()
      assert.deepEqual(babel, want, `babel scanner differs on ${path.relative(REPO_ROOT, f)}`)
      const rx = [...new Set(fallback.scanImports(read(f), f).filter((i) => i.kind === 'import' || i.kind === 'export').map((i) => i.spec))].sort()
      assert.deepEqual(rx, want, `regex fallback differs on ${path.relative(REPO_ROOT, f)}`)
    }
  } finally {
    delete process.env.LL_NO_BABEL
  }
})

test('meta reader: default export, satisfies, const references, templates; skips what it cannot evaluate', async () => {
  const src = `
    import type { ComponentDoc } from "../types"
    import { helper } from "./helper"
    const usage = \`<A />\`
    const shared = { a: 1 }
    export default {
      slug: "x",
      title: "X" + " thing",
      count: -3,
      usage,
      nested: { ...shared, b: [1, 2, ...[3]] },
      computed: helper(),
      [dynamic]: 1,
      method() {},
    } satisfies ComponentDoc
  `
  const babel = readMeta(src, 'x.ts')
  assert.deepEqual(babel.data, { slug: 'x', title: 'X thing', count: -3, usage: '<A />', nested: { a: 1, b: [1, 2, 3] } })
  assert.equal(readMeta('export const a = 1', 'x.ts').data, null)
  assert.match(readMeta('export default someCall()', 'x.ts').error, /object literal/)
  for (const f of ['button', 'card', 'dialog', 'login']) {
    const { data } = readMeta(read(path.join(FIXTURE, 'src/docs/meta', `${f}.ts`)), `${f}.ts`)
    assert.equal(data.slug, f)
    assert.ok(data.description.length > 10)
  }
  const fb = await import('./registry/parse.mjs?fallback-meta')
  process.env.LL_NO_BABEL = '1'
  try {
    const real = read(path.join(FIXTURE, 'src/docs/meta/button.ts'))
    assert.deepEqual(fb.readMeta(real, 'button.ts').data, readMeta(real, 'button.ts').data)
  } finally {
    delete process.env.LL_NO_BABEL
  }
})

test('css: colour detection follows var() chains, other values are not colours', () => {
  const vars = { '--ink': '#222', '--paper': 'var(--ink)', '--len': '4px' }
  const look = (k) => vars[k]
  for (const ok of ['#fff', '#12345678', 'oklch(0.5 0.1 20)', 'rgb(var(--x) / .2)', 'color-mix(in oklab, red 50%, blue)', 'transparent', 'var(--ink)', 'var(--paper)', 'var(--nope, #fff)']) {
    assert.equal(isColorValue(ok, look), true, ok)
  }
  for (const bad of ['0 1px 2px red', '4px', 'var(--len)', 'var(--nope)', 'url(data:image/png;base64,AA==)', '42, 36, 32', '1', '0.5rem']) {
    assert.equal(isColorValue(bad, look), false, bad)
  }
  assert.deepEqual(splitTopLevel('a, b(c, d), "e, f", g[h, i]'), ['a', 'b(c, d)', '"e, f"', 'g[h, i]'])
})

test('css: :root/.dark colours go to cssVars, everything else to css', () => {
  const r = convertCss(`
    :root { --paper: #fff; --ink: var(--paper); --len: 3px; --radius: 0.5rem; color-scheme: light; }
    .dark { --paper: #000; --tone: 1; }
    @layer base { :root { --late: oklch(0.5 0 0); } .dark { --late: oklch(0.2 0 0); } }
  `)
  assert.deepEqual(r.cssVars.light, { paper: '#fff', ink: 'var(--paper)', radius: '0.5rem', late: 'oklch(0.5 0 0)' })
  assert.deepEqual(r.cssVars.dark, { paper: '#000', late: 'oklch(0.2 0 0)' })
  assert.deepEqual(r.css[':root'], { '--len': '3px', 'color-scheme': 'light' })
  assert.deepEqual(r.css['.dark'], { '--tone': '1' })
  assert.equal(r.css['@layer base'], undefined, 'a layer that only held :root variables disappears')
  assert.deepEqual(r.errors, [])
})

test('css: @theme, fonts, keyframes, custom-variant, utilities', () => {
  const r = convertCss(`
    @import "tailwindcss";
    @import "tw-animate-css";
    @import "./fonts.css";
    @import url("https://fonts.example/x.css");
    @plugin "@tailwindcss/typography";
    @source "../x";
    @custom-variant dark (&:is(.dark *));
    @theme inline {
      --color-paper: var(--paper);
      --font-hand: "Kalam", cursive;
      --font-mono: "Plex", monospace;
      --color-*: initial;
      --animate-x: x 1s;
      @keyframes x { from { opacity: 0 } to { opacity: 1 } }
    }
    @utility tilt-* { rotate: calc(--value(integer) * 1deg); &:hover { rotate: 0deg } @media (min-width: 1px) { rotate: 1deg } }
  `)
  assert.deepEqual(r.cssVars.theme, { 'color-paper': 'var(--paper)', 'animate-x': 'x 1s' })
  assert.deepEqual(r.fontFamilies, { '--font-hand': '"Kalam", cursive', '--font-mono': '"Plex", monospace' })
  assert.deepEqual(Object.keys(r.css).filter((k) => k.startsWith('@import') || k.startsWith('@plugin')), ['@import "tw-animate-css"', '@import url("https://fonts.example/x.css")', '@plugin "@tailwindcss/typography"'])
  assert.deepEqual(r.devDependencies, ['@tailwindcss/typography', 'tw-animate-css'])
  assert.ok(r.css['@custom-variant dark (&:is(.dark *))'])
  assert.deepEqual(r.css['@keyframes x'], { from: { opacity: '0' }, to: { opacity: '1' } })
  assert.deepEqual(r.css['@utility tilt-*'], { rotate: 'calc(--value(integer) * 1deg)', '&:hover': { rotate: '0deg' }, '@media (min-width: 1px)': { rotate: '1deg' } })
  const warned = r.warnings.join('\n')
  assert.match(warned, /--color-\*: initial/)
  assert.match(warned, /@source/)
})

test('css: nesting is flattened (& forms, :is() wrapping, bubbling media), @variant is an error, @property warns', () => {
  const r = convertCss(`
    .a, .b {
      color: red;
      &:hover { color: blue }
      .child { x: 1 }
      .dark & { y: 2 }
      @media (min-width: 1px) { color: green; &:focus { z: 3 } }
    }
    .p .q { > .r & { w: 4 } }
    @media print { .c { display: none } }
    @property --x { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
  `)
  assert.deepEqual(Object.keys(r.css), ['.a, .b', '.a:hover, .b:hover', '.a .child, .b .child', '.dark .a, .dark .b', '@media (min-width: 1px)', '.p .q', '> .r :is(.p .q)', '@media print'])
  assert.deepEqual(r.css['@media (min-width: 1px)'], { '.a, .b': { color: 'green' }, '.a:focus, .b:focus': { z: '3' } })
  assert.equal(r.css['@property --x'], undefined)
  assert.match(r.warnings.join('\n'), /@property --x was dropped/)
  const bad = convertCss('.a { @variant dark { color: red } }')
  assert.match(bad.errors.join('\n'), /@variant nested/)
  assert.match(convertCss('.a { color: red; color: blue }').warnings.join('\n'), /declares color twice/)
})

test('JSON-schema validator agrees with ajv on registry documents', async (t) => {
  let Ajv
  try {
    Ajv = createRequire(path.join(REPO_ROOT, 'package.json'))('ajv')
  } catch {
    return t.skip('ajv not available')
  }
  const ajv = new (Ajv.default ?? Ajv)({ strict: false, allErrors: true })
  const itemSchema = JSON.parse(read(path.join(REPO_ROOT, 'tools/schema/registry-item.json')))
  const regSchema = JSON.parse(read(path.join(REPO_ROOT, 'tools/schema/registry.json')))
  delete itemSchema.$schema
  delete regSchema.$schema
  ajv.addSchema(itemSchema, 'https://ui.shadcn.com/schema/registry-item.json')
  ajv.addSchema(regSchema, 'https://ui.shadcn.com/schema/registry.json')
  const items = [
    { name: 'a', type: 'registry:ui' },
    { name: 'a', type: 'registry:ui', files: [{ path: 'x.tsx', type: 'registry:ui', target: '@ui/x.tsx', content: '' }] },
    { name: 'a', type: 'registry:nope' },
    { name: 'a' },
    { type: 'registry:ui' },
    { name: 'a', type: 'registry:ui', files: [{ path: 'x', type: 'registry:page' }] },
    { name: 'a', type: 'registry:ui', files: [{ type: 'registry:ui' }] },
    { name: 'a', type: 'registry:font' },
    { name: 'a', type: 'registry:font', font: { family: 'x', provider: 'google', import: 'X', variable: '--x' } },
    { name: 'a', type: 'registry:font', font: { family: 'x', provider: 'bunny', import: 'X', variable: '--x' } },
    { name: 'a', type: 'registry:ui', font: { family: 'x', provider: 'google', import: 'X', variable: '--x' } },
    { name: 'a', type: 'registry:ui', dependencies: 'react' },
    { name: 'a', type: 'registry:ui', cssVars: { theme: { a: 'b' }, light: { a: 1 } } },
    { name: 'a', type: 'registry:ui', css: { '.a': { color: 'red', '&:hover': { color: 'blue' } }, '@import "x"': {} } },
    { name: 'a', type: 'registry:ui', css: { '.a': { color: 3 } } },
    { name: 'a', type: 'registry:style', extends: 'none', style: 'x' },
    { name: 'a', type: 'registry:base', style: 'x', baseColor: 'y' },
    { name: 'a', type: 'registry:ui', categories: ['x'], meta: { any: [1] }, docs: 'hi' },
  ]
  for (const it of items) {
    const want = ajv.getSchema('https://ui.shadcn.com/schema/registry-item.json')(it)
    assert.equal(validateRegistryItem(it).length === 0, want, `item ${JSON.stringify(it)}`)
  }
  const regs = [
    { name: 'r', homepage: 'h', items: [] },
    { name: 'r', homepage: 'h', items: [{ name: 'a', type: 'registry:ui' }] },
    { name: 'r', homepage: 'h', items: [{ name: 'a', type: 'registry:bad' }] },
    { name: 1, homepage: 'h', items: [] },
    { name: 'r', include: ['x/registry.json'] },
  ]
  for (const r of regs) {
    const want = ajv.getSchema('https://ui.shadcn.com/schema/registry.json')(r)
    assert.equal(validateRegistry(r).length === 0, want, `registry ${JSON.stringify(r)}`)
  }
  assert.deepEqual(validate(3, { type: 'string' }), ['/: expected string, got integer'])
  assert.equal(validate('ab', { type: 'string', minLength: 3 }).length, 1)
  assert.equal(validate({ a: 1 }, { type: 'object', additionalProperties: false, properties: {} }).length, 1)
  assert.equal(validate(2, { anyOf: [{ const: 1 }, { const: 2 }] }).length, 0)
  assert.equal(validate(3, { oneOf: [{ type: 'number' }, { type: 'integer' }] }).length, 1)
})

test('addressing: url, namespace and name modes round-trip; env and dotenv configure the base URL', () => {
  for (const [deps, expected] of [['url', 'https://x.test/r/button.json'], ['namespace', '@looseleaf/button'], ['name', 'button']]) {
    const c = resolveConfig({ root: SCRATCH, url: 'https://x.test/r/', deps, env: {} })
    assert.equal(itemAddress('button', c), expected)
    assert.equal(addressToName(expected, c), 'button')
  }
  assert.equal(resolveConfig({ root: SCRATCH, env: {} }).registryUrl, 'https://kevintngo.github.io/looseleaf/r')
  assert.equal(resolveConfig({ root: SCRATCH, env: { VITE_REGISTRY_URL: 'https://a.b/reg/r///' } }).registryUrl, 'https://a.b/reg/r')
  assert.equal(resolveConfig({ root: SCRATCH, env: { VITE_REGISTRY_URL: 'https://a.b/reg/r' } }).homepage, 'https://a.b/reg')
  write(path.join(SCRATCH, 'dot', '.env'), '# c\nVITE_REGISTRY_URL="https://dot.env/r"  \nOTHER=1\n')
  assert.equal(resolveConfig({ root: path.join(SCRATCH, 'dot'), env: {} }).registryUrl, 'https://dot.env/r')
  assert.equal(resolveConfig({ root: path.join(SCRATCH, 'dot'), env: { VITE_REGISTRY_URL: 'https://env.wins/r' } }).registryUrl, 'https://env.wins/r', 'process env beats .env')
  assert.throws(() => resolveConfig({ root: SCRATCH, url: 'not a url', env: {} }), /absolute http/)
  assert.throws(() => resolveConfig({ root: SCRATCH, deps: 'weird', env: {} }), /--deps/)
  assert.throws(() => resolveConfig({ root: SCRATCH, namespace: 'looseleaf', env: {} }), /Namespace/)
})

test('scan: the fixture tree produces the expected items, files, targets and dependencies', () => {
  const { registry, errors, warnings } = scanAndBuild(FIXTURE)
  assert.deepEqual(errors, [])
  assert.equal(warnings.length, 1, warnings.join('\n'))
  assert.match(warnings[0], /@property --ll-angle was dropped/)
  const by = Object.fromEntries(registry.items.map((i) => [i.name, i]))
  assert.deepEqual(Object.keys(by), [
    'looseleaf', 'looseleaf-blocks', 'looseleaf-theme', 'font-kalam', 'font-caveat', 'font-special-elite', 'font-ibm-plex-mono',
    'utils', 'ink', 'ink-art', 'ink-grain-textures', 'ink-icons', 'ink-paper', 'ink-paper-textures', 'ink-recipes', 'ink-stickers', 'use-tilt', 'button', 'card', 'chart', 'dialog', 'empty', 'icon', 'login',
  ])
  const dep = (...names) => names.map((n) => itemAddress(n, cfg))
  assert.equal(by.button.type, 'registry:ui')
  assert.deepEqual(by.button.files, [
    { path: 'src/components/ui/button.tsx', type: 'registry:ui', target: '@ui/button.tsx' },
    { path: 'src/lib/ink/recipes/button-ink.ts', type: 'registry:lib', target: '@lib/ink/recipes/button-ink.ts' },
  ])
  assert.deepEqual(by.button.dependencies, ['class-variance-authority', 'radix-ui'])
  assert.deepEqual(by.button.registryDependencies, dep('ink', 'ink-recipes', 'looseleaf-theme', 'use-tilt'))
  assert.deepEqual(by.dialog.registryDependencies, dep('button', 'looseleaf-theme'))
  assert.deepEqual(by.card.registryDependencies, dep('ink', 'ink-paper', 'ink-recipes', 'looseleaf-theme'), '@/lib/ink/paper (a core file) maps to ink, @/lib/ink/paper/edges to ink-paper, the shared _frame recipe to ink-recipes')
  assert.equal(by.card.categories[0], 'Paper')
  assert.deepEqual(by.ink.files.map((f) => f.target), [
    '@lib/ink/index.ts', '@lib/ink/paper.tsx', '@lib/ink/pen.ts', '@lib/ink/recipes/index.ts', '@lib/ink/rng.ts', '@lib/ink/strokes/felt.ts',
  ])
  assert.ok(by.ink.files.some((f) => f.target === '@lib/ink/strokes/felt.ts'), 'sub-directories keep their relative path')
  assert.equal(by['use-tilt'].type, 'registry:hook')
  assert.equal(by['use-tilt'].files[0].target, '@hooks/use-tilt.ts')
  assert.equal(by.login.type, 'registry:block')
  assert.deepEqual(by.login.files.map((f) => f.target), ['@components/blocks/login/fields.tsx', '@components/blocks/login/index.tsx', '@components/blocks/login/login-block.tsx', '@components/blocks/login/parts/hint.tsx'])
  assert.deepEqual(by.login.registryDependencies, dep('button', 'card', 'looseleaf-theme'))
  assert.deepEqual(by.login.dependencies, ['@hookform/resolvers@^5', 'react-hook-form@^7', 'zod@^4'], 'the packages whose major matters are written as pkg@range (config.mjs DEFAULT_PINS)')
  assert.deepEqual(by.button.dependencies, ['class-variance-authority', 'radix-ui'], 'everything else stays a bare name')
  assert.deepEqual(by.login.categories, ['Forms'], 'a category in the meta wins')
  assert.equal(by['looseleaf-theme'].type, 'registry:theme')
  assert.deepEqual(by['looseleaf-theme'].devDependencies, ['tw-animate-css'])
  assert.equal(by['looseleaf-theme'].registryDependencies.length, 4)
  assert.equal(by['font-ibm-plex-mono'].font.selector, 'code, kbd, samp, pre')
  assert.equal(by['font-kalam'].font.variable, '--font-hand')
  assert.equal(by.looseleaf.type, 'registry:style')
  assert.equal(by.looseleaf.extends, 'none')
  assert.ok(by.looseleaf.registryDependencies.length >= 6 && !by.looseleaf.registryDependencies.some((d) => d.includes('login')))
  assert.equal(by['utils'].registryDependencies, undefined)
  assert.deepEqual(validateRegistry(registry), [])
})

test('layout: art kinds, baked textures and component recipes become the items notes/registry.md promises', () => {
  const { registry, errors } = scanAndBuild(FIXTURE)
  assert.deepEqual(errors, [])
  const by = Object.fromEntries(registry.items.map((i) => [i.name, i]))
  const dep = (...names) => names.map((n) => itemAddress(n, cfg))
  assert.deepEqual(by['ink-icons'].files.map((f) => f.target), ['@lib/ink/art/icons/index.ts', '@lib/ink/art/icons/marks.ts'])
  assert.deepEqual(by['ink-icons'].registryDependencies, dep('ink-art'))
  assert.deepEqual(by['ink-stickers'].files.map((f) => f.path), ['src/lib/ink/art/stickers/food.ts', 'src/lib/ink/art/stickers/index.ts'])
  assert.ok(!by.ink.files.some((f) => /art\/(icons|stickers)\//.test(f.path)), 'the core ink item excludes the art kinds')
  assert.deepEqual(by['ink-art'].files.map((f) => f.path), ['src/lib/ink/art/types.ts'], 'files directly in art/ (types, dsl, glyphs, art-draw …) are the art renderer item')
  assert.deepEqual(by['ink-art'].registryDependencies, dep('ink'), 'the renderer builds on the core (its art types import the seeded generator)')
  assert.deepEqual(by['ink-paper'].files.map((f) => f.path), ['src/lib/ink/paper/edges.ts'])
  assert.ok(by.ink.files.some((f) => f.path === 'src/lib/ink/paper.tsx'), 'only the paper/ DIRECTORY leaves the core')
  assert.ok(by.card.registryDependencies.includes(itemAddress('ink-paper', cfg)))
  assert.deepEqual(by.chart.files.map((f) => f.target), ['@ui/chart.tsx', '@lib/ink/charts/scale.ts'])
  assert.ok(!by.ink.files.some((f) => /charts\//.test(f.path)))
  assert.deepEqual(by['ink-paper-textures'].files.map((f) => f.path), ['src/lib/ink/textures-paper.generated.ts'])
  assert.deepEqual(by['ink-grain-textures'].files.map((f) => f.path), ['src/lib/ink/textures.generated.ts'])
  assert.deepEqual(by.ink.registryDependencies, dep('ink-grain-textures', 'ink-paper-textures'))
  assert.ok(by.card.files.some((f) => f.path === 'src/lib/ink/recipes/card-ink.ts' && f.type === 'registry:lib' && f.target === '@lib/ink/recipes/card-ink.ts'))
  assert.deepEqual(by['ink-recipes'].files.map((f) => f.path), ['src/lib/ink/recipes/_frame.ts', 'src/lib/ink/recipes/tooltip-ink.ts'], 'a shared recipe, and one with no matching component, ship in ink-recipes')
  assert.deepEqual(by.ink.files.filter((f) => f.path.includes('/recipes/')).map((f) => f.path), ['src/lib/ink/recipes/index.ts'], 'only the recipe API (recipes/index.ts) stays in the core')
  assert.ok(!by.ink.files.some((f) => /recipes\/(button|card)-ink\.ts/.test(f.path)))
  assert.deepEqual(by.empty.registryDependencies, dep('ink-stickers', 'looseleaf-theme'))
  assert.deepEqual(by.icon.registryDependencies, dep('ink-icons', 'looseleaf-theme'))
  const umbrella = by.looseleaf.registryDependencies
  for (const n of ['ink', 'ink-art', 'ink-paper', 'ink-recipes', 'ink-icons', 'ink-stickers', 'ink-paper-textures', 'ink-grain-textures', 'icon', 'empty', 'button', 'chart']) assert.ok(umbrella.includes(itemAddress(n, cfg)), `${n} is in the umbrella`)
  assert.ok(!umbrella.some((d) => d.includes('login')), 'blocks stay out of the umbrella')
})

test('layout: ownerOfLibFile decides by path; recipes are owned by a component only when that component exists', async () => {
  const { ownerOfLibFile, libItemInfo } = await import('./registry/layout.mjs')
  const ctx = { uiSlugs: new Set(['button', 'input-otp', 'chart', 'typography']) }
  const own = (sub, dir = 'ink') => ownerOfLibFile(dir, sub, ctx)
  assert.deepEqual(own('art/icons/arrows.ts'), { kind: 'lib', item: 'ink-icons' })
  assert.deepEqual(own('art/mascots/poses.ts'), { kind: 'lib', item: 'ink-mascots' })
  assert.deepEqual(own('art/scenes/empty-scenes.ts'), { kind: 'lib', item: 'ink-scenes' })
  assert.deepEqual(own('art/types.ts'), { kind: 'lib', item: 'ink-art' })
  assert.deepEqual(own('art/dsl.ts'), { kind: 'lib', item: 'ink-art' })
  assert.deepEqual(own('art/glyphs.ts'), { kind: 'lib', item: 'ink-art' })
  assert.deepEqual(own('art-draw.ts'), { kind: 'lib', item: 'ink-art' })
  assert.deepEqual(own('paper/stocks.ts'), { kind: 'lib', item: 'ink-paper' })
  assert.deepEqual(own('paper/sheet-layers.tsx'), { kind: 'lib', item: 'ink-paper' })
  assert.deepEqual(own('paper.tsx'), { kind: 'lib', item: 'ink' }, 'a FILE called paper.tsx is not the paper/ directory')
  assert.deepEqual(own('recipes/paper-set-ink.ts'), { kind: 'lib', item: 'ink-paper' }, 'the paper set recipe sits with the paper it draws (rule before the recipe rule)')
  assert.deepEqual(own('charts/chart-scale.ts'), { kind: 'ui', item: 'chart' })
  assert.deepEqual(own('typography-tiles.generated.ts'), { kind: 'ui', item: 'typography' })
  assert.deepEqual(ownerOfLibFile('ink', 'charts/chart-scale.ts', { uiSlugs: new Set() }), { kind: 'lib', item: 'ink' }, 'without a chart component the geometry falls back to the core')
  assert.deepEqual(own('recipes/button-ink.ts'), { kind: 'ui', item: 'button' })
  assert.deepEqual(own('recipes/button-ink/parts.ts'), { kind: 'ui', item: 'button' })
  assert.deepEqual(own('recipes/input-otp-ink.ts'), { kind: 'ui', item: 'input-otp' })
  assert.deepEqual(own('recipes/button.ts'), { kind: 'ui', item: 'button' }, 'the bare <slug>.ts is still owned by the component (scan.mjs then refuses it, see the cli hazard test)')
  assert.deepEqual(own('recipes/button.states.ts'), { kind: 'lib', item: 'ink-recipes' }, 'only <slug>-ink.ts or <slug>-ink/… (or the bare slug) belongs to a component')
  assert.deepEqual(own('recipes/toast-ink.ts'), { kind: 'lib', item: 'ink-recipes' }, 'no ui/toast.tsx here: the recipe ships with the shared recipes')
  assert.deepEqual(own('recipes/toast.ts'), { kind: 'lib', item: 'ink-recipes' })
  assert.deepEqual(own('recipes/_shared.ts'), { kind: 'lib', item: 'ink-recipes' })
  assert.deepEqual(own('recipes/index.ts'), { kind: 'lib', item: 'ink' }, 'the recipe API stays in the core')
  assert.deepEqual(own('react/ink.tsx'), { kind: 'lib', item: 'ink' })
  assert.deepEqual(own('textures-paper.generated.ts'), { kind: 'lib', item: 'ink-paper-textures' })
  assert.deepEqual(own('textures.generated.ts'), { kind: 'lib', item: 'ink-grain-textures' })
  assert.deepEqual(own('x.ts', 'other'), { kind: 'lib', item: 'other' })
  assert.deepEqual(own('recipes/button.ts', 'other'), { kind: 'lib', item: 'other' }, 'only the ink directory has the recipe rule')
  assert.equal(libItemInfo('ink-icons').title, 'Ink icons')
  assert.equal(libItemInfo('ink-mascots').title, 'Ink mascots')
  for (const n of ['ink', 'ink-art', 'ink-paper', 'ink-recipes']) assert.ok(libItemInfo(n).description.length > 40, `${n} has a written description`)
  assert.match(libItemInfo('ink-newkind').description, /newkind/)
  assert.equal(libItemInfo('something-else'), null)
})

test('layout: the engine never depends on a component, and lib items never form a circle', () => {
  const up = copyTree()
  write(path.join(up, 'src/lib/ink/index.ts'), `${read(path.join(up, 'src/lib/ink/index.ts'))}\nexport { buttonRecipe } from "@/lib/ink/recipes/button-ink"\n`)
  assert.ok(scanAndBuild(up).errors.some((e) => /lib item "ink" imports the component "button"/.test(e)), 'ink -> button (through a recipe it owns the barrel for)')
  const circle = copyTree()
  write(path.join(circle, 'src/lib/ink/art/types.ts'), `${read(path.join(circle, 'src/lib/ink/art/types.ts'))}\nexport { marks } from "@/lib/ink/art/icons"\n`)
  const errs = scanAndBuild(circle).errors.join('\n')
  assert.match(errs, /lib items depend on each other in a circle: (ink-art -> ink-icons -> ink-art|ink-icons -> ink-art -> ink-icons)/)
})

test('cli hazard: an import the shadcn CLI would re-resolve to another file (same base name, .tsx before .ts) is refused', async () => {
  const d = copyTree()
  renameSync(path.join(d, 'src/lib/ink/recipes/card-ink.ts'), path.join(d, 'src/lib/ink/recipes/card.ts'))
  write(path.join(d, 'src/components/ui/card.tsx'), read(path.join(d, 'src/components/ui/card.tsx')).replace('recipes/card-ink"', 'recipes/card"'))
  const errs = scanAndBuild(d).errors
  assert.ok(errs.some((e) => /card\.tsx: import "@\/lib\/ink\/recipes\/card": the shadcn CLI re-resolves "@\/lib\/ink\/recipes\/card" to "@\/components\/ui\/card"/.test(e) && /recipes\/<slug>-ink\.ts/.test(e)), errs.join('\n'))
  const off = scanTree(d, cfg, { cliHazard: 'off' })
  assert.deepEqual(off.errors, [])
  assert.ok(off.items.get('card').files.some((f) => f.path === 'src/lib/ink/recipes/card.ts'))
  const m = copyTree()
  write(path.join(m, 'src/lib/ink/art/mascot/index.ts'), 'export const stubby = { grid: 64 }\n')
  write(path.join(m, 'src/components/ui/mascot.tsx'), 'import { stubby } from "@/lib/ink/art/mascot"\nexport const Mascot = () => stubby.grid\n')
  const merrs = scanAndBuild(m).errors.join('\n')
  assert.match(merrs, /mascot\.tsx: import "@\/lib\/ink\/art\/mascot": the shadcn CLI re-resolves "@\/lib\/ink\/art\/mascot" to "@\/components\/ui\/mascot"/)
  assert.deepEqual(scanAndBuild(FIXTURE).errors, [])
  const w = copyTree()
  write(path.join(w, 'src/hooks/use-tilt.tsx'), 'export const twin = 1\n')
  assert.match(scanAndBuild(w).errors.join('\n'), /duplicate item name|re-resolves "@\/hooks\/use-tilt"/, 'a .tsx twin of a .ts import is caught (here also as a duplicate item)')
})

test('layout: importing another component\'s recipe makes you depend on that component (and the graph says so)', () => {
  const d = copyTree()
  write(path.join(d, 'src/components/ui/tag.tsx'), `import { buttonRecipe } from "@/lib/ink/recipes/button-ink"\nexport const Tag = () => buttonRecipe("x").d\n`)
  const tag = scanAndBuild(d).registry.items.find((i) => i.name === 'tag')
  assert.ok(tag.registryDependencies.includes(itemAddress('button', cfg)), 'tag depends on button because it imports button\'s recipe')
})

test('meta: blocks read title, description and tags from the docs shell\'s content/blocks/<name>.meta.ts', () => {
  const { registry, errors } = scanAndBuild(FIXTURE)
  assert.deepEqual(errors, [])
  const login = registry.items.find((i) => i.name === 'login')
  assert.equal(login.title, 'Login slip (block)')
  assert.deepEqual(login.meta.tags, ['auth', 'forms'])
  assert.match(login.docs, /Installed the "Login slip \(block\)" block/)
  assert.match(login.meta.usage, /LoginBlock/, 'usage still comes from src/docs/meta/login.ts')
  const d = copyTree()
  rmSync(path.join(d, 'src/docs/content'), { recursive: true, force: true })
  assert.equal(scanAndBuild(d).registry.items.find((i) => i.name === 'login').title, 'Login slip', 'without a BlockDoc the component meta is used')
  rmSync(path.join(d, 'src/docs/meta/login.ts'))
  const w = scanAndBuild(d)
  assert.match(w.warnings.join('\n'), /no src\/docs\/meta\/<slug>\.ts.*login/)
  const only = copyTree()
  rmSync(path.join(only, 'src/docs/meta/login.ts'))
  const t = scanAndBuild(only).registry.items.find((i) => i.name === 'login')
  assert.equal(t.title, 'Login slip (block)', 'a BlockDoc alone is enough')
  assert.ok(!scanAndBuild(only).warnings.some((x) => /no src\/docs\/meta/.test(x)))
})

test('pins: packages whose major matters are written pkg@range, everything else stays bare, and the pins must match package.json', async () => {
  const { DEFAULT_PINS } = await import('./registry/config.mjs')
  assert.deepEqual(Object.keys(DEFAULT_PINS).sort(), ['@hookform/resolvers', 'react-day-picker', 'react-hook-form', 'react-resizable-panels', 'zod'])
  const rootPkg = JSON.parse(read(path.join(REPO_ROOT, 'package.json')))
  for (const [name, range] of Object.entries(DEFAULT_PINS)) {
    assert.equal(/\d+/.exec(rootPkg.dependencies[name])?.[0], /\d+/.exec(range)[0], `${name}: package.json ${rootPkg.dependencies[name]} vs pin ${range}`)
  }
  const login = (c) => buildRegistry(scanTree(FIXTURE, c), FIXTURE, c).registry.items.find((i) => i.name === 'login')
  assert.deepEqual(login(cfg).dependencies, ['@hookform/resolvers@^5', 'react-hook-form@^7', 'zod@^4'])
  assert.match(login(cfg).docs, /Needs @hookform\/resolvers@\^5, react-hook-form@\^7, zod@\^4/)
  const off = resolveConfig({ root: FIXTURE, env: {}, pins: 'off' })
  assert.deepEqual(login(off).dependencies, ['@hookform/resolvers', 'react-hook-form', 'zod'], '--pins off writes bare names again')
  assert.ok(!/Needs /.test(login(off).docs))
  assert.throws(() => resolveConfig({ root: FIXTURE, env: {}, pins: 'maybe' }), /--pins must be on \| off/)
  assert.equal(resolveConfig({ root: FIXTURE, env: { LOOSELEAF_PINS: 'off' } }).pins.zod, undefined)
  const d = copyTree()
  const pkgFile = path.join(d, 'package.json')
  write(pkgFile, read(pkgFile).replace('"zod": "^4.6.5"', '"zod": "^3.25.0"'))
  assert.ok(scanAndBuild(d).errors.some((e) => /package "zod" is pinned to "\^4".*declares "\^3\.25\.0"/.test(e)), scanAndBuild(d).errors.join('\n'))
  const out = path.join(SCRATCH, 'pins-out')
  const r = await runRegistryBuild({ root: FIXTURE, url: 'https://x.test/r', registryFile: path.join(SCRATCH, 'pins.json'), outDir: out })
  assert.deepEqual(r.errors, [])
  assert.deepEqual(JSON.parse(read(path.join(out, 'login.json'))).dependencies, ['@hookform/resolvers@^5', 'react-hook-form@^7', 'zod@^4'])
})

test('blocks: docs print an import that resolves, categories come from a table, a `_` folder gets an explanation', async () => {
  const { blockCategory } = await import('./registry/layout.mjs')
  assert.equal(blockCategory('login-03', {}), 'authentication')
  assert.equal(blockCategory('otp-01', {}), 'authentication')
  assert.equal(blockCategory('reset-password-01', {}), 'authentication')
  assert.equal(blockCategory('sidebar-07', { tags: ['sidebar'] }), 'sidebar')
  assert.equal(blockCategory('dashboard-finance', {}), 'dashboard')
  assert.equal(blockCategory('settings-billing', {}), 'settings')
  assert.equal(blockCategory('checkout-01', {}), 'commerce')
  assert.equal(blockCategory('error-404', { tags: ['marketing', 'error', '404'] }), 'feedback', 'an error page is feedback even though it is tagged marketing')
  assert.equal(blockCategory('empty-inbox', { tags: ['empty state', 'inbox'] }), 'feedback')
  assert.equal(blockCategory('pricing-01', { tags: ['marketing', 'pricing'] }), 'marketing')
  assert.equal(blockCategory('inbox', { tags: ['inbox', 'mail'] }), 'app')
  assert.equal(blockCategory('inbox', { category: 'Mail' }), 'Mail', 'a category written in a meta file wins')

  const d = copyTree()
  write(path.join(d, 'src/blocks/pricing/page.tsx'), 'export default function PricingPage() {\n  return null\n}\n')
  write(path.join(d, 'src/blocks/pricing/data.ts'), 'export const plans = []\n')
  write(path.join(d, 'src/blocks/anon/page.tsx'), 'const X = () => null\nexport default X\n')
  const by = Object.fromEntries(scanAndBuild(d).registry.items.map((i) => [i.name, i]))
  assert.match(by.pricing.docs, /Import it: import PricingPage from "<your components alias>\/blocks\/pricing\/page"/, 'a block has page.tsx, not an index: the import names the file that exists')
  assert.match(by.anon.docs, /import X from "<your components alias>\/blocks\/anon\/page"/)
  assert.deepEqual(by.pricing.categories, ['app'])
  assert.match(by.login.docs, /Usage:\nimport \{ LoginBlock \}/, 'a usage written in the meta replaces the generated import line')
  write(path.join(d, 'src/blocks/barrel/index.tsx'), 'export { A } from "./a"\n')
  write(path.join(d, 'src/blocks/barrel/a.tsx'), 'export const A = () => null\n')
  assert.match(Object.fromEntries(scanAndBuild(d).registry.items.map((i) => [i.name, i])).barrel.docs, /import \{ … \} from "<your components alias>\/blocks\/barrel"/)

  const under = copyTree()
  write(path.join(under, 'src/blocks/_shared/kit.tsx'), 'export const K = 1\n')
  assert.ok(scanAndBuild(under).errors.some((e) => /item name "_shared".*shared by several blocks is a block of its own/.test(e)), scanAndBuild(under).errors.join('\n'))
})

test('fonts: weights come from the stylesheets the docs app loads, else from the table', async () => {
  const { readFontWeights, FONT_TABLE, buildFontItems } = await import('./registry/fonts.mjs')
  const w = readFontWeights(FIXTURE)
  assert.deepEqual(w['@fontsource/kalam'], ['400', '700'])
  assert.deepEqual(w['@fontsource/caveat'], ['400'])
  const items = Object.fromEntries(buildFontItems({}, w).map((f) => [f.name, f]))
  assert.deepEqual(items['font-kalam'].font.weight, ['400', '700'])
  assert.deepEqual(Object.keys(items['font-kalam'].css), ['@import "@fontsource/kalam/700.css"'])
  assert.deepEqual(items['font-caveat'].font.weight, ['400'])
  assert.equal(items['font-caveat'].css, undefined)
  const table = Object.fromEntries(FONT_TABLE.map((f) => [f.name, f.weight]))
  assert.deepEqual(table, { 'font-kalam': ['400', '700'], 'font-caveat': ['400', '500', '600', '700'], 'font-special-elite': ['400'], 'font-ibm-plex-mono': ['400', '500'] })
  const real = readFontWeights(REPO_ROOT)
  if (Object.keys(real).length) assert.deepEqual(Object.fromEntries(FONT_TABLE.map((f) => [f.name, real[f.dependency]])), table, 'src/styles/fonts.css and FONT_TABLE agree')
  assert.deepEqual(readFontWeights(path.join(SCRATCH, 'nope')), {})
})

test('scan: --no-targets omits placeholders, --theme-dep none drops the theme dependency', () => {
  const noTargets = scanAndBuild(FIXTURE, { targets: false }).registry
  assert.ok(noTargets.items.every((i) => (i.files ?? []).every((f) => !('target' in f))))
  const noTheme = buildRegistry(scanTree(FIXTURE, resolveConfig({ root: FIXTURE, themeDep: 'none', env: {} }), {}), FIXTURE, resolveConfig({ root: FIXTURE, themeDep: 'none', env: {} }), {}).registry
  assert.ok(!noTheme.items.find((i) => i.name === 'button').registryDependencies.some((d) => d.includes('looseleaf-theme')))
})

test('scan: broken trees are reported precisely (and never crash)', () => {
  const cases = [
    ['unresolved alias', (d) => write(path.join(d, 'src/components/ui/card.tsx'), read(path.join(d, 'src/components/ui/card.tsx')).replace('@/lib/ink/paper', '@/lib/ink/nope')), /card\.tsx.*"@\/lib\/ink\/nope" does not resolve to any file that ships/],
    ['undeclared package', (d) => write(path.join(d, 'src/hooks/use-x.ts'), 'import pad from "left-pad"\nexport const useX = () => pad\n'), /use-x\.ts.*package "left-pad" is not declared in package\.json/],
    ['devDependency import', (d) => { write(path.join(d, 'package.json'), read(path.join(d, 'package.json')).replace('"dependencies": {', '"devDependencies": { "vitest": "^5.0.0" },\n  "dependencies": {')); write(path.join(d, 'src/hooks/use-t.ts'), 'import { vi } from "vitest"\nexport const useT = () => vi\n') }, /use-t\.ts.*package "vitest" is only a devDependency in package\.json/],
    ['@/registry import', (d) => write(path.join(d, 'src/hooks/use-y.ts'), 'import { a } from "@/registry/new-york/lib/a"\n'), /"@\/registry" imports/],
    ['docs import', (d) => write(path.join(d, 'src/hooks/use-y.ts'), 'import type { ComponentDoc } from "@/docs/types"\n'), /"@\/docs" is not part of the registry/],
    ['relative escape', (d) => write(path.join(d, 'src/components/ui/card.tsx'), 'import { rng } from "../../lib/ink/rng"\nexport const Card = rng\n'), /reaches into item "ink"/],
    ['binary file', (d) => write(path.join(d, 'src/lib/ink/grain.png'), 'x'), /grain\.png: binary file/],
    ['NUL bytes', (d) => write(path.join(d, 'src/lib/ink/blob.ts'), 'a\u0000b'), /blob\.ts: binary content/],
    ['reserved name', (d) => write(path.join(d, 'src/components/ui/looseleaf.tsx'), 'export const a = 1\n'), /"looseleaf" is reserved/],
    ['non-kebab slug', (d) => write(path.join(d, 'src/components/ui/MyThing.tsx'), 'export const a = 1\n'), /slug must be kebab-case/],
    ['non-kebab block', (d) => write(path.join(d, 'src/blocks/Sign_In/index.tsx'), 'export const a = 1\n'), /item name "Sign_In".*must be kebab-case/],
    ['dotted lib file', (d) => write(path.join(d, 'src/lib/tex.generated.ts'), 'export const a = 1\n'), /item name "tex\.generated".*must be kebab-case/],
    ['duplicate item names', (d) => write(path.join(d, 'src/lib/button.ts'), 'export const a = 1\n'), /duplicate item name "button"/],
    ['@variant in css', (d) => write(path.join(d, 'src/styles/looseleaf.css'), '.a { @variant dark { color: red } }\n'), /@variant nested/],
    ['bad css import package', (d) => write(path.join(d, 'src/styles/looseleaf.css'), '@import "left-pad-css";\n'), /imports "left-pad-css" which is not declared/],
  ]
  for (const [name, mutate, expected] of cases) {
    const d = copyTree()
    mutate(d)
    const { errors } = scanAndBuild(d)
    assert.ok(errors.some((e) => expected.test(e)), `${name}: expected ${expected}, got\n${errors.join('\n') || '(no errors)'}`)
  }
  const d = copyTree()
  mkdirSync(path.join(d, 'src/components/ui/nested'), { recursive: true })
  write(path.join(d, 'src/components/ui/nested/x.tsx'), 'export const a = 1\n')
  write(path.join(d, 'src/hooks/helper.ts'), 'export const a = 1\n')
  write(path.join(d, 'src/blocks/README.md'), 'hello')
  write(path.join(d, 'src/docs/meta/broken.ts'), 'export default fn()')
  write(path.join(d, 'src/docs/meta/card.ts'), 'export default fn()')
  const { errors, warnings } = scanAndBuild(d)
  assert.deepEqual(errors, [])
  const w = warnings.join('\n')
  assert.match(w, /nested\/: ignored/)
  assert.match(w, /helper\.ts: ignored/)
  assert.match(w, /README\.md: ignored/)
  assert.match(w, /card\.ts: default export is not an object literal/)
})

test('scan: empty, missing and partial trees give fewer items, not crashes', () => {
  assert.deepEqual(scanAndBuild(path.join(SCRATCH, 'does-not-exist')).registry.items, [])
  const only = path.join(SCRATCH, 'partial')
  write(path.join(only, 'package.json'), '{"dependencies":{}}')
  write(path.join(only, 'src/components/ui/thing.tsx'), 'export const Thing = () => null\n')
  const r = scanAndBuild(only)
  assert.deepEqual(r.errors, [])
  assert.deepEqual(r.registry.items.map((i) => i.name), ['looseleaf', 'thing'])
  assert.ok(!r.registry.items.some((i) => i.name === 'looseleaf-theme'), 'no theme without a stylesheet')
})

test('build: deterministic output, and tampered output is caught by validation', async () => {
  const out1 = path.join(SCRATCH, 'o1')
  const out2 = path.join(SCRATCH, 'o2')
  const common = { root: FIXTURE, url: 'https://x.test/r' }
  const a = await runRegistryBuild({ ...common, registryFile: path.join(SCRATCH, 'r1.json'), outDir: out1 })
  const b = await runRegistryBuild({ ...common, registryFile: path.join(SCRATCH, 'r2.json'), outDir: out2 })
  assert.deepEqual(a.errors, [], a.errors.join('\n'))
  assert.equal(a.ok && b.ok, true)
  assert.equal(read(path.join(SCRATCH, 'r1.json')), read(path.join(SCRATCH, 'r2.json')))
  for (const f of readdirSync(out1)) assert.equal(read(path.join(out1, f)), read(path.join(out2, f)), `${f} differs between runs`)
  const btn = JSON.parse(read(path.join(out1, 'button.json')))
  assert.equal(btn.$schema, 'https://ui.shadcn.com/schema/registry-item.json')
  assert.ok(btn.files[0].content.includes('cva('))
  assert.equal(JSON.parse(read(path.join(out1, 'login.json'))).files.find((f) => f.path.endsWith('login-block.tsx')).content.includes('@/components/blocks/login/fields'), true)

  const c = resolveConfig({ root: FIXTURE, url: 'https://x.test/r', env: {} })
  const clean = await validateBuilt({ outDir: out1, cfg: c })
  assert.deepEqual(clean.errors, [])

  const tampered = path.join(SCRATCH, 'o3')
  cpSync(out1, tampered, { recursive: true })
  const j = JSON.parse(read(path.join(tampered, 'button.json')))
  j.registryDependencies = j.registryDependencies.filter((d) => !d.includes('/ink.json') && !d.includes('/ink-recipes.json') && !d.includes('/use-tilt.json'))
  j.dependencies = []
  writeFileSync(path.join(tampered, 'button.json'), JSON.stringify(j))
  const bad = await validateBuilt({ outDir: tampered, cfg: c })
  const msgs = bad.errors.join('\n')
  assert.match(msgs, /button: .*imports "@\/lib\/ink", but neither button nor its registryDependencies ship that file/)
  assert.match(msgs, /button: .*imports "@\/hooks\/use-tilt"/)
  assert.match(msgs, /package "radix-ui" is not in dependencies of button/)

  const t3 = path.join(SCRATCH, 'o3b')
  cpSync(out1, t3, { recursive: true })
  const um = JSON.parse(read(path.join(t3, 'looseleaf.json')))
  um.registryDependencies = um.registryDependencies.filter((d) => !d.endsWith('/icon.json') && !d.endsWith('/ink-icons.json'))
  writeFileSync(path.join(t3, 'looseleaf.json'), JSON.stringify(um))
  const bad3 = (await validateBuilt({ outDir: t3, cfg: c })).errors.join('\n')
  assert.match(bad3, /the looseleaf umbrella does not install: ink-icons, icon|the looseleaf umbrella does not install: icon, ink-icons/)

  const t4 = path.join(SCRATCH, 'o3c')
  cpSync(out1, t4, { recursive: true })
  const bl = JSON.parse(read(path.join(t4, 'looseleaf-blocks.json')))
  bl.registryDependencies = []
  writeFileSync(path.join(t4, 'looseleaf-blocks.json'), JSON.stringify(bl))
  assert.match((await validateBuilt({ outDir: t4, cfg: c })).errors.join('\n'), /the looseleaf-blocks umbrella does not install: login/)

  const t2 = path.join(SCRATCH, 'o4')
  cpSync(out1, t2, { recursive: true })
  const d = JSON.parse(read(path.join(t2, 'dialog.json')))
  d.registryDependencies.push('https://x.test/r/ghost.json')
  d.files[0].content += '\nimport { x } from "@/registry/new-york/ui/x"\n'
  writeFileSync(path.join(t2, 'dialog.json'), JSON.stringify(d))
  const u = JSON.parse(read(path.join(t2, 'use-tilt.json')))
  u.files[0].content = 'a\u0000b'
  writeFileSync(path.join(t2, 'use-tilt.json'), JSON.stringify(u))
  const bad2 = (await validateBuilt({ outDir: t2, cfg: c })).errors.join('\n')
  assert.match(bad2, /names "ghost", which is not an item of this registry/)
  assert.match(bad2, /leftover @\/registry import/)
  assert.match(bad2, /contains NUL bytes/)
})

test('build: a real failure in the tree stops before shadcn build and leaves no output', async () => {
  const d = copyTree()
  write(path.join(d, 'src/hooks/use-z.ts'), 'import x from "not-a-package"\nexport default x\n')
  const out = path.join(SCRATCH, 'o5')
  const r = await runRegistryBuild({ root: d, registryFile: path.join(SCRATCH, 'r5.json'), outDir: out })
  assert.equal(r.ok, false)
  assert.ok(r.errors.some((e) => /not-a-package/.test(e)))
  assert.equal(existsSync(out), false)
  assert.equal(existsSync(path.join(SCRATCH, 'r5.json')), false)
})

test('build: theme cssVars/css survive the CLI schema (round trip through shadcn build)', async () => {
  const out = path.join(SCRATCH, 'o6')
  const r = await runRegistryBuild({ root: FIXTURE, registryFile: path.join(SCRATCH, 'r6.json'), outDir: out })
  assert.equal(r.ok, true, r.errors.join('\n'))
  const theme = JSON.parse(read(path.join(out, 'looseleaf-theme.json')))
  assert.ok(theme.cssVars.light.paper && theme.cssVars.dark.paper && theme.cssVars.theme['color-paper'])
  assert.ok(theme.css['@utility ll-underline'] && theme.css['@keyframes ll-soak'] && theme.css[':root']['--ll-tilt'])
  assert.equal(theme.css['@property --ll-angle'], undefined)
  assert.ok(r.warnings.some((w) => /@property --ll-angle was dropped/.test(w)))
})

test('build: a dependency cycle between components is a warning, and the install still resolves', async () => {
  const d = copyTree()
  write(path.join(d, 'src/components/ui/button.tsx'), `import { Dialog } from "@/components/ui/dialog"\n${read(path.join(d, 'src/components/ui/button.tsx'))}\nvoid Dialog\n`)
  const r = await runRegistryBuild({ root: d, registryFile: path.join(SCRATCH, 'r7.json'), outDir: path.join(SCRATCH, 'o7') })
  assert.equal(r.ok, true, r.errors.join('\n'))
  assert.ok(r.warnings.some((w) => /cycle: (button -> dialog -> button|dialog -> button -> dialog)/.test(w)), r.warnings.join('\n'))
})

test('build: stable directives write "use client"; (the CLI never strips it), the default leaves the source alone', async () => {
  const dflt = await runRegistryBuild({ root: FIXTURE, registryFile: path.join(SCRATCH, 'r8.json'), outDir: path.join(SCRATCH, 'o8'), stableDirectives: false })
  const stable = await runRegistryBuild({ root: FIXTURE, registryFile: path.join(SCRATCH, 'r9.json'), outDir: path.join(SCRATCH, 'o9'), stableDirectives: true })
  assert.equal(dflt.ok && stable.ok, true)
  const first = (dir) => JSON.parse(read(path.join(dir, 'dialog.json'))).files[0].content.split('\n')[0]
  assert.equal(first(path.join(SCRATCH, 'o8')), '"use client"')
  assert.equal(first(path.join(SCRATCH, 'o9')), '"use client";')
  const other = JSON.parse(read(path.join(SCRATCH, 'o9', 'button.json'))).files[0].content
  assert.equal(other, JSON.parse(read(path.join(SCRATCH, 'o8', 'button.json'))).files[0].content)
})
