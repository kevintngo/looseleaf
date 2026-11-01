import * as React from "react"

const draw = { layer: (name: string, fn: () => void) => void [name, fn] }
const html = `<g data-layer="focused"><path d="M0 0"/></g><g data-layer="rest"></g>`

export function BadInkLayerName(props: React.ComponentProps<"span">) {
  draw.layer("hovr", () => {})
  draw.layer("hover", () => {})
  return (
    <span data-slot="bad-ink-layer-name" {...props}>
      <svg data-ink="border" aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0">
        <g data-layer="rest" />
        <g data-layer="pressd" />
        <g data-layer="open" dangerouslySetInnerHTML={{ __html: html }} />
      </svg>
    </span>
  )
}
