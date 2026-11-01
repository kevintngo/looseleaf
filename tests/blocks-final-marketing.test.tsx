import { afterEach, beforeEach, describe, expect, it } from "vitest"

import Error404 from "@/blocks/error-404/page"
import Error500 from "@/blocks/error-500/page"
import Faq01 from "@/blocks/faq-01/page"
import LandingHero01 from "@/blocks/landing-hero-01/page"
import LandingHero02 from "@/blocks/landing-hero-02/page"
import Newsletter01 from "@/blocks/newsletter-01/page"
import Testimonials01 from "@/blocks/testimonials-01/page"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const frame = (container: HTMLElement) => container.querySelector("section > div, .\\@container > div")!

describe("taped sheets keep 32 px of desk on a phone", () => {
  it.each([
    ["landing-hero-01", <LandingHero01 key="a" />, "p-8"],
    ["landing-hero-02", <LandingHero02 key="b" />, "px-8"],
    ["faq-01", <Faq01 key="c" />, "px-8"],
    ["testimonials-01", <Testimonials01 key="d" />, "px-8"],
    ["newsletter-01", <Newsletter01 key="e" />, "px-8"],
  ])("%s", (_name, ui, cls) => {
    const { container } = renderUI(ui)
    expect(frame(container)).toHaveClass(cls)
    expect(frame(container)).not.toHaveClass("px-7", "p-7")
  })
})

describe("hero ledes", () => {
  it("are balanced (WebKit leaves `text-wrap: pretty` with a lone last word)", () => {
    const one = renderUI(<LandingHero01 />)
    expect(one.getByText(/Penmark keeps your team/)).toHaveClass("text-balance")
    expect(one.getByText(/Penmark keeps your team/)).not.toHaveClass("text-pretty")
    one.unmount()
    const two = renderUI(<LandingHero02 />)
    expect(two.getByText(/Tasks, notes and the odd doodle/)).toHaveClass("text-balance")
  })

  it("the two buttons keep a gap wider than a hand-drawn overshoot", () => {
    const one = renderUI(<LandingHero01 />)
    expect(one.getByRole("link", { name: "Start a notebook" }).parentElement).toHaveClass("gap-x-4")
    one.unmount()
    const two = renderUI(<LandingHero02 />)
    expect(two.getByRole("link", { name: "Try it free" }).parentElement).toHaveClass("gap-x-4")
  })
})

describe("landing-hero-02", () => {
  it("the tally sits beside the count, not at the far end of the page", () => {
    const { container, getByRole } = renderUI(<LandingHero02 />)
    const row = container.querySelector("[role=status]")!.parentElement!
    expect(row).toHaveClass("flex", "items-center")
    expect(row).toContainElement(getByRole("img", { name: "2 tasks done" }))
  })
})

describe("faq-01", () => {
  it("a row never wears the pre-measure pencil outline except while it has keyboard focus", () => {
    const { getAllByRole } = renderUI(<Faq01 />)
    const triggers = getAllByRole("button", { expanded: false }).concat(getAllByRole("button", { expanded: true }))
    expect(triggers.length).toBeGreaterThanOrEqual(6)
    for (const t of triggers) expect(t.className).toContain("[&:not(:focus-visible)]:outline-transparent")
  })
})

describe("newsletter-01", () => {
  it("the envelope box is as tall as the open flap needs (in proportion to its width), not a fixed 23 rem", () => {
    const { getByRole } = renderUI(<Newsletter01 />)
    const box = getByRole("button", { name: /Peek inside/ }).closest("[class*='aspect-[40/39]']")!
    expect(box).not.toBeNull()
    expect(box.className).not.toContain("min-h-[23rem]")
  })
})

describe("Stubby is drawn at the size he is shown", () => {
  it.each([
    ["landing-hero-01", <LandingHero01 key="a" />, "184"],
    ["error-404", <Error404 key="b" />, "184"],
    ["error-500", <Error500 key="c" />, "196"],
  ])("%s", (_name, ui, px) => {
    const { container } = renderUI(ui)
    const shown = [...container.querySelectorAll("[data-slot=mascot]")].find((m) => m.getAttribute("class")?.includes(`h-[${px}px]`))
    expect(shown).toBeDefined()
    expect(shown!.getAttribute("height")).toBe(px)
  })
})

describe("error-404", () => {
  it("the / key hint is not shown on a phone (there is no keyboard to press it on)", () => {
    const { container } = renderUI(<Error404 />)
    expect(container.querySelector("[data-slot=kbd]")!.closest("[data-slot=input-group-addon]")).toHaveClass("max-sm:hidden")
  })
})
