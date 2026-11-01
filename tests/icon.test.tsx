import * as React from "react"
import { describe, expect, it } from "vitest"
import { renderToString } from "react-dom/server"
import { Icon } from "@/components/ui/icon"
import { icons } from "@/lib/ink/art/icons"
import { IconSizeContext } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

describe("Icon", () => {
  it("draws an intrinsic ink svg, decorative by default", async () => {
    const { container } = renderUI(<Icon name="check" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("data-slot", "icon")
    expect(svg).toHaveAttribute("data-ink", "icon")
    expect(svg).toHaveAttribute("data-icon", "check")
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).not.toHaveAttribute("role")
    expect(svg.getAttribute("focusable")).toBe("false")
    expect(svg.innerHTML.length).toBeGreaterThan(50)
    expectInkLayers(container, { min: 1, kinds: ["icon"], intrinsic: true })
    await axeCheck(container)
  })

  it("`label` makes it an image with a name", async () => {
    const { container, getByRole } = renderUI(<Icon name="search" label="Search" />)
    expect(getByRole("img", { name: "Search" })).toBeInTheDocument()
    expect(container.querySelector("svg")).not.toHaveAttribute("aria-hidden")
    await axeCheck(container)
  })

  it("resolves lucide names, older names and PascalCase exports to our ids", () => {
    for (const [name, id] of [["Trash2", "trash"], ["trash-2", "trash"], ["alert-triangle", "triangle-alert"], ["MoreHorizontal", "ellipsis"], ["ChevronDownIcon", "chevron-down"], ["Loader2", "loader-circle"]] as const) {
      const { container, unmount } = renderUI(<Icon name={name} />)
      expect(container.querySelector("svg")).toHaveAttribute("data-icon", id)
      expect(container.querySelector("svg")).not.toHaveAttribute("data-missing")
      unmount()
    }
  })

  it("an unknown name shows a hand-drawn placeholder instead of nothing", () => {
    const { container } = renderUI(<Icon name="no-such-icon-yet" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("data-missing")
    expect(svg.innerHTML.length).toBeGreaterThan(50)
  })

  it("picks the tier from the size: micro, small, master, hi", () => {
    const html = (size: number) => renderToString(<Icon name="check" size={size} />)
    expect(html(12)).toMatch(/viewBox="0 0 12 12"/)
    expect(new Set([html(12), html(16), html(24), html(48)]).size).toBe(4)
    const check = icons.check
    expect(check.micro).toBeDefined()
    expect(check.small).toBeDefined()
  })

  it("reads the size from a `size-N` class (the shadcn convention) and defaults to the 16 px tier", () => {
    expect(renderToString(<Icon name="check" className="size-3" />)).toMatch(/viewBox="0 0 12 12"/)
    expect(renderToString(<Icon name="check" className="size-6" />)).toMatch(/viewBox="0 0 24 24"/)
    expect(renderToString(<Icon name="check" className="size-[20px]" />)).toMatch(/viewBox="0 0 20 20"/)
    expect(renderToString(<Icon name="check" />)).toMatch(/viewBox="0 0 16 16"/)
    expect(renderToString(<Icon name="check" />)).toMatch(/width="1em"/)
  })

  it("an explicit size wins over a parent's size rule (inline style)", () => {
    const { container } = renderUI(<Icon name="check" size={20} />)
    expect(container.querySelector("svg")).toHaveStyle({ width: "20px", height: "20px" })
  })

  it("ink is currentColor, so text color utilities work; accent washes only in doodle tone", () => {
    const ui = renderToString(<Icon name="bell" size={24} />)
    const doodle = renderToString(<Icon name="bell" size={24} tone="doodle" />)
    expect(ui).toContain("currentColor")
    expect(ui).not.toContain("var(--ll-lemon)")
    expect(doodle).toContain("var(--ll-lemon)")
    expect(renderToString(<Icon name="bell" size={24} tone="doodle" accent="sky" />)).toContain("var(--ll-sky)")
  })

  it("is deterministic (SSR-safe) and the seed changes the hand", () => {
    const a = renderToString(<Icon name="search" size={24} />)
    expect(renderToString(<Icon name="search" size={24} />)).toBe(a)
    expect(renderToString(<Icon name="search" size={24} seed="other" />)).not.toBe(a)
    expect(a).not.toMatch(/NaN|undefined|Infinity/)
  })

  it("direction glyphs flip themselves in RTL; only art that says it is symmetric can be mirrored", () => {
    expect(renderToString(<Icon name="chevron-right" />)).toContain("rtl:-scale-x-100")
    expect(renderToString(<Icon name="chevron-down" />)).not.toContain("rtl:-scale-x-100")
    expect(renderToString(<Icon name="arrow-left" flip />)).not.toMatch(/[\s"]-scale-x-100/)
    expect(renderToString(<Icon name="plus" flip />)).toMatch(/[\s"]-scale-x-100/)
    expect(renderToString(<Icon name="chevron-down" flip="y" />)).toMatch(/[\s"]-scale-y-100/)
  })

  it("passes classes and props through", () => {
    const { container } = renderUI(<Icon name="check" className="text-red" data-testid="i" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveClass("text-red")
    expect(svg).toHaveClass("pointer-events-none")
    expect(svg).toHaveAttribute("data-testid", "i")
  })

  it("every drawn icon renders with a 16 px redraw that is not the master", () => {
    for (const [id, def] of Object.entries(icons)) {
      expect(def.small, id).toBeDefined()
      const s16 = renderToString(<Icon name={id} size={16} />)
      const s24 = renderToString(<Icon name={id} size={24} />)
      expect(s16, id).not.toBe(s24)
    }
  })
})

describe("Icon weight (audit 4.8)", () => {
  const svgOf = (el: React.ReactElement) => renderToString(el)

  it("small ui icons are drawn a hair heavier than the engine's floor; large ones and doodle tone are not", () => {
    const at16 = svgOf(<Icon name="check" size={16} />)
    const at16plain = svgOf(<Icon name="check" size={16} weight={1} />)
    expect(at16).not.toBe(at16plain)
    expect(svgOf(<Icon name="check" size={24} />)).toBe(svgOf(<Icon name="check" size={24} weight={1} />))
    expect(svgOf(<Icon name="check" size={16} tone="doodle" />)).toBe(svgOf(<Icon name="check" size={16} tone="doodle" weight={1} />))
  })

  it("`weight` is a plain multiplier and is deterministic", () => {
    const a = svgOf(<Icon name="check" size={16} weight={1.4} />)
    expect(a).toBe(svgOf(<Icon name="check" size={16} weight={1.4} />))
    expect(a).not.toBe(svgOf(<Icon name="check" size={16} weight={1} />))
  })

  it("takes its default size from IconSizeContext, but an explicit size or size-N class wins", () => {
    const html = (el: React.ReactElement) => renderToString(<IconSizeContext value={12}>{el}</IconSizeContext>)
    expect(html(<Icon name="check" />)).toMatch(/width="12"/)
    expect(html(<Icon name="check" size={20} />)).toMatch(/width="20"/)
    expect(html(<Icon name="check" className="size-6" />)).toMatch(/width="24"/)
    expect(renderToString(<Icon name="check" />)).toMatch(/width="1em"/)
  })
})
