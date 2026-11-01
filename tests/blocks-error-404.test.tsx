import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import Error404 from "@/blocks/error-404/page"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(700, 120)
})
afterEach(() => restore())

describe("error-404 block", () => {
  it("is a section named by its one h1 and says what happened in words", () => {
    const { getByRole, container } = renderUI(<Error404 />)
    expect(getByRole("region", { name: "This page wandered off" })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([[1, "This page wandered off"]])
    expect(container).toHaveTextContent("Error 404")
    expect(container).toHaveTextContent("Page not found")
  })

  it("hides the whole picture (scrap, number, Stubby) from assistive technology", () => {
    const { container } = renderUI(<Error404 />)
    const scene = container.querySelector("[data-slot=error-scene]")!
    expect(scene).toHaveAttribute("aria-hidden", "true")
    expect(scene.querySelector("[data-slot=napkin]")).not.toBeNull()
    expect(scene.querySelector("[data-pose=shrug]")).not.toBeNull()
    expect(scene).toHaveTextContent("404")
    expectDecorativeInk(container)
  })

  it("has a labeled search that hands the words over and does not navigate", async () => {
    const onSearch = vi.fn()
    const { user, getByRole } = renderUI(<Error404 onSearch={onSearch} />)
    const search = getByRole("searchbox", { name: "Search the site" })
    expect(getByRole("search")).toContainElement(search)
    await user.type(search, "  pricing  {Enter}")
    expect(onSearch).toHaveBeenCalledWith("pricing")
  })

  it("pressing / anywhere else focuses the search, but not while typing in it", async () => {
    const { user, getByRole, container } = renderUI(
      <div>
        <Error404 />
        <input aria-label="Other field" />
      </div>,
    )
    const search = getByRole("searchbox", { name: "Search the site" })
    container.ownerDocument.body.focus()
    await user.keyboard("/")
    expect(search).toHaveFocus()
    expect(search).toHaveValue("")
    await user.keyboard("a/b")
    expect(search).toHaveValue("a/b")
    getByRole("textbox", { name: "Other field" }).focus()
    await user.keyboard("/")
    expect(getByRole("textbox", { name: "Other field" })).toHaveValue("/")
  })

  it("offers two ways out: home, and back", async () => {
    const onGoBack = vi.fn()
    const { user, getByRole } = renderUI(<Error404 onGoBack={onGoBack} />)
    expect(getByRole("link", { name: "Take me home" })).toHaveAttribute("href", "#home")
    await user.click(getByRole("button", { name: "Go back" }))
    expect(onGoBack).toHaveBeenCalledTimes(1)
    expect(getByRole("link", { name: "Tell us what you were looking for" })).toHaveAttribute("href", "#contact")
  })

  it("uses logical classes only", () => {
    const { container } = renderUI(<Error404 />)
    expectLogicalClasses(container)
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Error404 />)
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Error404 onGoBack={() => {}} />)
    await expectHydrates(<Error404 onGoBack={() => {}} />)
  })
})
