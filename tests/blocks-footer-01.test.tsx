import { afterEach, beforeEach, describe, expect, it } from "vitest"

import Footer01 from "@/blocks/footer-01/page"
import { COLUMNS } from "@/blocks/footer-01/components/footer-01-links"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(800, 200)
})
afterEach(() => restore())

describe("footer-01 block", () => {
  it("is the page footer (contentinfo) with three labeled navigations", () => {
    const { getByRole } = renderUI(<Footer01 />)
    expect(getByRole("contentinfo")).toBeInTheDocument()
    for (const col of COLUMNS) {
      const nav = getByRole("navigation", { name: col.title })
      for (const link of col.links) expect(nav).toHaveTextContent(link)
    }
  })

  it("has a link for every entry and headings that name the lists", () => {
    const { getAllByRole, getByRole } = renderUI(<Footer01 />)
    const total = COLUMNS.reduce((n, c) => n + c.links.length, 0)
    expect(getAllByRole("link").length).toBeGreaterThanOrEqual(total + 6)
    expect(getByRole("heading", { level: 2, name: "Resources" })).toBeInTheDocument()
    expect(getByRole("link", { name: "Help center" })).toHaveAttribute("href", "#help-center")
  })

  it("names the icon-only social links", () => {
    const { getByRole } = renderUI(<Footer01 />)
    const list = getByRole("list", { name: "Elsewhere" })
    for (const name of ["Email us", "Read the blog", "Join the chat", "See the source"]) expect(list).toContainElement(getByRole("link", { name }))
    expect(getByRole("link", { name: "Email us" })).toHaveAttribute("href", "mailto:hello@penmark.example")
  })

  it("the stamp is a named image and the seam is a decorative rule", () => {
    const { getByRole, container } = renderUI(<Footer01 />)
    expect(getByRole("img", { name: "Stamp: hand made, drawn in Lisbon" })).toBeInTheDocument()
    expect(container.querySelector("[data-slot=separator][role=separator]")).toBeNull()
  })

  it("is kraft paper torn along the top", () => {
    const { getByRole } = renderUI(<Footer01 />)
    expect(getByRole("contentinfo")).toHaveAttribute("data-stock", "kraft")
  })

  it("keeps every drawing decorative and uses logical classes", () => {
    const { container } = renderUI(<Footer01 />)
    expectDecorativeInk(container)
    expectLogicalClasses(container)
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Footer01 />)
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Footer01 />)
    await expectHydrates(<Footer01 />)
  })
})
