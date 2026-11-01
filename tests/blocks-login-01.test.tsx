import { describe, expect, it } from "vitest"

import { LoginForm } from "@/blocks/login-01/components/login-01-form"
import Login01Page from "@/blocks/login-01/page"
import { describeAuthPage, describeLoginForm, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "login-01", Page: Login01Page, heading: "Welcome back" })
describeLoginForm({ slug: "login-01", Form: LoginForm as never, socials: ["Sign in with Google"], remember: true })

describe("login-01: the hand-made parts", () => {
  it("has Stubby peeking over the card, taped down, both as decoration", () => {
    const { container } = mountPage(Login01Page)
    expect(container.querySelector('[data-slot="mascot"][data-pose="peek"]')).toHaveAttribute("aria-hidden", "true")
    expect(container.querySelector('[data-slot="tape"]')).toBeInTheDocument()
  })
})
