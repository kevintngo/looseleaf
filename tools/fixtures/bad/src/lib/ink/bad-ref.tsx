import * as React from "react"

export const InkRef = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>(function InkRef(props, ref) {
  return <svg data-ink="border" aria-hidden="true" focusable="false" ref={ref} {...props} />
})
