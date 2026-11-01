import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import Newsletter01 from "@/blocks/newsletter-01/page"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk, expectHydrates, expectLogicalClasses, expectSsrStable, headingOutline } from "./_blocks-marketing"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(700, 200)
})
afterEach(() => restore())

describe("newsletter-01 block", () => {
  it("is a section named by its h2 with a labelled email field and a submit button", () => {
    const { getByRole, container } = renderUI(<Newsletter01 />)
    expect(getByRole("region", { name: "One short letter, every Sunday" })).toBeInTheDocument()
    expect(headingOutline(container)).toEqual([[2, "One short letter, every Sunday"]])
    const field = getByRole("textbox", { name: "Your email address" })
    expect(field).toHaveAttribute("type", "email")
    expect(field).toHaveAttribute("autocomplete", "email")
    expect(field).toBeRequired()
    expect(getByRole("button", { name: "Subscribe" })).toHaveAttribute("type", "submit")
  })

  it("flags a bad address under the field, keeps the focus there and clears when typing again", async () => {
    const { user, getByRole, queryByRole } = renderUI(<Newsletter01 />)
    const field = getByRole("textbox", { name: "Your email address" })
    await user.type(field, "ada@")
    await user.click(getByRole("button", { name: "Subscribe" }))
    expect(getByRole("alert")).toHaveTextContent("does not look like an email address")
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(field.getAttribute("aria-describedby")).toContain(getByRole("alert").id)
    expect(field).toHaveFocus()
    await user.type(field, "example.com")
    expect(queryByRole("alert")).toBeNull()
    expect(field).not.toHaveAttribute("aria-invalid")
  })

  it("subscribing opens the envelope, stamps it and moves focus to the confirmation", async () => {
    const onSubscribe = vi.fn()
    const { user, getByRole, queryByRole } = renderUI(<Newsletter01 onSubscribe={onSubscribe} />)
    expect(queryByRole("img", { name: "Subscribed" })).toBeNull()
    await user.type(getByRole("textbox", { name: "Your email address" }), "ada@example.com")
    await user.keyboard("{Enter}")
    expect(onSubscribe).toHaveBeenCalledWith("ada@example.com")
    const note = getByRole("status")
    expect(note).toHaveTextContent("You’re on the list.")
    expect(note).toHaveTextContent("ada@example.com")
    expect(note).toHaveFocus()
    expect(getByRole("img", { name: "Subscribed" })).toBeInTheDocument()
    expect(getByRole("button", { name: "Peek inside the Sunday letter" })).toHaveAttribute("aria-expanded", "true")
  })

  it("lets someone start again with another address", async () => {
    const { user, getByRole, queryByRole } = renderUI(<Newsletter01 />)
    await user.type(getByRole("textbox", { name: "Your email address" }), "ada@example.com")
    await user.click(getByRole("button", { name: "Subscribe" }))
    await user.click(getByRole("button", { name: "Use a different address" }))
    expect(getByRole("textbox", { name: "Your email address" })).toHaveValue("")
    expect(queryByRole("img", { name: "Subscribed" })).toBeNull()
    expect(getByRole("button", { name: "Peek inside the Sunday letter" })).toHaveAttribute("aria-expanded", "false")
  })

  it("shows a failure from the caller instead of a false success", async () => {
    const { user, getByRole, queryByRole } = renderUI(<Newsletter01 onSubscribe={() => Promise.reject(new Error("nope"))} />)
    await user.type(getByRole("textbox", { name: "Your email address" }), "ada@example.com")
    await user.click(getByRole("button", { name: "Subscribe" }))
    expect(getByRole("alert")).toHaveTextContent("Something went wrong on our side")
    expect(queryByRole("img", { name: "Subscribed" })).toBeNull()
    expect(getByRole("button", { name: "Subscribe" })).toBeEnabled()
  })

  it("the sample letter opens on its own from the keyboard", async () => {
    const { user, getByRole, queryByText } = renderUI(<Newsletter01 />)
    expect(queryByText("Sunday letter, no. 41")).toBeNull()
    const trigger = getByRole("button", { name: "Peek inside the Sunday letter" })
    trigger.focus()
    await user.keyboard(" ")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(queryByText("Sunday letter, no. 41")).not.toBeNull()
  })

  it("keeps every drawing decorative and uses logical classes", () => {
    const { container } = renderUI(<Newsletter01 />)
    expectDecorativeInk(container)
    expectLogicalClasses(container)
  })

  it("has no axe violations: idle, invalid and done", async () => {
    const { user, container, getByRole } = renderUI(<Newsletter01 />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Subscribe" }))
    await axeCheck(container)
    await user.type(getByRole("textbox", { name: "Your email address" }), "ada@example.com")
    await user.click(getByRole("button", { name: "Subscribe" }))
    await axeCheck(container)
  })

  it("renders the same on the server twice and hydrates cleanly", async () => {
    expectSsrStable(<Newsletter01 />)
    await expectHydrates(<Newsletter01 />)
  })
})
