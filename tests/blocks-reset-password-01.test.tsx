import * as React from "react"
import { waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ResetPasswordForm } from "@/blocks/reset-password-01/components/reset-password-01-form"
import ResetPassword01Page from "@/blocks/reset-password-01/page"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { describeAuthPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "reset-password-01", Page: ResetPassword01Page, heading: "Choose a new password" })

let restore = () => {}
beforeEach(() => {
  restore = mockBox(240, 36)
})
afterEach(() => restore())

const form = (props: Partial<React.ComponentProps<typeof ResetPasswordForm>> = {}) => renderUI(<InkProvider><ResetPasswordForm {...props} /></InkProvider>)
const save = { name: "Save new password" }
const first = () => document.querySelector<HTMLInputElement>('input[autocomplete="new-password"]')!
const second = () => document.querySelectorAll<HTMLInputElement>('input[autocomplete="new-password"]')[1]!

describe("reset-password-01", () => {
  it("has two labeled password fields with their own toggles", async () => {
    const { user, getByLabelText, getByRole } = form()
    expect(getByLabelText("New password", { selector: "input" })).toBe(first())
    expect(getByLabelText("Confirm new password", { selector: "input" })).toBe(second())
    await user.click(getByRole("button", { name: "Show password confirmation" }))
    expect(second()).toHaveAttribute("type", "text")
    expect(first()).toHaveAttribute("type", "password")
  })

  it("ticks the rules off while you type, in words for a screen reader too", async () => {
    const { user, getByRole } = form()
    const rules = getByRole("list", { name: "A good password has" })
    const met = () => [...rules.querySelectorAll("li")].map((li) => li.getAttribute("data-met"))
    expect(met()).toEqual(["false", "false", "false"])
    expect(rules).toHaveTextContent("Not yet: 8 or more characters")
    await user.type(first(), "pencilstub")
    expect(met()).toEqual(["true", "false", "false"])
    expect(rules).toHaveTextContent("Done: 8 or more characters")
    await user.type(first(), "9")
    expect(met()).toEqual(["true", "true", "false"])
    await user.type(first(), "S")
    expect(met()).toEqual(["true", "true", "true"])
    expect(first().getAttribute("aria-describedby")).toContain(rules.id)
  })

  it("says which rule is broken and what does not match", async () => {
    const onSubmit = vi.fn()
    const { user, getByRole, getAllByRole } = form({ onSubmit })
    await user.click(getByRole("button", save))
    expect(getAllByRole("alert").map((a) => a.textContent)).toEqual(["Use at least 8 characters.", "Type the password once more."])
    expect(first()).toHaveFocus()
    await user.type(first(), "pencilstub")
    await user.tab()
    await waitFor(() => expect(getAllByRole("alert")[0]).toHaveTextContent("Add at least one number."))
    await user.clear(first())
    await user.type(first(), "Pencilstub9")
    await user.type(second(), "Pencilstub8")
    await user.click(getByRole("button", save))
    await waitFor(() => expect(getByRole("alert")).toHaveTextContent("Those two do not match yet."))
    expect(onSubmit).not.toHaveBeenCalled()
    await axeCheck(document.body)
  })

  it("saves the checked password and then the card says it is changed", async () => {
    let finish = () => {}
    const onSubmit = vi.fn((_values: { password: string }) => new Promise<void>((resolve) => (finish = resolve)))
    const { user, getByRole } = form({ onSubmit })
    await user.type(first(), "Pencilstub9")
    await user.type(second(), "Pencilstub9")
    await user.click(getByRole("button", save))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ password: "Pencilstub9" }))
    expect(getByRole("button", { name: /Saving/ })).toBeDisabled()
    finish()
    const title = await waitFor(() => getByRole("heading", { level: 1, name: "Password changed" }))
    expect(title).toHaveFocus()
    expect(getByRole("link", { name: "Back to sign in" })).toHaveAttribute("href", "#login")
    expect(document.querySelector('[data-slot="seal"]')).toHaveAttribute("aria-label", "Done")
    await axeCheck(document.body)
  })

  it("shows the message of a failed save and keeps what was typed", async () => {
    const { user, getByRole, findByRole } = form({ onSubmit: vi.fn().mockRejectedValue(new Error("This link has expired.")) })
    await user.type(first(), "Pencilstub9")
    await user.type(second(), "Pencilstub9")
    await user.click(getByRole("button", save))
    const alert = await findByRole("alert")
    expect(alert).toHaveTextContent("That did not go through")
    expect(alert).toHaveTextContent("This link has expired.")
    expect(first()).toHaveValue("Pencilstub9")
  })

  describe("without an onSubmit", () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
    afterEach(() => vi.useRealTimers())

    it("pretends it worked and says nothing was saved", async () => {
      const { user, getByRole, findByRole } = form()
      await user.type(first(), "Pencilstub9")
      await user.type(second(), "Pencilstub9")
      await user.click(getByRole("button", save))
      await vi.advanceTimersByTimeAsync(800)
      expect(await findByRole("heading", { level: 1, name: "Password changed" })).toBeInTheDocument()
      expect(document.body).toHaveTextContent("This is a demo: nothing was saved.")
    })
  })
})
