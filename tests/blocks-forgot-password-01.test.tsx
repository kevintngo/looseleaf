import * as React from "react"
import { waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ForgotPasswordForm } from "@/blocks/forgot-password-01/components/forgot-password-01-form"
import ForgotPassword01Page from "@/blocks/forgot-password-01/page"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { describeAuthPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "forgot-password-01", Page: ForgotPassword01Page, heading: "Forgot your password?" })

let restore = () => {}
beforeEach(() => {
  restore = mockBox(240, 36)
})
afterEach(() => restore())

const form = (props: Partial<React.ComponentProps<typeof ForgotPasswordForm>> = {}) => renderUI(<InkProvider><ForgotPasswordForm {...props} /></InkProvider>)
const send = { name: "Send reset link" }

describe("forgot-password-01", () => {
  it("has one labelled field, one button and a way back", () => {
    const { getByLabelText, getByRole } = form()
    expect(getByLabelText("Email")).toHaveAttribute("autocomplete", "email")
    expect(getByRole("button", send)).toHaveAttribute("type", "submit")
    expect(getByRole("link", { name: "Back to sign in" })).toHaveAttribute("href", "#login")
  })

  it("explains a bad address in the field and sends nothing", async () => {
    const onSubmit = vi.fn()
    const { user, getByRole, getByLabelText } = form({ onSubmit })
    await user.click(getByRole("button", send))
    expect(getByRole("alert")).toHaveTextContent("Enter a full address, like ada@notes.dev.")
    expect(getByLabelText("Email")).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
    await axeCheck(document.body)
  })

  it("sends the address, then the card says a link is on its way without saying whether the account exists", async () => {
    let finish = () => {}
    const onSubmit = vi.fn((_values: { email: string }) => new Promise<void>((resolve) => (finish = resolve)))
    const { user, getByRole, getByLabelText } = form({ onSubmit })
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", send))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: "ada@notes.dev" }))
    expect(getByRole("button", { name: /Sending/ })).toBeDisabled()
    finish()
    const title = await waitFor(() => getByRole("heading", { level: 1, name: "Check your email" }))
    expect(title).toHaveFocus()
    expect(document.body).toHaveTextContent("If ada@notes.dev has an account, a link to choose a new password is on its way.")
    expect(getByRole("link", { name: "Back to sign in" })).toHaveAttribute("href", "#login")
    await axeCheck(document.body)
  })

  it("can send it again, and says so", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { user, getByRole, getByLabelText } = form({ onSubmit })
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", send))
    await user.click(await waitFor(() => getByRole("button", { name: "send it again" })))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
    expect(onSubmit).toHaveBeenLastCalledWith({ email: "ada@notes.dev" })
    await waitFor(() => expect(document.querySelector('p[role="status"]')).toHaveTextContent("We sent the link again."))
  })

  it("shows the message of a failed send and keeps the field", async () => {
    const { user, getByRole, getByLabelText, findByRole } = form({ onSubmit: vi.fn().mockRejectedValue(new Error("Slow down: one link a minute.")) })
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", send))
    const alert = await findByRole("alert")
    expect(alert).toHaveTextContent("Slow down: one link a minute.")
    expect(getByLabelText("Email")).toHaveValue("ada@notes.dev")
  })

  describe("without an onSubmit", () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
    afterEach(() => vi.useRealTimers())

    it("pretends it worked and says nothing was sent", async () => {
      const { user, getByRole, getByLabelText, findByRole } = form()
      await user.type(getByLabelText("Email"), "ada@notes.dev")
      await user.click(getByRole("button", send))
      await vi.advanceTimersByTimeAsync(800)
      expect(await findByRole("heading", { level: 1, name: "Check your email" })).toBeInTheDocument()
      expect(document.body).toHaveTextContent("This is a demo: nothing was sent.")
    })
  })
})
