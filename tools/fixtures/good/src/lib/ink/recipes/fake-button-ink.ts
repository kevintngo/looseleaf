import { hashSeed, mulberry32 } from "@/lib/ink/rng"

export interface FakeButtonInk {
  svg: string
  w: number
  h: number
  pad: number
  layers: string[]
}

export function fakeButtonRecipe(w: number, h: number, seed: string): FakeButtonInk {
  const rnd = mulberry32(hashSeed(seed))
  const j = () => Math.round((rnd() - 0.5) * 30) / 10
  const d = `M ${1 + j()} ${1 + j()} L ${w - 1 + j()} ${1 + j()} L ${w - 1 + j()} ${h - 1 + j()} L ${1 + j()} ${h - 1 + j()} Z`
  const rest = `<path d="${d}" fill="none" stroke="var(--ll-ink)" stroke-width="1.6"/>`
  const hover = `<path d="M 2 ${h + 2} L ${w - 2} ${h + 2}" stroke="var(--ll-pencil)" stroke-width="1.2"/>`
  return { svg: `<g data-layer="rest">${rest}</g><g data-layer="hover">${hover}</g>`, w, h, pad: 8, layers: ["rest", "hover"] }
}

export function smooth(values: number[], window = 3): number[] {
  return values.map((v, i) => (v + (values[i + 1] ?? v)) / window)
}
