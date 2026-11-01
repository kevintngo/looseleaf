import { afterEach, beforeEach, describe, expect, it } from "vitest"

import EmptySearch from "@/blocks/empty-search/page"
import { PEOPLE, findPeople } from "@/blocks/empty-search/components/empty-search-people"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(640, 200)
})
afterEach(() => restore())

describe("empty-search block", () => {
  it("starts on the empty state: the words you typed are quoted back and Stubby searches", () => {
    const { getByRole, container } = renderUI(<EmptySearch />)
    expect(getByRole("region", { name: "Contacts" })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([[2, "Contacts"]])
    expect(container).toHaveTextContent("No results for “ghost pepper”")
    expect(container.querySelector("[data-pose=search]")).not.toBeNull()
    expect(getByRole("status")).toHaveTextContent("No results.")
    expectDecorativeInk(container)
  })

  it("draws the empty area as a sketched frame (border asks for it)", () => {
    const { container } = renderUI(<EmptySearch />)
    expect(container.querySelector("[data-slot=empty]")).toHaveClass("border", "border-dashed")
  })

  it("filters as you type and lists who matches", async () => {
    const { user, getByRole, queryByRole } = renderUI(<EmptySearch />)
    const box = getByRole("searchbox", { name: "Search contacts" })
    await user.clear(box)
    expect(getByRole("list", { name: "Contacts" }).querySelectorAll("li")).toHaveLength(PEOPLE.length)
    await user.type(box, "ada")
    expect(getByRole("list", { name: "Contacts" }).querySelectorAll("li")).toHaveLength(1)
    expect(getByRole("status")).toHaveTextContent("1 person found.")
    expect(queryByRole("button", { name: "Clear search" })).not.toBeNull()
    await user.type(box, "zzz")
    expect(queryByRole("list", { name: "Contacts" })).toBeNull()
    expect(getByRole("status")).toHaveTextContent("No results.")
  })

  it("clear empties the box and puts the focus back in it", async () => {
    const { user, getAllByRole, getByRole } = renderUI(<EmptySearch />)
    await user.click(getAllByRole("button", { name: "Clear search" })[0])
    const box = getByRole("searchbox", { name: "Search contacts" })
    expect(box).toHaveValue("")
    expect(box).toHaveFocus()
    expect(getByRole("list", { name: "Contacts" }).querySelectorAll("li")).toHaveLength(PEOPLE.length)
  })

  it("the suggestions are searches that work", async () => {
    const { user, getByRole } = renderUI(<EmptySearch />)
    await user.click(getByRole("button", { name: "Printer" }))
    expect(getByRole("searchbox", { name: "Search contacts" })).toHaveValue("Printer")
    const list = getByRole("list", { name: "Contacts" })
    expect(list).toHaveTextContent("Sam Reyes")
    expect(list.querySelectorAll("li")).toHaveLength(1)
  })

  it("finds by name or place, in any case, and ignores stray spaces", () => {
    expect(findPeople("  LAGOS ").map((p) => p.name)).toEqual(["Jo Okafor"])
    expect(findPeople("")).toHaveLength(PEOPLE.length)
    expect(findPeople("xyz")).toEqual([])
  })

  it("a very long unbroken query cannot break the title", () => {
    const { getByText } = renderUI(<EmptySearch defaultQuery={"x".repeat(120)} />)
    expect(getByText(/No results for/)).toHaveClass("wrap-anywhere")
  })

  it("uses logical classes only", () => {
    const { container } = renderUI(<EmptySearch />)
    expectLogicalClasses(container)
  })

  it("has no axe violations: empty, then with results", async () => {
    const { user, container, getByRole } = renderUI(<EmptySearch />)
    await axeCheck(container)
    await user.clear(getByRole("searchbox", { name: "Search contacts" }))
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<EmptySearch />)
    await expectHydrates(<EmptySearch />)
  })
})
