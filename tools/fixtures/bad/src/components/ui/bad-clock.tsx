"use client"

import * as React from "react"

export function BadClock(props: React.ComponentProps<"button">) {
  const [seed, setSeed] = React.useState("a")
  React.useEffect(() => {
    setSeed(String(Math.random()))
  }, [])
  const onClick = () => setSeed(String(Date.now()))
  const handleKey = () => void crypto.randomUUID()
  React.useEffect(() => {
    const t = performance.now()
    return () => void t
  }, [])
  return <button data-slot="bad-clock" data-seed={seed} onClick={onClick} onKeyDown={handleKey} {...props} />
}
