import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import EmptyInbox from "@/blocks/empty-inbox/page"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(640, 200)
})
afterEach(() => restore())

describe("empty-inbox block", () => {
  it("is a section named by its h2 with three filters, the first one selected", () => {
    const { getByRole, container } = renderUI(<EmptyInbox />)
    expect(getByRole("region", { name: "Inbox" })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([[2, "Inbox"]])
    const tabs = getByRole("tablist", { name: "Filter mail" })
    expect(tabs.querySelectorAll("[role=tab]")).toHaveLength(3)
    expect(getByRole("tab", { name: "All mail" })).toHaveAttribute("aria-selected", "true")
  })

  it("inbox zero: the words carry the meaning, Stubby celebrates and the 0 is decoration", () => {
    const { getByRole, container } = renderUI(<EmptyInbox />)
    const panel = getByRole("tabpanel", { name: "All mail" })
    expect(panel).toHaveTextContent("Inbox zero")
    expect(panel).toHaveTextContent("You have read everything")
    expect(panel.querySelector("[data-pose=celebrate]")).not.toBeNull()
    expect(panel.querySelector("[data-slot=circled]")?.getAttribute("aria-hidden")).toBe("true")
    expectDecorativeInk(container)
  })

  it("each filter has its own empty state, with Stubby in another pose", async () => {
    const { user, getByRole } = renderUI(<EmptyInbox />)
    await user.click(getByRole("tab", { name: "Unread" }))
    expect(getByRole("tabpanel", { name: "Unread" })).toHaveTextContent("All quiet")
    expect(getByRole("tabpanel", { name: "Unread" }).querySelector("[data-pose=sleep]")).not.toBeNull()
    await user.click(getByRole("tab", { name: "Starred" }))
    expect(getByRole("tabpanel", { name: "Starred" })).toHaveTextContent("Nothing starred yet")
    expect(getByRole("tabpanel", { name: "Starred" }).querySelector("[data-pose=peek]")).not.toBeNull()
  })

  it("the filters work from the keyboard", async () => {
    const { user, getByRole } = renderUI(<EmptyInbox />)
    getByRole("tab", { name: "All mail" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(getByRole("tab", { name: "Unread" })).toHaveFocus()
    expect(getByRole("tab", { name: "Unread" })).toHaveAttribute("aria-selected", "true")
  })

  it("compose and refresh tell the caller; refresh says so in a status", async () => {
    const onCompose = vi.fn()
    const onRefresh = vi.fn()
    const { user, getByRole } = renderUI(<EmptyInbox onCompose={onCompose} onRefresh={onRefresh} />)
    await user.click(getByRole("button", { name: "Write a message" }))
    expect(onCompose).toHaveBeenCalledTimes(1)
    expect(getByRole("status")).toHaveTextContent("Checked just now")
    await user.click(getByRole("button", { name: "Check for new mail" }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(getByRole("status")).toHaveTextContent("Checked again. Still nothing new.")
    expect(getByRole("link", { name: "Visit the archive" })).toHaveAttribute("href", "#archive")
  })

  it("uses logical classes only", () => {
    const { container } = renderUI(<EmptyInbox />)
    expectLogicalClasses(container)
  })

  it("has no axe violations on every filter", async () => {
    const { user, container, getByRole } = renderUI(<EmptyInbox />)
    await axeCheck(container)
    await user.click(getByRole("tab", { name: "Unread" }))
    await axeCheck(container)
    await user.click(getByRole("tab", { name: "Starred" }))
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<EmptyInbox />)
    await expectHydrates(<EmptyInbox />)
  })
})
