import * as React from "react"

export default function BadDefault(props: React.ComponentProps<"div">) {
  return <div data-slot="bad-default" {...props} />
}
