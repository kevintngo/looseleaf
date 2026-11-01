import { afterEach, beforeEach, describe, expect, it } from "vitest"

import LandingHero02 from "@/blocks/landing-hero-02/page"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(700, 60)
})
afterEach(() => restore())

describe("landing-hero-02 block", () => {
  it("is a section named by its one h1, with the checklist heading nested below it", () => {
    const { getByRole, container } = renderUI(<LandingHero02 />)
    expect(getByRole("region", { name: "Your whole week, on one page." })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([
      [1, "Your whole week, on one page."],
      [2, "Today"],
    ])
  })

  it("starts with two of five tasks done, in the bar, the words and the tally", () => {
    const { getByRole } = renderUI(<LandingHero02 />)
    expect(getByRole("progressbar", { name: "Tasks done today" })).toHaveAttribute("aria-valuenow", "2")
    expect(getByRole("progressbar", { name: "Tasks done today" })).toHaveAttribute("aria-valuetext", "2 of 5 done")
    expect(getByRole("status")).toHaveTextContent("2 of 5 done")
    expect(getByRole("img", { name: "2 tasks done" })).toBeInTheDocument()
    expect(getByRole("checkbox", { name: "Send the invoices" })).toBeChecked()
    expect(getByRole("checkbox", { name: "Book the offsite" })).not.toBeChecked()
  })

  it("ticking every task moves the bar and the tally and stamps it ALL DONE", async () => {
    const { user, getByRole, queryByRole } = renderUI(<LandingHero02 />)
    expect(queryByRole("img", { name: "All done" })).toBeNull()
    for (const name of ["Review Ada’s pull request", "Book the offsite", "Water the plant"]) await user.click(getByRole("checkbox", { name }))
    expect(getByRole("progressbar", { name: "Tasks done today" })).toHaveAttribute("aria-valuenow", "5")
    expect(getByRole("status")).toHaveTextContent("5 of 5 done")
    expect(getByRole("img", { name: "5 tasks done" })).toBeInTheDocument()
    expect(getByRole("img", { name: "All done" })).toBeInTheDocument()
    await user.click(getByRole("checkbox", { name: "Water the plant" }))
    expect(queryByRole("img", { name: "All done" })).toBeNull()
  })

  it("a task can be ticked from the keyboard", async () => {
    const { user, getByRole } = renderUI(<LandingHero02 />)
    getByRole("checkbox", { name: "Water the plant" }).focus()
    await user.keyboard(" ")
    expect(getByRole("checkbox", { name: "Water the plant" })).toBeChecked()
    expect(getByRole("status")).toHaveTextContent("3 of 5 done")
  })

  it("the week tab shows a bar per day", async () => {
    const { user, getByRole, getAllByRole } = renderUI(<LandingHero02 />)
    await user.click(getByRole("tab", { name: "This week" }))
    expect(getByRole("progressbar", { name: "Mon: 100% done" })).toHaveAttribute("aria-valuenow", "100")
    expect(getAllByRole("progressbar")).toHaveLength(5)
  })

  it("has margin notes as notes, and only logical direction classes", () => {
    const { getAllByRole, container } = renderUI(<LandingHero02 />)
    expect(getAllByRole("note", { hidden: true }).map((n) => n.textContent)).toEqual(["done before lunch", "ask Sam first"])
    expectLogicalClasses(container)
  })

  it("keeps every drawing decorative", () => {
    const { container } = renderUI(<LandingHero02 />)
    expectDecorativeInk(container)
  })

  it("has no axe violations, also with the other tab open", async () => {
    const { user, container, getByRole } = renderUI(<LandingHero02 />)
    await axeCheck(container)
    await user.click(getByRole("tab", { name: "This week" }))
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<LandingHero02 />)
    await expectHydrates(<LandingHero02 />)
  })
})
