import { afterEach, beforeEach, describe, expect, it } from "vitest"

import Cta01 from "@/blocks/cta-01/page"
import Faq01 from "@/blocks/faq-01/page"
import Features01 from "@/blocks/features-01/page"
import Footer01 from "@/blocks/footer-01/page"
import LandingHero01 from "@/blocks/landing-hero-01/page"
import LandingHero02 from "@/blocks/landing-hero-02/page"
import Newsletter01 from "@/blocks/newsletter-01/page"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(700, 80)
})
afterEach(() => restore())

describe("browser review: marketing blocks a", () => {
  it("landing-hero-02: the two corner stickers lie ON the page, not behind it (prop layer 3 is under the raised sheet at 8)", () => {
    const { container } = renderUI(<LandingHero02 />)
    const stickers = Array.from(container.querySelectorAll("[data-slot=landing-hero-window] > div > [class*='-bottom-']"))
    expect(stickers).toHaveLength(2)
    for (const s of stickers) {
      expect(s.getAttribute("class")).toContain("z-(--ll-z-raised)")
      expect(s.getAttribute("class")).not.toContain("z-(--ll-z-prop)")
    }
    expect(container.querySelector("[data-slot=paper]")?.className).toContain("@xl:pb-10")
  })

  it("faq-01: a question that wraps keeps the blank ruled line above it (top padding, not only a minimum height)", () => {
    const { getAllByRole } = renderUI(<Faq01 />)
    for (const q of getAllByRole("button", { name: /\?$/ })) {
      expect(q).toHaveClass("pt-7", "min-h-14")
    }
  })

  it("features-01: the pin is placed near the end edge by hand (Paper's own sits mid-edge, on the letters of a title), the clip is on the last card", () => {
    const { container } = renderUI(<Features01 />)
    const cards = Array.from(container.querySelectorAll("[data-slot=features-cards] article"))
    expect(cards).toHaveLength(3)
    const pin = cards[0].querySelector("[data-slot=fastener]")
    expect(pin).toHaveAttribute("data-kind", "pin")
    expect(pin?.getAttribute("class")).toContain("end-10")
    expect(cards[0]).toHaveTextContent("Write together")
    expect(cards[2].querySelector("[data-slot=fastener]")).toHaveAttribute("data-kind", "clip")
  })

  it("the avatar stacks overlap by 2 px, not enough to cover the initials", () => {
    const hero1 = renderUI(<LandingHero01 />)
    expect(hero1.container.querySelector("[data-slot=avatar-group]")?.className).toContain("[&>*+*]:-ms-0.5")
    hero1.unmount()
    const hero2 = renderUI(<LandingHero02 />)
    expect(hero2.container.querySelector("[data-slot=avatar-group]")?.className).toContain("[&>*+*]:-ms-0.5")
  })

  it("the blocks whose tape and ink bleed past a phone's edge clip the sideways overflow on their own frame", () => {
    for (const ui of [<LandingHero01 key="1" />, <LandingHero02 key="2" />, <Newsletter01 key="3" />]) {
      const { container, unmount } = renderUI(ui)
      const root = container.firstElementChild as HTMLElement
      expect(root.className).toContain("@container")
      expect(root.className).toContain("overflow-x-clip")
      unmount()
    }
  })

  it("footer-01: Privacy and Terms are 24 px targets or more and lists keep their list role for Safari", () => {
    const { getByRole, getAllByRole } = renderUI(<Footer01 />)
    expect(getByRole("link", { name: "Privacy" })).toHaveClass("inline-block", "py-1")
    expect(getByRole("link", { name: "Terms" })).toHaveClass("inline-block", "py-1")
    for (const list of getAllByRole("list")) expect(list.getAttribute("role")).toBe("list")
  })

  it("cta-01: the party popper sits clear of the kicker", () => {
    const { container } = renderUI(<Cta01 />)
    const sticker = container.querySelector("[class*='-top-9']")
    expect(sticker?.getAttribute("class")).toContain("-start-5")
  })
})
