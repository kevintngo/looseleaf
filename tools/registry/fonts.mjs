import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { FONT_VARIABLES } from './css.mjs'

export const FONT_TABLE = [
  {
    name: 'font-ibm-plex-mono',
    title: 'IBM Plex Mono',
    role: 'mono',
    variable: '--font-mono',
    family: "'IBM Plex Mono', ui-monospace, monospace",
    import: 'IBM_Plex_Mono',
    weight: ['400', '500'],
    dependency: '@fontsource/ibm-plex-mono',
    selector: 'code, kbd, samp, pre',
    description: 'IBM Plex Mono for code, kbd and numbers (font-mono).',
  },
]

if (!FONT_TABLE.every((f) => FONT_VARIABLES.includes(f.variable))) throw new Error('FONT_TABLE and FONT_VARIABLES disagree')

export const KEVIN_SANS_CSS = 'https://kevintngo.github.io/looseleaf/fonts/kevin-sans.css'

export const KEVIN_SANS_ROLES = [
  ['--font-hand', '"Kevin Sans Hand", "Kevin Sans", cursive'],
  ['--font-script', '"Kevin Sans Script", "Kevin Sans", cursive'],
  ['--font-type', '"Kevin Sans Type", "Kevin Sans", cursive'],
]

export function buildKevinSansItem(fontFamilies = {}) {
  const theme = {}
  for (const [variable, fallback] of KEVIN_SANS_ROLES) theme[variable.slice(2)] = fontFamilies[variable] ?? fallback
  return {
    name: 'font-kevin-sans',
    type: 'registry:theme',
    title: 'Kevin Sans',
    description: 'Kevin Sans, the hand of every Looseleaf label, title and stamp: one family tuned for three roles (font-hand, font-script, font-type). The ink engine loads it from the Looseleaf site the first time a component draws, unless the page already has it.',
    categories: ['fonts'],
    cssVars: { theme },
  }
}

export function readFontWeights(root) {
  const dir = path.join(root, 'src', 'styles')
  const out = {}
  if (!existsSync(dir)) return out
  let files = []
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.css'))
  } catch {
    return out
  }
  for (const file of files) {
    let text = ''
    try {
      text = readFileSync(path.join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    } catch {
      continue
    }
    for (const m of text.matchAll(/@import\s+(?:url\()?["'](@fontsource\/[a-z0-9-]+)(?:\/(\d{3})\.css)?["']\)?/g)) {
      const list = (out[m[1]] ??= [])
      const weight = m[2] ?? '400'
      if (!list.includes(weight)) list.push(weight)
    }
  }
  for (const list of Object.values(out)) list.sort()
  return out
}

export function buildFontItems(fontFamilies = {}, weights = {}) {
  return [buildKevinSansItem(fontFamilies), ...FONT_TABLE.map((base) => {
    const f = weights[base.dependency]?.length ? { ...base, weight: weights[base.dependency] } : base
    const family = fontFamilies[f.variable] ?? f.family
    const css = {}
    for (const w of f.weight) if (w !== '400') css[`@import "${f.dependency}/${w}.css"`] = {}
    return {
      name: f.name,
      type: 'registry:font',
      title: f.title,
      description: f.description,
      categories: ['fonts'],
      dependencies: [f.dependency],
      font: {
        family,
        provider: 'google',
        import: f.import,
        variable: f.variable,
        weight: f.weight,
        subsets: ['latin'],
        ...(f.selector ? { selector: f.selector } : {}),
        dependency: f.dependency,
      },
      ...(Object.keys(css).length ? { css } : {}),
    }
  })]
}
