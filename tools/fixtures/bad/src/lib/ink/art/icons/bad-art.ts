import { defineIcons } from "@/lib/ink/art/types"
import { Ink } from "@/lib/ink/builder"
import type { ArtDef } from "@/lib/ink/art/types"

const jitter = Math.random()

export const bad = defineIcons({
  bad: { grid: 24, parts: [["f", "#e8483a", "M 4 4 L 20 4 L 20 20 Z"], ["d", 12 + jitter, 12, 2]] },
  worse: { grid: 24, parts: [["s", "M 4 4 L 20 20"]] } satisfies ArtDef,
}) as unknown as { ink: typeof Ink }
