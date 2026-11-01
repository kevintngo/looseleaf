import { hashSeed, mulberry32 } from "@/lib/ink/rng"
import { frame } from "@/lib/ink/recipes/_frame"

export function tooltipRecipe(seed: string): { d: string } {
  return { d: frame(mulberry32(hashSeed(seed)), 80, 28) }
}
