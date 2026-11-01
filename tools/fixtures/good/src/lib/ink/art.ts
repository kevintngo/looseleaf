import { hashSeed, mulberry32 } from "@/lib/ink/rng"

export const PENS = {
  felt: "#2a2420",
  marker: "#e0784b",
  highlighter: "rgba(245, 223, 107, 0.6)",
} as const

export function wobblyBox(width: number, height: number, seed: string): string {
  const rnd = mulberry32(hashSeed(seed))
  const j = () => (rnd() - 0.5) * 2.4
  const r = (n: number) => Math.round(n * 100) / 100
  const p = [
    [1 + j(), 1 + j()],
    [width - 1 + j(), 1 + j()],
    [width - 1 + j(), height - 1 + j()],
    [1 + j(), height - 1 + j()],
  ]
  return `M ${r(p[0][0])} ${r(p[0][1])} L ${r(p[1][0])} ${r(p[1][1])} L ${r(p[2][0])} ${r(p[2][1])} L ${r(p[3][0])} ${r(p[3][1])} Z`
}

export const GRAIN_DEFS = `<filter id="ll-grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" /></filter>`
