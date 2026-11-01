import { describe, expect, it } from "vitest"
import { renderToString } from "react-dom/server"
import { Stamp } from "@/components/ui/stamp"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

describe("Stamp", () => {
  it("draws flat ink through the stamp wear mask and is an image named by its text", async () => {
    const { container, getByRole } = renderUI(<Stamp text="Approved" ink="green" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("data-slot", "stamp")
    expect(svg).toHaveAttribute("data-ink", "stamp")
    expect(getByRole("img", { name: "Approved" })).toBeInTheDocument()
    expect(svg.innerHTML).toMatch(/mask="url\(#ll-stamp-\d\)"/)
    expect(svg.innerHTML).toContain("var(--ll-green)")
    expectInkLayers(container, { min: 1, kinds: ["stamp"], intrinsic: true })
    await axeCheck(container)
  })

  it("all four shapes render, deterministically", () => {
    for (const shape of ["rect", "round", "burst", "void"] as const) {
      const a = renderToString(<Stamp text="Paid" shape={shape} ring="PAID IN FULL" />)
      expect(renderToString(<Stamp text="Paid" shape={shape} ring="PAID IN FULL" />)).toBe(a)
      expect(a).not.toMatch(/NaN|undefined|Infinity/)
    }
  })

  it("seeded tilt, or an explicit one", () => {
    const { container } = renderUI(<Stamp text="Draft" tilt={-4} />)
    expect(container.querySelector("svg")!.innerHTML).toContain("rotate(-4.00")
    expect(renderToString(<Stamp text="Draft" seed="1" />)).not.toBe(renderToString(<Stamp text="Draft" seed="2" />))
  })

  it("only red, blue, green and ink: never a stationery accent", () => {
    for (const ink of ["red", "ink-you", "green", "ink"] as const) expect(renderToString(<Stamp text="X" ink={ink} />)).toMatch(/var\(--ll-(red|ink-you|green|ink)\)/)
  })

  it("renders nothing without text or a preset", () => {
    expect(renderUI(<Stamp />).container.querySelector("svg")).toBeNull()
  })
})
