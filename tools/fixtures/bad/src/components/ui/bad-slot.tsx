import * as React from "react"

export function BadSlot(props: React.ComponentProps<"div">) {
  return <div className="p-2" {...props} />
}

export function BadSlotFormat(props: React.ComponentProps<"div">) {
  return <div data-slot="Bad_Format" {...props} />
}
