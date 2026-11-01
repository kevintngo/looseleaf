"use client"

import * as React from "react"

export function BadRandom(props: React.ComponentProps<"div">) {
  const jitter = Math.random()
  const stamp = Date.now()
  const created = new Date()
  const [seed] = React.useState(() => performance.now())
  React.useEffect(() => {
    void Math.random()
    void Date.now()
  }, [])
  const onClick = () => void Math.random()
  return (
    <div data-slot="bad-random" onClick={onClick} {...props}>
      {jitter + stamp + created.getTime() + seed}
    </div>
  )
}
