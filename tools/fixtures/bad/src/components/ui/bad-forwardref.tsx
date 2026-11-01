import * as React from "react"

export const BadForwardRef = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(function BadForwardRef(props, ref) {
  return <div data-slot="bad-forward-ref" ref={ref} {...props} />
})
