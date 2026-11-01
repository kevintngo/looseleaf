import * as React from "react"

export function Suppressed(props: React.ComponentProps<"div">) {
  // lint-house-disable-next-line hard-coded-color -- fixture: proves the escape hatch works
  const color = "#123456"
  const other = "#abcdef" // lint-house-disable-line hard-coded-color
  return (
    <div data-slot="suppressed" data-color={color} data-other={other} {...props} />
  )
}
