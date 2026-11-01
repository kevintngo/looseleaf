import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Underline } from "@/components/ui/underline"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { lineMetrics } from "@/lib/ink/recipes/text-marks-ink"
import { underlineRecipe, type UnderlineKind } from "@/lib/ink/recipes/underline-ink"
import { THREE_LINES, inkSvgs, mockLines } from "./_marks-lib"
import { describeTextMark } from "./_marks-suite"

describeTextMark({
  name: "Underline",
  slot: "underline",
  kind: "underline",
  tag: "span",
  mode: "lines",
  over: false,
  drawOn: "wipe",
  make: (props, children) => <Underline {...props}>{children}</Underline>,
  variants: [{ kind: "double" }, { kind: "wavy" }, { tone: "blue" }, { weight: "brush" }],
})

describe("Underline specifics", () => {
  it("exposes the kind, and its fallback is the browser's underline in the pen's colour", () => {
    const { getByText } = render(<Underline kind="wavy" tone="blue">wavy</Underline>)
    const el = getByText("wavy")
    expect(el).toHaveAttribute("data-kind", "wavy")
    expect(el).toHaveClass("underline", "decoration-ink-you", "data-[ink-ready]:no-underline", "forced-colors:not-data-[mark=off]:underline!")
  })

  it("draws the drawn line and hands the underline back to the pen once it exists", () => {
    const restore = mockLines("underline", THREE_LINES)
    const { getByText } = render(<Underline>drawn</Underline>)
    expect(inkSvgs(getByText("drawn"))).toHaveLength(3)
    expect(getByText("drawn")).toHaveAttribute("data-ink-ready")
    restore()
  })

  it("the recipe: every kind stays in the lo-tier budget and is finite", () => {
    const base = { ...lineMetrics(27, 17), first: true, last: true, n: 1, tone: "ink" as const, weight: "regular" as const }
    for (const kind of ["single", "double", "wavy", "scribble"] as UnderlineKind[]) {
      const f = runRecipe(underlineRecipe, { box: { w: 200, h: 26 }, params: { ...base, kind }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
      const nodes = (f.parts.rest?.match(/<(path|g|use|clipPath)\b/g) ?? []).length
      expect(nodes, kind).toBeLessThanOrEqual(12)
      expect(f.parts.rest?.length ?? 0, kind).toBeLessThan(8000)
      expect(f.parts.rest, kind).not.toMatch(/NaN|undefined|Infinity/)
    }
  })

  it("small text takes the fine-liner, large text a fatter pen", () => {
    const at = (fs: number) => {
      const m = lineMetrics(Math.round(fs * 1.6), fs)
      return runRecipe(underlineRecipe, { box: { w: 200, h: m.ch }, params: { ...m, first: true, last: true, n: 1, kind: "single", tone: "ink", weight: "regular" }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS }).parts.rest ?? ""
    }
    expect(at(13)).not.toBe(at(17))
    expect(at(30)).not.toBe(at(17))
  })
})
