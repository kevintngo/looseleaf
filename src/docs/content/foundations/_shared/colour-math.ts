import type { Expr } from "./data-types"

export interface RGB {
  r: number
  g: number
  b: number
}

export function parseHex(text: string): RGB | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim())
  if (!m) return null
  const h = m[1]!.length === 3 ? [...m[1]!].map((c) => c + c).join("") : m[1]!
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

const byte = (v: number) => Math.max(0, Math.min(255, Math.round(v + 1e-6)))

export function toHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((v) => byte(v).toString(16).padStart(2, "0")).join("")}`
}

const lin = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function luminance({ r, g, b }: RGB): number {
  return 0.2126 * lin(byte(r)) + 0.7152 * lin(byte(g)) + 0.0722 * lin(byte(b))
}

export function contrast(fg: string, bg: string): number {
  const a = parseHex(fg)
  const b = parseHex(bg)
  if (!a || !b) return Number.NaN
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export function mix(a: RGB, pct: number, b: RGB): RGB {
  const t = pct / 100
  return { r: a.r * t + b.r * (1 - t), g: a.g * t + b.g * (1 - t), b: a.b * t + b.b * (1 - t) }
}

export function evalExpr(expr: Expr, colours: Readonly<Record<string, string>>, aliases: Readonly<Record<string, Expr>> = {}, depth = 0): RGB | null {
  if (depth > 8) return null
  if (typeof expr === "string") {
    if (expr.startsWith("#")) return parseHex(expr)
    const own = colours[expr]
    if (own !== undefined) return parseHex(own)
    const follows = aliases[expr]
    return follows ? evalExpr(follows, colours, aliases, depth + 1) : null
  }
  const a = evalExpr(expr[0], colours, aliases, depth + 1)
  const b = evalExpr(expr[2], colours, aliases, depth + 1)
  return a && b ? mix(a, expr[1], b) : null
}

export type Grade = "AAA" | "AA" | "AA large" | "fail"

export function grade(ratio: number): Grade {
  if (!(ratio >= 3)) return "fail"
  if (ratio >= 7) return "AAA"
  if (ratio >= 4.5) return "AA"
  return "AA large"
}

export const formatRatio = (ratio: number | null | undefined): string => (ratio === null || ratio === undefined || Number.isNaN(ratio) ? "n/a" : `${ratio.toFixed(2)} : 1`)
