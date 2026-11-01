"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { penWidth, wobblyLine } from "./pen"
import { feltWidth } from "@/lib/ink/strokes/felt"
import { grainTile } from "@/lib/ink/textures.generated"
import { paperTile } from "@/lib/ink/textures-paper.generated"

type InkProps = React.ComponentProps<"svg"> & { seed?: string }

export function Ink({ seed, className, ...props }: InkProps) {
  const id = React.useId()
  const d = wobblyLine(seed ?? id, 100, 6)
  return (
    <svg
      aria-hidden="true"
      data-slot="ink"
      viewBox="0 0 100 6"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-1.5 w-full", className)}
      style={{ backgroundImage: `url(${grainTile}), url(${paperTile})` }}
      {...props}
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth={penWidth(seed ?? id) + feltWidth(() => 0.5, 0)} strokeLinecap="round" />
    </svg>
  )
}
