import { hashSeed, mulberry32 } from "@/lib/ink/rng"
import { frame } from "@/lib/ink/recipes/_frame"

export function cardRecipe(seed: string, w = 320, h = 200): { d: string } {
  return { d: frame(mulberry32(hashSeed(`card:${seed}`)), w, h) }
}
