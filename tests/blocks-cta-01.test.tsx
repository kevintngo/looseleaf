import { afterEach, beforeEach, describe, expect, it } from "vitest"

import Cta01 from "@/blocks/cta-01/page"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(800, 200)
})
afterEach(() => restore())

describe("cta-01 block", () => {
  it("is a section named by its h2 with two links to act on", () => {
    const { getByRole, container } = renderUI(<Cta01 />)
    expect(getByRole("region", { name: "Ready when you are." })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([[2, "Ready when you are."]])
    expect(getByRole("link", { name: "Start writing" })).toHaveAttribute("href", "#start")
    expect(getByRole("link", { name: "or talk to a human" })).toHaveAttribute("href", "#talk")
  })

  it("puts the words on the body of the ticket and the serial number on the stub", () => {
    const { container } = renderUI(<Cta01 />)
    const ticket = container.querySelector("[data-slot=ticket]")!
    expect(ticket.querySelector("[data-slot=ticket-body]")).toHaveTextContent("Ready when you are.")
    expect(ticket.querySelector("[data-slot=ticket-stub]")).toHaveTextContent("No. 0001")
    expect(ticket.querySelector("[data-slot=ticket-stub]")).toHaveAttribute("role", "note")
  })

  it("keeps every drawing decorative and uses logical classes", () => {
    const { container } = renderUI(<Cta01 />)
    expectDecorativeInk(container)
    expectLogicalClasses(container)
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Cta01 />)
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Cta01 />)
    await expectHydrates(<Cta01 />)
  })
})
