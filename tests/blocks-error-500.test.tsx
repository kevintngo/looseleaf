import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import Error500 from "@/blocks/error-500/page"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(700, 120)
})
afterEach(() => {
  restore()
  vi.restoreAllMocks()
})

describe("error-500 block", () => {
  it("is a section named by its one h1 and says what happened in words", () => {
    const { getByRole, container } = renderUI(<Error500 />)
    expect(getByRole("region", { name: "Something broke on our side" })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([[1, "Something broke on our side"]])
    expect(container).toHaveTextContent("Error 500")
    expect(container).toHaveTextContent("nothing you wrote is lost")
  })

  it("hides the picture from assistive technology and keeps the slip", () => {
    const { container, getByRole } = renderUI(<Error500 />)
    const scene = container.querySelector("[data-slot=error-scene]")!
    expect(scene).toHaveAttribute("aria-hidden", "true")
    expect(scene.querySelector("[data-pose=oops]")).not.toBeNull()
    expect(scene).toHaveTextContent("sorry!")
    const slip = getByRole("group", { name: "Details for support" })
    expect(slip).toHaveTextContent("Status")
    expect(slip).toHaveTextContent("/notebooks/48")
    expect(slip).toHaveTextContent("7F3A-91C2")
    expectDecorativeInk(scene)
  })

  it("shows the reference you pass in, on the slip and in the barcode", () => {
    const { getByRole } = renderUI(<Error500 reference="AB-12-CD" request="/pages/9" time="10:02 UTC" />)
    const slip = getByRole("group", { name: "Details for support" })
    expect(slip).toHaveTextContent("AB-12-CD")
    expect(slip).toHaveTextContent("/pages/9")
    expect(slip).toHaveTextContent("10:02 UTC")
    expect(getByRole("img", { name: "Barcode AB12CD" })).toBeInTheDocument()
  })

  it("copies the reference and says so, politely", async () => {
    const { user, getByRole } = renderUI(<Error500 />)
    await user.click(getByRole("button", { name: "Copy reference" }))
    expect(await navigator.clipboard.readText()).toBe("7F3A-91C2")
    expect(getByRole("status")).toHaveTextContent("Reference 7F3A-91C2 copied.")
    expect(getByRole("button", { name: "Copied" })).toBeInTheDocument()
  })

  it("does not claim a copy that failed", async () => {
    const { user, getByRole, queryByRole } = renderUI(<Error500 />)
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"))
    await user.click(getByRole("button", { name: "Copy reference" }))
    expect(getByRole("status")).toHaveTextContent("Could not copy")
    expect(queryByRole("button", { name: "Copied" })).toBeNull()
  })

  it("offers try again, go home and the status page", async () => {
    const onRetry = vi.fn()
    const { user, getByRole } = renderUI(<Error500 onRetry={onRetry} />)
    await user.click(getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(getByRole("link", { name: "Go home" })).toHaveAttribute("href", "#home")
    expect(getByRole("link", { name: "Check the status page" })).toHaveAttribute("href", "#status")
  })

  it("uses logical classes only", () => {
    const { container } = renderUI(<Error500 />)
    expectLogicalClasses(container)
  })

  it("has no axe violations, also after copying", async () => {
    const { user, container, getByRole } = renderUI(<Error500 />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Copy reference" }))
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Error500 onRetry={() => {}} />)
    await expectHydrates(<Error500 onRetry={() => {}} />)
  })
})
