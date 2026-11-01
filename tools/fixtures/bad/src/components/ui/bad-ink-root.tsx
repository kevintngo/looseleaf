import * as React from "react"

export function BadInkRoot(props: React.ComponentProps<"span">) {
  return (
    <span data-slot="bad-ink-root" {...props}>
      <svg data-ink="border" aria-hidden="true" viewBox="0 0 10 10" className="pointer-events-none absolute inset-0" />
      <svg data-ink="underline" aria-hidden="true" focusable="false" className="absolute inset-x-0 bottom-0" />
      <svg data-ink="dot" aria-hidden="true" focusable="false" tabIndex={0} className="pointer-events-none absolute" />
      <svg data-ink="dash" aria-hidden="true" focusable="false" className="pointer-events-none absolute" role="button" />
      <svg data-ink="fine" aria-hidden="true" focusable="false" className="pointer-events-none absolute" />
    </span>
  )
}
