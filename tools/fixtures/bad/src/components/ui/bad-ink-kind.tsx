import * as React from "react"

export function BadInkKind(props: React.ComponentProps<"span">) {
  return (
    <span data-slot="bad-ink-kind" {...props}>
      <svg data-ink="icons" aria-hidden="true" focusable="false" />
      <svg data-ink="Sticker" aria-hidden="true" focusable="false" />
      <svg data-ink="icon" aria-hidden="true" focusable="false" />
      <svg data-ink="hand-drawn-border" aria-hidden="true" focusable="false" />
    </span>
  )
}
