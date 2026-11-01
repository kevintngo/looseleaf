import { describe, expect, it } from "vitest"
import { renderToString } from "react-dom/server"
import { Doodle } from "@/components/ui/doodle"
import { doodles } from "@/lib/ink/art/doodles"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

describe("Doodle", () => {
  it("is intrinsic, decorative ink; aria-hidden unless labelled", async () => {
    const { container, rerender, getByRole } = renderUI(<Doodle name="star" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("data-slot", "doodle")
    expect(svg).toHaveAttribute("data-ink", "doodle")
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expectInkLayers(container, { min: 1, kinds: ["doodle"], intrinsic: true })
    rerender(<Doodle name="star" label="A yellow star" />)
    expect(getByRole("img", { name: "A yellow star" })).toBeInTheDocument()
    await axeCheck(container)
  })

  it("redraws below 72 px (the 48 px drawing) and is deterministic", () => {
    const at = (size: number) => renderToString(<Doodle name="sun" size={size} />)
    expect(at(48)).not.toBe(at(96))
    expect(at(96)).toBe(at(96))
    expect(at(96)).not.toMatch(/NaN|undefined|Infinity/)
  })

  it("draws its accent colours in doodle tone (ink is --ll-ink, not currentColor)", () => {
    const html = renderToString(<Doodle name="flower" size={96} />)
    expect(html).toContain("var(--ll-bubblegum)")
    expect(html).toContain("var(--ll-ink)")
  })

  it("rotate and flip are CSS, never a redraw", () => {
    const { container } = renderUI(<Doodle name="mushroom" rotate={12} flip />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveStyle({ rotate: "12deg" })
    expect(svg).toHaveClass("-scale-x-100")
  })

  it("an unknown name renders nothing, every drawn doodle has a 48 px redraw", () => {
    const { container } = renderUI(<Doodle name="nope-not-drawn" />)
    expect(container.querySelector("svg")).toBeNull()
    for (const [id, def] of Object.entries(doodles)) expect(def.small, id).toBeDefined()
  })
})
