import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Signature } from "@/components/ui/signature"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { signatureRecipe, type SignatureFlourish } from "@/lib/ink/recipes/signature-ink"
import { describeBlockMark } from "./_block-suite"
import { inkSvgs } from "./_marks-lib"

describeBlockMark({
  name: "Signature",
  slot: "signature",
  kind: "signature",
  size: [220, 56],
  drawOn: "reveal",
  make: (props) => <Signature {...props}>Ada Lovelace</Signature>,
  variants: [{ flourish: "underline" }, { tone: "ink" }, { weight: "brush" }, { size: "lg" }],
})

describe("Signature specifics", () => {
  it("the name is real text in its own element, in the script font", () => {
    const { getByText, getByTestId } = render(<Signature data-testid="s">Ada Lovelace</Signature>)
    const name = getByText("Ada Lovelace")
    expect(name).toHaveAttribute("data-slot", "signature-name")
    expect(getByTestId("s")).toHaveClass("font-script", "text-ink-you", "text-[44px]")
    expect(getByTestId("s").textContent).toBe("Ada Lovelace")
  })

  it("keeps its own size when a grid or flex parent would stretch it (the flourish is drawn from the box)", () => {
    const { getByTestId } = render(<Signature data-testid="s">x</Signature>)
    expect(getByTestId("s")).toHaveClass("self-start", "justify-self-start", "inline-block", "pb-3")
  })

  it("the pen line follows the line box (the box less its 12 px of padding), not the padded box", () => {
    const run = (h: number, fs: number) =>
      runRecipe(signatureRecipe, { box: { w: 240, h }, params: { flourish: "underline", tone: "blue", weight: "regular", fs }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS }).parts.rest ?? ""
    const ys = (svg: string) => [...svg.matchAll(/[ML]\s*-?[\d.]+[ ,](-?[\d.]+)/g)].map((m) => Number(m[1]))
    const lowest = (svg: string) => Math.max(...ys(svg))
    expect(lowest(run(56, 44))).toBeLessThan(44)
    expect(lowest(run(80, 44))).toBeGreaterThan(lowest(run(56, 44)))
  })

  it("flourish none draws nothing; the others draw one svg; sizes pick the type size", () => {
    const none = render(<Signature data-testid="n" flourish="none">x</Signature>)
    expect(inkSvgs(none.getByTestId("n"))[0]?.querySelectorAll("path").length ?? 0).toBe(0)
    none.unmount()
    const lg = render(<Signature data-testid="l" size="lg">x</Signature>)
    expect(lg.getByTestId("l")).toHaveClass("text-[64px]")
  })

  it("animate writes the name with a wipe and the flourish through a mask, the flourish a beat later", () => {
    const { getByTestId } = render(<Signature data-testid="s" animate delay={100}>Ada</Signature>)
    const el = getByTestId("s")
    expect(el.className).toContain("signature-name")
    expect(el.style.getPropertyValue("--ll-name-delay")).toBe("100ms")
    expect(el.style.getPropertyValue("--ll-draw-delay")).toBe("800ms")
    expect(inkSvgs(el)[0].innerHTML).toContain('data-part="reveal"')
  })

  it("the recipe: every flourish stays in budget and is finite", () => {
    for (const flourish of ["swoosh", "underline"] as SignatureFlourish[]) {
      for (const animate of [false, true]) {
        const f = runRecipe(signatureRecipe, { box: { w: 240, h: 56 }, params: { flourish, tone: "blue", weight: "regular", fs: 44, animate }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
        expect((f.parts.rest?.match(/<(path|g|use|clipPath|mask)\b/g) ?? []).length, flourish).toBeLessThanOrEqual(16)
        expect(f.parts.rest?.length ?? 0, flourish).toBeLessThan(9000)
        expect(f.parts.rest).not.toMatch(/NaN|undefined|Infinity/)
      }
    }
    expect(runRecipe(signatureRecipe, { box: { w: 240, h: 56 }, params: { flourish: "none", tone: "blue", weight: "regular", fs: 44 }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS }).parts.rest ?? "").toBe("")
  })
})
