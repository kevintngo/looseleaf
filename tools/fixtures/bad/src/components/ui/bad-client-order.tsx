import * as React from "react"

"use client"

export function BadClientOrder() {
  const id = React.useId()
  return <span data-slot="bad-client-order">{id}</span>
}
