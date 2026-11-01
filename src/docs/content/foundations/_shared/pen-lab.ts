import { Ink } from "@/lib/ink/builder"
import { hatch } from "@/lib/ink/fills"
import { paint } from "@/lib/ink/paint"
import { stroke as penStroke } from "@/lib/ink/pen"
import { PENS } from "@/lib/ink/pens"
import { makeRng } from "@/lib/ink/rng"
import { box, check, line, underline } from "@/lib/ink/shapes"
import type { PenName, Pt, StrokeOpts, Tier } from "@/lib/ink/types"
import type { Drawn } from "./ink-picture"

export type PenGroup = "felt" | "pencil" | "marker" | "accent-marker" | "accent-felt"

export interface PenRow {
  name: PenName
  group: PenGroup
  label: string
  colour: string
  kind: string
  width: number
  alpha: number
  grain: string
}

const LABELS: Record<string, string> = {
  ink: "Felt tip, brown-black",
  blue: "Felt tip, blue",
  redfelt: "Felt tip, red",
  greenfelt: "Felt tip, green",
  focus: "Felt tip, focus blue",
  pencil: "Graphite pencil",
  red: "Red pencil",
  green: "Green pencil",
  orange: "Orange pencil",
  bluepencil: "Blue pencil",
  terracotta: "Terracotta marker",
  hi: "Yellow highlighter",
}

const KIND_WORD: Record<string, string> = { felt: "felt tip", pencil: "pencil", marker: "marker", hl: "highlighter" }

function row(name: PenName, group: PenGroup, label: string): PenRow {
  const spec = PENS[name]
  return { name, group, label, colour: spec.color, kind: KIND_WORD[spec.kind] ?? spec.kind, width: spec.W, alpha: spec.alpha, grain: spec.grain }
}

const ACCENTS = ["tomato", "tangerine", "lemon", "grass", "teal", "sky", "grape", "bubblegum"] as const

export function penRows(): PenRow[] {
  const felts: PenName[] = ["ink", "blue", "redfelt", "greenfelt", "focus"]
  const pencils: PenName[] = ["pencil", "red", "green", "orange", "bluepencil"]
  return [
    ...felts.map((n) => row(n, "felt", LABELS[n]!)),
    ...pencils.map((n) => row(n, "pencil", LABELS[n]!)),
    ...(["terracotta", "hi"] as const).map((n) => row(n, "marker", LABELS[n]!)),
    ...ACCENTS.map((a) => row(`m_${a}`, "accent-marker", `${a[0]!.toUpperCase()}${a.slice(1)} marker`)),
    ...ACCENTS.map((a) => row(`f_${a}`, "accent-felt", `${a[0]!.toUpperCase()}${a.slice(1)} felt tip`)),
  ]
}

export const hasWeights = (name: PenName): boolean => !/^(terracotta|hi|m_|f_)/.test(name) && !name.includes(".")

export function waveLine(w: number, h: number): Pt[] {
  const m = Math.min(10, w * 0.06)
  return [
    [m, h * 0.62],
    [w * 0.2, h * 0.26],
    [w * 0.38, h * 0.72],
    [w * 0.56, h * 0.28],
    [w * 0.74, h * 0.7],
    [w - m, h * 0.4],
  ]
}

export function labLines(w: number, h: number): Pt[][] {
  const m = 14
  return [
    [
      [m, h * 0.58],
      [w * 0.13, h * 0.22],
      [w * 0.27, h * 0.7],
      [w * 0.4, h * 0.2],
      [w * 0.55, h * 0.66],
      [w * 0.68, h * 0.24],
      [w * 0.82, h * 0.62],
      [w - m, h * 0.3],
    ],
    [
      [m + 10, h * 0.9],
      [w * 0.4, h * 0.87],
      [w - m - 14, h * 0.91],
    ],
  ]
}

const PAD = 10

function finish(ink: Ink, w: number, h: number, pad = PAD): Drawn {
  const res = ink.toSvg({ w, h, pad })
  return { svg: res.svg, w: res.w, h: res.h, pad: res.pad }
}

export function drawSample(pen: PenName, o: { w?: number; h?: number; tier?: Tier; seed?: string } = {}): Drawn {
  const w = o.w ?? 168
  const h = o.h ?? 40
  const ink = new Ink(o.seed ?? `pen-table:${pen}`, { tier: o.tier ?? "lo" })
  ink.stroke(waveLine(w, h), pen)
  return finish(ink, w, h)
}

export interface LabParams {
  pen: PenName
  seed: number
  tier: Tier
  speed: number
  wobble: number
  width: number
  pressure: number
  dry: number
  start: "pool" | "soft"
  end: "pool" | "flick" | "soft"
}

export const LAB_DEFAULTS: LabParams = { pen: "ink.brush", seed: 3, tier: "hi", speed: 1, wobble: 1, width: 1, pressure: 0, dry: 1, start: "pool", end: "flick" }
export const LAB_W = 440
export const LAB_H = 150

export const pressureProfile = (pressure: number) => (t: number): number => 1 + pressure * (1 - Math.abs(2 * t - 1))

function labOpts(p: LabParams): StrokeOpts {
  const o: StrokeOpts = { speed: p.speed, wobble: p.wobble, width: p.width, dry: p.dry, start: p.start, end: p.end }
  if (p.pressure !== 0) o.press = pressureProfile(p.pressure)
  return o
}

export function drawLab(p: LabParams): Drawn {
  const ink = new Ink(`pen-lab:${p.seed}`, { tier: p.tier })
  for (const pts of labLines(LAB_W, LAB_H)) ink.stroke(pts, p.pen, labOpts(p))
  return finish(ink, LAB_W, LAB_H, 14)
}

export function labCode(p: LabParams): string {
  const opts: string[] = []
  if (p.speed !== 1) opts.push(`speed: ${p.speed}`)
  if (p.wobble !== 1) opts.push(`wobble: ${p.wobble}`)
  if (p.width !== 1) opts.push(`width: ${p.width}`)
  if (p.dry !== 1) opts.push(`dry: ${p.dry}`)
  if (p.start !== "pool") opts.push(`start: "${p.start}"`)
  if (p.end !== "flick") opts.push(`end: "${p.end}"`)
  if (p.pressure !== 0) opts.push(`press: (t) => 1 + ${p.pressure} * (1 - Math.abs(2 * t - 1))`)
  const arg = opts.length ? `, { ${opts.join(", ")} }` : ""
  return [`import { Ink } from "@/lib/ink"`, ``, `const ink = new Ink("hello", { tier: "${p.tier}" })`, `ink.stroke(points, "${p.pen}"${arg})`, `const { svg, w, h, pad } = ink.toSvg({ w: ${LAB_W}, h: ${LAB_H}, pad: 14 })`].join("\n")
}

export interface ExplodedLayer {
  kind: string
  d: string
  fill: string
  opacity: number
  evenodd: boolean
}

export interface Exploded {
  w: number
  h: number
  pad: number
  layers: ExplodedLayer[]
  centre: string
  points: Pt[]
}

export const LAYER_STORY: Record<string, string> = {
  halo: "The stain: ink wicking a hair beyond the tip. Faint, wide, soft.",
  hair: "Capillary hairs where the felt bleeds along the paper fibres (hi tier).",
  body: "The line itself: a variable-width ribbon that swells where the hand slows and on down-strokes.",
  core: "The wet core: a darker, narrower ribbon down the middle, where the tip pressed hardest.",
  pool: "Pools where the pen landed and where it lifted: a felt tip always leaves a blot at the start.",
  smear: "Graphite dragged sideways: the film around a pencil line.",
  rim: "The dried rim of a marker: pigment collects at the edge of a wet stripe.",
  streak: "Streaks along the pull of a marker or highlighter nib.",
}

export function explodeStroke(o: { pen: PenName; seed: string; tier: Tier; w?: number; h?: number; opts?: StrokeOpts }): Exploded {
  const w = o.w ?? 260
  const h = o.h ?? 74
  const pts = waveLine(w, h)
  const res = penStroke(pts, o.pen, makeRng(o.seed), { tier: o.tier, ...o.opts })
  return {
    w,
    h,
    pad: PAD,
    layers: res.layers.map((l) => ({ kind: l.k, d: l.d, fill: paint(l.fill), opacity: l.op, evenodd: l.rule === "evenodd" })),
    centre: pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" "),
    points: pts,
  }
}

export function drawEnds(o: { pen: PenName; start: "pool" | "soft"; end: "pool" | "flick" | "soft"; seed?: string; tier?: Tier }): Drawn {
  const w = 190
  const h = 54
  const ink = new Ink(o.seed ?? "ends", { tier: o.tier ?? "hi" })
  ink.stroke(
    [
      [14, h * 0.72],
      [w * 0.35, h * 0.3],
      [w * 0.65, h * 0.66],
      [w - 16, h * 0.34],
    ],
    o.pen,
    { start: o.start, end: o.end, wobble: 0.8 },
  )
  return finish(ink, w, h)
}

export function drawHierarchy(mode: "flat" | "layered", seed = "hierarchy"): Drawn {
  const w = 230
  const h = 132
  const layered = mode === "layered"
  const ink = new Ink(`${seed}:${mode}`, { tier: "hi" })
  box(ink, 0, 0, w, h, { pen: "ink", corner: 3 })
  underline(ink, 16, 38, 112, { pen: layered ? "blue.brush" : "blue" })
  for (let i = 0; i < 3; i++) line(ink, 16, 62 + i * 20, w - 18 - i * 26, 62 + i * 20, { pen: layered ? "pencil.fine" : "pencil" })
  check(ink, w - 46, 14, 22, { pen: layered ? "greenfelt.brush" : "greenfelt" })
  return finish(ink, w, h)
}

export function drawHatch(tones: 1 | 2 | 3, seed = "hatch"): Drawn {
  const w = 96
  const h = 64
  const ink = new Ink(`${seed}:${tones}`, { tier: "lo" })
  hatch(ink, [0, 0, w, h], { pen: "red", angle: 58, gap: 5, tones })
  box(ink, 0, 0, w, h, { pen: "red.fine", corner: 3 })
  return finish(ink, w, h)
}

export function drawCrossing(seed = "crossing"): Drawn {
  const w = 190
  const h = 96
  const ink = new Ink(seed, { tier: "hi" })
  ink.stroke([[10, 38], [w * 0.4, 30], [w - 12, 40]], "hi", { wobble: 0.6 })
  ink.stroke([[w * 0.5, 8], [w * 0.52, h * 0.5], [w * 0.49, h - 8]], "m_sky", { wobble: 0.6 })
  return finish(ink, w, h, 14)
}
