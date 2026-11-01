import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Squiggle } from "@/components/ui/squiggle"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { SQUIGGLE_KINDS, squiggleRecipe, type SquiggleParams } from "@/lib/ink/recipes/squiggle-ink"
import { describeBlockMark } from "./_block-suite"

describeBlockMark({
  name: "Squiggle",
  slot: "squiggle",
  kind: "squiggle",
  size: [400, 16],
  drawOn: "reveal",
  make: (props) => <Squiggle {...props} />,
  variants: [{ kind: "zigzag" }, { kind: "loops" }, { kind: "scallops" }, { kind: "dashes" }, { kind: "dots" }, { tone: "blue" }, { orientation: "vertical" }],
})

describe("Squiggle specifics", () => {
  it("is decorative by default (role none) and a real separator with decorative={false}", () => {
    const a = render(<Squiggle data-testid="a" />)
    expect(a.getByTestId("a")).toHaveAttribute("role", "none")
    expect(a.getByTestId("a")).not.toHaveAttribute("aria-orientation")
    a.unmount()
    const b = render(<Squiggle data-testid="b" decorative={false} orientation="vertical" />)
    expect(b.getByTestId("b")).toHaveAttribute("role", "separator")
    expect(b.getByTestId("b")).toHaveAttribute("aria-orientation", "vertical")
    expect(b.getByTestId("b")).toHaveAttribute("data-orientation", "vertical")
  })

  it("full width and 16 px high by default; a vertical one is 16 px wide; className resizes", () => {
    const a = render(<Squiggle data-testid="a" />)
    expect(a.getByTestId("a")).toHaveClass("h-4", "w-full")
    a.unmount()
    const b = render(<Squiggle data-testid="b" orientation="vertical" />)
    expect(b.getByTestId("b")).toHaveClass("w-4", "h-full")
    b.unmount()
    const c = render(<Squiggle data-testid="c" className="h-6 w-40" />)
    expect(c.getByTestId("c")).toHaveClass("h-6", "w-40")
    expect(c.getByTestId("c")).not.toHaveClass("h-4")
  })

  it("the recipe: every kind and orientation stays in budget, finite, and animates through a mask", () => {
    const base: SquiggleParams = { kind: "wavy", orientation: "horizontal", tone: "ink", weight: "regular" }
    const seen = new Set<string>()
    for (const kind of SQUIGGLE_KINDS) {
      for (const orientation of ["horizontal", "vertical"] as const) {
        const box = orientation === "horizontal" ? { w: 420, h: 16 } : { w: 16, h: 200 }
        const f = runRecipe(squiggleRecipe, { box, params: { ...base, kind, orientation }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
        expect(f.parts.rest?.length ?? 0, `${kind} ${orientation}`).toBeLessThan(14000)
        expect((f.parts.rest?.match(/<(path|g|use|clipPath|mask)\b/g) ?? []).length, kind).toBeLessThanOrEqual(24)
        expect(f.parts.rest).not.toMatch(/NaN|undefined|Infinity/)
        seen.add(f.parts.rest ?? "")
        const anim = runRecipe(squiggleRecipe, { box, params: { ...base, kind, orientation, animate: true }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
        expect(anim.parts.rest).toContain('data-part="reveal"')
      }
    }
    expect(seen.size).toBe(SQUIGGLE_KINDS.length * 2)
  })

  it("handles absurd boxes without a throw", () => {
    for (const box of [{ w: 4, h: 2 }, { w: 2000, h: 40 }, { w: 6, h: 3000 }]) {
      for (const orientation of ["horizontal", "vertical"] as const) {
        const f = runRecipe(squiggleRecipe, { box, params: { kind: "loops", orientation, tone: "ink", weight: "regular" }, seed: "s", tier: "lo", density: "calm", dir: "rtl", knobs: DEFAULT_KNOBS })
        expect(f.parts.rest ?? "").not.toMatch(/NaN|Infinity/)
      }
    }
  })
})
