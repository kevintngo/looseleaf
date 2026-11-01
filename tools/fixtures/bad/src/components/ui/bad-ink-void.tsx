import * as React from "react"

export function BadInkVoid(props: React.ComponentProps<"input">) {
  return (
    <div data-slot="bad-ink-void" data-ink-host="">
      <input {...props}>
        <svg data-ink="border" aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0" />
      </input>
      <textarea>
        <Ink />
      </textarea>
      <span>
        <svg data-ink="fine" aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0" />
      </span>
    </div>
  )
}

declare function Ink(): React.ReactElement
