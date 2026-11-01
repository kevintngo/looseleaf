import { afterEach, beforeEach, describe, expect, it } from "vitest"

import Faq01 from "@/blocks/faq-01/page"
import { QUESTIONS } from "@/blocks/faq-01/components/faq-01-sheet"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(640, 300)
})
afterEach(() => restore())

describe("faq-01 block", () => {
  it("is a section named by its h2; each question is an h3 button, then the help card", () => {
    const { getByRole, container } = renderUI(<Faq01 />)
    expect(getByRole("region", { name: "Questions, answered" })).toBeInTheDocument()
    const outline = headingOutline(container)
    expect(outline[0]).toEqual([2, "Questions, answered"])
    expect(outline.slice(1, 1 + QUESTIONS.length)).toEqual(QUESTIONS.map((q) => [3, q.q]))
    expect(outline.at(-1)).toEqual([3, "Still stuck?"])
  })

  it("prints its rules on the paper and writes on the lines (28 px tall rows)", () => {
    const { container } = renderUI(<Faq01 />)
    const sheet = container.querySelector("[data-stock=paper]")!
    expect(sheet.querySelector("[data-slot=paper-rules]")).not.toBeNull()
    expect(sheet.querySelector("[data-slot=accordion-trigger]")).toHaveClass("min-h-14", "leading-7")
    expect(sheet.querySelector("[data-slot=accordion-item]")).toHaveClass("pb-0")
  })

  it("starts with the first answer open and opens one at a time", async () => {
    const { user, getByRole } = renderUI(<Faq01 />)
    const first = getByRole("button", { name: QUESTIONS[0].q })
    const second = getByRole("button", { name: QUESTIONS[1].q })
    expect(first).toHaveAttribute("aria-expanded", "true")
    expect(getByRole("region", { name: QUESTIONS[0].q })).toHaveTextContent("Teams of up to five")
    await user.click(second)
    expect(second).toHaveAttribute("aria-expanded", "true")
    expect(first).toHaveAttribute("aria-expanded", "false")
    await user.click(second)
    expect(second).toHaveAttribute("aria-expanded", "false")
  })

  it("works from the keyboard: arrows move between questions, Space opens", async () => {
    const { user, getByRole } = renderUI(<Faq01 />)
    getByRole("button", { name: QUESTIONS[0].q }).focus()
    await user.keyboard("{ArrowDown}")
    expect(getByRole("button", { name: QUESTIONS[1].q })).toHaveFocus()
    await user.keyboard(" ")
    expect(getByRole("button", { name: QUESTIONS[1].q })).toHaveAttribute("aria-expanded", "true")
    await user.keyboard("{End}")
    expect(getByRole("button", { name: QUESTIONS.at(-1)!.q })).toHaveFocus()
  })

  it("offers a mail link for anything that is not answered", () => {
    const { getByRole } = renderUI(<Faq01 />)
    expect(getByRole("link", { name: "Write to us" })).toHaveAttribute("href", "mailto:hello@penmark.example")
  })

  it("keeps every drawing decorative and uses logical classes", () => {
    const { container } = renderUI(<Faq01 />)
    expectDecorativeInk(container)
    expectLogicalClasses(container)
  })

  it("has no axe violations, open and after a change", async () => {
    const { user, container, getByRole } = renderUI(<Faq01 />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: QUESTIONS[3].q }))
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Faq01 />)
    await expectHydrates(<Faq01 />)
  })
})
