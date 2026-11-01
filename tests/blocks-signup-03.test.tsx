import { describe, expect, it } from "vitest"

import { SignupForm } from "@/blocks/signup-03/components/signup-03-form"
import Signup03Page from "@/blocks/signup-03/page"
import { describeAuthPage, describeSignupForm, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "signup-03", Page: Signup03Page, heading: "Create your account" })
describeSignupForm({ slug: "signup-03", Form: SignupForm as never, socials: [] })

describe("signup-03: the strength tally", () => {
  it("counts nothing until you type, then one stroke per thing the password does right", async () => {
    const { user, getByLabelText, container } = mountPage(Signup03Page)
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).toHaveTextContent("")
    expect(container.querySelector('[data-slot="tally"]')).toBeNull()
    const pw = getByLabelText("Password", { selector: "input" })
    await user.type(pw, "abc")
    expect(live).toHaveTextContent("weak")
    expect(container.querySelector('[data-slot="tally"]')).toHaveAttribute("aria-label", "Password strength: weak")
    await user.clear(pw)
    await user.type(pw, "pencilstub9")
    expect(live).toHaveTextContent("okay")
    await user.clear(pw)
    await user.type(pw, "Pencilstub9")
    expect(live).toHaveTextContent("good")
    await user.clear(pw)
    await user.type(pw, "Pencil-Stub-9-forever")
    expect(live).toHaveTextContent("strong")
    await user.clear(pw)
    expect(live).toHaveTextContent("")
  })

  it("puts the two password fields in a container-query grid and the terms under the card", () => {
    const { container, getByRole } = mountPage(Signup03Page)
    expect(container.querySelector('[class*="@[20rem]/pw:grid-cols-2"]')).toBeInTheDocument()
    expect(getByRole("link", { name: "Privacy Policy" }).closest('[data-slot="card"]')).toBeNull()
  })

  it("lies on a desk with clips and pins", () => {
    const { container } = mountPage(Signup03Page)
    expect([...container.querySelectorAll("[data-object]")].map((o) => o.getAttribute("data-object"))).toEqual(["clips", "pins"])
  })
})
