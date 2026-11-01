import type { CSSProperties } from "react"
import { contrast, evalExpr, parseHex, toHex } from "./colour-math"
import { ALIASES, CONTRAST, FOREST, T0 } from "./data.generated"
import type { ContrastRow, Expr } from "./data-types"

export interface TokenSpec {
  token: string
  label: string
  note: string
}

export interface TokenGroup {
  id: string
  title: string
  essential: boolean
  tokens: readonly TokenSpec[]
}

const t = (token: string, label: string, note: string): TokenSpec => ({ token, label, note })

export const TOKEN_GROUPS: readonly TokenGroup[] = [
  {
    id: "table",
    title: "Desk and paper",
    essential: true,
    tokens: [
      t("--ll-desk", "Desk", "the blotter everything lies on"),
      t("--ll-paper", "Paper", "cards, dialogs, the main sheet"),
      t("--ll-paper-shade", "Paper shade", "code chips, muted fills"),
      t("--ll-slip", "Slip", "menus, popovers, tooltips"),
      t("--ll-card", "Index card", "index-card stock"),
      t("--ll-kraft", "Kraft", "envelopes, stitched borders"),
    ],
  },
  {
    id: "inks",
    title: "Inks",
    essential: true,
    tokens: [
      t("--ll-ink", "Ink", "body text, the system's voice"),
      t("--ll-ink-soft", "Ink, soft", "secondary text on the desk"),
      t("--ll-ink-muted", "Ink, muted", "descriptions and hints"),
      t("--ll-ink-you", "Blue felt", "links, typed input, focus"),
      t("--ll-red", "Red pencil", "errors and danger"),
      t("--ll-green", "Green pencil", "ok and added"),
    ],
  },
  {
    id: "marks",
    title: "Marker and highlighter",
    essential: true,
    tokens: [
      t("--ll-marker", "Marker", "the primary action"),
      t("--ll-hi", "Highlighter", "emphasis, selection, hover"),
      t("--ll-hi-deep", "Highlighter, deep", "the highlighter as a mark that must be seen"),
      t("--chart-1", "Chart series 1", "follows the marker until you set it"),
    ],
  },
  {
    id: "more-surfaces",
    title: "More stocks and rules",
    essential: false,
    tokens: [
      t("--ll-desk-deep", "Desk, deep", "vignette and desk edges"),
      t("--ll-graph", "Graph paper", "graph and dot-grid stocks"),
      t("--ll-check", "Guest check", "ledger green"),
      t("--ll-pad", "Order pad", "the sidebar"),
      t("--ll-photo", "Photo", "polaroid border, sticker border"),
      t("--ll-rule-blue", "Blue rule", "index-card ruling"),
      t("--ll-rule-red", "Red rule", "index-card header line"),
      t("--ll-pad-rule", "Pad rule", "sidebar ruling"),
      t("--ll-check-rule", "Ledger rule", "ledger ruling"),
    ],
  },
  {
    id: "more-inks",
    title: "More inks",
    essential: false,
    tokens: [
      t("--ll-pencil", "Pencil", "drawn meta marks, large text"),
      t("--ll-pencil-text", "Pencil, text", "graphite that is safe as small text"),
      t("--ll-pencil-mark", "Pencil, line", "borders and hairlines, never text"),
      t("--ll-orange-text", "Orange text", "working and warm status text"),
      t("--ll-focus", "Focus", "the drawn focus ring"),
      t("--ll-link-hover", "Link, hover", "the darker blue"),
      t("--ll-check-ink", "Ledger print", "ink printed on the ledger"),
      t("--ll-check-no", "Ledger no", "the red printed on the ledger"),
    ],
  },
  {
    id: "stickies",
    title: "Sticky notes",
    essential: false,
    tokens: [
      t("--ll-sticky-yellow", "Yellow", "the classic"),
      t("--ll-sticky-green", "Green", "sage sticky"),
      t("--ll-sticky-orange", "Orange", "apricot sticky"),
      t("--ll-sticky-pink", "Pink", "salmon sticky"),
      t("--ll-sticky-blue", "Blue", "powder-blue sticky"),
    ],
  },
  {
    id: "accents",
    title: "Stationery accents",
    essential: false,
    tokens: ["tomato", "tangerine", "lemon", "grass", "teal", "sky", "grape", "bubblegum"].map((n) => t(`--ll-${n}`, n, "decoration only: stickers, washi, badges, chart fills")),
  },
]

export const ALL_TOKENS: readonly TokenSpec[] = TOKEN_GROUPS.flatMap((g) => g.tokens)

export interface KnobSpec {
  token: string
  label: string
  min: number
  max: number
  step: number
  unit: string
  engine?: "wobble" | "misreg" | "width"
  note: string
}

export const KNOBS: readonly KnobSpec[] = [
  { token: "--ll-wobble", label: "Wobble", min: 0, max: 2, step: 0.05, unit: "", engine: "wobble", note: "How unsteady the hand is. 0 is a ruler." },
  { token: "--ll-stroke-fine", label: "Pen weight", min: 0.8, max: 3, step: 0.05, unit: "", engine: "width", note: "Every pen's width scales with this (1.7 is Notebook)." },
  { token: "--ll-misreg-k", label: "Misregistration", min: 0, max: 2.5, step: 0.05, unit: "", engine: "misreg", note: "How far fills miss their outlines." },
  { token: "--ll-shadow-k", label: "Shadow strength", min: 0, max: 3, step: 0.05, unit: "", note: "Multiplies every shadow. A dark theme needs about 2.5." },
  { token: "--ll-tilt-max", label: "Largest tilt", min: 0, max: 4, step: 0.1, unit: "deg", note: "No sheet turns further than this." },
]

export type KnobValues = Record<string, number>

export const KNOB_DEFAULTS: KnobValues = { "--ll-wobble": 1, "--ll-stroke-fine": 1.7, "--ll-misreg-k": 1, "--ll-shadow-k": 1, "--ll-tilt-max": 2 }

export interface ThemeState {
  colours: Record<string, string>
  knobs: KnobValues
}

export const EMPTY_THEME: ThemeState = { colours: {}, knobs: { ...KNOB_DEFAULTS } }

export function baseColour(token: string): string {
  if (token === "--chart-1") return T0["--ll-marker"] ?? "#000000"
  return T0[token] ?? "#000000"
}

export function effectiveColours(state: ThemeState): Record<string, string> {
  return { ...T0, ...state.colours }
}

export function colourOf(state: ThemeState, token: string): string {
  const own = state.colours[token]
  if (own) return own
  if (token === "--chart-1") return state.colours["--ll-marker"] ?? baseColour("--ll-marker")
  return baseColour(token)
}

export function normaliseHex(text: string): string | null {
  const c = parseHex(text.trim().startsWith("#") ? text.trim() : `#${text.trim()}`)
  return c ? toHex(c) : null
}

export function setColour(state: ThemeState, token: string, hex: string): ThemeState {
  const next = { ...state.colours }
  if (hex.toLowerCase() === baseColour(token).toLowerCase() && token !== "--chart-1") delete next[token]
  else next[token] = hex.toLowerCase()
  return { ...state, colours: next }
}

export function clearColour(state: ThemeState, token: string): ThemeState {
  const next = { ...state.colours }
  delete next[token]
  return { ...state, colours: next }
}

export function setShade(state: ThemeState, hex: string): ThemeState {
  const triplet = shadeFromHex(hex)
  const next = { ...state.colours }
  if (triplet === T0["--ll-shade"]) delete next["--ll-shade"]
  else next["--ll-shade"] = triplet
  return { ...state, colours: next }
}

export const setKnob = (state: ThemeState, token: string, value: number): ThemeState => ({ ...state, knobs: { ...state.knobs, [token]: value } })

export function shadeHex(state: ThemeState): string {
  const raw = state.colours["--ll-shade"] ?? T0["--ll-shade"] ?? "58 44 30"
  const [r = 58, g = 44, b = 30] = raw.split(/\s+/).map(Number)
  return toHex({ r, g, b })
}

export function shadeFromHex(hex: string): string {
  const c = parseHex(hex)
  return c ? `${c.r} ${c.g} ${c.b}` : "58 44 30"
}

export function scopeStyle(state: ThemeState): CSSProperties {
  const style: Record<string, string> = {}
  for (const [k, v] of Object.entries(state.colours)) style[k] = v
  for (const k of KNOBS) {
    const v = state.knobs[k.token] ?? KNOB_DEFAULTS[k.token]
    if (v !== KNOB_DEFAULTS[k.token]) style[k.token] = `${v}${k.unit}`
  }
  return style as CSSProperties
}

export function engineKnobs(state: ThemeState): { wobble: number; misreg: number; width: number } {
  const v = (k: string) => state.knobs[k] ?? KNOB_DEFAULTS[k]!
  return { wobble: v("--ll-wobble"), misreg: v("--ll-misreg-k"), width: v("--ll-stroke-fine") / 1.7 }
}

export interface LivePair {
  row: ContrastRow
  ratio: number
  fgHex: string
  bgHex: string
  status: "ok" | "warn" | "fail"
  tokens: string[]
}

export function tokensOf(expr: Expr, own: Readonly<Record<string, string>> = {}, out: string[] = []): string[] {
  if (typeof expr === "string") {
    if (expr.startsWith("#")) return out
    out.push(expr)
    const follows = ALIASES[expr]
    if (follows && own[expr] === undefined) tokensOf(follows, own, out)
  } else {
    tokensOf(expr[0], own, out)
    tokensOf(expr[2], own, out)
  }
  return out
}

export function evaluatePairs(state: ThemeState): LivePair[] {
  const colours = effectiveColours(state)
  const out: LivePair[] = []
  for (const row of CONTRAST) {
    if (!row.live) continue
    const fg = evalExpr(row.live.fg, colours, ALIASES)
    const bg = evalExpr(row.live.bg, colours, ALIASES)
    if (!fg || !bg) continue
    const fgHex = toHex(fg)
    const bgHex = toHex(bg)
    const ratio = contrast(fgHex, bgHex)
    const status = ratio + 1e-9 >= row.min ? "ok" : row.level === "warn" ? "warn" : "fail"
    out.push({ row, ratio, fgHex, bgHex, status, tokens: [...new Set([...tokensOf(row.live.fg, state.colours), ...tokensOf(row.live.bg, state.colours)])] })
  }
  return out
}

export function problemsByToken(pairs: readonly LivePair[]): Map<string, LivePair[]> {
  const map = new Map<string, LivePair[]>()
  for (const p of pairs) {
    if (p.status !== "fail") continue
    for (const tok of p.tokens) map.set(tok, [...(map.get(tok) ?? []), p])
  }
  return map
}

export function themeCss(name: string, state: ThemeState): string {
  const order = [...ALL_TOKENS.map((s) => s.token), "--ll-shade", ...KNOBS.map((k) => k.token)]
  const lines: string[] = []
  for (const token of order) {
    const colour = state.colours[token]
    if (colour) lines.push(`  ${token}: ${colour};`)
    else {
      const knob = KNOBS.find((k) => k.token === token)
      const v = state.knobs[token]
      if (knob && v !== undefined && v !== KNOB_DEFAULTS[token]) lines.push(`  ${token}: ${v}${knob.unit};`)
    }
  }
  return lines.length ? `[data-theme="${name}"] {\n${lines.join("\n")}\n}` : `[data-theme="${name}"] {\n  /* nothing overridden yet: this is Notebook */\n}`
}

export function forestAfter(count: number): ThemeState {
  const colours: Record<string, string> = {}
  for (const step of FOREST.steps.slice(0, count)) for (const [k, v] of Object.entries(step.decls)) colours[k] = v
  const knobs = { ...KNOB_DEFAULTS }
  if (count >= FOREST.steps.length) knobs["--ll-wobble"] = FOREST.knobs.wobble
  return { colours, knobs }
}
