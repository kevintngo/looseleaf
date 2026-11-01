import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { itemAddress } from './config.mjs'
import { convertCss } from './css.mjs'
import { buildFontItems, readFontWeights } from './fonts.mjs'
import { blockCategory, libItemInfo, ownerOfLibFile } from './layout.mjs'
import { classifySpecifier, isCodeFile, readMeta, scanExports, scanImports } from './parse.mjs'

const CODE_EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
const TEXT_EXT = new Set([...CODE_EXT, '.css', '.json', '.svg', '.cjs', '.mts', '.cts'])
const BINARY_EXT = new Set(
  '.png .jpg .jpeg .gif .webp .avif .ico .bmp .tiff .woff .woff2 .ttf .otf .eot .mp3 .wav .ogg .mp4 .webm .mov .wasm .zip .gz .pdf .psd'.split(' ')
)
const IGNORED = /(^|\/)(\.[^/]*|__tests__|__snapshots__|node_modules)(\/|$)|\.(test|spec|stories)\.[^/]+$/

export const RESERVED = new Set(['looseleaf', 'looseleaf-theme', 'looseleaf-blocks', 'utils', 'registry'])

const posix = (p) => p.split(path.sep).join('/')
const titleCase = (slug) => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const stripCodeExt = (p) => p.replace(/\.(tsx?|jsx?|mjs|mts)$/, '')

function listDir(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

function walkFiles(dir, base = dir) {
  const out = []
  for (const e of listDir(dir)) {
    const full = path.join(dir, e.name)
    const rel = posix(path.relative(base, full))
    if (IGNORED.test(rel)) continue
    if (e.isDirectory()) out.push(...walkFiles(full, base))
    else if (e.isFile()) out.push(rel)
  }
  return out
}

export function scanTree(root, cfg, { targets = true, cliHazard = 'error' } = {}) {
  const warnings = []
  const errors = []
  const rel = (...p) => path.join(root, ...p)

  const pkg = (() => {
    try {
      return JSON.parse(readFileSync(rel('package.json'), 'utf8'))
    } catch {
      warnings.push('package.json not found: npm dependencies are not checked against it')
      return null
    }
  })()
  const declared = pkg
    ? new Set(['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].flatMap((k) => Object.keys(pkg[k] ?? {})))
    : null
  const runtime = pkg ? new Set(['dependencies', 'peerDependencies', 'optionalDependencies'].flatMap((k) => Object.keys(pkg[k] ?? {}))) : null

  const items = new Map()
  const addItem = (item) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.name)) {
      const hint = item.kind === 'block' && item.name.startsWith('_') ? ' (a helper kit shared by several blocks is a block of its own: a kebab-case directory with a preview and a BlockDoc, like src/blocks/sidebar-shared; the docs hide only `_`-prefixed files in src/docs/content/blocks, not blocks)' : ''
      errors.push(`item name "${item.name}" (${item.files[0]?.path}) must be kebab-case (lowercase letters, digits, single dashes) so it can be a URL: rename the file or directory${hint}`)
      return
    }
    if (RESERVED.has(item.name) && !(item.name === 'utils' && item.kind === 'utils')) {
      errors.push(`item name "${item.name}" is reserved (${item.files[0]?.path})`)
      return
    }
    if (items.has(item.name)) {
      errors.push(`duplicate item name "${item.name}": ${items.get(item.name).files[0]?.path} and ${item.files[0]?.path}`)
      return
    }
    items.set(item.name, item)
  }

  const readFile = (relPath) => {
    const content = readFileSync(rel(relPath), 'utf8')
    if (content.includes('\u0000')) errors.push(`${relPath}: binary content. Registry files must be text; embed binary assets as base64 in a .ts or .css file`)
    return content
  }

  const collectDir = (relDir) => {
    const out = []
    for (const f of walkFiles(rel(relDir))) {
      const ext = path.extname(f).toLowerCase()
      const full = `${relDir}/${f}`
      if (BINARY_EXT.has(ext)) {
        errors.push(`${full}: binary file (${ext}). Registry files must be text; embed it as base64 in a .ts or .css file (see src/lib/ink/textures.generated.ts)`)
        continue
      }
      if (!TEXT_EXT.has(ext)) {
        warnings.push(`${full}: skipped (unknown extension "${ext}")`)
        continue
      }
      out.push({ path: full, sub: f })
    }
    return out
  }

  for (const ext of ['.ts', '.tsx']) {
    const p = `src/lib/utils${ext}`
    if (existsSync(rel(p))) {
      addItem({ name: 'utils', type: 'registry:lib', kind: 'utils', files: [{ path: p, type: 'registry:lib', ...(targets ? { target: `@lib/utils${ext}` } : {}), content: readFile(p) }] })
      break
    }
  }

  const isUiFile = (e) => e.isFile() && /\.(tsx|ts)$/.test(e.name) && !IGNORED.test(e.name)
  const uiSlugs = new Set(listDir(rel('src/components/ui')).filter(isUiFile).map((e) => stripCodeExt(e.name)).filter((slug) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)))
  const uiExtras = new Map()

  for (const e of listDir(rel('src/lib'))) {
    if (IGNORED.test(e.name)) continue
    if (e.isDirectory()) {
      const groups = new Map()
      for (const { path: p, sub } of collectDir(`src/lib/${e.name}`)) {
        const owner = ownerOfLibFile(e.name, sub, { uiSlugs })
        const file = { path: p, type: 'registry:lib', ...(targets ? { target: `@lib/${e.name}/${sub}` } : {}), content: readFile(p) }
        if (owner.kind === 'ui') uiExtras.set(owner.item, [...(uiExtras.get(owner.item) ?? []), file])
        else groups.set(owner.item, [...(groups.get(owner.item) ?? []), file])
      }
      const order = [...groups.keys()].sort((a, b) => (a === e.name ? -1 : b === e.name ? 1 : a < b ? -1 : 1))
      for (const name of order) addItem({ name, type: 'registry:lib', kind: 'lib', files: groups.get(name) })
    } else if (e.isFile() && CODE_EXT.includes(path.extname(e.name)) && stripCodeExt(e.name) !== 'utils') {
      const p = `src/lib/${e.name}`
      const name = stripCodeExt(e.name)
      addItem({ name, type: 'registry:lib', kind: 'lib', files: [{ path: p, type: 'registry:lib', ...(targets ? { target: `@lib/${e.name}` } : {}), content: readFile(p) }] })
    }
  }

  for (const e of listDir(rel('src/hooks'))) {
    if (!e.isFile() || IGNORED.test(e.name)) continue
    if (!/^use-[a-z0-9-]+\.(ts|tsx)$/.test(e.name)) {
      warnings.push(`src/hooks/${e.name}: ignored (hooks must be named use-*.ts or use-*.tsx)`)
      continue
    }
    const p = `src/hooks/${e.name}`
    addItem({ name: stripCodeExt(e.name), type: 'registry:hook', kind: 'hook', files: [{ path: p, type: 'registry:hook', ...(targets ? { target: `@hooks/${e.name}` } : {}), content: readFile(p) }] })
  }

  for (const e of listDir(rel('src/components/ui'))) {
    if (IGNORED.test(e.name)) continue
    if (e.isDirectory()) {
      warnings.push(`src/components/ui/${e.name}/: ignored (a component family is ONE file src/components/ui/<slug>.tsx)`)
      continue
    }
    if (!e.isFile() || !/\.(tsx|ts)$/.test(e.name)) continue
    const slug = stripCodeExt(e.name)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      errors.push(`src/components/ui/${e.name}: slug must be kebab-case`)
      continue
    }
    const p = `src/components/ui/${e.name}`
    addItem({ name: slug, type: 'registry:ui', kind: 'ui', files: [{ path: p, type: 'registry:ui', ...(targets ? { target: `@ui/${e.name}` } : {}), content: readFile(p) }, ...(uiExtras.get(slug) ?? [])] })
  }

  for (const e of listDir(rel('src/blocks'))) {
    if (IGNORED.test(e.name)) continue
    if (!e.isDirectory()) {
      warnings.push(`src/blocks/${e.name}: ignored (a block is a directory src/blocks/<name>/)`)
      continue
    }
    const files = collectDir(`src/blocks/${e.name}`).map(({ path: p, sub }) => ({
      path: p,
      type: 'registry:component',
      ...(targets ? { target: `@components/blocks/${e.name}/${sub}` } : {}),
      content: readFile(p),
    }))
    if (files.length) addItem({ name: e.name, type: 'registry:block', kind: 'block', files })
  }

  const metaDir = rel('src/docs/meta')
  const blockMetaDir = rel('src/docs/content/blocks')
  const noMeta = []
  const readMetaFile = (file, label) => {
    const { data, error } = readMeta(readFileSync(file, 'utf8'), file)
    if (!data) warnings.push(`${label}: ${error}`)
    return data
  }
  for (const item of items.values()) {
    const file = ['.ts', '.tsx'].map((x) => path.join(metaDir, item.name + x)).find((f) => existsSync(f))
    const blockFile = item.kind === 'block' ? ['.meta.ts', '.meta.tsx'].map((x) => path.join(blockMetaDir, item.name + x)).find((f) => existsSync(f)) : undefined
    if (!file && !blockFile) {
      item.meta = null
      if (item.kind === 'ui' || item.kind === 'block') noMeta.push(item.name)
      continue
    }
    const blockDoc = blockFile ? readMetaFile(blockFile, `src/docs/content/blocks/${path.basename(blockFile)}`) : null
    const componentDoc = file ? readMetaFile(file, `src/docs/meta/${path.basename(file)}`) : null
    if (!blockDoc && !componentDoc) {
      item.meta = null
      continue
    }
    const data = { ...(componentDoc ?? {}), ...(blockDoc ?? {}) }
    item.meta = data
    if (componentDoc?.slug && componentDoc.slug !== item.name) warnings.push(`src/docs/meta/${path.basename(file)}: slug "${componentDoc.slug}" does not match the file name`)
    if (item.kind === 'ui' && Array.isArray(data.parts)) {
      const { names, typeOnly } = scanExports(item.files[0].content, item.files[0].path)
      const known = new Set([...names, ...typeOnly])
      for (const part of data.parts) {
        if (part?.name && !known.has(part.name)) warnings.push(`src/docs/meta/${path.basename(file)}: lists part "${part.name}" but ${item.files[0].path} does not export it`)
      }
    }
  }

  if (noMeta.length) {
    const shown = noMeta.length > 8 ? `${noMeta.slice(0, 8).join(', ')}, … ${noMeta.length - 8} more` : noMeta.join(', ')
    warnings.push(`${noMeta.length} item(s) have no src/docs/meta/<slug>.ts, so title and description fall back to defaults: ${shown}`)
  }

  const providers = new Map()
  const provide = (aliasPath, itemName) => {
    if (!providers.has(aliasPath)) providers.set(aliasPath, itemName)
  }
  for (const item of items.values()) {
    for (const f of item.files) {
      const srcRel = f.path.replace(/^src\//, '')
      const noExt = stripCodeExt(srcRel)
      provide(noExt, item.name)
      if (item.kind === 'block') provide(noExt.replace(/^blocks\//, 'components/blocks/'), item.name)
      const dirIndex = noExt.match(/^(.*)\/index$/)
      if (dirIndex) {
        provide(dirIndex[1], item.name)
        if (item.kind === 'block') provide(dirIndex[1].replace(/^blocks\//, 'components/blocks/'), item.name)
      }
    }
  }

  const allFiles = new Map()
  for (const i of items.values()) for (const f of i.files) allFiles.set(f.path, i.name)

  const RESOLVE_EXT = ['.tsx', '.ts', '.js', '.jsx', '.css']
  const destKey = (item, f) => (item.kind === 'block' ? f.path.replace(/^src\/blocks\//, 'components/blocks/') : f.path.replace(/^src\//, ''))
  const planned = []
  for (const i of items.values()) for (const f of i.files) if (isCodeFile(f.path)) planned.push(destKey(i, f))
  const plannedSet = new Set(planned)
  const cliPick = (key) => {
    const found = new Set()
    for (const ext of RESOLVE_EXT) {
      if (plannedSet.has(key + ext)) found.add(key + ext)
      if (plannedSet.has(`${key}/index${ext}`)) found.add(`${key}/index${ext}`)
    }
    const base = path.posix.basename(key)
    for (const g of planned) if (RESOLVE_EXT.some((ext) => g.endsWith(`/${base}${ext}`) || g === base + ext)) found.add(g)
    if (!found.size) return null
    const extRank = (g) => RESOLVE_EXT.indexOf(path.posix.extname(g))
    return [...found].sort((a, b) => extRank(a) - extRank(b) || (b.startsWith(key) ? 1 : 0) - (a.startsWith(key) ? 1 : 0))[0]
  }
  const reportedPicks = new Set()
  const checkCliPick = (where, key, intended) => {
    if (cliHazard === 'off' || reportedPicks.has(`${where}|${key}`)) return
    const pick = cliPick(key)
    if (!pick || pick === intended) return
    reportedPicks.add(`${where}|${key}`)
    errors.push(`${where}: the shadcn CLI re-resolves "@/${key}" to "@/${pick.replace(/\.[jt]sx?$|\.css$/, '')}" (same base name "${path.posix.basename(key)}", and .tsx outranks .ts), so the installed import would point at the wrong file. Give ${intended} a name no other file in the registry shares (recipes: recipes/<slug>-ink.ts, not recipes/<slug>.ts; art barrels: a directory name that is not also a ui slug)`)
  }
  const fileKeyOf = new Map()
  for (const i of items.values()) {
    for (const f of i.files) {
      if (!isCodeFile(f.path)) continue
      const dest = destKey(i, f)
      const noExt = stripCodeExt(dest)
      if (!fileKeyOf.has(noExt)) fileKeyOf.set(noExt, dest)
      const dirIndex = noExt.match(/^(.*)\/index$/)
      if (dirIndex && !fileKeyOf.has(dirIndex[1])) fileKeyOf.set(dirIndex[1], dest)
    }
  }

  const NOT_SHIPPED = /^(docs|styles|tests?|assets|registry|main|App)(\/|$)/

  for (const item of items.values()) {
    const npm = new Set()
    const local = new Set()
    for (const f of item.files) {
      if (!isCodeFile(f.path)) continue
      for (const imp of scanImports(f.content, f.path)) {
        const c = classifySpecifier(imp.spec)
        const where = `${f.path}: import "${imp.spec}"`
        if (c.kind === 'implicit' || c.kind === 'builtin') continue
        if (c.kind === 'other') {
          errors.push(`${where} is not a resolvable module in a registry file`)
        } else if (c.kind === 'package') {
          npm.add(c.name)
          if (declared && !declared.has(c.name)) errors.push(`${where}: package "${c.name}" is not declared in package.json`)
          else if (runtime && !runtime.has(c.name)) errors.push(`${where}: package "${c.name}" is only a devDependency in package.json; code that ships in the registry needs a runtime dependency (move it to "dependencies")`)
        } else if (c.kind === 'relative') {
          const target = posix(path.posix.normalize(path.posix.join(path.posix.dirname(f.path), imp.spec)))
          const candidates = [target, ...CODE_EXT.map((x) => target + x), ...CODE_EXT.map((x) => `${target}/index${x}`)]
          const hit = candidates.find((x) => allFiles.has(x)) ?? candidates.find((x) => existsSync(rel(x)) && statSync(rel(x)).isFile())
          if (!hit) errors.push(`${where} does not resolve to a file`)
          else if (allFiles.get(hit) !== item.name) {
            errors.push(`${where} reaches into ${allFiles.has(hit) ? `item "${allFiles.get(hit)}"` : 'a file outside the registry'}; use the @/ alias so the CLI can rewrite it`)
          }
        } else if (c.kind === 'alias') {
          const key = c.path.replace(/\.(tsx?|jsx?|mjs)$/, '')
          if (/^registry(\/|$)/.test(key)) {
            errors.push(`${where}: "@/registry" imports are only for the shadcn build faux-registry; import via @/components/ui, @/lib, @/hooks`)
            continue
          }
          if (key === 'lib/utils') continue
          const owner = providers.get(key) ?? providers.get(key.replace(/\/index$/, ''))
          if (!owner && NOT_SHIPPED.test(key)) {
            errors.push(`${where}: "@/${key.split('/')[0]}" is not part of the registry (docs, styles, tests and assets are never shipped)`)
            continue
          }
          if (!owner) {
            errors.push(`${where} does not resolve to any file that ships in the registry`)
            continue
          }
          if (owner !== item.name) local.add(owner)
          const shipKey = key.replace(/^blocks\//, 'components/blocks/')
          const intended = fileKeyOf.get(shipKey) ?? fileKeyOf.get(shipKey.replace(/\/index$/, ''))
          if (intended && !/\.[jt]sx?$|\.mjs$|\.css$/.test(c.path)) checkCliPick(`${f.path}: import "${imp.spec}"`, shipKey, intended)
        }
      }
    }
    item.npm = [...npm].sort()
    item.local = [...local].sort()
  }

  const major = (range) => /\d+/.exec(String(range ?? ''))?.[0]
  for (const [name, range] of Object.entries(cfg.pins ?? {})) {
    const have = pkg?.dependencies?.[name] ?? pkg?.devDependencies?.[name]
    if (have && major(have) !== major(range)) errors.push(`package "${name}" is pinned to "${range}" for the registry (tools/registry/config.mjs DEFAULT_PINS) but package.json declares "${have}": the code was written against ${have}, so change one of the two`)
  }

  for (const item of items.values()) {
    if (item.kind !== 'lib') continue
    for (const dep of item.local) {
      const target = items.get(dep)
      if (target && target.kind === 'ui') errors.push(`lib item "${item.name}" imports the component "${dep}": src/lib must not depend on src/components (move the shared code into src/lib, or rename a shared recipe so it does not look like the ${dep} recipe)`)
    }
  }
  const state = new Map()
  const stack = []
  const visit = (name) => {
    if (state.get(name) === 2) return
    if (state.get(name) === 1) {
      errors.push(`lib items depend on each other in a circle: ${[...stack.slice(stack.indexOf(name)), name].join(' -> ')} (art items import ink, never the other way round; keep ink/art/index.ts style barrels out of ink)`)
      return
    }
    state.set(name, 1)
    stack.push(name)
    for (const dep of items.get(name)?.local ?? []) if (items.get(dep)?.kind === 'lib') visit(dep)
    stack.pop()
    state.set(name, 2)
  }
  for (const item of items.values()) if (item.kind === 'lib') visit(item.name)

  return { items, warnings, errors, pkg, declared }
}

const UMBRELLA_DOCS = (cfg) =>
  [
    'Looseleaf is installed: paper tokens, fonts (Kalam, Caveat, Special Elite, IBM Plex Mono), the ink drawing engine and every component.',
    'Dark mode follows shadcn: add the `dark` class to <html>. A second theme is a `[data-theme="…"]` block that overrides the CSS variables.',
    `Docs and the component list: ${cfg.homepage}`,
  ].join('\n')

const pascal = (slug) => slug.replace(/(?:^|[-_]+)(\w)/g, (_, c) => c.toUpperCase())

function blockEntry(item) {
  const files = item.files.filter((f) => /\.tsx?$/.test(f.path))
  const entry = files.find((f) => /^src\/blocks\/[^/]+\/index\.tsx?$/.test(f.path)) ?? files.find((f) => /^src\/blocks\/[^/]+\/page\.tsx?$/.test(f.path))
  if (!entry) return null
  const rel = entry.path.slice(`src/blocks/${item.name}/`.length).replace(/\.tsx?$/, '')
  const spec = rel === 'index' ? `blocks/${item.name}` : `blocks/${item.name}/${rel}`
  const named = /export\s+default\s+(?:async\s+)?(?:function\s*\*?\s*|class\s+)([A-Za-z_$][\w$]*)/.exec(entry.content)?.[1] ?? /export\s+default\s+([A-Z][\w$]*)\s*[;\n]/.exec(entry.content)?.[1]
  const hasDefault = /export\s+default\b|export\s*\{[^}]*\bas\s+default\b/.test(entry.content)
  return { spec, name: named ?? pascal(item.name), hasDefault }
}

const blockDocs = (item, meta, cfg) => {
  const entry = blockEntry(item)
  const pinned = item.npm.filter((n) => cfg.pins?.[n]).map((n) => `${n}@${cfg.pins[n]}`)
  return [
    `Installed the "${item.title ?? item.name}" block into your components directory under blocks/${item.name}/.`,
    meta?.usage
      ? `Usage:\n${meta.usage}`
      : entry
        ? `Import it: ${entry.hasDefault ? `import ${entry.name} from` : 'import { … } from'} "<your components alias>/${entry.spec}"`
        : `Its files are under "<your components alias>/blocks/${item.name}".`,
    ...(pinned.length ? [`Needs ${pinned.join(', ')}: the CLI installs them (a project on an older major is upgraded).`] : []),
  ].join('\n')
}

export function buildRegistry(scan, root, cfg, { targets = true } = {}) {
  const warnings = [...scan.warnings]
  const errors = [...scan.errors]
  const { items } = scan
  const out = []
  const names = new Set()

  let theme = null
  let fontItems = []
  const cssFile = path.join(root, 'src/styles/looseleaf.css')
  if (existsSync(cssFile)) {
    const conv = convertCss(readFileSync(cssFile, 'utf8'), { file: 'src/styles/looseleaf.css' })
    warnings.push(...conv.warnings)
    errors.push(...conv.errors)
    for (const dep of [...conv.dependencies, ...conv.devDependencies]) {
      if (scan.declared && !scan.declared.has(dep)) errors.push(`src/styles/looseleaf.css imports "${dep}" which is not declared in package.json`)
    }
    fontItems = buildFontItems(conv.fontFamilies, readFontWeights(root))
    theme = {
      name: 'looseleaf-theme',
      type: 'registry:theme',
      title: 'Looseleaf theme',
      description: 'Paper tokens, @theme mappings, keyframes and utilities for Looseleaf, merged into your global CSS. Fonts are pulled in as registry dependencies.',
      categories: ['theme'],
      ...(conv.dependencies.length ? { dependencies: conv.dependencies } : {}),
      ...(conv.devDependencies.length ? { devDependencies: conv.devDependencies } : {}),
      registryDependencies: fontItems.map((f) => itemAddress(f.name, cfg)),
      ...(conv.cssVars ? { cssVars: conv.cssVars } : {}),
      ...(conv.css ? { css: conv.css } : {}),
    }
  } else {
    warnings.push('src/styles/looseleaf.css not found: no theme or font items are emitted')
  }

  const themeAddr = theme && cfg.themeDep === 'all' ? itemAddress('looseleaf-theme', cfg) : null

  const byKind = (k) => [...items.values()].filter((i) => i.kind === k)
  const toRegistryItem = (item) => {
    const meta = item.meta
    const info = item.kind === 'lib' ? libItemInfo(item.name) : null
    const title = meta?.title ?? info?.title ?? (item.kind === 'hook' ? item.name : titleCase(item.name))
    const fallbackDesc =
      info
        ? info.description
        : item.kind === 'hook'
          ? `The ${item.name} React hook from Looseleaf.`
          : item.kind === 'utils'
            ? 'The cn() class-name helper (clsx + tailwind-merge). `shadcn init` already creates this; you only need it if you skipped init.'
            : item.kind === 'lib'
              ? `Shared Looseleaf helpers: ${item.name}.`
              : `${title} from Looseleaf.`
    item.title = title
    const deps = new Set(item.local)
    if (themeAddr && (item.kind === 'ui' || item.kind === 'block')) deps.add('looseleaf-theme')
    const registryDependencies = [...deps].sort().map((n) => itemAddress(n, cfg))
    const metaOut = {}
    if (meta) {
      for (const k of ['status', 'upstream', 'related', 'a11y', 'usage', 'tags']) if (meta[k] !== undefined) metaOut[k] = meta[k]
      if (Array.isArray(meta.parts)) metaOut.parts = meta.parts.map((p) => p?.name).filter(Boolean)
    }
    return {
      name: item.name,
      type: item.type,
      title,
      description: meta?.description ?? fallbackDesc,
      ...(item.kind === 'block' ? { categories: [blockCategory(item.name, meta)] } : meta?.category ? { categories: [meta.category] } : {}),
      ...(item.npm.length ? { dependencies: item.npm.map((n) => (cfg.pins?.[n] ? `${n}@${cfg.pins[n]}` : n)) } : {}),
      ...(registryDependencies.length ? { registryDependencies } : {}),
      files: item.files.map(({ path: p, type, target }) => ({ path: p, type, ...(target ? { target } : {}) })),
      ...(item.kind === 'block' ? { docs: blockDocs(item, meta, cfg) } : {}),
      ...(Object.keys(metaOut).length ? { meta: metaOut } : {}),
    }
  }

  const uiItems = byKind('ui')
  const libItems = byKind('lib')
  const hookItems = byKind('hook')
  const blockItems = byKind('block')
  const utilsItem = byKind('utils')

  const umbrellaDeps = [
    ...(theme ? ['looseleaf-theme'] : []),
    ...libItems.map((i) => i.name),
    ...hookItems.map((i) => i.name),
    ...uiItems.map((i) => i.name),
  ]
  if (umbrellaDeps.length) {
    out.push({
      name: 'looseleaf',
      type: 'registry:style',
      extends: 'none',
      title: 'Looseleaf',
      description: 'Everything: the paper theme, fonts, the ink engine and every Looseleaf component. Overwrites your global CSS tokens.',
      categories: ['umbrella'],
      registryDependencies: umbrellaDeps.map((n) => itemAddress(n, cfg)),
      docs: UMBRELLA_DOCS(cfg),
    })
  }
  if (blockItems.length) {
    out.push({
      name: 'looseleaf-blocks',
      type: 'registry:block',
      title: 'Looseleaf blocks',
      description: 'Every composed page block (login, dashboard, …). Pulls in the components they need.',
      categories: ['umbrella'],
      registryDependencies: blockItems.map((i) => itemAddress(i.name, cfg)),
    })
  }
  if (theme) out.push(theme, ...fontItems)
  for (const i of [...utilsItem, ...libItems, ...hookItems, ...uiItems, ...blockItems]) out.push(toRegistryItem(i))

  for (const i of out) {
    if (names.has(i.name)) errors.push(`duplicate item name "${i.name}"`)
    names.add(i.name)
  }

  const ORDER = ['name', 'type', 'extends', 'title', 'description', 'categories', 'dependencies', 'devDependencies', 'registryDependencies', 'files', 'font', 'cssVars', 'css', 'docs', 'meta']
  const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99)))

  const registry = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'looseleaf',
    homepage: cfg.homepage,
    items: out.map(sortKeys),
  }
  return { registry, warnings, errors }
}
