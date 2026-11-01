#!/usr/bin/env node
// lint-house.mjs — the Looseleaf house-rules linter. Node + the oxc parser bundled with Vite 8 (see lib/source.mjs).
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { TOOLS_DIR, c, collectFiles, matchAny, parseArgs, plural, readJson, readText, resolveRoot, toPosix } from './lib/util.mjs'
import { calleeName, extractClassPieces, findAttr, isFunctionNode, jsxName, parseSource, stringValue, tokensOf, unwrap, walk } from './lib/source.mjs'
import { splitVariants } from './lib/tw.mjs'

export const RULES = {
  'parse-error': { severity: 'warn', zones: ['all'], doc: 'The file does not parse cleanly; other findings may be incomplete.', fix: 'Fix the syntax error (tsc reports the same one).' },
  'import-allowed': { severity: 'error', zones: ['registry'], doc: 'Registry files may import only react, packages in package.json dependencies, and @/ aliases.', fix: 'Import a package that is in "dependencies", or move the code out of the registry zone. devDependencies are not installed for users.' },
  'relative-import': { severity: 'error', zones: ['registry'], doc: 'Registry files must import Looseleaf files through the @/ alias so the shadcn CLI can rewrite paths.', fix: 'Replace "./x" with "@/lib/x" / "@/components/ui/x" / "@/hooks/x".' },
  'example-import': { severity: 'warn', zones: ['examples'], doc: 'Docs examples import only @/components/ui/*, @/lib/*, @/hooks/*, react (plus the few form/date libs in allow.exampleImports).', fix: 'Import from the @/ alias or drop the import; the example is the documentation users copy.' },
  'no-lucide': { severity: 'error', zones: ['all'], doc: 'lucide-react is banned: every glyph is a hand-drawn Looseleaf doodle icon.', fix: 'Use the doodle icon from @/components/ui/icon (or an ink glyph) instead.' },
  'hard-coded-color': { severity: 'error', zones: ['ui', 'blocks', 'recipes', 'art'], doc: 'No hex / rgb() / hsl() / oklch() literals in components, recipes or art data (engine output is coloured by paint(key) -> var(--ll-*)).', fix: 'Use a theme token: a Tailwind utility (bg-paper, text-ink) or var(--ll-*); in recipes/art use a paint key (\'ink\', \'marker\', …).' },
  'palette-color': { severity: 'warn', zones: ['ui', 'blocks'], doc: 'Tailwind palette colours (bg-red-500, text-white) bypass the theme tokens.', fix: 'Use a semantic token colour (bg-destructive, text-primary-foreground) so a second theme can restyle it.' },
  'use-client': { severity: 'error', zones: ['ui', 'blocks'], doc: '"use client" must be the first statement of files that use hooks, createContext, inline event handlers, or Radix/client-only packages.', fix: 'Add "use client" as the very first line of the file.' },
  'data-slot': { severity: 'error', zones: ['ui'], doc: 'The root element an exported component returns must carry data-slot="…" (shadcn v4 compatibility).', fix: 'Add data-slot="kebab-name" to the returned root element, matching upstream shadcn.' },
  'data-slot-format': { severity: 'warn', zones: ['ui'], doc: 'data-slot values are lowercase kebab-case string literals.', fix: 'Use e.g. data-slot="card-header".' },
  'rounded-class': { severity: 'error', zones: ['ui', 'blocks'], doc: 'Visual corners come from the ink layer, not border-radius. Only allow.rounded utilities are permitted.', fix: 'Remove rounded-*; if it is a hit-area/clip need use rounded-[inherit] or add the exception to lint-house.config.json.' },
  'aspect-auto-height': { severity: 'warn', zones: ['examples', 'blocks'], doc: 'A frame that takes its height from an aspect ratio (Chart, Carousel, Resizable, Progress rings) is 0 px tall when a class list says `aspect-auto` and gives it no height: jsdom hides it (mockBox sizes every element), a browser shows nothing.', fix: 'Add h-* / min-h-* / size-* (or keep an aspect-* ratio) next to aspect-auto.' },
  'font-literal': { severity: 'warn', zones: ['ui', 'blocks'], doc: 'Handwriting fonts only via tokens (font-hand, font-script, font-type, font-mono).', fix: 'Use a font-* token utility instead of an arbitrary family or inline fontFamily.' },
  'fe-turbulence': { severity: 'error', zones: ['all'], doc: 'feTurbulence / feDisplacementMap / feGaussianBlur are not used at runtime (roughness is geometry, big surfaces are baked tiles, shadows are CSS). Only the shared engine defs in src/lib/ink may hold a filter; recipes/ and art/ never do.', fix: 'Use geometry for roughness, a baked texture tile for surfaces, box-shadow / drop-shadow for shadows.' },
  'forward-ref': { severity: 'error', zones: ['all'], doc: 'React 19: ref is a normal prop; forwardRef is not used anywhere.', fix: 'Take `ref` from props: function X({ ref, ...props }: React.ComponentProps<"div">).' },
  'default-export': { severity: 'error', zones: ['ui', 'hooks', 'lib'], doc: 'Named exports only in ui, hooks and lib files.', fix: 'Use `export function Name` / `export { Name }`.' },
  'module-scope-dom': { severity: 'error', zones: ['registry', 'examples'], doc: 'window/document/navigator/... must not be touched at module scope (SSR).', fix: 'Move it inside an effect/handler, or guard with typeof window !== "undefined".' },
  'unseeded-random': { severity: 'error', zones: ['registry', 'examples'], doc: 'Math.random()/crypto randomness in render paths breaks SSR/hydration and art determinism.', fix: 'Use the seeded RNG from @/lib/ink/rng, seeded from useId()/props.' },
  'render-time': { severity: 'error', zones: ['registry', 'examples'], doc: 'Date.now()/new Date()/performance.now() in render paths cause hydration mismatches.', fix: 'Read the clock in an effect or event handler, or take the value as a prop.' },
  'console-log': { severity: 'error', zones: ['registry', 'examples'], doc: 'No console.log/debug/info left in shipped code.', fix: 'Delete it (console.warn/error are allowed for genuine warnings).' },
  debugger: { severity: 'error', zones: ['all'], doc: 'No debugger statements.', fix: 'Delete it.' },
  'ink-layer': { severity: 'error', zones: ['all'], doc: 'Every element with data-ink="<kind>" is a decorative ink layer and must be aria-hidden and name a kind (named intrinsic art such as <Icon label> may use role="img" + aria-label instead).', fix: 'Write <svg data-ink="kind" aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0 …">.' },
  'ink-svg-root': { severity: 'error', zones: ['all'], doc: 'CONTRACT ink-layer conventions: an ink svg root is <svg data-ink aria-hidden="true" focusable="false">; overlay ink (absolute/fixed) carries pointer-events-none; ink is never focusable or interactive (no tabIndex, no handlers, no interactive role).', fix: 'Add focusable="false"; add pointer-events-none next to absolute; drop tabIndex/handlers/role.' },
  'ink-layer-name': { severity: 'error', zones: ['all'], doc: 'State layers are <g data-layer="rest|hover|pressed|focus|disabled|invalid|checked|indeterminate|open|busy">; any other name is never toggled by looseleaf.css.', fix: 'Use one of the ten layer names (notes/tokens.md section 6), in ink.layer(name) and data-layer alike.' },
  'ink-void-host': { severity: 'error', zones: ['ui', 'blocks', 'examples'], doc: 'An <input>/<textarea>/<select>/<img> cannot host an svg child: wrap it in a host element that owns the ink and the state (data-ink-focus="within").', fix: 'Render <span data-ink-host …><Ink/><input/></span> instead of putting ink inside the control.' },
  'ink-host-svg': { severity: 'error', zones: ['ui', 'blocks'], doc: 'A host of ink (a file that calls useInk / renders <Ink>) has an absolutely positioned <svg> as a direct child, so shadcn\'s [&_svg:not([class*=\'size-\'])]:size-4 and has-[>svg]:px-3 rules would size and pad the drawing itself. They must exclude the ink svg: :not(.absolute).', fix: 'Write [&_svg:not(.absolute):not([class*=\'size-\'])]:size-4 and has-[>svg:not(.absolute)]:px-3 (see src/components/ui/button.tsx).' },
  'ink-kind': { severity: 'warn', zones: ['all'], doc: 'data-ink kinds are lowercase kebab-case; the intrinsic art kinds are singular (icon doodle sticker stamp tape prop mascot illustration badge) because looseleaf.css keeps exactly those in forced-colors mode.', fix: 'Write data-ink="icon", not "icons"/"Icon".' },
  'recipe-pure': { severity: 'error', zones: ['recipes', 'art'], doc: 'Recipes and art batches (src/lib/ink/art/<kind>/*) are pure functions/data over @/lib/ink: no react, DOM, timers, hooks, JSX, components or hooks imports (art imports only its types). Colour goes through paint(), randomness through the seeded rng.', fix: 'Move DOM/React work into the component; keep the recipe a pure (w, h, seed, opts) => InkResult function.' },
  'ink-direct-import': { severity: 'error', zones: ['ui', 'blocks', 'hooks', 'examples'], doc: 'Components never call the pen: they import engine internals (pen, pens, shapes, fills, builder, geom, noise) only through recipes/ or the @/lib/ink barrel.', fix: 'Put the drawing in src/lib/ink/recipes/<slug>.ts and import that (or take the value from the @/lib/ink barrel).' },
  'no-clock-random': { severity: 'error', zones: ['ink', 'ui', 'blocks'], doc: 'Math.random(), crypto randomness and Date.now() appear nowhere in src/lib/ink or in components, not even in effects or handlers (art and ids must be reproducible from a seed). unseeded-random / render-time already cover render paths.', fix: 'Use the seeded rng (@/lib/ink/rng) keyed by useId()/props; take timestamps as props. If a handler genuinely needs the clock: // lint-house-disable-next-line no-clock-random -- reason.' },
  'todo-litter': { severity: 'warn', zones: ['registry', 'examples'], doc: 'No TODO/FIXME/XXX/HACK litter.', fix: 'Do the work or delete the comment.' },
  'file-name': { severity: 'error', zones: ['ui', 'hooks', 'examples', 'meta', 'recipes', 'art'], doc: 'File naming: ui/<slug>.tsx (kebab), hooks/use-*.ts, examples/<slug>/NN-name.tsx, meta/<slug>.ts, ink/recipes/<slug>.ts (a recipe named after a ui slug ships with that component), ink/art/<kind>/<batch>.ts.', fix: 'Rename the file; the registry item name, docs globs and recipe ownership depend on it.' },
  'example-shape': { severity: 'error', zones: ['examples'], doc: 'Examples default-export a component and export `meta: ExampleMeta`.', fix: 'Add `export default function Example()` and `export const meta = { title: "…" }`.' },
  'meta-shape': { severity: 'error', zones: ['meta'], doc: 'meta/<slug>.ts default-exports a ComponentDoc whose slug equals the file name.', fix: 'export default { slug: "<file-name>", … } satisfies ComponentDoc.' },
}

const DEFAULTS = {
  scan: { include: ['src/**/*.{ts,tsx}'], exclude: ['**/*.d.ts', '**/*.test.{ts,tsx}', '**/*.generated.{ts,tsx}'] },
  zones: {
    ui: ['src/components/ui/**'],
    blocks: ['src/blocks/**'],
    hooks: ['src/hooks/**'],
    lib: ['src/lib/**'],
    ink: ['src/lib/ink/**'],
    recipes: ['src/lib/ink/recipes/**'],
    art: ['src/lib/ink/art/*/**'],
    examples: ['src/docs/examples/**'],
    meta: ['src/docs/meta/**'],
    docs: ['src/docs/**'],
  },
  registryZones: ['ui', 'blocks', 'hooks', 'lib'],
  overrides: [
    { files: ['src/lib/ink/**'], rules: { 'relative-import': 'warn', 'fe-turbulence': 'off' } },
    { files: ['src/lib/ink/recipes/**', 'src/lib/ink/art/*/**'], rules: { 'fe-turbulence': 'error' } },
    { files: ['src/docs/examples/**'], rules: { 'console-log': 'warn' } },
  ],
  allow: {
    importPackages: [],
    exampleImports: ['react', 'react-dom', 'react-hook-form', '@hookform/resolvers', 'zod', 'date-fns', 'sonner', 'react-day-picker'],
    rounded: ['rounded-none', 'rounded-full', 'rounded-inherit', 'rounded-[inherit]'],
    colorLiterals: [],
    clientPackages: ['radix-ui', '@radix-ui/*', 'cmdk', 'vaul', 'sonner', 'embla-carousel-react', 'input-otp', 'react-day-picker', 'react-hook-form', 'react-resizable-panels', 'next-themes', 'recharts'],
    radixServerSafe: ['Slot', 'Slottable'],
    moduleGlobals: ['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'matchMedia', 'getComputedStyle', 'requestAnimationFrame', 'HTMLElement', 'customElements'],
    consoleMethods: ['log', 'debug', 'info', 'trace', 'dir', 'table'],
    safeCallees: ['useEffect', 'useLayoutEffect', 'useInsertionEffect', 'useImperativeHandle', 'useCallback', 'useEffectEvent', 'useEvent', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'requestIdleCallback', 'queueMicrotask', 'addEventListener', 'startTransition'],
    classFunctions: ['cn', 'clsx', 'cx', 'twMerge', 'twJoin', 'classNames', 'classnames', 'cva', 'tv'],
    inkLayers: ['rest', 'hover', 'pressed', 'focus', 'disabled', 'invalid', 'checked', 'indeterminate', 'open', 'busy'],
    inkIntrinsicKinds: ['icon', 'doodle', 'sticker', 'stamp', 'tape', 'prop', 'mascot', 'illustration', 'badge'],
    inkInternals: ['pen', 'pens', 'shapes', 'fills', 'builder', 'geom', 'noise'],
    artImports: ['@/lib/ink/art/**'],
    pureGlobals: ['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'matchMedia', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback', 'setTimeout', 'setInterval', 'queueMicrotask', 'fetch', 'performance', 'crypto', 'ResizeObserver', 'MutationObserver', 'IntersectionObserver', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'Image', 'DOMParser', 'XMLSerializer', 'customElements'],
  },
}

export function buildConfig(user = {}) {
  const cfg = {
    scan: { ...DEFAULTS.scan, ...(user.scan ?? {}) },
    zones: { ...DEFAULTS.zones, ...(user.zones ?? {}) },
    registryZones: user.registryZones ?? DEFAULTS.registryZones,
    overrides: user.overrides ?? DEFAULTS.overrides,
    allow: { ...DEFAULTS.allow, ...(user.allow ?? {}) },
    rules: {},
  }
  for (const [id, def] of Object.entries(RULES)) {
    const u = user.rules?.[id]
    const merged = { severity: def.severity, zones: def.zones, exceptZones: def.exceptZones ?? [] }
    if (typeof u === 'string') merged.severity = u
    else if (u && typeof u === 'object') Object.assign(merged, u)
    cfg.rules[id] = merged
  }
  for (const id of Object.keys(user.rules ?? {})) if (!RULES[id]) throw new Error(`config: unknown rule "${id}"`)
  return cfg
}

function zonesOf(rel, cfg) {
  const z = new Set(['all'])
  for (const [name, globs] of Object.entries(cfg.zones)) if (matchAny(globs, rel)) z.add(name)
  if (cfg.registryZones.some((n) => z.has(n))) z.add('registry')
  return z
}

function severityFor(id, rel, zones, cfg) {
  const r = cfg.rules[id]
  let sev = r.severity
  for (const o of cfg.overrides) {
    if (matchAny(o.files, rel) && o.rules && id in o.rules) {
      const v = o.rules[id]
      sev = typeof v === 'string' ? v : (v?.severity ?? sev)
    }
  }
  if (sev === 'off') return 'off'
  const inZone = r.zones.includes('all') || r.zones.some((zn) => zones.has(zn))
  if (!inZone) return 'off'
  if ((r.exceptZones ?? []).some((zn) => zones.has(zn))) return 'off'
  return sev
}

function packageOf(spec) {
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/')
  return spec.split('/')[0]
}

function globLike(patterns, spec) {
  return patterns.some((p) => (p.endsWith('/*') ? spec.startsWith(p.slice(0, -1)) : p === spec))
}

const HEX_RE = /(?<![\w&/#-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g
const COLOR_FN_RE = /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(\s*[\d.+-]/g
const HEX_SKIP_ATTRS = new Set(['href', 'id', 'htmlFor', 'to', 'name', 'form', 'list', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-activedescendant', 'data-href', 'xlinkHref', 'src', 'poster'])
const CSS_WORDS_BEFORE_HEX = /(?:solid|dashed|dotted|double|groove|ridge|inset|outset|from|to|at|and|via|,|:)$/i
const PALETTE_RE = /^(?:bg|text|border|border-[xytrblse]|ring|ring-offset|inset-ring|outline|fill|stroke|from|via|to|decoration|divide|accent|caret|shadow|placeholder)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\/[\w.[\]%-]+)?$/
const ROUNDED_RE = /^rounded(?:-(?:s|e|t|r|b|l|ss|se|ee|es|tl|tr|br|bl))?(?:-.+)?$/
const BARE_CLASSES = new Set('flex grid block inline hidden relative absolute fixed sticky static truncate border shadow rounded contents container underline italic uppercase lowercase capitalize grow shrink resize isolate ring outline transition transform filter blur invert grayscale sepia antialiased visible invisible collapse table group peer prose'.split(' '))

function looksLikeClassList(tokens) {
  if (!tokens.length) return false
  const strong = tokens.filter((t) => /[-:[\]]/.test(t) || BARE_CLASSES.has(t)).length
  return strong / tokens.length >= 0.8 && (tokens.length >= 2 || /-/.test(tokens[0]))
}

function blankComments(text, comments) {
  if (!comments.length) return text
  let out = ''
  let last = 0
  for (const cm of comments) {
    out += text.slice(last, cm.start) + text.slice(cm.start, cm.end).replace(/[^\n]/g, ' ')
    last = cm.end
  }
  return out + text.slice(last)
}

const NON_VISUAL = new Set(['style', 'script', 'link', 'meta', 'title'])
const isNonVisual = (tag) => NON_VISUAL.has(tag) || /(^|\.)\w*Provider$/.test(tag)
const HOOK_RE = /^use[A-Z0-9]/
const isUpper = (s) => /^[A-Z]/.test(s)

function lintText({ rel, text, cfg, pkg, zones, root }) {
  const out = []
  const sev = {}
  for (const id of Object.keys(RULES)) sev[id] = severityFor(id, rel, zones, cfg)
  const on = (id) => sev[id] !== 'off'
  const parsed = parseSource(rel, text)
  const emit = (rule, offset, message) => {
    if (!on(rule)) return
    const { line, col } = parsed.posOf(Math.max(0, offset))
    out.push({ file: rel, line, col, rule, severity: sev[rule], message })
  }

  if (on('parse-error')) {
    for (const e of parsed.errors) {
      const start = e.labels?.[0]?.start ?? 0
      emit('parse-error', start, String(e.message ?? e).split('\n')[0])
    }
  }
  if (!parsed.program) return { diagnostics: out, parsed }
  const program = parsed.program
  const base = path.posix.basename(rel)

  if (on('file-name')) {
    const inUi = zones.has('ui')
    if (inUi && !/^src\/components\/ui\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.tsx$/.test(rel)) emit('file-name', 0, 'ui files are flat and named <kebab-slug>.tsx (registry item name = slug)')
    else if (zones.has('hooks') && !/^src\/hooks\/use-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx?$/.test(rel)) emit('file-name', 0, 'hook files are named use-<kebab>.ts')
    else if (zones.has('examples') && !/^src\/docs\/examples\/[a-z][a-z0-9-]*\/(?:\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx|_[\w.-]+\.tsx?)$/.test(rel)) emit('file-name', 0, 'examples live at src/docs/examples/<slug>/NN-name.tsx')
    else if (zones.has('meta') && !/^src\/docs\/meta\/(?:[a-z][a-z0-9-]*|_[\w.-]+)\.ts$/.test(rel)) emit('file-name', 0, 'meta files are src/docs/meta/<slug>.ts')
    else if (zones.has('recipes') && !/^src\/lib\/ink\/recipes\/(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*\/)?_?[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.ts$/.test(rel)) emit('file-name', 0, 'recipes are src/lib/ink/recipes/<slug>.ts (or <slug>/<name>.ts): kebab-case, plain .ts, no JSX')
    else if (zones.has('art') && !/^src\/lib\/ink\/art\/(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*\/)?[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.ts$/.test(rel)) emit('file-name', 0, 'art files are src/lib/ink/art/<kind>/<batch>.ts (plus index.ts barrels and art/types.ts): kebab-case, plain .ts')
    const uiTwin = (stem) => root && fs.existsSync(path.join(root, 'src', 'components', 'ui', `${stem}.tsx`))
    const recipeStem = zones.has('recipes') ? /^src\/lib\/ink\/recipes\/([^/]+?)(?:\.ts|\/[^/]+\.ts)$/.exec(rel)?.[1] : null
    if (recipeStem && uiTwin(recipeStem)) emit('file-name', 0, `recipe "${recipeStem}" has the base name of the ui component src/components/ui/${recipeStem}.tsx: the shadcn CLI would rewrite its import to the component on install — name it ${recipeStem}-ink.ts`)
    const artKind = zones.has('art') ? /^src\/lib\/ink\/art\/([^/]+)\/index\.ts$/.exec(rel)?.[1] : null
    if (artKind && uiTwin(artKind)) emit('file-name', 0, `art directory "${artKind}" has the base name of the ui component src/components/ui/${artKind}.tsx: the shadcn CLI would rewrite the barrel import to the component — rename one of them`)
  }

  if (on('todo-litter')) {
    for (const cm of parsed.comments) {
      const m = /\b(TODO|FIXME|XXX|HACK)\b/.exec(cm.value)
      if (m) emit('todo-litter', cm.start + 2 + m.index, `${m[1]} comment`)
    }
  }
  if (on('fe-turbulence')) {
    const code = blankComments(text, parsed.comments)
    for (const m of code.matchAll(/fe(?:Turbulence|DisplacementMap|GaussianBlur)/gi)) emit('fe-turbulence', m.index, `${m[0]} — no runtime filters for roughness, surfaces or shadows`)
  }

  const body = program.body
  const directives = body.filter((n) => n.type === 'ExpressionStatement' && n.directive)
  const hasUseClient = directives.some((n) => n.directive === 'use client')
  const misplacedUseClient = body.find((n) => n.type === 'ExpressionStatement' && !n.directive && n.expression?.type === 'Literal' && n.expression.value === 'use client')
  const topFns = new Map()
  const importedFrom = new Map()
  const exported = new Map()
  let defaultExport = null
  const declaredFnNames = new Set()

  const noteFn = (name, fn) => {
    if (name && fn) topFns.set(name, fn)
  }
  for (const stmt of body) {
    if (stmt.type === 'ImportDeclaration') for (const sp of stmt.specifiers ?? []) importedFrom.set(sp.local.name, stmt.source.value)
    let decl = stmt
    if (stmt.type === 'ExportNamedDeclaration' || stmt.type === 'ExportDefaultDeclaration') decl = stmt.declaration ?? stmt
    if (decl?.type === 'FunctionDeclaration' && decl.id) noteFn(decl.id.name, decl)
    if (decl?.type === 'VariableDeclaration') {
      for (const d of decl.declarations) {
        const init = unwrap(d.init)
        if (d.id.type === 'Identifier' && init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) noteFn(d.id.name, init)
      }
    }
    if (stmt.type === 'ExportNamedDeclaration' && !stmt.source) {
      if (stmt.declaration?.type === 'FunctionDeclaration' && stmt.declaration.id) exported.set(stmt.declaration.id.name, { local: stmt.declaration.id.name, node: stmt })
      else if (stmt.declaration?.type === 'VariableDeclaration') {
        for (const d of stmt.declaration.declarations) if (d.id.type === 'Identifier') exported.set(d.id.name, { local: d.id.name, node: stmt })
      }
      for (const sp of stmt.specifiers ?? []) {
        const exp = sp.exported.name ?? sp.exported.value
        const local = sp.local.name ?? sp.local.value
        if (exp === 'default') defaultExport = defaultExport ?? stmt
        else exported.set(exp, { local, node: stmt })
      }
    }
    if (stmt.type === 'ExportDefaultDeclaration') defaultExport = stmt
  }

  if (defaultExport) emit('default-export', defaultExport.start, 'default export — use named exports only')

  const clientTriggers = []
  const allow = cfg.allow
  const deps = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {}), ...allow.importPackages])
  const devDeps = new Set(Object.keys(pkg.devDependencies ?? {}))

  const inkInternalsRe = new RegExp(`^@/lib/ink/(?:${allow.inkInternals.join('|')})(?:\\.[jt]sx?)?$`)
  const checkPureImport = (spec, offset, typeOnly) => {
    const art = zones.has('art')
    if (spec.startsWith('.')) return
    if (spec.startsWith('@/')) {
      if (art) {
        if (matchAny(allow.artImports, spec) || (typeOnly && /^@\/lib\/ink(?:\/|$)/.test(spec) && !/^@\/lib\/ink\/react(?:\/|$)/.test(spec))) return
        emit('recipe-pure', offset, `art is pure data: "${spec}" is not allowed (import only ${allow.artImports.join(', ')}, plus types from @/lib/ink)`)
      } else if (/^@\/(?:components|hooks)(?:\/|$)|^@\/lib\/ink\/react(?:\/|$)|^@\/lib\/utils(?:\/|$)/.test(spec)) {
        emit('recipe-pure', offset, `recipes are pure functions over the engine: "${spec}" is a component/hook/react/class-name module`)
      }
      return
    }
    emit('recipe-pure', offset, `${art ? 'art' : 'recipes'} import no packages: "${spec}" (react and the DOM never enter a recipe)`)
  }

  const lucideSpec = (spec) => /^(?:@lucide\/|lucide(?:-[\w-]+)?(?:\/|$))/.test(spec)
  const checkSpecifier = (spec, offset, names, typeOnly = false) => {
    if (lucideSpec(spec)) emit('no-lucide', offset, `import of "${spec}" — lucide is banned, use the doodle icon set`)
    if (on('recipe-pure')) checkPureImport(spec, offset, typeOnly)
    if (on('ink-direct-import') && inkInternalsRe.test(spec)) emit('ink-direct-import', offset, `"${spec}" is engine-internal — draw through src/lib/ink/recipes/<slug>.ts (or the @/lib/ink barrel), components never call the pen`)
    if (zones.has('registry')) {
      if (spec.startsWith('.')) emit('relative-import', offset, `relative import "${spec}" — use the @/ alias`)
      else if (spec.startsWith('@/')) {
      } else if (!lucideSpec(spec)) {
        const p = packageOf(spec)
        if (p === 'react' || deps.has(p)) {
        } else if (devDeps.has(p)) emit('import-allowed', offset, `"${p}" is a devDependency; registry files may only import runtime dependencies`)
        else emit('import-allowed', offset, `"${spec}" is not react, a package.json dependency, or an @/ alias`)
      }
    }
    if (zones.has('examples') && !lucideSpec(spec)) {
      const ok = spec.startsWith('@/components/ui/') || spec.startsWith('@/lib/') || spec.startsWith('@/hooks/') || allow.exampleImports.includes(packageOf(spec)) || spec === 'react' || spec.startsWith('react/') || /^\.\/_[\w.-]+$/.test(spec)
      if (!ok) emit('example-import', offset, `example imports "${spec}" — examples use @/components/ui/*, @/lib/*, @/hooks/*, react (and ./_helper files next to them)`)
    }
    if (globLike(allow.clientPackages, spec) || globLike(allow.clientPackages, packageOf(spec))) {
      const safeOnly = packageOf(spec) === 'radix-ui' && names && names.length > 0 && names.every((n) => allow.radixServerSafe.includes(n))
      if (!safeOnly) clientTriggers.push({ offset, why: `imports "${spec}"` })
    }
  }

  const returnedRoots = (fn) => {
    const roots = []
    const addRoots = (expr) => {
      expr = unwrap(expr)
      if (!expr) return
      if (expr.type === 'JSXElement') roots.push(expr)
      else if (expr.type === 'JSXFragment') expr.children.forEach((ch) => ch.type === 'JSXElement' && roots.push(ch))
      else if (expr.type === 'ConditionalExpression') {
        addRoots(expr.consequent)
        addRoots(expr.alternate)
      } else if (expr.type === 'LogicalExpression') addRoots(expr.right)
    }
    if (fn.body.type !== 'BlockStatement') addRoots(fn.body)
    else {
      walk(fn.body, (n) => {
        if (n !== fn.body && isFunctionNode(n)) return false
        if (n.type === 'ReturnStatement' && n.argument) addRoots(n.argument)
        return true
      })
    }
    return roots
  }

  const INTERACTIVE_ROLES = new Set(['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'option', 'combobox', 'textbox', 'slider', 'spinbutton', 'searchbox', 'treeitem', 'gridcell'])
  const VOID_HOSTS = new Set(['input', 'textarea', 'select', 'img', 'br', 'hr', 'video', 'audio', 'canvas', 'progress', 'meter'])
  const isInkNode = (el) => {
    const tag = jsxName(el.openingElement.name)
    return tag === 'Ink' || tag.endsWith('.Ink') || (findAttr(el.openingElement, 'data-ink') !== null && tag === 'svg')
  }
  const checkVoidHost = (el) => {
    if (!on('ink-void-host')) return
    const tag = jsxName(el.openingElement.name)
    if (!VOID_HOSTS.has(tag)) return
    for (const ch of el.children ?? []) {
      if (ch.type === 'JSXElement' && isInkNode(ch)) emit('ink-void-host', ch.start, `ink inside <${tag}> — a <${tag}> cannot host an svg: wrap it in a host element that owns the ink`)
    }
  }
  const classTokensOf = (attr) => {
    const toks = []
    walk(attr.value, (n) => {
      if (n.type === 'Literal' && typeof n.value === 'string') toks.push(...n.value.split(/\s+/).filter(Boolean))
      else if (n.type === 'TemplateElement') toks.push(...(n.value.cooked ?? n.value.raw).split(/\s+/).filter(Boolean))
      return true
    })
    return toks
  }
  const checkInkRoot = (opening, inkAttr) => {
    if (!on('ink-svg-root')) return
    const focusable = findAttr(opening, 'focusable')
    const fv = focusable?.value
    const focusableOk = focusable && ((fv?.type === 'Literal' && (fv.value === 'false' || fv.value === false)) || (fv?.type === 'JSXExpressionContainer' && fv.expression.type === 'Literal' && (fv.expression.value === false || fv.expression.value === 'false')))
    if (!focusableOk) emit('ink-svg-root', opening.start, '<svg data-ink> must carry focusable="false"')
    for (const bad of ['tabIndex', 'onClick', 'onKeyDown']) {
      if (findAttr(opening, bad)) emit('ink-svg-root', findAttr(opening, bad).start, `ink is decorative: <svg data-ink> must not set ${bad}`)
    }
    const role = findAttr(opening, 'role')
    if (role?.value?.type === 'Literal' && INTERACTIVE_ROLES.has(String(role.value.value))) emit('ink-svg-root', role.start, `ink is never interactive: role="${role.value.value}" on <svg data-ink> (role="img" + aria-label is fine for named intrinsic art)`)
    const cls = findAttr(opening, 'className') ?? findAttr(opening, 'class')
    if (cls) {
      const toks = classTokensOf(cls)
      const overlay = toks.some((tk) => tk === 'absolute' || tk === 'fixed')
      const style = findAttr(opening, 'style')
      let styleNone = false
      if (style) walk(style.value, (n) => { if (n.type === 'Property' && (n.key.name ?? n.key.value) === 'pointerEvents') styleNone = true; return true })
      if (overlay && !toks.includes('pointer-events-none') && !styleNone) emit('ink-svg-root', cls.start, 'overlay ink (absolute/fixed) must carry pointer-events-none')
    }
    void inkAttr
  }
  const KIND_TYPOS = { icons: 'icon', doodles: 'doodle', stickers: 'sticker', stamps: 'stamp', tapes: 'tape', props: 'prop', mascots: 'mascot', illustrations: 'illustration', badges: 'badge' }
  const checkInkKind = (value, offset) => {
    if (!on('ink-kind') || typeof value !== 'string' || !value) return
    if (KIND_TYPOS[value.toLowerCase()]) emit('ink-kind', offset, `data-ink="${value}": the kind is singular — "${KIND_TYPOS[value.toLowerCase()]}" (forced-colors keeps ${allow.inkIntrinsicKinds.join(' ')})`)
    else if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)) emit('ink-kind', offset, `data-ink="${value}" is not lowercase kebab-case`)
  }
  const checkLayerName = (value, offset) => {
    if (typeof value === 'string' && value && !inkLayers.has(value)) emit('ink-layer-name', offset, `state layer "${value}" is not one of ${[...inkLayers].join(', ')}`)
  }

  let fnDepth = 0
  const allowedTs = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion', 'TSInstantiationExpression', 'TSEnumDeclaration', 'TSEnumBody', 'TSEnumMember', 'TSModuleDeclaration', 'TSModuleBlock', 'TSExportAssignment', 'TSParameterProperty'])
  const moduleGlobals = new Set(allow.moduleGlobals)
  const localNames = new Set()
  if (on('recipe-pure')) {
    const addPattern = (pat) => {
      if (!pat) return
      if (pat.type === 'Identifier') localNames.add(pat.name)
      else if (pat.type === 'ObjectPattern') pat.properties.forEach((pr) => addPattern(pr.type === 'RestElement' ? pr.argument : pr.value))
      else if (pat.type === 'ArrayPattern') pat.elements.forEach(addPattern)
      else if (pat.type === 'RestElement') addPattern(pat.argument)
      else if (pat.type === 'AssignmentPattern') addPattern(pat.left)
    }
    walk(program, (n) => {
      if (n.type === 'VariableDeclarator') addPattern(n.id)
      else if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') {
        if (n.id) localNames.add(n.id.name)
        n.params.forEach(addPattern)
      } else if (n.type === 'CatchClause') addPattern(n.param)
      else if (n.type === 'ImportSpecifier' || n.type === 'ImportDefaultSpecifier' || n.type === 'ImportNamespaceSpecifier') localNames.add(n.local.name)
      return !n.type.startsWith('TS')
    })
  }
  const pureGlobals = new Set(allow.pureGlobals.filter((g) => !localNames.has(g)))
  const inkLayers = new Set(allow.inkLayers)
  let jsxReported = false
  const safeCallees = new Set(allow.safeCallees)
  const consoleMethods = new Set(allow.consoleMethods)

  const containsTypeofGuard = (node) => {
    let found = false
    walk(node, (n) => {
      if (n.type === 'UnaryExpression' && n.operator === 'typeof' && n.argument.type === 'Identifier' && moduleGlobals.has(n.argument.name)) found = true
      return !found
    })
    return found
  }
  const isGuarded = (ancestors, node) => {
    for (let i = 0; i < ancestors.length; i++) {
      const a = ancestors[i]
      const child = ancestors[i + 1] ?? node
      if ((a.type === 'IfStatement' || a.type === 'ConditionalExpression') && child !== a.test && containsTypeofGuard(a.test)) return true
      if (a.type === 'LogicalExpression' && child === a.right && containsTypeofGuard(a.left)) return true
    }
    return false
  }
  const isSafeFn = (fn, parent, grand) => {
    if (!parent) return false
    if (parent.type === 'CallExpression' && parent.arguments.includes(fn) && safeCallees.has(calleeName(parent))) return true
    if (parent.type === 'JSXExpressionContainer' && grand?.type === 'JSXAttribute' && /^on[A-Z]/.test(jsxName(grand.name))) return true
    if (parent.type === 'Property' && !parent.computed && /^(on[A-Z]|handle[A-Z])/.test(parent.key.name ?? parent.key.value ?? '')) return true
    if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier' && /^(on|handle)[A-Z]/.test(parent.id.name)) return true
    if (fn.type === 'FunctionDeclaration' && fn.id && /^(on|handle)[A-Z]/.test(fn.id.name)) return true
    if (parent.type === 'MethodDefinition' && /^(on|handle)[A-Z]/.test(parent.key?.name ?? '')) return true
    return false
  }
  const inSafeContext = (ancestors) => {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const a = ancestors[i]
      if (isFunctionNode(a) && isSafeFn(a, ancestors[i - 1], ancestors[i - 2])) return true
    }
    return false
  }

  const checkString = (value, offset, attrName) => {
    if (on('ink-layer-name') && value.includes('data-layer=')) {
      for (const m of value.matchAll(/data-layer=["']([^"'$]+)["']/g)) checkLayerName(m[1], offset + m.index + 12)
    }
    if (on('hard-coded-color') && !HEX_SKIP_ATTRS.has(attrName ?? '')) {
      for (const m of value.matchAll(HEX_RE)) {
        const lit = m[0]
        if (allow.colorLiterals.some((x) => x.toLowerCase() === lit.toLowerCase())) continue
        const before = value.slice(0, m.index).trimEnd()
        const prose = /^#[0-9]+$/.test(lit) && lit.length <= 5 && value[m.index - 1] === ' ' && /[A-Za-z]$/.test(before) && !CSS_WORDS_BEFORE_HEX.test(before)
        if (prose) continue
        emit('hard-coded-color', offset + m.index, `hard-coded colour ${lit} — use a theme token or var(--ll-*)`)
      }
      for (const m of value.matchAll(COLOR_FN_RE)) {
        const call = /^[^)]*\)?/.exec(value.slice(m.index))[0]
        emit('hard-coded-color', offset + m.index, `hard-coded colour ${call} — use a theme token or var(--ll-*)`)
      }
    }
  }

  walk(
    program,
    (node, ancestors) => {
      const t = node.type
      if (t.startsWith('TS') && !allowedTs.has(t)) return false
      const parent = ancestors[ancestors.length - 1]
      if (isFunctionNode(node) || (t === 'PropertyDefinition' && !node.static)) fnDepth++

      switch (t) {
        case 'ImportDeclaration': {
          const names = (node.specifiers ?? []).map((s) => (s.type === 'ImportSpecifier' ? (s.imported.name ?? s.imported.value) : '*'))
          const specs = node.specifiers ?? []
          const typeOnly = node.importKind === 'type' || (specs.length > 0 && specs.every((sp) => sp.importKind === 'type'))
          checkSpecifier(node.source.value, node.source.start + 1, names, typeOnly)
          break
        }
        case 'ExportAllDeclaration':
          checkSpecifier(node.source.value, node.source.start + 1, ['*'], node.exportKind === 'type')
          break
        case 'ExportNamedDeclaration':
          if (node.source) checkSpecifier(node.source.value, node.source.start + 1, (node.specifiers ?? []).map((s) => s.local.name ?? s.local.value), node.exportKind === 'type')
          break
        case 'ImportExpression':
          if (node.source?.type === 'Literal' && typeof node.source.value === 'string') checkSpecifier(node.source.value, node.source.start + 1, null)
          break
        case 'DebuggerStatement':
          emit('debugger', node.start, 'debugger statement')
          break
        case 'Identifier': {
          if (node.name === 'forwardRef' && !(parent?.type === 'Property' && parent.key === node)) emit('forward-ref', node.start, 'forwardRef — React 19: ref is a normal prop')
          const watched = (fnDepth === 0 && moduleGlobals.has(node.name) && on('module-scope-dom')) || (pureGlobals.has(node.name) && on('recipe-pure'))
          if (watched) {
            const isRef =
              !(parent?.type === 'MemberExpression' && parent.property === node && !parent.computed) &&
              !(parent?.type === 'Property' && parent.key === node && !parent.computed && !parent.shorthand) &&
              !(parent?.type === 'VariableDeclarator' && parent.id === node) &&
              !(parent?.type === 'UnaryExpression' && parent.operator === 'typeof') &&
              !/^(Import|Export)(Specifier|DefaultSpecifier|NamespaceSpecifier)$/.test(parent?.type ?? '') &&
              !(parent?.type === 'PropertyDefinition' && parent.key === node) &&
              !(parent?.type === 'MethodDefinition' && parent.key === node)
            if (isRef && fnDepth === 0 && moduleGlobals.has(node.name) && !isGuarded(ancestors, node)) emit('module-scope-dom', node.start, `\`${node.name}\` used at module scope — breaks SSR`)
            if (isRef && pureGlobals.has(node.name)) emit('recipe-pure', node.start, `\`${node.name}\` in a ${zones.has('art') ? 'art' : 'recipe'} file — recipes and art are pure, no DOM/timers/clock`)
          }
          break
        }
        case 'JSXElement':
        case 'JSXFragment':
          if (on('recipe-pure') && !jsxReported) {
            jsxReported = true
            emit('recipe-pure', node.start, 'JSX in a recipe/art file — recipes return ink strings, components render them')
          }
          if (t === 'JSXElement') checkVoidHost(node)
          break
        case 'JSXOpeningElement': {
          const tag = jsxName(node.name)
          const ink = findAttr(node, 'data-ink')
          if (ink) {
            const hidden = findAttr(node, 'aria-hidden')
            const hv = hidden?.value
            const hiddenOk = hidden && (hv == null || (hv.type === 'Literal' && (hv.value === 'true' || hv.value === true)) || (hv.type === 'JSXExpressionContainer' && (hv.expression.type !== 'Literal' || hv.expression.value === true || hv.expression.value === 'true')))
            const kind = ink.value && ink.value.type === 'Literal' ? ink.value.value : ink.value ? 'dynamic' : ''
            const roleAttr = findAttr(node, 'role')
            const labelled = allow.inkIntrinsicKinds.includes(kind) && roleAttr?.value?.type === 'Literal' && roleAttr.value.value === 'img' && Boolean(findAttr(node, 'aria-label') ?? findAttr(node, 'aria-labelledby'))
            if (!hiddenOk && !labelled) emit('ink-layer', node.start, `<${tag} data-ink> must carry aria-hidden="true" (intrinsic art with a name: role="img" + aria-label)`)
            if (kind === '' || kind === 'true') emit('ink-layer', ink.start, 'data-ink needs a kind, e.g. data-ink="underline"')
            else if (ink.value?.type === 'Literal') checkInkKind(kind, ink.value.start + 1)
            if (tag === 'svg') checkInkRoot(node, ink)
          }
          break
        }
        case 'JSXAttribute': {
          const name = jsxName(node.name)
          if (/^on[A-Z]/.test(name) && node.value?.type === 'JSXExpressionContainer') {
            const ex = unwrap(node.value.expression)
            if (ex && (ex.type === 'ArrowFunctionExpression' || ex.type === 'FunctionExpression')) clientTriggers.push({ offset: node.start, why: `inline ${name} handler` })
            else if (ex?.type === 'Identifier') clientTriggers.push({ offset: node.start, why: `handler ${ex.name}`, ident: ex.name })
          }
          if (name === 'data-layer' && node.value?.type === 'Literal') checkLayerName(node.value.value, node.value.start + 1)
          if (name === 'data-slot' && on('data-slot-format')) {
            const v = node.value
            if (v?.type === 'Literal' && typeof v.value === 'string' && !/^[a-z][a-z0-9-]*$/.test(v.value)) emit('data-slot-format', v.start, `data-slot "${v.value}" is not lowercase kebab-case`)
          }
          if (node.value?.type === 'Literal' && typeof node.value.value === 'string') checkString(node.value.value, node.value.start + 1, name)
          return true
        }
        case 'Literal':
          if (typeof node.value === 'string' && parent?.type !== 'JSXAttribute') {
            if (!(parent && (parent.type === 'ImportDeclaration' || parent.type === 'ExportAllDeclaration' || parent.type === 'ExportNamedDeclaration' || parent.type === 'ImportExpression'))) {
              const isRequireArg = parent?.type === 'CallExpression' && unwrap(parent.callee)?.name === 'require'
              if (!isRequireArg && !zones.has('meta') && /^(lucide|lucide-react|@lucide\/.+)$/.test(node.value)) emit('no-lucide', node.start, `string "${node.value}" — lucide is banned`)
              checkString(node.value, node.start + 1, undefined)
            }
          }
          break
        case 'TemplateElement':
          checkString(node.value.cooked ?? node.value.raw, node.start + 1, undefined)
          break
        case 'ObjectExpression':
          break
        case 'Property':
          if (on('rounded-class') && !node.computed) {
            const k = node.key.name ?? node.key.value
            if (k === 'borderRadius' || k === 'border-radius') {
              const v = stringValue(unwrap(node.value))
              if (!(v === 'inherit' || v === '0' || v === 'none' || (unwrap(node.value)?.type === 'Literal' && unwrap(node.value).value === 0))) emit('rounded-class', node.start, 'inline borderRadius — corners come from the ink layer')
            }
            if (on('font-literal') && k === 'fontFamily' && stringValue(unwrap(node.value)) !== null) emit('font-literal', node.start, 'inline fontFamily — use a font-* token utility')
          }
          break
        case 'CallExpression': {
          const callee = unwrap(node.callee)
          const name = calleeName(node)
          if (callee?.type === 'Identifier' && callee.name === 'require' && node.arguments[0]?.type === 'Literal' && typeof node.arguments[0].value === 'string') checkSpecifier(node.arguments[0].value, node.arguments[0].start + 1, null)
          if (on('recipe-pure') && (HOOK_RE.test(name) || (callee?.type === 'Identifier' && callee.name === 'use'))) emit('recipe-pure', node.start, `${name}() — hooks belong to the component, a recipe is a plain function`)
          if (HOOK_RE.test(name) || (callee?.type === 'Identifier' && callee.name === 'use')) clientTriggers.push({ offset: node.start, why: `calls ${name}()` })
          else if (name === 'createContext') clientTriggers.push({ offset: node.start, why: 'calls createContext()' })
          if (callee?.type === 'MemberExpression' && !callee.computed && callee.object.type === 'Identifier') {
            const obj = callee.object.name
            const prop = callee.property.name
            if (obj === 'console' && consoleMethods.has(prop)) emit('console-log', node.start, `console.${prop}() left in code`)
            const random = (obj === 'Math' && prop === 'random') || (obj === 'crypto' && (prop === 'randomUUID' || prop === 'getRandomValues'))
            if (random && !inSafeContext(ancestors)) emit('unseeded-random', node.start, `${obj}.${prop}() in a render path — use the seeded RNG (@/lib/ink/rng)`)
            const time = (obj === 'Date' && prop === 'now') || (obj === 'performance' && prop === 'now')
            if (time && !inSafeContext(ancestors)) emit('render-time', node.start, `${obj}.${prop}() in a render path — SSR/hydration mismatch`)
            if ((random || (obj === 'Date' && prop === 'now')) && inSafeContext(ancestors)) emit('no-clock-random', node.start, `${obj}.${prop}() — no randomness or wall clock in ink or components, not even in effects/handlers (seed from useId()/props)`)
            if (prop === 'layer' && node.arguments[0]?.type === 'Literal' && (zones.has('recipes') || zones.has('ink') || zones.has('ui') || zones.has('blocks'))) checkLayerName(node.arguments[0].value, node.arguments[0].start + 1)
          }
          if (callee?.type === 'Identifier' && callee.name === 'Date' && node.arguments.length === 0 && !inSafeContext(ancestors)) emit('render-time', node.start, 'Date() in a render path')
          break
        }
        case 'NewExpression': {
          const callee = unwrap(node.callee)
          if (callee?.type === 'Identifier' && callee.name === 'Date' && node.arguments.length === 0 && !inSafeContext(ancestors)) emit('render-time', node.start, 'new Date() in a render path — SSR/hydration mismatch')
          break
        }
        case 'FunctionDeclaration':
          if (node.id) declaredFnNames.add(node.id.name)
          break
        case 'VariableDeclarator': {
          const init = unwrap(node.init)
          if (node.id.type === 'Identifier' && init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) declaredFnNames.add(node.id.name)
          break
        }
        default:
      }
      return true
    },
    (node) => {
      if (isFunctionNode(node) || (node.type === 'PropertyDefinition' && !node.static)) fnDepth--
    }
  )

  const hostsInk = on('ink-host-svg') && /\buseInk\s*\(|<(?:Ink|InkLayer|InkSvg)\b/.test(text)
  if (on('rounded-class') || on('palette-color') || on('font-literal') || on('aspect-auto-height') || hostsInk) {
    const roundedOk = new Set(allow.rounded)
    for (const p of extractClassPieces(program, { classFns: allow.classFunctions, ambient: true })) {
      const toks = tokensOf(p)
      if (p.context === 'ambient' && !looksLikeClassList(toks.map((x) => x.token))) continue
      if (on('aspect-auto-height')) {
        const plain = toks.map((x) => ({ ...x, ...splitVariants(x.token) }))
        const auto = plain.find((x) => x.utility === 'aspect-auto' && !x.variants.length)
        const sized = plain.some((x) => /^(?:h|min-h|size)-|^aspect-(?!auto$)|^(?:flex-1|grow|basis-|self-stretch|row-span-|inset-y-|inset-0$)/.test(x.utility.replace(/^!|!$/g, '')))
        if (auto && !sized) emit('aspect-auto-height', auto.offset, '`aspect-auto` without any height (h-*, min-h-*, size-*, aspect-*) in the same class list: an element that gets its height from the ratio is 0 px tall')
      }
      for (const { token, offset } of toks) {
        const utility = splitVariants(token).utility.replace(/^!|!$/g, '')
        if (hostsInk) {
          const variants = splitVariants(token).variants
          const reaches = variants.filter((v) => /^(?:has-|\[&)/.test(v) && /svg/.test(v) && !/\.absolute/.test(v))
          const sizing = /^(?:size|w|h|min-w|min-h|max-w|max-h)-/.test(utility)
          const bracketOnSvg = reaches.find((v) => v.startsWith('[&'))
          const hasOnSvg = reaches.find((v) => v.startsWith('has-'))
          if ((bracketOnSvg && sizing) || hasOnSvg) emit('ink-host-svg', offset, `"${token}" also matches the ink svg (an absolute direct child of this host): add :not(.absolute) inside the selector`)
        }
        if (on('rounded-class') && ROUNDED_RE.test(utility) && !roundedOk.has(utility)) emit('rounded-class', offset, `"${utility}" — visual corners come from ink (allowed: ${[...roundedOk].join(', ')})`)
        if (on('palette-color') && PALETTE_RE.test(utility)) emit('palette-color', offset, `"${utility}" is a palette colour — use a theme token colour`)
        if (on('font-literal') && /^font-\[['"a-zA-Z]/.test(utility)) emit('font-literal', offset, `"${utility}" — use a font-* token utility (font-hand, font-script, font-type, font-mono)`)
      }
    }
  }

  if (on('use-client')) {
    if (misplacedUseClient && !hasUseClient) emit('use-client', misplacedUseClient.start, '"use client" must be the first statement in the file')
    else if (!hasUseClient && clientTriggers.length) {
      const real = clientTriggers.filter((tr) => !tr.ident || declaredFnNames.has(tr.ident))
      if (real.length) {
        const first = real[0]
        emit('use-client', first.offset, `missing "use client" (${first.why}${real.length > 1 ? `, +${real.length - 1} more` : ''})`)
      }
    }
  }

  if (on('data-slot')) {
    for (const [name, info] of exported) {
      if (!isUpper(name) || HOOK_RE.test(name)) continue
      const fn = topFns.get(info.local)
      if (!fn) continue
      const roots = returnedRoots(fn)
      if (!roots.length) continue
      const hasSlot = (root, depth = 0) => {
        if (findAttr(root.openingElement, 'data-slot')) return true
        const tag = jsxName(root.openingElement.name)
        const head = tag.split('.')[0]
        if (!isUpper(head)) return false
        if ((importedFrom.get(head) ?? '').startsWith('@/')) return true
        const local = topFns.get(tag)
        if (local && depth < 3) {
          const inner = returnedRoots(local).filter((r) => !isNonVisual(jsxName(r.openingElement.name)))
          if (inner.length && inner.every((r) => hasSlot(r, depth + 1))) return true
        }
        let found = false
        walk(root, (n) => {
          if (n.type === 'JSXOpeningElement' && findAttr(n, 'data-slot')) found = true
          return !found && !(n !== root && isFunctionNode(n))
        })
        return found
      }
      const missing = roots.filter((r) => !isNonVisual(jsxName(r.openingElement.name)) && !hasSlot(r))
      if (missing.length && missing.length === roots.filter((r) => !isNonVisual(jsxName(r.openingElement.name))).length) {
        const r = missing[0]
        emit('data-slot', r.start, `exported component ${name} returns <${jsxName(r.openingElement.name)}> without data-slot`)
      }
    }
  }

  if (on('example-shape') && !base.startsWith('_')) {
    if (!defaultExport) emit('example-shape', 0, 'example must `export default` its component')
    if (!exported.has('meta')) emit('example-shape', 0, 'example must `export const meta: ExampleMeta`')
  }
  if (on('meta-shape') && !base.startsWith('_')) {
    if (!defaultExport) emit('meta-shape', 0, 'meta file must `export default { … } satisfies ComponentDoc`')
    else {
      const decl = unwrap(defaultExport.declaration)
      if (decl?.type === 'ObjectExpression') {
        const slugProp = decl.properties.find((p) => p.type === 'Property' && !p.computed && (p.key.name ?? p.key.value) === 'slug')
        const slug = slugProp ? stringValue(unwrap(slugProp.value)) : null
        const expected = base.replace(/\.tsx?$/, '')
        if (slug == null) emit('meta-shape', decl.start, 'meta object has no literal `slug`')
        else if (slug !== expected) emit('meta-shape', slugProp.start, `slug "${slug}" does not match file name "${expected}"`)
      }
    }
  }

  return { diagnostics: out, parsed }
}

function suppressions(parsed) {
  const perLine = new Map()
  const fileWide = new Set()
  const add = (line, rules) => {
    if (!perLine.has(line)) perLine.set(line, new Set())
    for (const r of rules) perLine.get(line).add(r)
  }
  for (const cm of parsed.comments) {
    const m = /lint-house-disable(-next-line|-line|-file)?\b([^\n]*)/.exec(cm.value)
    if (!m) continue
    const rules = m[2].replace(/--.*$/, '').replace(/\*\/\s*$/, '').split(/[\s,]+/).filter(Boolean)
    const list = rules.length ? rules : ['*']
    const startLine = parsed.posOf(cm.start).line
    const endLine = parsed.posOf(cm.end).line
    if (m[1] === '-next-line') add(endLine + 1, list)
    else if (m[1] === '-line') add(startLine, list)
    else if (m[1] === '-file') list.forEach((r) => fileWide.add(r))
    else add(startLine, list)
  }
  return (d) => fileWide.has('*') || fileWide.has(d.rule) || perLine.get(d.line)?.has('*') || perLine.get(d.line)?.has(d.rule)
}

export function lintProject({ root, config = {}, files = null, packageJson = null }) {
  const cfg = buildConfig(config)
  const pkg = packageJson ?? readJson(path.join(root, 'package.json'), {}) ?? {}
  const candidates = files ?? collectFiles(root, cfg.scan.include, cfg.scan.exclude)
  const diagnostics = []
  const suppressed = []
  for (const rel of candidates) {
    const text = readText(path.join(root, rel))
    if (text == null) continue
    const zones = zonesOf(rel, cfg)
    const { diagnostics: ds, parsed } = lintText({ rel, text, cfg, pkg, zones, root })
    const isSuppressed = parsed.program ? suppressions(parsed) : () => false
    for (const d of ds) (isSuppressed(d) ? suppressed : diagnostics).push(d)
  }
  const order = (a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line || a.col - b.col)
  diagnostics.sort(order)
  return { diagnostics, suppressed, filesScanned: candidates.length, cfg }
}

function main() {
  const { flags, positionals, errors } = parseArgs(process.argv.slice(2), {
    bool: ['json', 'fix-list', 'rules', 'strict', 'quiet', 'no-config', 'print-config', 'show-suppressed', 'help'],
    str: ['root', 'config', 'max-warnings'],
    list: ['rule'],
  })
  if (errors.length || flags.help) {
    if (errors.length) console.error(errors.join('\n'))
    console.error('usage: node tools/lint-house.mjs [files or dirs…] [--fix-list] [--json] [--rules] [--strict] [--quiet] [--rule id[,id]] [--root dir] [--config file] [--show-suppressed]')
    process.exit(flags.help ? 0 : 2)
  }
  const root = resolveRoot(flags.root)
  let userConfig = {}
  if (!flags['no-config']) {
    const cfgPath = flags.config ? path.resolve(process.cwd(), flags.config) : path.join(TOOLS_DIR, 'lint-house.config.json')
    const cfgText = readText(cfgPath)
    if (cfgText == null) {
      if (flags.config) {
        console.error(`lint-house: config not found: ${cfgPath}`)
        process.exit(2)
      }
    } else {
      try {
        userConfig = JSON.parse(cfgText)
      } catch (e) {
        console.error(`lint-house: invalid JSON in ${cfgPath}: ${e.message}`)
        process.exit(2)
      }
    }
  }
  let cfg
  try {
    cfg = buildConfig(userConfig)
  } catch (e) {
    console.error(`lint-house: ${e.message}`)
    process.exit(2)
  }
  if (flags['print-config']) {
    console.log(JSON.stringify(cfg, null, 2))
    return
  }
  if (flags.rules) {
    for (const [id, r] of Object.entries(cfg.rules)) {
      console.log(`${c.bold(id.padEnd(18))} ${r.severity.padEnd(5)} zones: ${r.zones.join(',')}${r.exceptZones?.length ? ` except ${r.exceptZones.join(',')}` : ''}`)
      console.log(`  ${RULES[id].doc}\n  fix: ${RULES[id].fix}`)
    }
    return
  }

  let files = null
  if (positionals.length) {
    files = []
    for (const p of positionals) {
      const abs = path.resolve(process.cwd(), p)
      const rel = toPosix(path.relative(root, abs))
      if (rel.startsWith('..')) {
        console.error(`lint-house: ${p} is outside the root ${root}`)
        process.exit(2)
      }
      let st = null
      try {
        st = fs.statSync(abs)
      } catch {
        console.error(`lint-house: no such file ${p}`)
        process.exit(2)
      }
      if (st.isDirectory()) files.push(...collectFiles(root, [`${rel}/**/*.{ts,tsx}`], cfg.scan.exclude))
      else files.push(rel)
    }
    files = [...new Set(files)]
  }

  let result
  try {
    result = lintProject({ root, config: userConfig, files })
  } catch (e) {
    console.error(`lint-house: ${e.stack ?? e.message}`)
    process.exit(2)
  }
  let { diagnostics } = result
  if (flags.rule.length) diagnostics = diagnostics.filter((d) => flags.rule.includes(d.rule))
  if (flags.quiet) diagnostics = diagnostics.filter((d) => d.severity === 'error')
  const errs = diagnostics.filter((d) => d.severity === 'error').length
  const warns = diagnostics.filter((d) => d.severity === 'warn').length
  const maxWarn = flags['max-warnings'] !== undefined ? Number(flags['max-warnings']) : flags.strict ? 0 : Infinity
  const failed = errs > 0 || warns > maxWarn

  if (flags.json) {
    console.log(JSON.stringify({ root, filesScanned: result.filesScanned, errors: errs, warnings: warns, suppressed: result.suppressed.length, diagnostics }, null, 2))
    process.exitCode = failed ? 1 : 0
    return
  }

  const sevLabel = (s) => (s === 'error' ? c.red('error') : c.yellow('warn '))
  if (flags['fix-list']) {
    const byFile = new Map()
    for (const d of diagnostics) byFile.set(d.file, [...(byFile.get(d.file) ?? []), d])
    console.log(`FIX LIST — ${plural(diagnostics.length, 'item')} in ${plural(byFile.size, 'file')}`)
    for (const [file, ds] of byFile) {
      console.log(`\n${file}`)
      for (const d of ds) console.log(`  [ ] L${d.line}  ${d.rule}  ${d.message}\n        -> ${RULES[d.rule].fix}`)
    }
    if (!diagnostics.length) console.log('  nothing to fix.')
  } else {
    for (const d of diagnostics) console.log(`${d.file}:${d.line}:${d.col}  ${sevLabel(d.severity)}  ${d.rule.padEnd(16)} ${d.message}`)
  }
  if (flags['show-suppressed']) for (const d of result.suppressed) console.log(c.dim(`${d.file}:${d.line}  suppressed ${d.rule}  ${d.message}`))

  const byRule = {}
  for (const d of diagnostics) byRule[d.rule] = (byRule[d.rule] ?? 0) + 1
  const breakdown = Object.entries(byRule).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} ${n}`).join(', ')
  const scope = files ? plural(result.filesScanned, 'file') : `${plural(result.filesScanned, 'file')} under src/`
  const tail = `${result.suppressed.length ? ` · ${result.suppressed.length} suppressed` : ''}${breakdown ? ` · ${breakdown}` : ''}`
  if (errs || warns) console.log(`\n${errs ? c.red(`✖ ${plural(errs, 'error')}`) : c.green('✔ 0 errors')}, ${plural(warns, 'warning')} · ${scope}${tail}`)
  else console.log(`${c.green('✔ lint-house clean')} · ${scope}${tail}${result.filesScanned === 0 ? ' (empty tree: nothing to lint yet)' : ''}`)
  process.exitCode = failed ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
