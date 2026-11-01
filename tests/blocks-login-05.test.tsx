import * as React from "react"
import { act, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { LoginForm } from "@/blocks/login-05/components/login-05-form"
import Login05Page from "@/blocks/login-05/page"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { describeAuthPage, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "login-05", Page: Login05Page, heading: "Welcome to Looseleaf" })

let restore = () => {}
beforeEach(() => {
  restore = mockBox(240, 36)
})
afterEach(() => restore())

const form = (props: Partial<React.ComponentProps<typeof LoginForm>> = {}) => renderUI(<InkProvider><LoginForm {...props} /></InkProvider>)
const send = { name: "Email me a sign-in link" }

describe("login-05: email first", () => {
  it("asks for an email, offers a link and two providers", () => {
    const { getByLabelText, getByRole } = form()
    expect(getByLabelText("Email")).toHaveAttribute("autocomplete", "email")
    expect(getByRole("button", send)).toHaveAttribute("type", "submit")
    expect(getByRole("button", { name: "Continue with Apple" })).toHaveAttribute("type", "button")
    expect(getByRole("button", { name: "Continue with Google" })).toHaveAttribute("type", "button")
    expect(getByRole("link", { name: "Make an account" })).toHaveAttribute("href", "#signup")
  })

  it("explains an empty or half-typed address in the field", async () => {
    const onSubmit = vi.fn()
    const { user, getByRole, getByLabelText } = form({ onSubmit })
    await user.click(getByRole("button", send))
    expect(getByRole("alert")).toHaveTextContent("Enter a full address, like ada@notes.dev.")
    expect(getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    expect(getByLabelText("Email")).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
    await axeCheck(document.body)
  })

  it("sends the checked address, shows the work, then says the link is on its way", async () => {
    let finish = () => {}
    const onSubmit = vi.fn((_values: { email: string }) => new Promise<void>((resolve) => (finish = resolve)))
    const { user, getByRole, getByLabelText } = form({ onSubmit })
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", send))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: "ada@notes.dev" }))
    expect(getByRole("button", { name: /Sending/ })).toBeDisabled()
    await act(async () => finish())
    const status = getByRole("status")
    expect(status).toHaveTextContent("Your link is on its way")
    expect(status).toHaveTextContent("ada@notes.dev")
    expect(status).not.toHaveTextContent("demo")
    expect(document.querySelector('[data-slot="mascot"]')).toHaveAttribute("data-pose", "celebrate")
    await axeCheck(document.body)
  })

  it("lets you go back and fix the address, with the cursor in the field and the address kept", async () => {
    const { user, getByRole, getByLabelText } = form({ onSubmit: vi.fn() })
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", send))
    await user.click(await waitFor(() => getByRole("button", { name: "Use a different email" })))
    await waitFor(() => expect(getByLabelText("Email")).toHaveFocus())
    expect(getByLabelText("Email")).toHaveValue("ada@notes.dev")
    expect(document.querySelector('[data-slot="mascot"]')).toHaveAttribute("data-pose", "wave")
  })

  it("shows the message of a failed send and keeps the field", async () => {
    const { user, getByRole, getByLabelText, findByRole } = form({ onSubmit: vi.fn().mockRejectedValue(new Error("Too many links today. Try tomorrow.")) })
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", send))
    const alert = await findByRole("alert")
    expect(alert).toHaveTextContent("That did not go through")
    expect(alert).toHaveTextContent("Too many links today. Try tomorrow.")
    expect(getByLabelText("Email")).toHaveValue("ada@notes.dev")
  })

  describe("without an onSubmit", () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
    afterEach(() => vi.useRealTimers())

    it("pretends it worked and says nothing was sent", async () => {
      const { user, getByRole, getByLabelText, findByRole } = form()
      await user.type(getByLabelText("Email"), "ada@notes.dev")
      await user.click(getByRole("button", send))
      await act(async () => {
        await vi.advanceTimersByTimeAsync(800)
      })
      expect(await findByRole("status")).toHaveTextContent("This is a demo: nothing was sent.")
    })
  })

  it("is a plain sheet of paper for a page, with Stubby waving", () => {
    const { container } = mountPage(Login05Page)
    const page = container.querySelector('[data-slot="paper"]')
    expect(page).toHaveAttribute("data-stock", "paper")
    expect(page?.className).toContain("min-h-svh")
    expect(container.querySelector('[data-slot="mascot"]')).toHaveAttribute("data-pose", "wave")
    expect(container.querySelector('[data-slot="card"]')).toBeNull()
  })
})
