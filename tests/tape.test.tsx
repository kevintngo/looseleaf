import * as React from "react"
import { renderToString } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Fastener } from "@/components/ui/paper"
import { Tape } from "@/components/ui/tape"
import { TAPE_KINDS } from "@/lib/ink/paper/props"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

describe("Tape", () => {
  it.each(TAPE_KINDS)("%s: an intrinsic aria-hidden svg with the strip drawn", (kind) => {
    const { container } = render(<Tape kind={kind} seed="k" />)
    const t = container.firstElementChild as SVGElement
    expect(t.tagName.toLowerCase()).toBe("svg")
    expect(t).toHaveAttribute("data-slot", "tape")
    expect(t).toHaveAttribute("data-ink", "tape")
    expect(t).toHaveAttribute("data-kind", kind)
    expect(t).toHaveAttribute("aria-hidden", "true")
    expect(t).toHaveAttribute("focusable", "false")
    expect(t).toHaveAttribute("width", "72")
    expect(t).toHaveAttribute("height", "22")
    expect(t.getAttribute("class")).toContain("pointer-events-none")
    expect(t.innerHTML.length).toBeGreaterThan(100)
    expectInkLayers(container, { min: 1, kinds: ["tape"] })
  })

  it("size, angle, colour and placement", () => {
    const { container } = render(<Tape length={120} height={26} angle={-30} color="sky" kind="washi-stripes" className="absolute -top-3 left-4" seed="a" />)
    const t = container.firstElementChild as SVGElement
    expect(t).toHaveAttribute("width", "120")
    expect(t.getAttribute("class")).toContain("absolute")
    expect(t.getAttribute("class")).not.toContain("relative")
    expect(t.getAttribute("style")).toContain("-30deg")
    expect(t.innerHTML).toContain("var(--ll-sky)")
  })

  it("is complete in server markup and identical on every render of a seed", () => {
    const a = renderToString(<Tape kind="washi-dots" seed="s1" />)
    expect(renderToString(<Tape kind="washi-dots" seed="s1" />)).toBe(a)
    expect(renderToString(<Tape kind="washi-dots" seed="s2" />)).not.toBe(a)
    expect(a).not.toMatch(/NaN|undefined/)
  })

  it("is decorative: axe finds nothing, and a Fastener too", async () => {
    const { container } = renderUI(
      <div>
        <Tape />
        <Fastener kind="pin" />
        <Fastener kind="staple" />
        <Fastener kind="binder-clip" />
      </div>,
    )
    await axeCheck(container)
    expect(container.querySelectorAll('svg[data-slot="fastener"]')).toHaveLength(3)
  })
})
