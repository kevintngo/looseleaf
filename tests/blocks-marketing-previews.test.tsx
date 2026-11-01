import fs from "node:fs"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDecorativeInk } from "./_blocks-marketing"

const NAMES = [
  "announcement-bar",
  "cta-01",
  "empty-inbox",
  "empty-search",
  "error-404",
  "error-500",
  "faq-01",
  "features-01",
  "footer-01",
  "landing-hero-01",
  "landing-hero-02",
  "logos-01",
  "newsletter-01",
  "onboarding-01",
  "testimonials-01",
]

const previews = import.meta.glob<{ default: React.ComponentType }>("/src/docs/content/blocks/*.tsx")
const metas = import.meta.glob<{ default: { title: string; description?: string; tags?: string[] } }>("/src/docs/content/blocks/*.meta.ts")

let restore = () => {}
beforeEach(() => {
  restore = mockBox(760, 160)
})
afterEach(() => restore())

describe("marketing block previews and metas", () => {
  for (const name of NAMES) {
    describe(name, () => {
      it("has a page, a preview and a meta", () => {
        expect(fs.existsSync(path.join(process.cwd(), "src/blocks", name, "page.tsx"))).toBe(true)
        expect(previews[`/src/docs/content/blocks/${name}.tsx`]).toBeTypeOf("function")
        expect(metas[`/src/docs/content/blocks/${name}.meta.ts`]).toBeTypeOf("function")
      })

      it("has a meta with a title, a description that says which surface it is for, and tags", async () => {
        const meta = (await metas[`/src/docs/content/blocks/${name}.meta.ts`]()).default
        expect(meta.title.length).toBeGreaterThan(3)
        expect(meta.description).toMatch(/paper or (on )?the desk/i)
        expect(meta.tags?.length ?? 0).toBeGreaterThan(1)
      })

      it("renders on the desk, decorative and accessible", async () => {
        const Preview = (await previews[`/src/docs/content/blocks/${name}.tsx`]()).default
        const { container } = renderUI(<Preview />)
        expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
        expectDecorativeInk(container)
        await axeCheck(container)
      })
    })
  }
})
