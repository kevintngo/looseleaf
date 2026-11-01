#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { customPropertyDecls, parseCss } from './lib/css.mjs'
import { checkContrast } from './check-tokens.mjs'
import { PALETTE_RE, contrast, loadTokens, parseTokenCss, collectDecls, CSS_FILE } from './lookdev/tokens.mjs'
import { parseColor, toHex, toSrgb } from './lib/color.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const OUT_FILE = path.join(ROOT, 'src', 'docs', 'content', 'foundations', '_shared', 'data.generated.ts')

const r2 = (v) => Math.round(v * 100) / 100
const isColour = (v) => /^#|^rgba/.test(v)
const readText = (f) => fs.readFileSync(f, 'utf8')

function declRoles(cssText) {
  const roles = new Map()
  for (const line of cssText.split('\n')) {
    const m = /^\s*(--[\w-]+):\s*[^;]*;\s*\/\*\s*(.*?)\s*\*\/\s*$/.exec(line)
    if (m && !roles.has(m[1])) roles.set(m[1], m[2])
  }
  return roles
}

const GROUPS = {
  surface: /^--ll-(desk|desk-deep|paper|paper-shade|slip|card|graph|kraft|check|pad|photo|rule-blue|rule-red|pad-rule|check-rule|sticky-(yellow|green|orange|pink|blue))$/,
  ink: /^--ll-(ink|ink-soft|ink-muted|ink-you|pencil|pencil-text|pencil-mark|red|green|marker|orange-text|hi|hi-deep|focus|link-hover|check-ink|check-no)$/,
  accent: /^--ll-(tomato|tangerine|lemon|grass|teal|sky|grape|bubblegum)$/,
  shadcn: /^--(background|foreground|card|card-foreground|popover|popover-foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|border|input|ring|chart-[1-5]|sidebar(-[a-z-]+)?)$/,
  paper: /^--ll-(umber|line|line-soft|link|input-ink|caret|placeholder|hi-select|selection-text|riso|stamp-fill(-red|-green)?|diff-(add|del)|syn-[a-z]+)$/,
}

function paletteData(tokens, roles, env) {
  const paper = tokens['--ll-paper']
  const desk = tokens['--ll-desk']
  const ink = tokens['--ll-ink']
  const ratios = (v) => (isColour(v) ? { onPaper: r2(contrast(v, paper)), onDesk: r2(contrast(v, desk)), inkOn: r2(contrast(ink, v)) } : { onPaper: null, onDesk: null, inkOn: null })
  const entry = (group) => (name) => ({ token: name, value: tokens[name], role: roles.get(name) ?? '', alias: aliasOf(env, name), group, ...ratios(tokens[name]) })
  const names = (re) => Object.keys(tokens).filter((n) => re.test(n) && n in tokens)
  return {
    palette: [...names(GROUPS.surface).map(entry('surface')), ...names(GROUPS.ink).map(entry('ink')), ...names(GROUPS.accent).map(entry('accent'))],
    roles: [...names(GROUPS.shadcn).map(entry('shadcn')), ...names(GROUPS.paper).map(entry('paper'))].filter((e) => isColour(e.value)),
  }
}

function aliasOf(env, name) {
  const raw = env.get(name)?.value?.trim() ?? ''
  return /^#/.test(raw) ? '' : raw.replace(/\s+/g, ' ')
}

function splitTop(text, sep = ',') {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of text) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === sep && depth === 0) {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

const OVERRIDABLE = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5']

function exprOf(name, env, depth = 0) {
  if (depth > 12) return null
  if (OVERRIDABLE.includes(name)) return name
  const raw = env.get(name)?.value?.trim()
  if (raw === undefined) return null
  return exprOfValue(raw, name, env, depth)
}

function exprOfValue(raw, name, env, depth) {
  if (/^#[0-9a-f]{6}$/i.test(raw)) return name && PALETTE_RE.test(name) ? name : raw.toLowerCase()
  let m = /^var\(\s*(--[\w-]+)\s*\)$/.exec(raw)
  if (m) return exprOf(m[1], env, depth + 1)
  m = /^color-mix\(\s*in srgb\s*,(.*)\)$/s.exec(raw)
  if (m) {
    const parts = splitTop(m[1])
    if (parts.length !== 2) return null
    const parse = (p) => {
      const pm = /^(.*?)(?:\s+(\d+(?:\.\d+)?)%)?$/s.exec(p.trim())
      return { color: pm[1].trim(), pct: pm[2] === undefined ? null : Number(pm[2]) }
    }
    const a = parse(parts[0])
    const b = parse(parts[1])
    let pa = a.pct
    if (pa === null) pa = b.pct === null ? 50 : 100 - b.pct
    const ea = exprOfValue(a.color, null, env, depth + 1)
    const eb = exprOfValue(b.color, null, env, depth + 1)
    return ea && eb ? [ea, pa, eb] : null
  }
  return null
}

function lookupToken(name, env) {
  if (name.startsWith('--')) return env.has(name) ? name : null
  for (const cand of [`--${name}`, `--color-${name}`, `--ll-${name}`, `--ll-color-${name}`]) if (env.has(cand)) return cand
  return null
}

function pairsData(env, pairsConfig, rows) {
  const out = []
  const rowOf = new Map(rows.filter((r) => r.scope === ':root').map((r) => [`${r.fg}|${r.bg}|${r.purpose}`, r]))
  for (const p of pairsConfig.pairs) {
    if (!p.fg || !p.bg) continue
    const row = rowOf.get(`${p.fg}|${p.bg}|${p.purpose ?? ''}`)
    if (!row || row.ratio === undefined) continue
    const fgTok = lookupToken(p.fg, env)
    const bgTok = lookupToken(p.bg, env)
    const fg = fgTok && !p.over ? exprOf(fgTok, env) : null
    const bg = bgTok && !p.over ? exprOf(bgTok, env) : null
    out.push({
      fg: p.fg,
      bg: p.bg,
      fgHex: row.fgHex,
      bgHex: row.bgHex,
      ratio: r2(row.ratio),
      min: p.min,
      level: p.level ?? 'error',
      status: row.status,
      purpose: p.purpose ?? '',
      section: (p.section ?? '').replace(/^./, (c) => c.toUpperCase()),
      live: fg && bg ? { fg, bg } : null,
    })
  }
  return out
}

function walkFiles(dir, exts, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'docs') continue
      walkFiles(p, exts, out)
    } else if (exts.some((x) => e.name.endsWith(x))) out.push(p)
  }
  return out
}

function readers(cssText, codeText, token) {
  const escaped = token.replace(/[-]/g, '\\-')
  const inCss = new RegExp(`var\\(${escaped}[,)]`).test(cssText) || new RegExp(`calc\\([^;]*var\\(${escaped}\\)`).test(cssText)
  const inCode = codeText.includes(token)
  return inCss && inCode ? 'css+code' : inCss ? 'css' : inCode ? 'code' : 'reserved'
}

function knobsData(tokens, roles, cssText) {
  const code = walkFiles(path.join(ROOT, 'src'), ['.ts', '.tsx'])
    .filter((f) => !f.endsWith('.generated.ts'))
    .map(readText)
    .join('\n')
  const rows = (re) => Object.keys(tokens).filter((n) => re.test(n))
  const mk = (n) => ({ token: n, value: tokens[n], role: roles.get(n) ?? '', readBy: readers(cssText, code, n) })
  return {
    knobs: rows(/^--ll-(wobble|stroke-fine|stroke-brush|bleed|bleed-loop|bleed-focus|misreg-(sm|md|lg|k)|jitter-k|tilt-max|tilt-turn|hover-tilt|hover-misreg|press-misreg|press-sink|shadow-k|grain|blend)$/).map(mk),
    geometry: rows(/^--ll-(hit|hit-min|ink-room|sheet-radius)$/).map(mk),
  }
}

const BEZIER = { 'ease-out': [0, 0, 0.58, 1], 'ease-in': [0.42, 0, 1, 1], ease: [0.25, 0.1, 0.25, 1], linear: [0, 0, 1, 1] }

function motionData(tokens, roles) {
  const durations = Object.keys(tokens)
    .filter((n) => /^--ll-dur-/.test(n))
    .map((n) => {
      const seconds = Number.parseFloat(tokens[n])
      return { token: n, name: n.replace('--ll-dur-', ''), seconds, ms: Math.round(seconds * 1000), role: roles.get(n) ?? '' }
    })
  const easings = Object.keys(tokens)
    .filter((n) => /^--ll-ease-/.test(n))
    .map((n) => {
      const css = tokens[n]
      const m = /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/.exec(css)
      const bezier = m ? [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])] : BEZIER[css]
      return { token: n, name: n.replace('--ll-ease-', ''), css, bezier, role: roles.get(n) ?? '' }
    })
    .filter((e) => e.bezier)
  return { durations, easings }
}

function densityData() {
  const pick = ['--ll-hit', '--ll-wobble', '--ll-stroke-fine', '--ll-stroke-brush', '--ll-misreg-k', '--ll-jitter-k', '--ll-tilt-max', '--ll-tilt-turn']
  const out = {}
  for (const d of ['comfortable', 'compact', 'calm']) {
    const t = loadTokens('notebook', { density: d === 'comfortable' ? undefined : d })
    out[d] = Object.fromEntries(pick.map((k) => [k, t[k]]))
  }
  return out
}

function fontData() {
  const css = readText(path.join(ROOT, 'src', 'styles', 'fonts.css'))
  const out = {}
  for (const m of css.matchAll(/@import\s+"@fontsource\/([\w-]+)\/(\d+)\.css"/g)) (out[m[1]] ??= []).push(Number(m[2]))
  return out
}

const FOREST_STEPS = [
  {
    id: 'surfaces',
    title: 'Surfaces',
    note: 'Pale sage felt for the desk, warm cream for the paper, a kraft-tinted slip. The rules on ruled stocks follow.',
    decls: {
      '--ll-desk': '#cdd2bb', '--ll-desk-deep': '#b6bea0', '--ll-paper': '#f3eee0', '--ll-paper-shade': '#e7e0cc', '--ll-slip': '#e7dbbf',
      '--ll-card': '#f6f1e1', '--ll-graph': '#eef1e2', '--ll-kraft': '#d9c39a', '--ll-check': '#e3e7cf', '--ll-pad': '#f3eddc', '--ll-photo': '#fbf8ee',
      '--ll-rule-blue': '#93a983', '--ll-rule-red': '#c98a7a', '--ll-pad-rule': '#aebc9c', '--ll-check-rule': '#8aa47b',
    },
  },
  {
    id: 'inks',
    title: 'Inks',
    note: 'The felt tip goes green-black, blue felt becomes petrol teal, and the pencils get a greener grey. Focus follows the blue.',
    decls: {
      '--ll-ink': '#262c24', '--ll-ink-soft': '#454b40', '--ll-ink-muted': '#3f453a', '--ll-ink-you': '#1f5570',
      '--ll-pencil': '#62625a', '--ll-pencil-text': '#57564f', '--ll-pencil-mark': '#7d7c73',
      '--ll-red': '#943123', '--ll-green': '#385b2e', '--ll-orange-text': '#86441a',
      '--ll-focus': '#1f5570', '--ll-link-hover': '#163f55', '--ll-check-ink': '#3a5b30', '--ll-check-no': '#a0352a',
    },
  },
  {
    id: 'marker',
    title: 'Marker and highlighter',
    note: 'A softer terracotta and a straw-coloured highlighter. This is the step the checker will object to.',
    decls: { '--ll-marker': '#cf7a3d', '--ll-hi': '#e3c86c', '--ll-hi-deep': '#8f6d10' },
  },
  {
    id: 'shade',
    title: 'Shadow colour',
    note: 'Shadows are umber in Notebook. In a green room they are green-black. It is one triplet.',
    decls: { '--ll-shade': '34 42 28' },
  },
]

const hexOf = (text) => toHex(toSrgb(parseColor(text)))
const mixHex = (a, b, t) => {
  const A = toSrgb(parseColor(a))
  const B = toSrgb(parseColor(b))
  return toHex({ r: A.r + (B.r - A.r) * t, g: A.g + (B.g - A.g) * t, b: A.b + (B.b - A.b) * t })
}

function forestScope(cssText, pairsConfig, decls) {
  const block = `[data-theme="forest"] {\n${Object.entries(decls).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`
  const slot = /\[data-theme="forest"\]\s*\{[^}]*\}/
  if (!slot.test(cssText)) throw new Error('looseleaf.css has no [data-theme="forest"] block for the walkthrough to fill')
  const filled = cssText.replace(slot, () => block)
  const { rows } = checkContrast({ decls: customPropertyDecls(parseCss(filled)), pairsConfig })
  const scope = rows.filter((r) => r.scope === '[data-theme="forest"]')
  const problems = scope.filter((r) => r.status === 'fail')
  return {
    pairs: scope.length,
    fails: problems.map((r) => ({ fg: r.fg, bg: r.bg, fgHex: r.fgHex, bgHex: r.bgHex, ratio: r2(r.ratio), min: r.min, purpose: r.purpose })),
    warns: scope.filter((r) => r.status === 'warn').length,
  }
}

function forestData(cssText, pairsConfig, notebook) {
  const cumulative = {}
  const steps = []
  const run = (step) => {
    Object.assign(cumulative, step.decls)
    steps.push({ id: step.id, title: step.title, note: step.note, decls: { ...step.decls }, check: forestScope(cssText, pairsConfig, cumulative) })
  }
  for (const s of FOREST_STEPS) run(s)

  const ink = cumulative['--ll-ink']
  const paper = cumulative['--ll-paper']
  const slip = cumulative['--ll-slip']
  let marker = cumulative['--ll-marker']
  while (contrast(ink, marker) < 4.55 && marker !== '#ffffff') marker = mixHex(marker, '#ffffff', 0.02)
  let chart = marker
  while ((contrast(chart, paper) < 3.05 || contrast(chart, slip) < 3.05) && chart !== '#000000') chart = mixHex(chart, '#000000', 0.02)
  const fix = { '--ll-marker': hexOf(marker), '--chart-1': hexOf(chart) }
  run({ id: 'fix', title: 'Fix what the checker found', note: 'Lighten the marker until the ink label reads, and give the chart its own darker orange.', decls: fix })

  const final = { ...cumulative }
  return {
    steps,
    final,
    notebook: Object.fromEntries(Object.keys(final).map((k) => [k, notebook[k] ?? null])),
    knobs: { wobble: 0.8, edge: 'deckle' },
  }
}

export function build() {
  const cssText = readText(CSS_FILE)
  const tokens = parseTokenCss(cssText)
  const roles = declRoles(cssText)
  const env = collectDecls(parseCss(cssText), {})
  const pairsConfig = JSON.parse(readText(path.join(ROOT, 'tools', 'contrast-pairs.json')))
  const { rows } = checkContrast({ decls: customPropertyDecls(parseCss(cssText)), pairsConfig })
  const { palette, roles: roleRows } = paletteData(tokens, roles, env)
  const t0 = Object.fromEntries(Object.keys(tokens).filter((n) => PALETTE_RE.test(n)).map((n) => [n, tokens[n]]))
  t0['--ll-shade'] = tokens['--ll-shade']
  const aliases = Object.fromEntries(OVERRIDABLE.map((n) => [n, exprOfValue(env.get(n).value.trim(), null, env, 0)]))
  return {
    palette,
    roles: roleRows,
    aliases,
    contrast: pairsData(env, pairsConfig, rows),
    ...knobsData(tokens, roles, cssText),
    ...motionData(tokens, roles),
    density: densityData(),
    fonts: fontData(),
    t0,
    forest: forestData(cssText, pairsConfig, tokens),
  }
}

const TYPES = {
  palette: 'PaletteEntry[]',
  roles: 'PaletteEntry[]',
  aliases: 'Record<string, Expr>',
  contrast: 'ContrastRow[]',
  knobs: 'KnobRow[]',
  geometry: 'KnobRow[]',
  durations: 'DurationRow[]',
  easings: 'EasingRow[]',
  density: 'Record<"comfortable" | "compact" | "calm", Record<string, string>>',
  fonts: 'Record<string, number[]>',
  t0: 'Record<string, string>',
  forest: 'ForestData',
}

export function render(data) {
  const consts = Object.keys(TYPES).map((k) => `export const ${k.toUpperCase()}: ${TYPES[k]} = ${JSON.stringify(data[k], null, 1)}\n`)
  return (
    'import type { ContrastRow, DurationRow, EasingRow, Expr, ForestData, KnobRow, PaletteEntry } from "./data-types"\n\n' +
    consts.join('\n')
  )
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href
if (isMain) {
  const args = process.argv.slice(2)
  const data = build()
  if (args.includes('--print')) console.log(JSON.stringify(data, null, 1))
  else if (args.includes('--check')) {
    const now = fs.existsSync(OUT_FILE) ? readText(OUT_FILE) : ''
    if (now !== render(data)) {
      console.error(`✖ ${path.relative(ROOT, OUT_FILE)} is out of date: run node tools/gen-docs-data.mjs`)
      process.exitCode = 1
    } else console.log(`✔ ${path.relative(ROOT, OUT_FILE)} is up to date`)
  } else {
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
    fs.writeFileSync(OUT_FILE, render(data))
    console.log(`wrote ${path.relative(ROOT, OUT_FILE)} (${data.palette.length} palette tokens, ${data.contrast.length} contrast pairs, ${data.forest.steps.length} forest steps)`)
  }
}
