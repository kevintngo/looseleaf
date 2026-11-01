import * as React from "react"

export function BadDebug(props: React.ComponentProps<"div">) {
  console.log("rendering", props)
  console.warn("allowed")
  debugger
  return <div data-slot="bad-debug" {...props} />
}
