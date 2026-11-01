import * as React from "react"

export function BadInk(props: React.ComponentProps<"span">) {
  return (
    <span data-slot="bad-ink" {...props}>
      <svg data-ink="underline" viewBox="0 0 10 10" />
      <svg data-ink aria-hidden="true" viewBox="0 0 10 10" />
    </span>
  )
}
