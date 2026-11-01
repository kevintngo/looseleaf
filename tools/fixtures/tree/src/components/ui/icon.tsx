import * as React from "react"

import { cn } from "@/lib/utils"
import { marks } from "@/lib/ink/art/icons"

type IconName = keyof typeof marks

function Icon({ name, size = 24, className, ...props }: Omit<React.ComponentProps<"svg">, "name"> & { name: IconName; size?: number }) {
  const def = marks[name]
  return (
    <svg
      data-slot="icon"
      data-ink="icon"
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${def.grid} ${def.grid}`}
      width={size}
      height={size}
      className={cn("inline-block shrink-0 text-ink", className)}
      {...props}
    >
      {def.parts.map((part, i) => (
        <path key={i} d={String(part[1])} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      ))}
    </svg>
  )
}

export { Icon }
export type { IconName }
