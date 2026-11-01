import * as React from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

const modules = import.meta.glob<{ default: React.ComponentType; meta: { title: string } }>("../src/docs/examples/chart/*.tsx", { eager: true })

let restore = () => {}
beforeEach(() => {
  restore = mockBox(520, 280)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

describe("chart examples", () => {
  const entries = Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))
  it("there are examples for every chart type", () => {
    expect(entries.length).toBeGreaterThanOrEqual(15)
  })
  for (const [path, mod] of entries) {
    it(`${path.split("/").pop()}: ${mod.meta.title} draws its charts and passes axe`, async () => {
      const Example = mod.default
      const { container } = renderUI(
        <InkProvider>
          <Example />
        </InkProvider>,
      )
      const charts = container.querySelectorAll("[data-slot=chart]")
      const canvases = container.querySelectorAll("[data-chart-type]")
      expect(canvases.length).toBeGreaterThan(0)
      for (const c of canvases) {
        expect(c).toHaveAttribute("aria-label")
        expect(c.getAttribute("aria-label")).not.toBe("")
        expect(c.hasAttribute("aria-describedby")).toBe(true)
      }
      expectInkLayers(container, { min: 1 })
      expect(container.querySelector('svg[data-ink="chart"]')).toBeTruthy()
      expect(charts.length + canvases.length).toBeGreaterThan(0)
      await axeCheck(container)
    })
  }
})
