export class ColorError extends Error {}

const NAMED = {
  black: '#000000', white: '#ffffff', red: '#ff0000', lime: '#00ff00', blue: '#0000ff', yellow: '#ffff00',
  cyan: '#00ffff', aqua: '#00ffff', magenta: '#ff00ff', fuchsia: '#ff00ff', gray: '#808080', grey: '#808080',
  silver: '#c0c0c0', maroon: '#800000', olive: '#808000', green: '#008000', purple: '#800080', teal: '#008080',
  navy: '#000080', orange: '#ffa500', pink: '#ffc0cb', brown: '#a52a2a',
}

const mul = (m, v) => [
  m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
  m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
  m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
]
const matMul = (a, b) => a.map((row) => [0, 1, 2].map((j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j]))
function inv(m) {
  const [[a, b, c], [d, e, f], [g, h, i]] = m
  const A = e * i - f * h
  const B = -(d * i - f * g)
  const C = d * h - e * g
  const det = a * A + b * B + c * C
  return [
    [A / det, -(b * i - c * h) / det, (b * f - c * e) / det],
    [B / det, (a * i - c * g) / det, -(a * f - c * d) / det],
    [C / det, -(a * h - b * g) / det, (a * e - b * d) / det],
  ]
}

const LIN_SRGB_TO_XYZ = [
  [506752 / 1228815, 87881 / 245763, 12673 / 70218],
  [87098 / 409605, 175762 / 245763, 12673 / 175545],
  [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
]
const XYZ_TO_LIN_SRGB = [
  [12831 / 3959, -329 / 214, -1974 / 3959],
  [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
  [705 / 12673, -2585 / 12673, 705 / 667],
]
const LIN_P3_TO_XYZ = [
  [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
  [35783 / 156275, 247089 / 357200, 198249 / 2500400],
  [0, 32229 / 714400, 5220557 / 5000800],
]
const XYZ_TO_LIN_P3 = inv(LIN_P3_TO_XYZ)

const WHITE_D65 = [0.3127 / 0.329, 1, (1 - 0.3127 - 0.329) / 0.329]
const WHITE_D50 = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585]
const BRADFORD = [
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
]
function adaptation(from, to) {
  const a = mul(BRADFORD, from)
  const b = mul(BRADFORD, to)
  const scale = [[b[0] / a[0], 0, 0], [0, b[1] / a[1], 0], [0, 0, b[2] / a[2]]]
  return matMul(inv(BRADFORD), matMul(scale, BRADFORD))
}
const D50_TO_D65 = adaptation(WHITE_D50, WHITE_D65)
const D65_TO_D50 = adaptation(WHITE_D65, WHITE_D50)

const decode = (v) => {
  const a = Math.abs(v)
  return a <= 0.04045 ? v / 12.92 : Math.sign(v) * ((a + 0.055) / 1.055) ** 2.4
}
const encode = (v) => {
  const a = Math.abs(v)
  return a <= 0.0031308 ? 12.92 * v : Math.sign(v) * (1.055 * a ** (1 / 2.4) - 0.055)
}

function oklabToLin([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}
function linToOklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}
const polarToRect = ([L, C, h]) => [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)]
const rectToPolar = ([L, a, b]) => {
  const C = Math.hypot(a, b)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) h += 360
  return [L, C, C < 1e-6 ? 0 : h]
}

const EPS = 216 / 24389
const KAPPA = 24389 / 27
function labToXyzD50([L, a, b]) {
  const fy = (L + 16) / 116
  const fx = a / 500 + fy
  const fz = fy - b / 200
  const x = fx ** 3 > EPS ? fx ** 3 : (116 * fx - 16) / KAPPA
  const y = L > KAPPA * EPS ? ((L + 16) / 116) ** 3 : L / KAPPA
  const z = fz ** 3 > EPS ? fz ** 3 : (116 * fz - 16) / KAPPA
  return [x * WHITE_D50[0], y * WHITE_D50[1], z * WHITE_D50[2]]
}
function xyzD50ToLab(xyz) {
  const f = xyz.map((v, i) => {
    const r = v / WHITE_D50[i]
    return r > EPS ? Math.cbrt(r) : (KAPPA * r + 16) / 116
  })
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])]
}

function hslToSrgb([h, s, l]) {
  h = ((h % 360) + 360) % 360
  const f = (n) => {
    const k = (n + h / 30) % 12
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [f(0), f(8), f(4)]
}
function srgbToHsl([r, g, b]) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (d !== 0) {
    s = l === 0 || l === 1 ? 0 : (max - l) / Math.min(l, 1 - l)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return [h, s, l]
}
function hwbToSrgb([h, w, b]) {
  if (w + b >= 1) {
    const gray = w / (w + b)
    return [gray, gray, gray]
  }
  const rgb = hslToSrgb([h, 1, 0.5])
  return rgb.map((v) => v * (1 - w - b) + w)
}
function srgbToHwb(rgb) {
  const [h] = srgbToHsl(rgb)
  return [h, Math.min(...rgb), 1 - Math.max(...rgb)]
}

const SPACES = {
  srgb: { to: (c) => c.map(decode), from: (l) => l.map(encode) },
  'srgb-linear': { to: (c) => c, from: (l) => l },
  hsl: { to: (c) => hslToSrgb(c).map(decode), from: (l) => srgbToHsl(l.map(encode)) },
  hwb: { to: (c) => hwbToSrgb(c).map(decode), from: (l) => srgbToHwb(l.map(encode)) },
  oklab: { to: oklabToLin, from: linToOklab },
  oklch: { to: (c) => oklabToLin(polarToRect(c)), from: (l) => rectToPolar(linToOklab(l)) },
  lab: { to: (c) => mul(XYZ_TO_LIN_SRGB, mul(D50_TO_D65, labToXyzD50(c))), from: (l) => xyzD50ToLab(mul(D65_TO_D50, mul(LIN_SRGB_TO_XYZ, l))) },
  lch: {
    to: (c) => mul(XYZ_TO_LIN_SRGB, mul(D50_TO_D65, labToXyzD50(polarToRect(c)))),
    from: (l) => rectToPolar(xyzD50ToLab(mul(D65_TO_D50, mul(LIN_SRGB_TO_XYZ, l)))),
  },
  'display-p3': { to: (c) => mul(XYZ_TO_LIN_SRGB, mul(LIN_P3_TO_XYZ, c.map(decode))), from: (l) => mul(XYZ_TO_LIN_P3, mul(LIN_SRGB_TO_XYZ, l)).map(encode) },
  'xyz-d65': { to: (c) => mul(XYZ_TO_LIN_SRGB, c), from: (l) => mul(LIN_SRGB_TO_XYZ, l) },
  'xyz-d50': { to: (c) => mul(XYZ_TO_LIN_SRGB, mul(D50_TO_D65, c)), from: (l) => mul(D65_TO_D50, mul(LIN_SRGB_TO_XYZ, l)) },
}
SPACES.xyz = SPACES['xyz-d65']
const HUE_INDEX = { hsl: 0, hwb: 0, lch: 2, oklch: 2 }

function convert(color, space) {
  if (color.space === space) return color
  return { space, c: SPACES[space].from(SPACES[color.space].to(color.c)), a: color.a }
}

const inGamut = (lin, eps = 1e-5) => lin.every((v) => v >= -eps && v <= 1 + eps)
const clamp01 = (v) => Math.min(1, Math.max(0, v))

function gamutMapLin(lin) {
  if (inGamut(lin)) return lin.map(clamp01)
  const [L, C, h] = rectToPolar(linToOklab(lin))
  if (L >= 1) return [1, 1, 1]
  if (L <= 0) return [0, 0, 0]
  let lo = 0
  let hi = C
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklabToLin(polarToRect([L, mid, h])), 1e-6)) lo = mid
    else hi = mid
  }
  return oklabToLin(polarToRect([L, lo, h])).map(clamp01)
}

export function toSrgb(color) {
  const lin = SPACES[color.space].to(color.c)
  const [r, g, b] = gamutMapLin(lin).map(encode).map(clamp01)
  return { r, g, b, a: color.a }
}

export function toHex({ r, g, b, a = 1 }) {
  const h = (v) => Math.round(clamp01(v) * 255 + 1e-6).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a) : ''}`
}

export function relativeLuminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map(decode)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

export function composite(fg, bg) {
  const a = fg.a ?? 1
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 }
}

export function splitArgs(s) {
  const out = []
  let depth = 0
  let cur = ''
  const flush = () => {
    if (cur) out.push(cur)
    cur = ''
  }
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (depth === 0 && (/\s/.test(ch) || ch === ',')) flush()
    else if (depth === 0 && ch === '/') {
      flush()
      out.push('/')
    } else cur += ch
  }
  flush()
  return out
}

function splitTopLevelCommas(s) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (depth === 0 && ch === ',') {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

function num(tok, pctOf = 1, what = 'number') {
  if (tok === undefined) throw new ColorError(`missing ${what}`)
  if (tok === 'none') return 0
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%?)$/i.exec(tok)
  if (!m) throw new ColorError(`cannot read ${what} "${tok}"`)
  const v = Number(m[1])
  return m[2] ? (v / 100) * pctOf : v
}
function angle(tok) {
  if (tok === undefined) throw new ColorError('missing hue')
  if (tok === 'none') return 0
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(deg|grad|rad|turn)?$/i.exec(tok)
  if (!m) throw new ColorError(`cannot read hue "${tok}"`)
  const v = Number(m[1])
  switch ((m[2] ?? 'deg').toLowerCase()) {
    case 'grad': return v * 0.9
    case 'rad': return (v * 180) / Math.PI
    case 'turn': return v * 360
    default: return v
  }
}
function alphaOf(toks, legacy = false) {
  const slash = toks.indexOf('/')
  if (slash === -1) {
    if (legacy && toks.length === 4) return { comps: toks.slice(0, 3), a: clamp01(num(toks[3], 1, 'alpha')) }
    return { comps: toks, a: 1 }
  }
  return { comps: toks.slice(0, slash), a: clamp01(num(toks[slash + 1], 1, 'alpha')) }
}

function parseFunction(name, inner, scheme, depth) {
  const lower = name.toLowerCase()
  if (lower === 'light-dark') {
    const [light, dark] = splitTopLevelCommas(inner)
    return parse(scheme === 'dark' ? dark : light, scheme, depth + 1)
  }
  if (lower === 'color-mix') return parseMix(inner, scheme, depth)
  const toks = splitArgs(inner)
  if (toks[0] === 'from') throw new ColorError('relative colour syntax is not supported')
  if (/\b(calc|var|env|min|max|clamp)\(/.test(inner)) throw new ColorError(`unresolved function inside ${name}()`)
  const { comps, a } = alphaOf(toks, /^(rgba?|hsla?)$/.test(lower))
  if (lower === 'rgb' || lower === 'rgba') {
    const [r, g, b] = comps.map((t) => num(t, 255, 'channel'))
    return { space: 'srgb', c: [r / 255, g / 255, b / 255], a: a }
  }
  if (lower === 'hsl' || lower === 'hsla') return { space: 'hsl', c: [angle(comps[0]), num(comps[1], 1) / (comps[1].endsWith('%') ? 1 : 100), num(comps[2], 1) / (comps[2].endsWith('%') ? 1 : 100)], a }
  if (lower === 'hwb') return { space: 'hwb', c: [angle(comps[0]), num(comps[1], 1) / (comps[1].endsWith('%') ? 1 : 100), num(comps[2], 1) / (comps[2].endsWith('%') ? 1 : 100)], a }
  if (lower === 'oklab') return { space: 'oklab', c: [num(comps[0], 1), num(comps[1], 0.4), num(comps[2], 0.4)], a }
  if (lower === 'oklch') return { space: 'oklch', c: [num(comps[0], 1), num(comps[1], 0.4), angle(comps[2])], a }
  if (lower === 'lab') return { space: 'lab', c: [num(comps[0], 100), num(comps[1], 125), num(comps[2], 125)], a }
  if (lower === 'lch') return { space: 'lch', c: [num(comps[0], 100), num(comps[1], 150), angle(comps[2])], a }
  if (lower === 'color') {
    const space = comps[0]
    if (!SPACES[space] || !['srgb', 'srgb-linear', 'display-p3', 'xyz', 'xyz-d65', 'xyz-d50'].includes(space)) throw new ColorError(`unsupported colour space "${space}"`)
    return { space: space === 'xyz' ? 'xyz-d65' : space, c: comps.slice(1, 4).map((t) => num(t, 1)), a }
  }
  throw new ColorError(`unsupported colour function ${name}()`)
}

function parseMix(inner, scheme, depth) {
  const parts = splitTopLevelCommas(inner)
  const head = /^in\s+([a-z0-9-]+)(?:\s+(shorter|longer|increasing|decreasing)\s+hue)?$/i.exec(parts[0] ?? '')
  if (!head || parts.length !== 3) throw new ColorError('cannot read color-mix()')
  const space = head[1].toLowerCase()
  const hueMethod = (head[2] ?? 'shorter').toLowerCase()
  if (!SPACES[space] || space === 'xyz') throw new ColorError(`color-mix in "${space}" is not supported`)
  const items = parts.slice(1).map((p) => {
    const toks = topLevelWords(p)
    let pct = null
    if (toks.length > 1 && /^[\d.]+%$/.test(toks[toks.length - 1])) pct = parseFloat(toks.pop())
    else if (toks.length > 1 && /^[\d.]+%$/.test(toks[0])) pct = parseFloat(toks.shift())
    return { color: parse(toks.join(' '), scheme, depth + 1), pct }
  })
  let [p1, p2] = [items[0].pct, items[1].pct]
  if (p1 == null && p2 == null) [p1, p2] = [50, 50]
  else if (p1 == null) p1 = 100 - p2
  else if (p2 == null) p2 = 100 - p1
  const sum = p1 + p2
  if (sum <= 0) throw new ColorError('color-mix() percentages sum to 0')
  const alphaMult = sum < 100 ? sum / 100 : 1
  const w1 = p1 / sum
  const w2 = p2 / sum
  const A = convert(items[0].color, space)
  const B = convert(items[1].color, space)
  const hi = HUE_INDEX[space]
  const alpha = A.a * w1 + B.a * w2
  const out = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    if (i === hi) {
      let h1 = A.c[i]
      let h2 = B.c[i]
      const d = h2 - h1
      if (hueMethod === 'shorter') {
        if (d > 180) h2 -= 360
        else if (d < -180) h2 += 360
      } else if (hueMethod === 'longer') {
        if (d > 0 && d < 180) h2 -= 360
        else if (d > -180 && d <= 0) h2 += 360
      } else if (hueMethod === 'increasing') {
        if (d < 0) h2 += 360
      } else if (d > 0) h2 -= 360
      out[i] = (((h1 * w1 + h2 * w2) % 360) + 360) % 360
    } else {
      const v = A.c[i] * A.a * w1 + B.c[i] * B.a * w2
      out[i] = alpha === 0 ? 0 : v / alpha
    }
  }
  return { space, c: out, a: alpha * alphaMult }
}

function topLevelWords(s) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of s.trim()) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (depth === 0 && /\s/.test(ch)) {
      if (cur) out.push(cur)
      cur = ''
    } else cur += ch
  }
  if (cur) out.push(cur)
  return out
}

function parse(str, scheme, depth) {
  if (depth > 8) throw new ColorError('colour nested too deeply')
  const s = str.trim()
  if (!s) throw new ColorError('empty colour')
  const lower = s.toLowerCase()
  if (lower === 'transparent') return { space: 'srgb', c: [0, 0, 0], a: 0 }
  if (lower === 'currentcolor' || lower === 'inherit' || lower === 'initial' || lower === 'unset' || lower === 'revert') throw new ColorError(`"${s}" depends on context`)
  if (NAMED[lower]) return parse(NAMED[lower], scheme, depth + 1)
  if (s[0] === '#') {
    const hex = s.slice(1)
    if (!/^[0-9a-f]+$/i.test(hex) || ![3, 4, 6, 8].includes(hex.length)) throw new ColorError(`bad hex colour "${s}"`)
    const full = hex.length <= 4 ? [...hex].map((ch) => ch + ch).join('') : hex
    const v = [0, 2, 4, 6].map((i) => (full.length > i ? parseInt(full.slice(i, i + 2), 16) / 255 : 1))
    return { space: 'srgb', c: [v[0], v[1], v[2]], a: v[3] }
  }
  const m = /^([a-z-]+)\((.*)\)$/is.exec(s)
  if (!m) throw new ColorError(`not a colour: "${s.length > 60 ? s.slice(0, 57) + '...' : s}"`)
  return parseFunction(m[1], m[2], scheme, depth)
}

export function parseColor(str, { scheme = 'light' } = {}) {
  return parse(String(str), scheme, 0)
}

export function parseToSrgb(str, opts) {
  return toSrgb(parseColor(str, opts))
}

export const oklchToSrgb = (L, C, h) => toSrgb({ space: 'oklch', c: [L, C, h], a: 1 })
