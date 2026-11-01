import { describe, expect, it } from "vitest"

import { SignupForm } from "@/blocks/signup-02/components/signup-02-form"
import Signup02Page from "@/blocks/signup-02/page"
import { describeAuthPage, describeSignupForm, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "signup-02", Page: Signup02Page, heading: "Create your account" })
describeSignupForm({ slug: "signup-02", Form: SignupForm as never, socials: ["Sign up with GitHub"] })

describe("signup-02: admit one", () => {
  it("shows the ticket beside the form, stub and number included, as decoration", () => {
    const { container } = mountPage(Signup02Page)
    const board = container.querySelector('[data-slot="signup-ticket"]')
    expect(board).toHaveAttribute("aria-hidden", "true")
    expect(board?.closest('[data-slot="desk"]')?.className).toContain("@3xl/page:flex")
    expect(board?.querySelector('[data-slot="ticket-title"]')).toHaveTextContent(/admit one/i)
    expect(board?.querySelector('[data-slot="ticket-stub"]')).toHaveTextContent("0001")
    expect(board?.querySelector('[data-slot="stamp"]')).toBeInTheDocument()
    expect(board?.querySelector('[data-slot="mascot"][data-pose="celebrate"]')).toBeInTheDocument()
  })

  it("keeps everything you can use out of the ticket panel", () => {
    const { container } = mountPage(Signup02Page)
    expect(container.querySelector('[data-slot="signup-ticket"] :is(a, button, input, [tabindex])')).toBeNull()
  })
})
