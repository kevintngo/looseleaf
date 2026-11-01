import * as React from "react"

import { hashSeed, mulberry32 } from "@/lib/ink/rng"

export function useTilt(seed: string, limit = 1.2): number {
  return React.useMemo(() => (mulberry32(hashSeed(seed))() - 0.5) * 2 * limit, [seed, limit])
}
