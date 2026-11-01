import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Strike } from "@/components/ui/strike"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { strikeRecipe, type StrikeKind } from "@/lib/ink/recipes/strike-ink"
import { lineMetrics } from "@/lib/ink/recipes/text-marks-ink"
import { THREE_LINES, inkSvgs, mockLines } from "./_marks-lib"
import { describeTextMark } from "./_marks-suite"

describeTextMark({
  name: "Strike",
  slot: "strike",
  kind: "strike",
  tag: "s",
  mode: "lines",
  over: true,
  drawOn: "wipe",
  make: (props, children) => <Strike {...props}>{children}</Strike>,
  variants: [{ kind: "double" }, { tone: "ink" }, { weight: "brush" }],
})

describe("Strike specifics", () => {
  it("is a real <s> (no longer accurate) with the browser's line-through as its fallback", () => {
    const { getByText } = render(<Strike>old</Strike>)
    const el = getByText("old")
    expect(el.tagName).toBe("S")
    expect(el).toHaveClass("decoration-red", "data-[ink-ready]:no-underline", "forced-colors:not-data-[mark=off]:line-through!")
  })

  it("a cross-out is ONE drawing over the whole wrapped phrase", () => {
    const restore = mockLines("strike", THREE_LINES)
    const { getByText } = render(<Strike kind="cross">crossed</Strike>)
    expect(inkSvgs(getByText("crossed"))).toHaveLength(1)
    restore()
  })

  it("the recipe: every kind stays in the lo-tier budget and is finite", () => {
    const base = { ...lineMetrics(27, 17), first: true, last: true, n: 1, tone: "red" as const, weight: "regular" as const }
    for (const kind of ["single", "double", "cross"] as StrikeKind[]) {
      const f = runRecipe(strikeRecipe, { box: { w: 220, h: 54 }, params: { ...base, kind }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
      const nodes = (f.parts.rest?.match(/<(path|g|use|clipPath)\b/g) ?? []).length
      expect(nodes, kind).toBeLessThanOrEqual(12)
      expect(f.parts.rest?.length ?? 0, kind).toBeLessThan(8000)
      expect(f.parts.rest, kind).not.toMatch(/NaN|undefined|Infinity/)
    }
  })
})
