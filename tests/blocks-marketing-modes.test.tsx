import * as React from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import AnnouncementBar from "@/blocks/announcement-bar/page"
import Cta01 from "@/blocks/cta-01/page"
import EmptyInbox from "@/blocks/empty-inbox/page"
import EmptySearch from "@/blocks/empty-search/page"
import Error404 from "@/blocks/error-404/page"
import Error500 from "@/blocks/error-500/page"
import Faq01 from "@/blocks/faq-01/page"
import Features01 from "@/blocks/features-01/page"
import Footer01 from "@/blocks/footer-01/page"
import LandingHero01 from "@/blocks/landing-hero-01/page"
import LandingHero02 from "@/blocks/landing-hero-02/page"
import Logos01 from "@/blocks/logos-01/page"
import Newsletter01 from "@/blocks/newsletter-01/page"
import Onboarding01 from "@/blocks/onboarding-01/page"
import Testimonials01 from "@/blocks/testimonials-01/page"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk } from "./_blocks-marketing"

const BLOCKS: Array<[string, () => React.ReactElement]> = [
  ["announcement-bar", () => <AnnouncementBar />],
  ["cta-01", () => <Cta01 />],
  ["empty-inbox", () => <EmptyInbox />],
  ["empty-search", () => <EmptySearch />],
  ["error-404", () => <Error404 onGoBack={() => {}} />],
  ["error-500", () => <Error500 onRetry={() => {}} />],
  ["faq-01", () => <Faq01 />],
  ["features-01", () => <Features01 />],
  ["features-01 bento", () => <Features01 variant="bento" />],
  ["footer-01", () => <Footer01 />],
  ["landing-hero-01", () => <LandingHero01 />],
  ["landing-hero-02", () => <LandingHero02 />],
  ["logos-01", () => <Logos01 />],
  ["newsletter-01", () => <Newsletter01 />],
  ["onboarding-01", () => <Onboarding01 />],
  ["testimonials-01", () => <Testimonials01 />],
]

const MODES = [
  { name: "compact density", provider: { density: "compact" as const } },
  { name: "calm density", provider: { density: "calm" as const } },
  { name: "reduced motion", provider: { motion: "reduced" as const } },
  { name: "hi tier", provider: { tier: "hi" as const } },
]

let restore = () => {}
beforeEach(() => {
  restore = mockBox(760, 160)
})
afterEach(() => restore())

describe("marketing blocks in every mode", () => {
  for (const [name, make] of BLOCKS) {
    describe(name, () => {
      for (const mode of MODES) {
        it(`renders in ${mode.name} with decorative drawings and no axe violations`, async () => {
          const { container } = renderUI(<InkProvider {...mode.provider}>{make()}</InkProvider>)
          expect(container.textContent?.length ?? 0).toBeGreaterThan(20)
          expectDecorativeInk(container)
          await axeCheck(container)
        })
      }

      it("renders right-to-left with no axe violations", async () => {
        const { container } = renderUI(
          <div dir="rtl">
            <InkProvider dir="rtl">{make()}</InkProvider>
          </div>,
        )
        expect(container.textContent?.length ?? 0).toBeGreaterThan(20)
        expectDecorativeInk(container)
        await axeCheck(container)
      })
    })
  }
})
