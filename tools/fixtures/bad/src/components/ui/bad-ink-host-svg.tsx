"use client"

import * as React from "react"

import { useInk } from "@/lib/ink/react"
import { fakeButtonRecipe } from "@/lib/ink/recipes/fake-button-ink"
import { cn } from "@/lib/utils"

export function BadInkHostSvg({ className, children, ...props }: React.ComponentProps<"button">) {
  const { hostRef, hostProps, node } = useInk({ recipe: fakeButtonRecipe, params: {}, kind: "button" })
  return (
    <button
      data-slot="bad-ink-host-svg"
      ref={hostRef}
      {...hostProps}
      className={cn(
        "relative isolate inline-flex items-center gap-2 [&_svg:not([class*='size-'])]:size-4 has-[>svg]:px-3",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not(.absolute)]:size-4 has-[>svg:not(.absolute)]:px-2",
        className
      )}
      {...props}
    >
      {node}
      {children}
    </button>
  )
}
