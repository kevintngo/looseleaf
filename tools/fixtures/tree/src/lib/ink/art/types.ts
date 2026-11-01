import type { mulberry32 } from "@/lib/ink/rng"

type Rng = ReturnType<typeof mulberry32>

export type Part = readonly (string | number)[]

export interface ArtDef {
  grid: number
  parts: readonly Part[]
  small?: readonly Part[]
}

export function defineArt<T extends Record<string, ArtDef>>(defs: T, _rng?: Rng): T {
  return defs
}
