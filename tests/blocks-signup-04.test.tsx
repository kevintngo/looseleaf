import { describe, expect, it } from "vitest"

import { SignupForm } from "@/blocks/signup-04/components/signup-04-form"
import Signup04Page from "@/blocks/signup-04/page"
import { describeAuthPage, describeSignupForm, mountPage } from "./_blocks-auth-suite"

describeAuthPage({ slug: "signup-04", Page: Signup04Page, heading: "Create your account" })
describeSignupForm({ slug: "signup-04", Form: SignupForm as never, socials: ["Sign up with Apple", "Sign up with Google", "Sign up with GitHub"] })

describe("signup-04: the welcome kit", () => {
  it("is a group of nine stickers on kraft that the card shows from two columns up", () => {
    const { container, getByRole } = mountPage(Signup04Page)
    const kit = getByRole("group", { name: "Welcome kit" })
    expect(kit.querySelectorAll('[data-slot="sticker-sheet-grid"] button')).toHaveLength(9)
    expect(kit.closest(".hidden")?.className).toContain("@2xl/signup:block")
    expect(container.querySelector('[data-slot="card-content"]')?.className).toContain("@2xl/signup:grid-cols-2")
  })

  it("peels a sticker off when you press it and says so", async () => {
    const { user, getByRole } = mountPage(Signup04Page)
    const kit = getByRole("group", { name: "Welcome kit" })
    const first = kit.querySelector<HTMLButtonElement>('[data-slot="sticker-sheet-grid"] button')!
    await user.click(first)
    expect(kit.querySelector('[role="status"]')?.textContent).toMatch(/peeled off/)
    expect(kit).toHaveTextContent("8 left")
  })
})
