import { describe, expect, it } from "vitest"

import { LoginForm } from "@/blocks/login-04/components/login-04-form"
import Login04Page from "@/blocks/login-04/page"
import { describeAuthPage, describeLoginForm, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "login-04", Page: Login04Page, heading: "Welcome back" })
describeLoginForm({ slug: "login-04", Form: LoginForm as never, socials: ["Sign in with Apple", "Sign in with Google", "Sign in with GitHub"] })

describe("login-04: the polaroid panel", () => {
  it("has three photographs drawn in marker, taped and pinned, as decoration only", () => {
    const { container } = mountPage(Login04Page)
    const panel = container.querySelector('[data-slot="login-polaroids"]')
    expect(panel).toHaveAttribute("aria-hidden", "true")
    expect(panel?.querySelectorAll('[data-slot="polaroid"]')).toHaveLength(3)
    expect([...(panel?.querySelectorAll('[data-slot="polaroid-caption"]') ?? [])].map((c) => c.textContent)).toEqual(["august", "gran's", "the ferry"])
    expect(panel?.querySelectorAll('[data-slot="tape"]').length).toBeGreaterThanOrEqual(2)
    expect(panel?.querySelector('[data-slot="fastener"][data-kind="pin"]')).toBeInTheDocument()
    expect(panel?.querySelector(":is(a, button, input, [tabindex])")).toBeNull()
  })

  it("opens to two columns by the card's own width and hides the panel below that", () => {
    const { container } = mountPage(Login04Page)
    expect(container.querySelector('[class*="@container/login"]')).toBeInTheDocument()
    const panel = container.querySelector('[data-slot="login-polaroids"]')?.parentElement
    expect(panel?.className).toContain("hidden")
    expect(panel?.className).toContain("@2xl/login:block")
    expect(container.querySelector('[data-slot="card-content"]')?.className).toContain("@2xl/login:grid-cols-2")
  })

  it("puts the three providers in one row of icon buttons that still have names", () => {
    const { getByRole } = mountPage(Login04Page)
    const row = getByRole("button", { name: "Sign in with Apple" }).closest('[data-slot="field"]')
    expect(row?.className).toContain("grid-cols-3")
    expect(row?.querySelectorAll("button")).toHaveLength(3)
  })
})
