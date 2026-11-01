"use client"

import type { ArtDef } from "@/lib/ink/art/types"
import { drawSkeleton, memo } from "@/lib/ink/art-draw"
import { useEnsureInkDefs } from "@/lib/ink/react"
import { cn } from "@/lib/utils"

const MARKS = {
  apple: {
    grid: 24,
    parts: [
      ["s", "M12 8.2 C10.6 7.1 7.5 7.4 6.5 10.3 C5.6 13 6.8 16.6 8.4 18.7 C9.4 20 10.7 19.5 12 19 C13.3 19.5 14.6 20.2 15.7 18.8 C17.3 16.8 18.1 15.3 18.3 14.5 C16.3 13.6 15.9 10.7 17.8 9.3 C16.4 7.3 13.6 7 12 8.2", 1.05],
      ["s", "M12.1 7.8 C12 6.1 13.1 4.7 14.9 4.3", 1],
    ],
  },
  google: {
    grid: 24,
    parts: [
      ["s", "M20.3 8.6 C18.8 5.2 15.4 3.5 12 3.9 C7.6 4.4 4.2 8.2 4.3 12.6 C4.4 17.2 7.9 20.6 12 20.5 C16.3 20.4 19.8 17.4 20 12.4", 1.15],
      ["s", "M12.2 12.5 L20.1 12.4", 1.1],
    ],
  },
  github: {
    grid: 24,
    parts: [
      ["s", "M6.3 3.9 C8 4 9.3 5 10.1 5.8 C11.4 5.5 12.7 5.5 14 5.8 C14.8 5 16.1 4 17.8 3.9 C18.4 5.2 18.4 6.6 18 7.8 C19.3 9 19.8 10.8 19.6 12.6 C19.2 16.6 15.9 19.1 12 19 C8.1 18.9 4.8 16.6 4.5 12.6 C4.3 10.8 4.8 9 6.1 7.8 C5.7 6.6 5.7 5.2 6.3 3.9", 1.1],
      ["s", "M9.9 19 C9.3 20.3 8 20.9 6.7 20.5", 0.95],
      ["s", "M14.3 19 C15 20.4 16.4 20.9 17.9 20.3", 0.95],
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
