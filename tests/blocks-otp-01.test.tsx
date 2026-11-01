import * as React from "react"
import { act, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DEMO_CODE, OtpForm } from "@/blocks/otp-01/components/otp-01-form"
import Otp01Page from "@/blocks/otp-01/page"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { describeAuthPage, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "otp-01", Page: Otp01Page, heading: "Check your email" })

let restore = () => {}
beforeEach(() => {
  restore = mockBox(240, 36)
  if (!document.elementFromPoint) document.elementFromPoint = () => null
})
afterEach(() => restore())

const form = (props: Partial<React.ComponentProps<typeof OtpForm>> = {}) => renderUI(<InkProvider><OtpForm {...props} /></InkProvider>)
const box = () => document.querySelector<HTMLInputElement>('[data-slot="input-otp"]')!

describe("otp-01: the code", () => {
  it("has six boxes behind one labeled field that asks the phone for the code", () => {
    const { getByLabelText, getByRole } = form()
    expect(document.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(6)
    expect(getByLabelText("Verification code")).toBe(box())
    expect(box()).toHaveAttribute("inputmode", "numeric")
    expect(box()).toHaveAttribute("autocomplete", "one-time-code")
    expect(getByRole("button", { name: "Verify" })).toBeDisabled()
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Check your email")
  })

  it("names the address the code went to", () => {
    const { container } = form({ email: "jo@paper.club" })
    expect(container.querySelector("strong")).toHaveTextContent("jo@paper.club")
  })

  describe("with the demo check", () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
    afterEach(() => vi.useRealTimers())

    it("checks by itself on the sixth digit and then shows the verified card", async () => {
      const onContinue = vi.fn()
      const { user, getByRole } = form({ onContinue })
      await user.click(box())
      await user.keyboard(DEMO_CODE)
      expect(getByRole("button", { name: /Checking/ })).toBeDisabled()
      expect(box()).toBeDisabled()
      await act(async () => {
        await vi.advanceTimersByTimeAsync(700)
      })
      expect(getByRole("heading", { level: 1 })).toHaveTextContent("You are verified")
      expect(document.querySelector('[data-slot="seal"]')).toHaveAttribute("aria-label", "Verified")
      await user.click(getByRole("button", { name: "Continue" }))
      expect(onContinue).toHaveBeenCalledTimes(1)
      await axeCheck(document.body)
    })

    it("turns the boxes red, clears them and says so when the code is wrong", async () => {
      const { user, getByRole } = form()
      await user.click(box())
      await user.keyboard("111111")
      await act(async () => {
        await vi.advanceTimersByTimeAsync(700)
      })
      expect(getByRole("alert")).toHaveTextContent("That code is not right")
      expect(box()).toHaveAttribute("aria-invalid", "true")
      expect(box().getAttribute("aria-describedby")).toBe(getByRole("alert").id)
      expect(box()).toHaveValue("")
      expect(box()).toHaveFocus()
      expect(document.querySelector('[data-slot="mascot"]')).toHaveAttribute("data-pose", "oops")
      await axeCheck(document.body)
      await user.keyboard("2")
      expect(box()).not.toHaveAttribute("aria-invalid")
    })

    it("takes a pasted code with a space or a hyphen in it", async () => {
      const { user, getByRole } = form()
      await user.click(box())
      await user.paste("246-810")
      await act(async () => {
        await vi.advanceTimersByTimeAsync(700)
      })
      expect(getByRole("heading", { level: 1 })).toHaveTextContent("You are verified")
    })

    it("refuses letters", async () => {
      const { user } = form()
      await user.click(box())
      await user.keyboard("ab12")
      expect(box()).toHaveValue("12")
    })

    it("counts out the wait in words and brings back Resend afterwards", async () => {
      const onResend = vi.fn()
      const { user, getByRole, queryByRole } = form({ onResend, resendAfter: 3 })
      expect(getByRole("timer")).toHaveTextContent("ask again in 3s")
      expect(queryByRole("button", { name: "Resend code" })).toBeNull()
      for (let second = 0; second < 3; second++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000)
        })
      }
      expect(queryByRole("timer")).toBeNull()
      await user.click(getByRole("button", { name: "Resend code" }))
      expect(onResend).toHaveBeenCalledTimes(1)
      expect(getByRole("timer")).toHaveTextContent("ask again in 3s")
      expect(box()).toHaveFocus()
      const status = document.querySelector('p[role="status"]')
      expect(status).toHaveTextContent("A new code is on its way.")
    })
  })

  it("asks your own check, and a check that throws is not the same as a wrong code", async () => {
    const onVerify = vi.fn().mockRejectedValue(new Error("offline"))
    const { user, findByRole } = form({ onVerify })
    await user.click(box())
    await user.keyboard("123456")
    expect(await findByRole("alert")).toHaveTextContent("We could not check that code")
    expect(onVerify).toHaveBeenCalledWith("123456")
  })

  it("verifies with the button too, once", async () => {
    const onVerify = vi.fn().mockResolvedValue(true)
    const { user, findByRole } = form({ onVerify })
    await user.click(box())
    await user.keyboard("123456")
    expect(await findByRole("heading", { level: 1, name: "You are verified" })).toBeInTheDocument()
    expect(onVerify).toHaveBeenCalledTimes(1)
  })

  it("puts a sticky note with the demo code on the page, outside the form", () => {
    const { container } = mountPage(Otp01Page)
    const note = container.querySelector('[data-slot="sticky-note"]')
    expect(note).toHaveTextContent(`the demo code is ${DEMO_CODE}`)
    expect(note?.closest("form")).toBeNull()
  })
})
