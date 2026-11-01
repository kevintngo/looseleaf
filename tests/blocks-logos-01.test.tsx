import { afterEach, beforeEach, describe, expect, it } from "vitest"

import Logos01 from "@/blocks/logos-01/page"
import { LOGOS } from "@/blocks/logos-01/components/logos-01-names"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(900, 44)
})
afterEach(() => restore())

describe("logos-01 block", () => {
  it("is a section named by its h2, with two named tickers", () => {
    const { getByRole, container } = renderUI(<Logos01 />)
    expect(getByRole("region", { name: "Kept on desks at" })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([[2, "Kept on desks at"]])
    expect(getByRole("marquee", { name: "Teams that use Penmark" })).toBeInTheDocument()
    expect(getByRole("marquee", { name: "More teams that use Penmark" })).toBeInTheDocument()
  })

  it("every name is in the first copy of a ticker; the copies are hidden from assistive technology and from the tab order", () => {
    const { container } = renderUI(<Logos01 />)
    for (const marquee of Array.from(container.querySelectorAll("[data-slot=marquee]"))) {
      const groups = Array.from(marquee.querySelectorAll("[data-slot=marquee-group]"))
      expect(groups.length).toBeGreaterThanOrEqual(2)
      expect(groups[0]).not.toHaveAttribute("aria-hidden")
      for (const copy of groups.slice(1)) {
        expect(copy).toHaveAttribute("aria-hidden", "true")
        expect(copy).toHaveAttribute("inert")
      }
    }
    for (const logo of LOGOS) expect(container.querySelector("[data-slot=marquee-group]:not([aria-hidden])")?.ownerDocument.body).toHaveTextContent(logo.name)
  })

  it("has one pause button, and it stops both tickers", async () => {
    const { user, getAllByRole, getByRole, container } = renderUI(<Logos01 />)
    expect(getAllByRole("button", { name: "Pause ticker" })).toHaveLength(1)
    const marquees = () => Array.from(container.querySelectorAll("[data-slot=marquee]"))
    expect(marquees().every((m) => !m.hasAttribute("data-paused"))).toBe(true)
    await user.click(getByRole("button", { name: "Pause ticker" }))
    expect(getByRole("button", { name: "Pause ticker" })).toHaveAttribute("aria-pressed", "true")
    expect(marquees().every((m) => m.hasAttribute("data-paused"))).toBe(true)
    await user.click(getByRole("button", { name: "Pause ticker" }))
    expect(marquees().every((m) => !m.hasAttribute("data-paused"))).toBe(true)
  })

  it("has a plain list of the same names for reduced motion, shown only then", () => {
    const { getByRole, container } = renderUI(<Logos01 />)
    const list = getByRole("list", { name: "Teams that use Penmark", hidden: true })
    expect(list).toHaveClass("hidden", "motion-reduce:flex")
    expect(list.querySelectorAll("li")).toHaveLength(LOGOS.length)
    const tickers = container.querySelector("div.grid")!
    expect(tickers).toHaveClass("motion-reduce:hidden")
  })

  it("keeps every drawing decorative and uses logical classes", () => {
    const { container } = renderUI(<Logos01 />)
    expectDecorativeInk(container)
    expectLogicalClasses(container)
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Logos01 />)
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Logos01 />)
    await expectHydrates(<Logos01 />)
  })
})
