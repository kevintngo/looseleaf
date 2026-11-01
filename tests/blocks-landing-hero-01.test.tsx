import { afterEach, beforeEach, describe, expect, it } from "vitest"

import LandingHero01 from "@/blocks/landing-hero-01/page"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(900, 120)
})
afterEach(() => restore())

describe("landing-hero-01 block", () => {
  it("is a section named by its one h1", () => {
    const { getByRole, container } = renderUI(<LandingHero01 />)
    const region = getByRole("region", { name: "Write it down." })
    expect(region.tagName).toBe("SECTION")
    expect(headingOutline(container)).toEqual([[1, "Write it down."]])
  })

  it("has the two calls to action as real links, and a main navigation", () => {
    const { getByRole } = renderUI(<LandingHero01 />)
    expect(getByRole("link", { name: "Start a notebook" })).toHaveAttribute("href", "#start")
    expect(getByRole("link", { name: "Watch the tour" })).toHaveAttribute("href", "#tour")
    const nav = getByRole("navigation", { name: "Main" })
    for (const name of ["Product", "Pricing", "Notes", "Changelog"]) expect(nav).toHaveTextContent(name)
  })

  it("puts the marked words in the text, not in a picture", () => {
    const { container } = renderUI(<LandingHero01 />)
    expect(container.querySelector("mark")).toHaveTextContent("found")
    expect(container.querySelector("[data-annotate=underline]")).toHaveTextContent("one calm page")
    expect(container.querySelector("[data-annotate=circle]")).toHaveTextContent("Free")
    expect(container.textContent).toContain("Free")
    expect(container.textContent).toContain("Loved by 4,200 small teams")
  })

  it("shows the rating as an image with a name", () => {
    const { getByRole } = renderUI(<LandingHero01 />)
    expect(getByRole("img", { name: /4\.5 out of 5/ })).toBeInTheDocument()
  })

  it("lays the collage out with logical, container-driven classes", () => {
    const { container } = renderUI(<LandingHero01 />)
    const collage = container.querySelector("[data-slot=landing-hero-collage]")!
    expect(collage.className).toMatch(/@xl:relative/)
    expect(collage.querySelector("figure")).not.toBeNull()
    expect(collage.querySelector("[data-slot=sticky-note]")).not.toBeNull()
    expect(collage.querySelector("[data-slot=index-card]")).not.toBeNull()
    expect(collage.querySelector("[data-slot=mascot]")).not.toBeNull()
    expectLogicalClasses(container)
  })

  it("keeps every drawing decorative", () => {
    const { container } = renderUI(<LandingHero01 />)
    expectDecorativeInk(container)
  })

  it("the tab order runs brand, nav, buttons, then the calls to action", async () => {
    const { user, getByRole } = renderUI(<LandingHero01 />)
    await user.tab()
    expect(getByRole("link", { name: "penmark" })).toHaveFocus()
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<LandingHero01 />)
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<LandingHero01 />)
    await expectHydrates(<LandingHero01 />)
  })
})
