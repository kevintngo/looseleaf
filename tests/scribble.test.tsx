import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Scribble } from "@/components/ui/scribble"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { scribbleRecipe } from "@/lib/ink/recipes/scribble-ink"
import { lineMetrics } from "@/lib/ink/recipes/text-marks-ink"
import { describeTextMark } from "./_marks-suite"

describeTextMark({
  name: "Scribble",
  slot: "scribble",
  kind: "scribble",
  tag: "span",
  mode: "lines",
  over: true,
  drawOn: "wipe",
  make: (props, children) => <Scribble {...props}>{children}</Scribble>,
  variants: [{ tone: "red" }, { weight: "fine" }],
})

describe("Scribble specifics", () => {
  it("leaves the words in the DOM (it is a look, not redaction) and falls back to a line-through", () => {
    const { getByText } = render(<Scribble>hunter2</Scribble>)
    expect(getByText("hunter2").textContent).toBe("hunter2")
    expect(getByText("hunter2")).toHaveClass("line-through", "data-[ink-ready]:no-underline")
  })

  it("the recipe stays in the budget for a long line, and calm density draws one pass fewer", () => {
    const base = { ...lineMetrics(27, 17), first: true, last: true, n: 1, tone: "ink" as const, weight: "regular" as const }
    const run = (w: number, density: "comfortable" | "calm") => runRecipe(scribbleRecipe, { box: { w, h: 26 }, params: base, seed: "s", tier: "lo", density, dir: "ltr", knobs: DEFAULT_KNOBS }).parts.rest ?? ""
    const long = run(420, "comfortable")
    expect((long.match(/<(path|g|use|clipPath)\b/g) ?? []).length).toBeLessThanOrEqual(12)
    expect(long).not.toMatch(/NaN|undefined|Infinity/)
    expect(run(300, "calm").length).toBeLessThan(run(300, "comfortable").length)
  })
})
