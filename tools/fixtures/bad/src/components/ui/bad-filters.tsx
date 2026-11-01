import * as React from "react"

export function BadFilters(props: React.ComponentProps<"svg">) {
  return (
    <svg data-slot="bad-filters" aria-hidden="true" {...props}>
      <filter id="rough">
        <feTurbulence baseFrequency="0.02" />
      </filter>
    </svg>
  )
}
