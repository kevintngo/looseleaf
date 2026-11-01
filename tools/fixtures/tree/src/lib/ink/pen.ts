import { mulberry32, hashSeed } from "./rng"
import { feltWidth } from "./strokes/felt"

export function penWidth(seed: string): number {
  return feltWidth(mulberry32(hashSeed(seed)))
}

export function wobblyLine(seed: string, w: number, h: number, steps = 6): string {
  const rand = mulberry32(hashSeed(seed))
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const x = (w / steps) * i
    const y = h / 2 + (rand() - 0.5) * h * 0.4
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return pts.join(" ")
}
