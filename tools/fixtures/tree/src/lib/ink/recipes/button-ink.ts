import { hashSeed, mulberry32 } from "@/lib/ink/rng"
import { frame } from "@/lib/ink/recipes/_frame"

export function buttonRecipe(seed: string, w = 120, h = 40): { d: string; w: number; h: number } {
  return { d: frame(mulberry32(hashSeed(seed)), w, h), w, h }
}
