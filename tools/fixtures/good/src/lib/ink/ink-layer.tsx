import * as React from "react"

import { wobblyBox, PENS } from "@/lib/ink/art"

export interface InkLayerProps extends React.ComponentProps<"svg"> {
  kind?: string
  seed?: string
  width?: number
  height?: number
}

export function InkLayer({ kind = "border", seed, width = 120, height = 40, className, ...props }: InkLayerProps) {
  const fallback = React.useId()
  const d = wobblyBox(width, height, seed ?? fallback)
  return (
    <svg
      data-ink={kind}
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      className={["pointer-events-none absolute inset-0 size-full overflow-visible", className].filter(Boolean).join(" ")}
      {...props}
    >
      <path d={d} fill="none" stroke={PENS.felt} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  )
}
