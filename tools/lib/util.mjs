import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const TOOLS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR
const paint = (open, close) => (s) => (useColor ? `\x1b[${open}m${s}\x1b[${close}m` : String(s))
export const c = {
  red: paint(31, 39),
  yellow: paint(33, 39),
  green: paint(32, 39),
  cyan: paint(36, 39),
  dim: paint(2, 22),
  bold: paint(1, 22),
}

export function parseArgs(argv, spec = {}) {
  const bool = new Set(spec.bool ?? [])
  const str = new Set(spec.str ?? [])
  const list = new Set(spec.list ?? [])
  const flags = {}
  for (const k of list) flags[k] = []
  const positionals = []
  const errors = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--') {
      positionals.push(...argv.slice(i + 1))
      break
    }
    if (!arg.startsWith('--')) {
      positionals.push(arg)
      continue
    }
    const eq = arg.indexOf('=')
    const name = arg.slice(2, eq === -1 ? undefined : eq)
    const inline = eq === -1 ? undefined : arg.slice(eq + 1)
    if (bool.has(name)) {
      flags[name] = inline === undefined ? true : inline !== 'false'
    } else if (str.has(name) || list.has(name)) {
      const value = inline ?? argv[++i]
      if (value === undefined) {
        errors.push(`--${name} needs a value`)
        continue
      }
      if (list.has(name)) flags[name].push(...value.split(',').filter(Boolean))
      else flags[name] = value
    } else {
      errors.push(`unknown flag --${name}`)
    }
  }
  return { flags, positionals, errors }
}

export function globToRegExp(glob) {
  let re = ''
  let braces = 0
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i]
    if (ch === '*') {
      if (glob[i + 1] === '*') {
        i++
        if (glob[i + 1] === '/') {
          i++
          re += '(?:.*/)?'
        } else re += '.*'
      } else re += '[^/]*'
    } else if (ch === '?') re += '[^/]'
    else if (ch === '{') {
      braces++
      re += '(?:'
    } else if (ch === '}' && braces > 0) {
      braces--
      re += ')'
    } else if (ch === ',' && braces > 0) re += '|'
    else re += ch.replace(/[.+^$()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${re}$`)
}

const globCache = new Map()
export function matchGlob(glob, rel) {
  let re = globCache.get(glob)
  if (!re) globCache.set(glob, (re = globToRegExp(glob)))
  return re.test(rel)
}
export const matchAny = (globs, rel) => (globs ?? []).some((g) => matchGlob(g, rel))

export function globBase(glob) {
  const parts = glob.split('/')
  const keep = []
  for (const p of parts) {
    if (/[*?{[]/.test(p)) break
    keep.push(p)
  }
  return keep.join('/')
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.locks', '.upstream', '_tmp'])

export function walkFiles(rootAbs, relDir = '') {
  const out = []
  const start = path.join(rootAbs, relDir)
  let entries
  try {
    entries = fs.readdirSync(start, { withFileTypes: true })
  } catch {
    return out
  }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
  for (const e of entries) {
    const rel = relDir ? `${relDir}/${e.name}` : e.name
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) out.push(...walkFiles(rootAbs, rel))
    } else if (e.isFile()) out.push(rel)
  }
  return out
}

export function collectFiles(rootAbs, include, exclude = []) {
  const seen = new Set()
  for (const glob of include) {
    const base = globBase(glob)
    for (const rel of walkFiles(rootAbs, base)) {
      if (matchGlob(glob, rel) && !matchAny(exclude, rel)) seen.add(rel)
    }
  }
  return [...seen].sort()
}

export function readText(abs) {
  try {
    return fs.readFileSync(abs, 'utf8')
  } catch {
    return null
  }
}

export function readJson(abs, fallback = null) {
  const text = readText(abs)
  if (text == null) return fallback
  try {
    return JSON.parse(text)
  } catch (e) {
    throw new Error(`${abs}: invalid JSON (${e.message})`)
  }
}

export function resolveRoot(flag) {
  return flag ? path.resolve(process.cwd(), flag) : PROJECT_ROOT
}

export function toPosix(p) {
  return p.split(path.sep).join('/')
}

export function lineIndex(text) {
  const starts = [0]
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1)
  return (offset) => {
    let lo = 0
    let hi = starts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid] <= offset) lo = mid
      else hi = mid - 1
    }
    return { line: lo + 1, col: offset - starts[lo] + 1 }
  }
}

export function formatTable(header, rows, { indent = '  ', maxWidth = 200 } = {}) {
  const all = [header, ...rows]
  const widths = header.map((_, i) => Math.min(maxWidth, Math.max(...all.map((r) => stripAnsi(String(r[i] ?? '')).length))))
  const line = (r) =>
    indent +
    r
      .map((cell, i) => {
        const s = String(cell ?? '')
        const pad = widths[i] - stripAnsi(s).length
        return i === r.length - 1 ? s : s + ' '.repeat(Math.max(0, pad))
      })
      .join('  ')
  return [line(header.map((h) => c.bold(h))), ...rows.map(line)].join('\n')
}

// eslint-disable-next-line no-control-regex
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '')

export function editDistance(a, b, bound = Infinity) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > bound) return bound + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      if (cur[j] < rowMin) rowMin = cur[j]
    }
    if (rowMin > bound) return bound + 1
    prev = cur
  }
  return prev[b.length]
}

export function plural(n, one, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}
