import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Bracket } from "@/components/ui/bracket"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { bracketRecipe, type BracketKind, type BracketParams } from "@/lib/ink/recipes/bracket-ink"
import { inkSvgs } from "./_marks-lib"
import { describeBlockMark } from "./_block-suite"
import { mockBox } from "./helpers"

describeBlockMark({
  name: "Bracket",
  slot: "bracket",
  kind: "bracket",
  size: [320, 120],
  drawOn: "reveal",
  make: (props) => <Bracket {...props}>the block</Bracket>,
  variants: [{ kind: "curly" }, { kind: "round" }, { side: "end" }, { tone: "blue" }, { weight: "brush" }],
})

describe("Bracket specifics", () => {
  it("reserves its own padding on the side it draws on (logical, so it flips in rtl) and exposes kind and side", () => {
    const restore = mockBox(320, 120)
    const a = render(<Bracket data-testid="a">x</Bracket>)
    expect(a.getByTestId("a")).toHaveClass("ps-7")
    expect(a.getByTestId("a")).toHaveAttribute("data-side", "start")
    expect(a.getByTestId("a")).toHaveAttribute("data-kind", "square")
    a.unmount()
    const b = render(<Bracket data-testid="b" side="end" kind="curly">x</Bracket>)
    expect(b.getByTestId("b")).toHaveClass("pe-7")
    expect(b.getByTestId("b")).toHaveAttribute("data-kind", "curly")
    restore()
  })

  it("does not touch the content", () => {
    const restore = mockBox(320, 120)
    const { getByText } = render(<Bracket><p>kept as is</p></Bracket>)
    expect(getByText("kept as is").tagName).toBe("P")
    restore()
  })

  it("the recipe: budgets for every kind and side, mirrored by direction", () => {
    const base: BracketParams = { kind: "square", side: "start", tone: "ink", weight: "regular", inset: 8 }
    const run = (p: Partial<BracketParams>, dir: "ltr" | "rtl" = "ltr", h = 240) => runRecipe(bracketRecipe, { box: { w: 200, h }, params: { ...base, ...p }, seed: "s", tier: "lo", density: "comfortable", dir, knobs: DEFAULT_KNOBS })
    for (const kind of ["square", "curly", "round"] as BracketKind[]) {
      for (const side of ["start", "end"] as const) {
        for (const animate of [false, true]) {
          const f = run({ kind, side, animate })
          expect((f.parts.rest?.match(/<(path|g|use|clipPath|mask)\b/g) ?? []).length, `${kind} ${side}`).toBeLessThanOrEqual(14)
          expect(f.parts.rest?.length ?? 0).toBeLessThan(6000)
          expect(f.parts.rest).not.toMatch(/NaN|undefined|Infinity/)
        }
      }
    }
    expect(run({ side: "start" }, "rtl").parts.rest).not.toBe(run({ side: "start" }).parts.rest)
    expect(run({ side: "end" }, "rtl").parts.rest).not.toBe(run({ side: "end" }).parts.rest)
    expect(run({}, "ltr", 60).parts.rest).not.toMatch(/NaN/)
  })

  it("draws the same footprint in a tiny box", () => {
    const restore = mockBox(40, 12)
    const { getByTestId } = render(<Bracket data-testid="t">x</Bracket>)
    expect(inkSvgs(getByTestId("t"))).toHaveLength(1)
    restore()
  })
})
