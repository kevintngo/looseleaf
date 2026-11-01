import fs from 'node:fs'
import path from 'node:path'
import { editDistance } from './util.mjs'

export function splitVariants(token) {
  const parts = []
  let depth = 0
  let cur = ''
  for (const ch of token) {
    if (ch === '[' || ch === '(') depth++
    else if (ch === ']' || ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ':' && depth === 0) {
      parts.push(cur)
      cur = ''
    } else cur += ch
  }
  return { variants: parts, utility: cur }
}

export function structuralProblem(token) {
  const stack = []
  let quote = ''
  const pairs = { ']': '[', ')': '(' }
  for (let i = 0; i < token.length; i++) {
    const ch = token[i]
    if (quote) {
      if (ch === quote) quote = ''
      continue
    }
    if (ch === '\\') {
      i++
      continue
    }
    if ((ch === "'" || ch === '"') && stack.length) quote = ch
    else if (ch === '[' || ch === '(') stack.push(ch)
    else if (ch === ']' || ch === ')') {
      const open = stack.pop()
      if (open !== pairs[ch]) return open ? `"${ch}" found while "${open}" is still open` : `"${ch}" has no opening bracket`
    }
  }
  if (quote) return `unterminated ${quote} quote`
  if (stack.length) return `unclosed "${stack[stack.length - 1]}"`
  return null
}

const COLOR_ROOTS = new Set([
  'bg', 'text', 'border', 'border-x', 'border-y', 'border-t', 'border-r', 'border-b', 'border-l', 'border-s', 'border-e',
  'ring', 'ring-offset', 'inset-ring', 'outline', 'fill', 'stroke', 'from', 'via', 'to', 'decoration', 'divide', 'accent',
  'caret', 'shadow', 'inset-shadow', 'drop-shadow', 'placeholder',
])
export const isColorRoot = (root) => COLOR_ROOTS.has(root)

const NAMESPACES = {
  text: ['--color-', '--text-'], font: ['--font-', '--font-weight-'], shadow: ['--shadow-', '--color-'], rounded: ['--radius-'],
  ease: ['--ease-'], animate: ['--animate-'], blur: ['--blur-'], tracking: ['--tracking-'], leading: ['--leading-'],
  'inset-shadow': ['--inset-shadow-', '--color-'], 'drop-shadow': ['--drop-shadow-', '--color-'],
}

export class Design {
  constructor(ds, cssFile, cssClassNames) {
    this.ds = ds
    this.cssFile = cssFile
    this.cssClassNames = cssClassNames
    this.cache = new Map()
    this._names = null
    this._roots = null
    this._bare = null
  }

  prime(tokens) {
    const todo = [...new Set(tokens)].filter((t) => !this.cache.has(t))
    const CHUNK = 1500
    for (let i = 0; i < todo.length; i += CHUNK) {
      const chunk = todo.slice(i, i + CHUNK)
      let out
      try {
        out = this.ds.candidatesToCss(chunk)
      } catch {
        out = chunk.map((t) => {
          try {
            return this.ds.candidatesToCss([t])[0]
          } catch {
            return null
          }
        })
      }
      chunk.forEach((t, j) => this.cache.set(t, out[j]))
    }
  }

  css(token) {
    if (!this.cache.has(token)) this.prime([token])
    return this.cache.get(token)
  }

  valid(token) {
    return this.css(token) != null
  }

  get classList() {
    if (!this._names) {
      try {
        this._names = this.ds.getClassList().map((e) => e[0])
      } catch {
        this._names = []
      }
      this._roots = new Set()
      this._bare = new Set()
      for (const n of this._names) {
        const name = n.startsWith('-') ? n.slice(1) : n
        this._roots.add(name.split('-')[0])
        if (!name.includes('-')) this._bare.add(name)
      }
    }
    return this._names
  }
  get roots() {
    this.classList
    return this._roots
  }
  get bareUtilities() {
    this.classList
    return this._bare
  }

  namesUnder(root) {
    if (!this._byRoot) {
      this._byRoot = new Map()
      for (const n of this.classList) {
        const key = n.replace(/^-/, '').split('-')[0]
        if (!this._byRoot.has(key)) this._byRoot.set(key, [])
        this._byRoot.get(key).push(n.replace(/^-/, ''))
      }
    }
    return this._byRoot.get(root) ?? []
  }

  variantNames() {
    try {
      return this.ds.getVariants().map((v) => v.name)
    } catch {
      return []
    }
  }

  hasFunctionalRoot(root) {
    try {
      return this.ds.utilities.has(root, 'functional')
    } catch {
      return false
    }
  }

  nearest(word, pool, limit = 3) {
    const bound = word.length <= 4 ? 1 : word.length <= 9 ? 2 : 3
    const hits = []
    for (const cand of pool) {
      if (Math.abs(cand.length - word.length) > bound) continue
      const d = editDistance(word, cand, bound)
      if (d <= bound) hits.push([d, cand])
    }
    hits.sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1]))
    return hits.slice(0, limit).map((h) => h[1])
  }

  diagnose(token) {
    if (this.valid(token)) return null
    const bad = structuralProblem(token)
    if (bad) return { kind: 'malformed', message: `malformed arbitrary value (${bad})`, suggestions: [] }
    const { variants, utility } = splitVariants(token)
    const bare = utility.replace(/^!/, '').replace(/!$/, '')
    if (this.valid(bare)) {
      for (const v of variants) {
        let parsed = null
        try {
          parsed = this.ds.parseVariant(v)
        } catch {
          parsed = null
        }
        if (!parsed) {
          const stem = v.replace(/\/[\w-]+$/, '').replace(/\[[^\]]*\]/g, '')
          const suggestions = this.nearest(stem, this.variantNames())
          return { kind: 'unknown-variant', message: `unknown variant "${v}:"`, variant: v, suggestions: suggestions.map((s) => `${s}:`) }
        }
      }
      return { kind: 'unknown-variant', message: 'variant combination generates no CSS', suggestions: [] }
    }
    let candidates = []
    try {
      candidates = this.ds.parseCandidate(bare)
    } catch {
      candidates = []
    }
    const functional = candidates.find((c) => c.kind === 'functional' && c.value)
    if (functional && this.hasFunctionalRoot(functional.root)) {
      if (functional.value.kind === 'named') {
        const root = functional.root
        const key = functional.value.value
        const ns = NAMESPACES[root] ?? (isColorRoot(root) ? ['--color-'] : null)
        const pool = this.classList.filter((n) => n.startsWith(`${root}-`)).map((n) => n.slice(root.length + 1))
        const near = this.nearest(key, pool).map((k) => `${root}-${k}`)
        const where = ns ? ` (theme keys ${ns.map((n) => `${n}${key}`).join(' or ')} are not defined)` : ''
        return {
          kind: 'theme-key',
          message: `"${root}-" has no value "${key}"${where}`,
          root,
          key,
          namespaces: ns ?? [],
          suggestions: near,
        }
      }
      return { kind: 'invalid-arbitrary', message: `invalid arbitrary value for "${functional.root}-"`, suggestions: [] }
    }
    const stripped = bare.replace(/^-/, '')
    const root = stripped.split('-')[0]
    let suggestions
    if (this.roots.has(root) && stripped.includes('-')) suggestions = this.nearest(stripped, this.namesUnder(root))
    else if (this.roots.has(root)) suggestions = this.nearest(stripped, this.bareUtilities)
    else suggestions = [...this.nearest(stripped, this.bareUtilities), ...this.nearest(root, this.roots).map((r) => stripped.replace(root, r))]
    return { kind: 'unknown-utility', message: `no utility "${bare}"`, suggestions: suggestions.slice(0, 3) }
  }

  looksLikeUtility(token) {
    const { variants, utility } = splitVariants(token)
    const bare = utility.replace(/^!/, '').replace(/!$/, '').replace(/^-/, '')
    if (variants.length || /[[(]/.test(bare)) return true
    if (bare.includes('-') && this.roots.has(bare.split('-')[0])) return true
    if (bare.includes('-')) return this.nearest(bare.split('-')[0], this.roots, 1).length > 0 && bare.split('-')[0].length >= 3
    if (bare.length >= 3 && this.nearest(bare, this.bareUtilities, 1).length > 0) return true
    return false
  }
}

export function cssClassNamesOf(texts) {
  const names = new Set()
  for (const text of texts) {
    const clean = text.replace(/\/\*[\s\S]*?\*\//g, '')
    for (const m of clean.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) names.add(m[1])
    for (const m of clean.matchAll(/@utility\s+([\w-]+)/g)) names.add(m[1])
  }
  return names
}

export async function loadDesign(cssAbs) {
  const css = fs.readFileSync(cssAbs, 'utf8')
  const { __unstable__loadDesignSystem } = await import('@tailwindcss/node')
  const ds = await __unstable__loadDesignSystem(css, { base: path.dirname(cssAbs) })
  return new Design(ds, cssAbs, new Set())
}
