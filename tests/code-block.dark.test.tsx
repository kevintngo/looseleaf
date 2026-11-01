import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CodeBlock } from "@/components/ui/code-block"

const tokenOf = (container: HTMLElement, kind: string) => container.querySelector(`[class~="text-(--ll-code-${kind})"]`)

describe("CodeBlock tone", () => {
  it("is a dark slip by default and a paper slip on request", () => {
    const dark = render(<CodeBlock code="const a = 1" language="ts" />)
    expect(dark.container.querySelector('[data-slot="code-block"]')).toHaveAttribute("data-tone", "dark")
    const paper = render(<CodeBlock code="const a = 1" language="ts" tone="paper" />)
    expect(paper.container.querySelector('[data-slot="code-block"]')).toHaveAttribute("data-tone", "paper")
  })

  it("colours keywords, strings, numbers and comments from the --ll-code palette", () => {
    const { container } = render(<CodeBlock code={'const name = "paper"\nconst n = 42\n// a note'} language="ts" />)
    expect(tokenOf(container, "keyword")).toHaveTextContent("const")
    expect(tokenOf(container, "string")).toHaveTextContent('"paper"')
    expect(tokenOf(container, "number")).toHaveTextContent("42")
    expect(tokenOf(container, "comment")).toHaveTextContent("// a note")
  })
})
