"use client"

import type { ArtDef } from "@/lib/ink/art/types"
import { drawSkeleton, memo } from "@/lib/ink/art-draw"
import { useEnsureInkDefs } from "@/lib/ink/react"
import { cn } from "@/lib/utils"

const MARKS = {
  google: {
    grid: 24,
    parts: [
      ["s", "M20.3 8.6 C18.8 5.2 15.4 3.5 12 3.9 C7.6 4.4 4.2 8.2 4.3 12.6 C4.4 17.2 7.9 20.6 12 20.5 C16.3 20.4 19.8 17.4 20 12.4", 1.15],
      ["s", "M12.2 12.5 L20.1 12.4", 1.1],
    ],
  },
} satisfies Record<string, ArtDef>

type BrandMarkName = keyof typeof MARKS

function BrandMark({ name, size = 16, className }: { name: BrandMarkName; size?: number; className?: string }) {
  useEnsureInkDefs()
  const res = memo(`auth-brand|${name}|${size}`, () => drawSkeleton(MARKS[name], size, name, { tone: "ui", kind: "icon", nib: 1.6 }))
  return (
    <svg
      data-ink="icon"
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${res.w} ${res.h}`}
      width={size}
      height={size}
      className={cn("pointer-events-none shrink-0 overflow-visible", className)}
      dangerouslySetInnerHTML={{ __html: res.svg }}
    />
  )
}

export { BrandMark }
export type { BrandMarkName }
