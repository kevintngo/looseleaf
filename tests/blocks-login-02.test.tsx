import { describe, expect, it } from "vitest"

import { LoginForm } from "@/blocks/login-02/components/login-02-form"
import Login02Page from "@/blocks/login-02/page"
import { describeAuthPage, describeLoginForm, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "login-02", Page: Login02Page, heading: "Good to see you again" })
describeLoginForm({ slug: "login-02", Form: LoginForm as never, socials: ["Sign in with GitHub"] })

describe("login-02: the cover slot", () => {
  it("is a decorative collage on the desk beside the form, hidden until the page is wide", () => {
    const { container } = mountPage(Login02Page)
    const cover = container.querySelector('[data-slot="login-cover"]')
    expect(cover).toBeInTheDocument()
    expect(cover?.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(cover?.closest('[data-slot="desk"]')?.className).toContain("hidden")
    expect(cover?.closest('[data-slot="desk"]')?.className).toContain("@3xl/page:flex")
    expect(cover?.querySelector('[data-slot="mascot"][data-pose="wave"]')).toBeInTheDocument()
    expect(cover?.querySelectorAll('[data-slot="sticker"]').length).toBe(0)
    expect(cover?.querySelector('[data-slot="sticky-note"]')).toHaveTextContent("psst: tab works too")
  })

  it("keeps everything you can use out of the decoration", () => {
    const { container } = mountPage(Login02Page)
    expect(container.querySelector('[data-slot="login-cover"] :is(a, button, input, [tabindex])')).toBeNull()
  })
})
