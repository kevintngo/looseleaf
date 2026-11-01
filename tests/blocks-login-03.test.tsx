import { describe, expect, it } from "vitest"

import { LoginForm } from "@/blocks/login-03/components/login-03-form"
import Login03Page from "@/blocks/login-03/page"
import { describeAuthPage, describeLoginForm, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "login-03", Page: Login03Page, heading: "Welcome back" })
describeLoginForm({ slug: "login-03", Form: LoginForm as never, socials: ["Sign in with Apple", "Sign in with Google"] })

describe("login-03: paper on a quiet desk", () => {
  it("lies on the desk with a coffee ring and a pencil, which are decoration", () => {
    const { container } = mountPage(Login03Page)
    const objects = container.querySelector('[data-slot="desk-objects"]')
    expect(objects).toHaveAttribute("aria-hidden", "true")
    expect([...container.querySelectorAll("[data-object]")].map((o) => o.getAttribute("data-object"))).toEqual(["coffee", "pencil"])
  })

  it("puts the provider buttons above the rule and the fields below it", () => {
    const { getByRole, getByLabelText, getByText } = mountPage(Login03Page)
    const order = [getByRole("button", { name: "Sign in with Apple" }), getByText("Or continue with"), getByLabelText("Email")]
    order.reduce((a, b) => {
      expect(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      return b
    })
  })

  it("puts the terms outside the card, in ink that reads on the desk", () => {
    const { getByRole } = mountPage(Login03Page)
    const terms = getByRole("link", { name: "Terms of Service" })
    expect(terms).toHaveAttribute("href", "#terms")
    expect(terms.closest('[data-slot="card"]')).toBeNull()
    expect(terms.parentElement?.className).toContain("[&>a]:text-foreground")
  })
})
