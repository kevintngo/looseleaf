import * as React from "react"
import { act, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SignupForm } from "@/blocks/signup-05/components/signup-05-form"
import Signup05Page from "@/blocks/signup-05/page"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { describeAuthPage, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "signup-05", Page: Signup05Page, heading: "Pull up a chair" })

let restore = () => {}
beforeEach(() => {
  restore = mockBox(240, 36)
})
afterEach(() => restore())

const form = (props: Partial<React.ComponentProps<typeof SignupForm>> = {}) => renderUI(<InkProvider><SignupForm {...props} /></InkProvider>)
const start = { name: "Email me a link to start" }

describe("signup-05: email first", () => {
  it("asks for an email, offers a link and two providers, and a way back to sign in", () => {
    const { getByLabelText, getByRole } = form()
    expect(getByLabelText("Email")).toHaveAttribute("autocomplete", "email")
    expect(getByRole("button", start)).toHaveAttribute("type", "submit")
    expect(getByRole("button", { name: "Continue with Apple" })).toBeInTheDocument()
    expect(getByRole("button", { name: "Continue with Google" })).toBeInTheDocument()
    expect(getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "#login")
  })

  it("explains a bad address in the field and keeps the cursor there", async () => {
    const onSubmit = vi.fn()
    const { user, getByRole, getByLabelText } = form({ onSubmit })
    await user.type(getByLabelText("Email"), "ada")
    await user.click(getByRole("button", start))
    expect(getByRole("alert")).toHaveTextContent("Enter a full address, like ada@notes.dev.")
    expect(getByLabelText("Email")).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
    await axeCheck(document.body)
  })

  it("sends the checked address and then says to check the inbox", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { user, getByRole, getByLabelText } = form({ onSubmit })
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", start))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: "ada@notes.dev" }))
    const status = await waitFor(() => getByRole("status"))
    expect(status).toHaveTextContent("Check your inbox")
    expect(status).toHaveTextContent("ada@notes.dev")
    expect(document.querySelector('[data-slot="mascot"]')).toHaveAttribute("data-pose", "celebrate")
    await axeCheck(document.body)
  })

  it("lets you go back and fix the address", async () => {
    const { user, getByRole, getByLabelText } = form({ onSubmit: vi.fn() })
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", start))
    await user.click(await waitFor(() => getByRole("button", { name: "Use a different email" })))
    await waitFor(() => expect(getByLabelText("Email")).toHaveFocus())
    expect(getByLabelText("Email")).toHaveValue("ada@notes.dev")
  })

  it("shows the message of a failed send", async () => {
    const { user, getByRole, getByLabelText, findByRole } = form({ onSubmit: vi.fn().mockRejectedValue(new Error("We are closed on Sundays.")) })
    await user.type(getByLabelText("Email"), "ada@notes.dev")
    await user.click(getByRole("button", start))
    expect(await findByRole("alert")).toHaveTextContent("We are closed on Sundays.")
  })

  describe("without an onSubmit", () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
    afterEach(() => vi.useRealTimers())

    it("pretends it worked and says nothing was sent", async () => {
      const { user, getByRole, getByLabelText, findByRole } = form()
      await user.type(getByLabelText("Email"), "ada@notes.dev")
      await user.click(getByRole("button", start))
      await act(async () => {
        await vi.advanceTimersByTimeAsync(800)
      })
      expect(await findByRole("status")).toHaveTextContent("This is a demo: nothing was sent.")
    })
  })

  it("is a page torn from a pad, laid on the desk", () => {
    const { container } = mountPage(Signup05Page)
    const sheet = container.querySelector('[data-slot="paper"]')
    expect(sheet).toHaveAttribute("data-stock", "pad")
    expect(sheet?.closest('[data-slot="desk"]')).toBeInTheDocument()
  })
})
