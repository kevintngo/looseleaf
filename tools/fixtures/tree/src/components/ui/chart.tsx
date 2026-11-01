import * as React from "react"

import { cn } from "@/lib/utils"
import { linear } from "@/lib/ink/charts/scale"
import { hashSeed } from "@/lib/ink/rng"

function Chart({ values, className, ...props }: React.ComponentProps<"svg"> & { values: number[] }) {
  const id = React.useId()
  const y = linear([0, Math.max(1, ...values)], [40, 0])
  const d = values.map((v, i) => `${i ? "L" : "M"} ${i * 10} ${y(v)}`).join(" ")
  return (
    <svg data-slot="chart" data-ink="chart" aria-hidden="true" focusable="false" viewBox="0 0 100 40" className={cn("h-24 w-full text-ink", className)} data-seed={hashSeed(id)} {...props}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  )
}

export { Chart }
