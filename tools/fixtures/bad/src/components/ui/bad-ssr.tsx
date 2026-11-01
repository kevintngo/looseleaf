import * as React from "react"

const width = window.innerWidth
document.title = "hello"
const guarded = typeof window !== "undefined" ? window.innerWidth : 0

export function BadSsr(props: React.ComponentProps<"div">) {
  return (
    <div data-slot="bad-ssr" {...props}>
      {width + guarded}
    </div>
  )
}
