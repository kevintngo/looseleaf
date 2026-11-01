import { describe, expect, it } from "vitest"
import { renderToString } from "react-dom/server"
import { Sticker } from "@/components/ui/sticker"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

describe("Sticker", () => {
  it("is an intrinsic die-cut with a white vinyl border and a CSS shadow", async () => {
    const { container } = renderUI(<Sticker name="cursor-click" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("data-slot", "sticker")
    expect(svg).toHaveAttribute("data-ink", "sticker")
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveClass("ll-drop-sticker")
    expect(svg.innerHTML).toContain("var(--ll-photo)")
    expect(svg.innerHTML).not.toMatch(/filter|feGaussianBlur/)
    expectInkLayers(container, { min: 1, kinds: ["sticker"], intrinsic: true })
    await axeCheck(container)
  })

  it("box is larger than the art (the border is added around it)", () => {
    const { container } = renderUI(<Sticker name="cursor-click" size={96} rotate={0} />)
    const svg = container.querySelector("svg")!
    expect(Number(svg.getAttribute("width"))).toBeGreaterThan(96)
  })

  it("tilts by a seeded amount unless told otherwise; a number is a plain rotation", () => {
    const auto = renderUI(<Sticker name="cursor-click" />).container.querySelector("svg")!
    expect(auto).toHaveClass("ll-tilt-layer")
    expect(auto.getAttribute("style")).toMatch(/--ll-tilt: -?\d/)
    const fixed = renderUI(<Sticker name="cursor-click" rotate={-7} />).container.querySelector("svg")!
    expect(fixed).toHaveStyle({ rotate: "-7deg" })
    expect(fixed).not.toHaveClass("ll-tilt-layer")
  })

  it("peel draws a folded corner; badge presets and hand-drawn stickers both work", () => {
    const flat = renderToString(<Sticker name="done" peel={false} seed="a" />)
    const peeled = renderToString(<Sticker name="done" peel seed="a" />)
    expect(peeled).not.toBe(flat)
    expect(peeled).toContain("matrix(0 -1 -1 0")
    expect(renderToString(<Sticker name="hand-point-right" />)).toContain("data-sticker=\"hand-point-right\"")
  })

  it("ids inside the drawing are unique per instance (useId), so two of the same sticker are valid HTML", () => {
    const { container } = renderUI(
      <div>
        <Sticker name="done" />
        <Sticker name="done" />
      </div>
    )
    const ids = Array.from(container.querySelectorAll("[id]")).map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("label makes it an image", () => {
    const { getByRole } = renderUI(<Sticker name="sale" label="Sale" />)
    expect(getByRole("img", { name: "Sale" })).toBeInTheDocument()
  })

  it("an unknown name renders nothing", () => {
    expect(renderUI(<Sticker name="nope" />).container.querySelector("svg")).toBeNull()
  })
})
