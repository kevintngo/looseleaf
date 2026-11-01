import { afterEach, beforeEach, describe, expect, it } from "vitest"

import Features01 from "@/blocks/features-01/page"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(800, 260)
})
afterEach(() => restore())

describe("features-01 block, cards", () => {
  it("is a section named by its h2, with one h3 per card", () => {
    const { getByRole, container } = renderUI(<Features01 />)
    expect(getByRole("region", { name: "Everything a good notebook does" })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([
      [2, "Everything a good notebook does"],
      [3, "Write together"],
      [3, "Never lose a page"],
      [3, "Share the good bits"],
    ])
  })

  it("has three articles in a list, each with a link", () => {
    const { getAllByRole, getByRole } = renderUI(<Features01 />)
    expect(getAllByRole("article")).toHaveLength(3)
    expect(getAllByRole("listitem")).toHaveLength(3)
    expect(getByRole("link", { name: "How writing works" })).toHaveAttribute("href", "#write")
    expect(getByRole("link", { name: "About sharing" })).toHaveAttribute("href", "#share")
  })

  it("draws a doodle per card that the words do not depend on", () => {
    const { container } = renderUI(<Features01 />)
    expect(container.querySelectorAll("[data-slot=doodle]")).toHaveLength(3)
    expectDecorativeInk(container)
  })

  it("uses logical classes only", () => {
    const { container } = renderUI(<Features01 />)
    expectLogicalClasses(container)
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Features01 />)
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Features01 />)
    await expectHydrates(<Features01 />)
  })
})

describe("features-01 block, bento on a corkboard", () => {
  it("has five tiles with their own h3 and the cork hidden from assistive technology", () => {
    const { container, queryByRole } = renderUI(<Features01 variant="bento" />)
    expect(headingOutline(container).map((h) => h[1])).toEqual(["Everything a good notebook does", "Write together", "Tick things off", "Draw on anything", "Version history", "Works offline"])
    expect(container.querySelectorAll("[data-slot=features-bento] > ul > li")).toHaveLength(5)
    expect(queryByRole("group", { name: "Cork" })).toBeNull()
    expect(container.querySelector("[data-slot=corkboard]")?.closest("[aria-hidden=true]")).not.toBeNull()
  })

  it("nothing on the cork can be picked up or reached with the keyboard", async () => {
    const { user, container } = renderUI(<Features01 variant="bento" />)
    await user.tab()
    expect(container.querySelector("[data-slot=corkboard]")?.contains(document.activeElement)).toBe(false)
    expect(container.querySelectorAll("[data-slot=corkboard-note]")).toHaveLength(0)
  })

  it("keeps the words of the ruled page as real text", () => {
    const { container } = renderUI(<Features01 variant="bento" />)
    const page = container.querySelector("[data-slot=paper][data-stock=paper]")!
    expect(page).toHaveTextContent("Ship the tape update before Friday")
    expect(page.querySelector("s")).toHaveTextContent("Rename the tabs")
  })

  it("the receipt total and the sticky note's tick are announced", () => {
    const { getByText } = renderUI(<Features01 variant="bento" />)
    expect(getByText("Pages kept")).toBeInTheDocument()
    expect(getByText(/^Done\./)).toBeInTheDocument()
  })

  it("keeps every drawing decorative and uses logical classes", () => {
    const { container } = renderUI(<Features01 variant="bento" />)
    expectDecorativeInk(container)
    expectLogicalClasses(container)
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Features01 variant="bento" />)
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Features01 variant="bento" />)
    await expectHydrates(<Features01 variant="bento" />)
  })
})
