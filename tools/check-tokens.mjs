#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { TOOLS_DIR, c, collectFiles, formatTable, matchAny, parseArgs, plural, readJson, readText, resolveRoot } from './lib/util.mjs'
import { ColorError, composite, contrastRatio, parseColor, toHex, toSrgb } from './lib/color.mjs'
import { customPropertyDecls, loadStylesheetGraph, parseCss, varRefs, visitCss } from './lib/css.mjs'
import { extractClassPieces, parseSource, tokensOf, walk } from './lib/source.mjs'
import { isColorRoot, loadDesign, splitVariants } from './lib/tw.mjs'

const DEFAULT_CONFIG = {
  ignorePrefixes: ['--tw-', '--radix-', '--cmdk-', '--vaul-', '--sonner-', '--rdp-', '--embla-', '--toast-', '--input-otp-', '--recharts-', '--default-', '--container-', '--breakpoint-'],
  ignoreNames: [],
  exclude: ['**/*.d.ts', '**/*.test.{ts,tsx}', '**/*.generated.{ts,tsx}', 'src/docs/meta/**'],
  checkedPrefixes: ['--ll-', '--color-'],
}

class Unresolved extends Error {}

const BASE_SELECTOR = /^(?::root|html|:host|body)$/
const SCOPE_SELECTOR = /^(?:(?::root|html|body))?(?:\.(?:dark|light|[\w-]*(?:theme|mode)[\w-]*)|\[data-(?:theme|mode|color-scheme)[^\]]*\])+$/

function scopeOf(chain, extraScopes) {
  let media = null
  let lastRule = null
  for (const n of chain) {
    if (n.kind === 'at' && n.name === 'theme') return { label: ':root', base: true }
    if (n.kind === 'at' && n.name === 'media') {
      if (/prefers-color-scheme\s*:\s*dark/.test(n.prelude)) media = '@media dark'
      else return null
    } else if (n.kind === 'at' && !['layer', 'supports', 'container', 'scope'].includes(n.name)) return null
    if (n.kind === 'rule') lastRule = n
  }
  if (!lastRule) return null
  const sels = lastRule.prelude.split(',').map((s) => s.trim().replace(/\s+/g, ''))
  const out = []
  for (const sel of sels) {
    if (BASE_SELECTOR.test(sel)) out.push(media ? { label: `:root ${media}`, dark: true } : { label: ':root', base: true })
    else if (SCOPE_SELECTOR.test(sel) || extraScopes.includes(sel)) out.push({ label: media ? `${sel} ${media}` : sel, dark: /dark/i.test(sel) || Boolean(media) })
  }
  return out.length ? out : null
}

function discoverScopes(decls, pairs) {
  const wanted = new Set()
  for (const p of pairs) {
    for (const name of [p.fg, p.bg]) {
      if (name.startsWith('--')) wanted.add(name)
      else for (const cand of [`--${name}`, `--color-${name}`, `--ll-${name}`, `--ll-color-${name}`]) wanted.add(cand)
    }
  }
  const counts = new Map()
  for (const d of decls) {
    if (d.atProperty || !wanted.has(d.prop)) continue
    const rule = [...d.chain].reverse().find((n) => n.kind === 'rule')
    const sel = rule?.prelude.trim()
    if (!sel || sel.includes(',') || /[\s>+~]/.test(sel) || BASE_SELECTOR.test(sel) || SCOPE_SELECTOR.test(sel)) continue
    if (!/^[\w:.#[\]="'-]+$/.test(sel)) continue
    counts.set(sel, (counts.get(sel) ?? new Set()).add(d.prop))
  }
  return [...counts].filter(([, props]) => props.size >= 2).map(([sel]) => sel)
}

function buildEnvironments(decls, extraScopes) {
  const base = new Map()
  const overlays = new Map()
  const scopeMeta = new Map()
  for (const d of decls) {
    if (d.atProperty) continue
    const hit = scopeOf(d.chain, extraScopes)
    if (!hit) continue
    for (const s of Array.isArray(hit) ? hit : [hit]) {
      if (s.base) base.set(d.prop, d.value)
      else {
        if (!overlays.has(s.label)) {
          overlays.set(s.label, new Map())
          scopeMeta.set(s.label, s)
        }
        overlays.get(s.label).set(d.prop, d.value)
      }
    }
  }
  const envs = [{ label: ':root', env: base, dark: false }]
  for (const [label, map] of overlays) envs.push({ label, env: new Map([...base, ...map]), dark: Boolean(scopeMeta.get(label).dark) })
  return envs
}

function substituteVars(value, env, stack = []) {
  let out = ''
  let i = 0
  while (i < value.length) {
    const at = value.indexOf('var(', i)
    if (at === -1 || (at > 0 && /[\w-]/.test(value[at - 1]))) {
      if (at === -1) {
        out += value.slice(i)
        break
      }
      out += value.slice(i, at + 4)
      i = at + 4
      continue
    }
    out += value.slice(i, at)
    let depth = 1
    let j = at + 4
    while (j < value.length && depth > 0) {
      if (value[j] === '(') depth++
      else if (value[j] === ')') depth--
      j++
    }
    const inner = value.slice(at + 4, j - 1)
    const comma = inner.indexOf(',')
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim()
    const fallback = comma === -1 ? null : inner.slice(comma + 1).trim()
    if (stack.includes(name)) throw new Unresolved(`circular reference ${[...stack, name].join(' -> ')}`)
    if (env.has(name)) out += substituteVars(env.get(name), env, [...stack, name])
    else if (fallback !== null) out += substituteVars(fallback, env, stack)
    else throw new Unresolved(`${name} is not defined`)
    i = j
  }
  return out
}

function lookupToken(name, env) {
  if (name.startsWith('--')) return env.has(name) ? name : null
  for (const cand of [`--${name}`, `--color-${name}`, `--ll-${name}`, `--ll-color-${name}`]) if (env.has(cand)) return cand
  return null
}

function resolveColor(nameOrLiteral, env, dark) {
  const looksLiteral = /^#|\(/.test(nameOrLiteral) || /^(?:white|black|transparent)$/i.test(nameOrLiteral)
  let raw
  let token = null
  if (looksLiteral) raw = nameOrLiteral
  else {
    token = lookupToken(nameOrLiteral, env)
    if (!token) throw Object.assign(new Unresolved(`token "${nameOrLiteral}" is not defined`), { missing: true })
    raw = env.get(token)
  }
  const flat = substituteVars(raw, env, token ? [token] : [])
  try {
    return { srgb: toSrgb(parseColor(flat, { scheme: dark ? 'dark' : 'light' })), token, flat }
  } catch (e) {
    if (e instanceof ColorError) throw new Unresolved(`${token ?? nameOrLiteral}: ${e.message}`)
    throw e
  }
}

export function checkContrast({ decls, pairsConfig }) {
  const envs = buildEnvironments(decls, [...(pairsConfig.scopes ?? []), ...discoverScopes(decls, pairsConfig.pairs)])
  const rows = []
  for (const { label, env, dark } of envs) {
    let page = { r: 1, g: 1, b: 1, a: 1 }
    try {
      page = resolveColor(pairsConfig.pageBackground ?? 'background', env, dark).srgb
      if (page.a < 1) page = composite(page, { r: 1, g: 1, b: 1, a: 1 })
    } catch {
    }
    for (const pair of pairsConfig.pairs) {
      const row = { scope: label, fg: pair.fg, bg: pair.bg, min: pair.min, purpose: pair.purpose ?? '', level: pair.level ?? 'error', required: Boolean(pair.required), status: 'ok' }
      try {
        const fgRes = resolveColor(pair.fg, env, dark)
        const bgRes = resolveColor(pair.bg, env, dark)
        const over = pair.over ? resolveColor(pair.over, env, dark).srgb : page
        const bg = bgRes.srgb.a < 1 ? composite(bgRes.srgb, over) : bgRes.srgb
        const fg = fgRes.srgb.a < 1 ? composite(fgRes.srgb, bg) : fgRes.srgb
        const byte = (v) => Math.round(v * 255 + 1e-6) / 255
        const q = (col) => ({ r: byte(col.r), g: byte(col.g), b: byte(col.b), a: 1 })
        row.ratio = contrastRatio(q(fg), q(bg))
        row.fgHex = toHex(fg)
        row.bgHex = toHex(bg)
        row.status = row.ratio + 1e-9 >= pair.min ? 'ok' : row.level === 'warn' ? 'warn' : 'fail'
      } catch (e) {
        if (!(e instanceof Unresolved)) throw e
        row.status = e.missing ? 'missing' : 'unresolved'
        row.reason = e.message
      }
      rows.push(row)
    }
  }
  const baseRows = new Map(rows.filter((r) => r.scope === ':root').map((r) => [`${r.fg}|${r.bg}`, r]))
  for (const r of rows) {
    const b = baseRows.get(`${r.fg}|${r.bg}`)
    if (r.scope !== ':root' && b && b.status === r.status && b.fgHex === r.fgHex && b.bgHex === r.bgHex && b.reason === r.reason) r.sameAsBase = true
  }
  return { scopes: envs.map((e) => e.label), rows }
}

const TS_LOCAL_DEF = [/["'`](--[\w-]+)["'`]\s*:/g, /\[(--[\w-]+):/g, /\.setProperty\(\s*["'`](--[\w-]+)/g, /(?<![\w(])(--[\w-]+)\s*:\s*[^\s;'"`]/g]

export async function checkReferences({ root, cssGraph, config, cssAbs, withClasses = true }) {
  const findings = []
  const defined = new Set()
  const cssFiles = collectFiles(root, ['src/**/*.css'])
  const seenFiles = new Set(cssGraph.map((g) => g.file))
  const allCss = [...cssGraph]
  for (const rel of cssFiles) {
    const abs = path.join(root, rel)
    if (seenFiles.has(abs)) continue
    const text = readText(abs)
    if (text != null) allCss.push({ file: abs, text, tree: parseCss(text) })
  }
  for (const g of allCss) for (const d of customPropertyDecls(g.tree)) defined.add(d.prop)

  const tsFiles = collectFiles(root, ['src/**/*.{ts,tsx}'], config.exclude)
  const tsInfo = []
  for (const rel of tsFiles) {
    const text = readText(path.join(root, rel))
    if (text == null) continue
    for (const re of TS_LOCAL_DEF) for (const m of text.matchAll(re)) defined.add(m[1])
    tsInfo.push({ rel, text })
  }

  let design = null
  let designError = null
  try {
    design = await loadDesign(cssAbs)
  } catch (e) {
    designError = String(e?.message ?? e).split('\n')[0]
  }
  const ignorePrefix = (n) => config.ignorePrefixes.some((p) => n.startsWith(p)) || config.ignoreNames.includes(n)
  const isDefined = (n) => defined.has(n) || ignorePrefix(n) || (design && safeTheme(design, n) !== undefined)
  const ours = (n) => config.checkedPrefixes.some((p) => n.startsWith(p))

  const report = (file, line, name, hasFallback, via) => {
    if (isDefined(name)) return
    if (hasFallback && !ours(name)) return
    findings.push({ kind: 'undefined-token', level: hasFallback ? 'warn' : 'error', file, line, name, via, message: hasFallback ? `${name} is not defined (a fallback hides it)` : `${name} is not defined in the stylesheet` })
  }

  for (const g of allCss) {
    const rel = path.relative(root, g.file).split(path.sep).join('/')
    const inTree = (node) => {
      for (const d of node.decls) for (const r of varRefs(d.value)) report(rel, d.line, r.name, r.hasFallback, 'css')
    }
    inTree(g.tree)
    visitCss(g.tree, (n) => inTree(n))
  }

  for (const f of tsInfo) {
    const parsed = parseSource(f.rel, f.text)
    if (!parsed.program) continue
    const strings = []
    walk(parsed.program, (n) => {
      if (n.type === 'Literal' && typeof n.value === 'string') strings.push({ v: n.value, o: n.start + 1 })
      else if (n.type === 'TemplateElement') strings.push({ v: n.value.cooked ?? n.value.raw, o: n.start + 1 })
      return true
    })
    for (const s of strings) {
      for (const r of varRefs(s.v)) report(f.rel, parsed.posOf(s.o).line, r.name, r.hasFallback, 'var()')
      for (const m of s.v.matchAll(/(?<!var)\(\s*(--[\w-]+)\s*\)/g)) report(f.rel, parsed.posOf(s.o + (m.index ?? 0)).line, m[1], false, 'utility')
    }
    if (withClasses && design) {
      const pieces = extractClassPieces(parsed.program, { ambient: false })
      const tokens = pieces.flatMap((p) => tokensOf(p))
      design.prime(tokens.map((t) => t.token))
      for (const { token, offset } of tokens) {
        if (design.valid(token)) continue
        const bare = splitVariants(token).utility.replace(/^!|!$/g, '')
        const d = design.diagnose(bare)
        if (d?.kind === 'theme-key' && isColorRoot(d.root) && d.namespaces.includes('--color-')) {
          const key = d.key.split('/')[0]
          if (defined.has(`--color-${key}`)) continue
          const expects = d.namespaces.map((ns) => `${ns}${key}`).join(' or ')
          findings.push({ kind: 'undefined-theme-key', level: 'error', file: f.rel, line: parsed.posOf(offset).line, name: `--color-${key}`, via: token, message: `class "${token}" needs ${expects}, which is not defined` })
        }
      }
    }
  }
  findings.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line))
  return { findings, designError, definedCount: defined.size, cssFiles: allCss.map((g) => path.relative(root, g.file).split(path.sep).join('/')), tsFiles: tsFiles.length }
}

function safeTheme(design, name) {
  try {
    return design.ds.resolveThemeValue(name)
  } catch {
    return undefined
  }
}

async function main() {
  const { flags, errors } = parseArgs(process.argv.slice(2), {
    bool: ['json', 'all', 'strict', 'no-refs', 'no-contrast', 'contrast', 'help', 'quiet'],
    str: ['root', 'css', 'pairs', 'config'],
    list: ['scope', 'only'],
  })
  if (errors.length || flags.help) {
    if (errors.length) console.error(errors.join('\n'))
    console.error('usage: node tools/check-tokens.mjs [--root dir] [--css file] [--pairs file] [--all] [--strict] [--json] [--no-refs] [--no-contrast] [--scope sel] [--only <glob>]… [--contrast]')
    process.exitCode = flags.help ? 0 : 2
    return
  }
  const root = resolveRoot(flags.root)
  const cssAbs = flags.css ? path.resolve(process.cwd(), flags.css) : path.join(root, 'src', 'styles', 'looseleaf.css')
  const rel = (p) => path.relative(root, p).split(path.sep).join('/') || p

  if (!fs.existsSync(cssAbs)) {
    const msg = `no stylesheet at ${rel(cssAbs)} yet — nothing to check`
    if (flags.json) console.log(JSON.stringify({ skipped: msg, contrast: [], references: [] }))
    else console.log(`${c.green('✔ check-tokens')} · ${msg} (empty tree)`)
    return
  }

  let config = DEFAULT_CONFIG
  let pairsConfig
  try {
    const userCfg = readJson(flags.config ? path.resolve(process.cwd(), flags.config) : path.join(TOOLS_DIR, 'check-tokens.config.json'), {}) ?? {}
    config = { ...DEFAULT_CONFIG, ...userCfg }
    pairsConfig = readJson(flags.pairs ? path.resolve(process.cwd(), flags.pairs) : path.join(TOOLS_DIR, 'contrast-pairs.json'), null)
    if (!pairsConfig) throw new Error('tools/contrast-pairs.json not found')
    pairsConfig = { ...pairsConfig, scopes: [...(pairsConfig.scopes ?? []), ...flags.scope] }
  } catch (e) {
    console.error(`check-tokens: ${e.message}`)
    process.exitCode = 2
    return
  }

  const graph = loadStylesheetGraph(cssAbs)
  const decls = graph.flatMap((g) => customPropertyDecls(g.tree))

  const only = flags.only
  let refs = { findings: [], definedCount: 0, cssFiles: [], tsFiles: 0 }
  if (!flags['no-refs']) {
    refs = await checkReferences({ root, cssGraph: graph, config, cssAbs })
    if (only.length) refs.findings = refs.findings.filter((f) => matchAny(only, f.file))
  }
  let contrast = { scopes: [], rows: [] }
  if (!flags['no-contrast'] && (!only.length || flags.contrast)) contrast = checkContrast({ decls, pairsConfig })

  const strict = Boolean(flags.strict)
  const refErrors = refs.findings.filter((f) => f.level === 'error')
  const failsRun = (r) => r.status === 'fail' || (r.status === 'missing' && r.required) || (strict && (r.status === 'missing' || r.status === 'unresolved'))
  const contrastFail = contrast.rows.filter((r) => !r.sameAsBase && failsRun(r))
  const failed = refErrors.length > 0 || contrastFail.length > 0

  if (flags.json) {
    console.log(JSON.stringify({ root, stylesheet: rel(cssAbs), scopes: contrast.scopes, references: refs.findings, contrast: contrast.rows, failed }, null, 2))
    process.exitCode = failed ? 1 : 0
    return
  }

  console.log(c.dim(`check-tokens · ${rel(cssAbs)}${graph.length > 1 ? ` (+${graph.length - 1} imported)` : ''} · scopes: ${contrast.scopes.join(', ') || '—'}${only.length ? ` · references in ${only.join(', ')} only, contrast table skipped` : ''}`))
  if (refs.designError) console.log(c.yellow(`! Tailwind could not compile the stylesheet (${refs.designError}); colour theme keys used in classes and Tailwind default tokens were not checked`))
  if (refs.findings.length) {
    console.log(c.bold('\nA. token references'))
    console.log(formatTable(['LOCATION', 'TOKEN', 'PROBLEM'], refs.findings.map((f) => [`${f.file}:${f.line}`, f.level === 'error' ? c.red(f.name) : c.yellow(f.name), f.message])))
  }
  if (contrast.rows.length) {
    const quietMissing = (r) => r.status === 'missing' && !r.required
    const shown = flags.all ? contrast.rows : contrast.rows.filter((r) => r.status !== 'ok' && !quietMissing(r) && !r.sameAsBase)
    const fmt = (r) => [
      r.scope,
      `${r.fg} / ${r.bg}`,
      r.fgHex ?? '',
      r.bgHex ?? '',
      r.ratio ? r.ratio.toFixed(2) : '—',
      String(r.min),
      r.status === 'ok' ? c.green('ok') : r.status === 'fail' ? c.red('FAIL') : r.status === 'warn' ? c.yellow('warn') : r.status === 'missing' ? (r.required ? c.red('MISSING') : c.yellow('missing')) : c.yellow('unresolved'),
      r.reason ?? r.purpose,
    ]
    if (shown.length) {
      console.log(c.bold(`\nB. contrast${flags.all ? '' : ' (problems only; --all shows every pair)'}`))
      console.log(formatTable(['SCOPE', 'PAIR', 'FG', 'BG', 'RATIO', 'MIN', 'RESULT', 'WHY / PURPOSE'], shown.map(fmt)))
    }
  }
  const skipped = [...new Set(contrast.rows.filter((r) => r.status === 'missing' && !r.required).map((r) => `${r.fg}/${r.bg}`))]
  if (!flags.all && skipped.length) console.log(c.dim(`\nnot checked (token not defined): ${skipped.join(', ')}`))
  const okCount = contrast.rows.filter((r) => r.status === 'ok').length
  const summary = [
    refErrors.length ? c.red(`✖ ${plural(refErrors.length, 'undefined token')}`) : c.green('✔ tokens defined'),
    contrast.rows.length ? (contrastFail.length ? c.red(`✖ ${plural(contrastFail.length, 'contrast failure')}`) : c.green(`✔ contrast`)) + ` (${okCount}/${contrast.rows.length} pair checks ok` + (contrast.rows.some((r) => r.status === 'missing') ? `, ${contrast.rows.filter((r) => r.status === 'missing').length} skipped: token not defined` : '') + ')' : '',
    refs.findings.filter((f) => f.level === 'warn').length ? c.yellow(`${plural(refs.findings.filter((f) => f.level === 'warn').length, 'warning')}`) : '',
  ].filter(Boolean)
  console.log(`\n${summary.join(' · ')}`)
  process.exitCode = failed ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
