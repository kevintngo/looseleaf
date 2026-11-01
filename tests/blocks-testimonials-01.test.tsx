import { afterEach, beforeEach, describe, expect, it } from "vitest"

import Testimonials01 from "@/blocks/testimonials-01/page"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(700, 300)
})
afterEach(() => restore())

describe("testimonials-01 block", () => {
  it("is a section named by its h2 with the rating and the average as text", () => {
    const { getByRole, container } = renderUI(<Testimonials01 />)
    expect(getByRole("region", { name: "Kind words, pinned up" })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([[2, "Kind words, pinned up"]])
    expect(getByRole("img", { name: "Rated 4.9 out of 5" })).toBeInTheDocument()
    expect(container).toHaveTextContent("4.9 average from 2,300 reviews")
  })

  it("has six quotations, each with a name, in a list", () => {
    const { container, getAllByRole } = renderUI(<Testimonials01 />)
    expect(getAllByRole("listitem")).toHaveLength(6)
    expect(container.querySelectorAll("[data-slot=testimonials-wall] blockquote")).toHaveLength(6)
    for (const name of ["Priya Nair", "Tomas Berg", "Lena Fischer", "Omar Haddad", "Yuki Tanaka", "Kofi Mensah"]) expect(container).toHaveTextContent(name)
  })

  it("every note sits in a figure or a labeled quotation, on its own kind of paper", () => {
    const { container } = renderUI(<Testimonials01 />)
    const stocks = Array.from(container.querySelectorAll("[data-stock]")).map((p) => p.getAttribute("data-stock"))
    expect(stocks).toEqual(expect.arrayContaining(["sticky-yellow", "sticky-pink", "napkin", "photo", "index-card", "paper"]))
    expect(container.querySelectorAll("figure").length).toBeGreaterThanOrEqual(6)
  })

  it("links to all the reviews", () => {
    const { getByRole } = renderUI(<Testimonials01 />)
    expect(getByRole("link", { name: "Read all the reviews" })).toHaveAttribute("href", "#reviews")
  })

  it("keeps every drawing decorative and uses logical classes", () => {
    const { container } = renderUI(<Testimonials01 />)
    expectDecorativeInk(container)
    expectLogicalClasses(container)
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Testimonials01 />)
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Testimonials01 />)
    await expectHydrates(<Testimonials01 />)
  })
})
