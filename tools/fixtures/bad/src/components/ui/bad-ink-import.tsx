import * as React from "react"

import { box } from "@/lib/ink/shapes"
import { bandFill } from "@/lib/ink/fills"
import { Ink } from "@/lib/ink/builder"
import { hashSeed } from "@/lib/ink/rng"
import { fakeButtonRecipe } from "@/lib/ink/recipes/fake-button"

export function BadInkImport(props: React.ComponentProps<"span">) {
  void [box, bandFill, Ink, hashSeed, fakeButtonRecipe]
  return <span data-slot="bad-ink-import" {...props} />
}
