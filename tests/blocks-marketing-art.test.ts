import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { icons } from "@/lib/ink/art/icons"
import { doodles } from "@/lib/ink/art/doodles"
import { stickers } from "@/lib/ink/art/stickers"
import { mascot } from "@/lib/ink/art/mascots"

const BLOCKS = [
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
const SCENES = ["hills", "sea", "house", "night"]

function sources(block: string): Array<{ file: string; text: string }> {
  const root = path.join(process.cwd(), "src/blocks", block)
  const out: Array<{ file: string; text: string }> = []
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (/\.tsx?$/.test(e.name)) out.push({ file: path.relative(process.cwd(), p), text: fs.readFileSync(p, "utf8") })
    }
  }
  walk(root)
  return out
}

const strings = (s: string) => Array.from(s.replace(/[!=]==?\s*"[^"]*"/g, "").matchAll(/"([^"]+)"/g), (m) => m[1])
const all = (text: string, re: RegExp) => Array.from(text.matchAll(re))

function used(text: string) {
  const found = { icon: new Set<string>(), doodle: new Set<string>(), sticker: new Set<string>(), pose: new Set<string>(), scene: new Set<string>() }
  for (const m of all(text, /<Icon\b[^>]*?\sname=(?:"([^"]+)"|\{([^}]*)\})/g)) (m[1] ? [m[1]] : strings(m[2])).forEach((n) => found.icon.add(n))
  for (const m of all(text, /\bicon: "([^"]+)"/g)) found.icon.add(m[1])
  for (const m of all(text, /<Doodle\b[^>]*?\sname=(?:"([^"]+)"|\{[^}]*\})/g)) if (m[1]) found.doodle.add(m[1])
  for (const m of all(text, /\bdoodle: "([^"]+)"/g)) found.doodle.add(m[1])
  for (const m of all(text, /<Sticker\b[^>]*?\sname="([^"]+)"/g)) found.sticker.add(m[1])
  for (const m of all(text, /\bpose=(?:"([^"]+)"|\{([^}]*)\})/g)) (m[1] ? [m[1]] : strings(m[2])).forEach((n) => found.pose.add(n))
  for (const m of all(text, /\bscene="([^"]+)"/g)) found.scene.add(m[1])
  return found
}

describe("marketing blocks name only art that exists", () => {
  for (const block of BLOCKS) {
    it(block, () => {
      const missing: string[] = []
      for (const { file, text } of sources(block)) {
        const u = used(text)
        for (const n of u.icon) if (!(n in icons)) missing.push(`${file}: icon "${n}"`)
        for (const n of u.doodle) if (!(n in doodles)) missing.push(`${file}: doodle "${n}"`)
        for (const n of u.sticker) if (!(n in stickers)) missing.push(`${file}: sticker "${n}"`)
        for (const n of u.pose) if (!(n in mascot)) missing.push(`${file}: Stubby pose "${n}"`)
        for (const n of u.scene) if (!SCENES.includes(n)) missing.push(`${file}: polaroid scene "${n}"`)
      }
      expect(missing).toEqual([])
    })
  }

  it("finds something to check (the scan is not empty)", () => {
    const total = BLOCKS.flatMap((b) => sources(b)).reduce((n, s) => {
      const u = used(s.text)
      return n + u.icon.size + u.doodle.size + u.sticker.size + u.pose.size + u.scene.size
    }, 0)
    expect(total).toBeGreaterThan(30)
  })
})
