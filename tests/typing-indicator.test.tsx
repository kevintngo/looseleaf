import * as React from "react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { TypingIndicator } from "@/components/ui/typing-indicator"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { typingGeometry, typingIndicatorRecipe } from "@/lib/ink/recipes/typing-indicator-ink"
import { axeCheck, expectInkLayers, mockBox } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(56, 24)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs]").forEach((n) => n.remove())
})

const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length
const parts = (root: ParentNode) => Array.from(root.querySelectorAll("svg [data-part]")).map((g) => g.getAttribute("data-part"))

describe("TypingIndicator", () => {
  it("is a polite status region with a screen-reader label", () => {
    const { getByRole } = render(<TypingIndicator />)
    const s = getByRole("status")
    expect(s).toHaveAttribute("data-slot", "typing-indicator")
    expect(s).toHaveAttribute("aria-live", "polite")
    expect(s).toHaveTextContent("Typing")
    expect(s.querySelector(".sr-only")).toHaveTextContent("Typing")
  })

  it("takes another label", () => {
    const { getByRole } = render(<TypingIndicator label="Stubby is typing" />)
    expect(getByRole("status", { name: "" })).toHaveTextContent("Stubby is typing")
  })

  it("draws three dots and a pencil, as parts CSS can animate", () => {
    const { container } = render(<TypingIndicator seed="a" />)
    expect(parts(container)).toEqual(["dot-1", "dot-2", "dot-3", "pencil"])
    expectInkLayers(container, { min: 1, kinds: ["typing"], absolute: true, layers: ["rest"] })
    expect(container.querySelector("svg")).toHaveAttribute("data-still")
  })

  it("the scrawl variant draws a line and a pencil", () => {
    const { container } = render(<TypingIndicator variant="squiggle" seed="a" />)
    expect(parts(container)).toEqual(["line", "pencil"])
    expect(container.querySelector('[data-slot="typing-indicator"]')).toHaveAttribute("data-variant", "squiggle")
  })

  it("pencil={false} leaves just the marks", () => {
    const { container } = render(<TypingIndicator pencil={false} seed="a" />)
    expect(parts(container)).toEqual(["dot-1", "dot-2", "dot-3"])
  })

  it("pen=you writes in blue felt", () => {
    const { container } = render(<TypingIndicator pen="you" seed="a" />)
    expect(container.querySelector("svg")!.innerHTML).toContain("var(--ll-ink-you)")
  })

  it("active={false} keeps an empty live region mounted", () => {
    const { getByRole, container, rerender } = render(<TypingIndicator active={false} />)
    const s = getByRole("status")
    expect(s).toBeEmptyDOMElement()
    expect(s).not.toHaveAttribute("data-ink-host")
    expect(container.querySelector("svg")).toBeNull()
    rerender(<TypingIndicator active />)
    expect(getByRole("status")).toBe(s)
    expect(s).toHaveTextContent("Typing")
    expect(container.querySelector("svg")).not.toBeNull()
  })

  it("carries its animations as classes on the parts and hoists the keyframes once", () => {
    const { unmount } = render(
      <>
        <TypingIndicator />
        <TypingIndicator variant="squiggle" />
      </>,
    )
    const [a, b] = Array.from(document.querySelectorAll('[data-slot="typing-indicator"]'))
    expect(a.className).toContain("[&>svg_[data-part^=dot]]:animate-[ll-type-dot_2s_ease-out_infinite_both]")
    expect(b.className).toContain("[&>svg_[data-part=line]]:animate-[ll-type-wipe_2.2s_ease-in-out_infinite_both]")
    expect(a.getAttribute("style")).toContain("--ll-type-span")
    const styles = Array.from(document.querySelectorAll("style")).filter((s) => s.textContent?.includes("ll-type-dot"))
    expect(styles).toHaveLength(1)
    unmount()
  })

  it("is mirrored in right-to-left (the pencil writes the other way)", () => {
    const { getByRole } = render(<TypingIndicator />)
    expect(getByRole("status").className).toContain("rtl:[&>svg]:-scale-x-100")
  })

  it("sits in a bubble and passes axe", async () => {
    const { container } = render(
      <Bubble variant="muted">
        <BubbleContent>
          <TypingIndicator />
        </BubbleContent>
      </Bubble>,
    )
    await axeCheck(container)
    const { container: c2 } = render(<TypingIndicator active={false} />)
    await axeCheck(c2)
  })
})

describe("typingIndicatorRecipe", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }

  it("is one layer, complete at rest, and cheap", () => {
    for (const variant of ["dots", "squiggle"] as const) {
      for (const pencil of [true, false]) {
        const f = runRecipe(typingIndicatorRecipe, { ...req, params: { variant, pencil }, box: variant === "dots" ? { w: 56, h: 24 } : { w: 80, h: 24 } })
        expect(f.layers).toEqual(["rest"])
        const rest = f.parts.rest ?? ""
        expect(nodes(rest), `${variant}/${pencil}`).toBeLessThanOrEqual(pencil ? 30 : 12)
        expect(rest.length).toBeLessThanOrEqual(9000)
        expect(rest).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
      }
    }
  })

  it("survives absurd boxes in every tier and density", () => {
    for (const box of [{ w: 4, h: 2 }, { w: 30, h: 12 }, { w: 400, h: 120 }]) {
      for (const tier of ["lo", "hi"] as const) {
        for (const density of ["comfortable", "compact", "calm"] as const) {
          const f = runRecipe(typingIndicatorRecipe, { ...req, params: { variant: "squiggle" }, box, tier, density })
          expect(Object.values(f.parts).join("")).not.toMatch(/NaN|Infinity/)
        }
      }
    }
  })

  it("geometry: the pencil walks the distance between the first and the last mark", () => {
    const g = typingGeometry(56, 24, "dots")
    expect(g.xs).toHaveLength(3)
    expect(g.span).toBeCloseTo(g.xs[2] - g.xs[0])
    expect(typingGeometry(80, 24, "squiggle").span).toBeGreaterThan(30)
  })
})

describe("TypingIndicator on the server", () => {
  it("renders the exact drawing (the size is known) and hydrates without a warning", async () => {
    restore()
    const tree = () => <TypingIndicator seed="ssr" />
    const html = renderToString(tree())
    expect(html).toContain('data-part="dot-1"')
    expect(html).toContain("Typing")
    expect(renderToString(tree())).toBe(html)
    const root = document.createElement("div")
    root.innerHTML = html
    document.body.append(root)
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(root, tree())
    })
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
    root.remove()
  })
})
