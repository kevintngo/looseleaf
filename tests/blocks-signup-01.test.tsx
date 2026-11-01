import { describe, expect, it } from "vitest"

import { SignupForm } from "@/blocks/signup-01/components/signup-01-form"
import Signup01Page from "@/blocks/signup-01/page"
import { describeAuthPage, describeSignupForm, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "signup-01", Page: Signup01Page, heading: "Create an account" })
describeSignupForm({ slug: "signup-01", Form: SignupForm as never, socials: ["Sign up with Google"] })

describe("signup-01: a guest check", () => {
  it("is clipped, with a dashed rule under the title and above the footer", () => {
    const { container } = mountPage(Signup01Page)
    expect(container.querySelector('[data-slot="fastener"][data-kind="clip"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-header"]')?.className).toContain("border-b")
    expect(container.querySelector('[data-slot="card-footer"]')?.className).toContain("border-t")
    expect(container.querySelector('[data-slot="card-footer"]')).toHaveTextContent("No. 0042")
  })

  it("describes each field's hint and message to the field", () => {
    const { getByLabelText } = mountPage(Signup01Page)
    const email = getByLabelText("Email")
    expect(document.getElementById(email.getAttribute("aria-describedby") ?? "")).toHaveTextContent("never share it")
    const password = getByLabelText("Password", { selector: "input" })
    expect(document.getElementById(password.getAttribute("aria-describedby") ?? "")).toHaveTextContent("At least 8 characters and one number.")
  })
})
