import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { ruleGeometry } from "@/lib/ink/paper/stocks"
import { INDEX_CARD, indexCardRecipe, type IndexCardParams } from "@/lib/ink/recipes/index-card-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(440, 264)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Card(props: React.ComponentProps<typeof IndexCard>) {
  return (
    <IndexCard {...props}>
      <IndexCardHeader>
        <IndexCardTitle>Recipes</IndexCardTitle>
      </IndexCardHeader>
      <IndexCardContent>oat porridge, the slow way</IndexCardContent>
      <IndexCardFooter>
        <span>no. 0042</span>
        <span>p. 3</span>
      </IndexCardFooter>
    </IndexCard>
  )
}

describe("IndexCard", () => {
  it("renders its parts with their data-slots on index-card stock with the printed rules", () => {
    const { container } = render(<Card />)
    for (const slot of ["index-card", "index-card-header", "index-card-title", "index-card-content", "index-card-footer"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    const card = container.firstElementChild as HTMLElement
    expect(card).toHaveAttribute("data-stock", "index-card")
    expect(card).toHaveClass("ll-paper", "flex", "flex-col", "leading-[30px]")
    expect(container.querySelector('[data-slot="paper-rules"]')).not.toBeNull()
    expect(card.className).toContain("rtl:[&>[data-slot=paper-rules]]:-scale-x-100")
  })

  it("lays out on the printed rules: a 49 px header zone (the first line box of the grid), the body starting where it ends", () => {
    const { container } = render(<Card />)
    expect(container.querySelector('[data-slot="index-card-header"]')).toHaveClass("h-[49px]", "items-end", "pb-1.5")
    expect(container.querySelector('[data-slot="index-card-content"]')).toHaveClass("flex-1")
    expect(container.querySelector('[data-slot="index-card-content"]')!.className).not.toMatch(/\bpt-/)
    expect(ruleGeometry("index").first).toBe(49)
    expect(ruleGeometry("index").pitch).toBe(30)
    expect(container.querySelector('[data-slot="index-card-footer"]')).toHaveClass("mt-auto", "justify-between", "leading-[30px]")
    expect(container.firstElementChild).toHaveClass("pb-[25px]", "min-h-56")
    expect(container.querySelector('[data-slot="index-card-title"]')).toHaveClass("font-script")
  })

  it("a plain card is pure CSS: no svg; a hole, a flag or a stack add one layer of ink on the root", () => {
    const { container, rerender } = render(<Card />)
    expect(container.querySelector("svg")).toBeNull()
    rerender(<Card hole />)
    const card = container.firstElementChild as HTMLElement
    const svg = container.querySelector('svg[data-ink="index-card"]')!
    expect(svg.parentElement).toBe(card)
    expect(card).toHaveAttribute("data-ink-ready")
    expect(card).toHaveClass("pb-[25px]")
    expectInkLayers(container, { min: 1, kinds: ["index-card"], absolute: true, layers: ["rest"] })
    rerender(<Card flag="tomato" />)
    expect(container.querySelector('svg[data-ink="index-card"]')).not.toBeNull()
    rerender(<Card stack={2} />)
    expect(container.querySelector('svg[data-ink="index-card"]')).not.toBeNull()
  })

  it("the decoration turns with the sheet", () => {
    const { container } = render(<Card hole seed="t" />)
    const card = container.firstElementChild as HTMLElement
    expect(card.style.getPropertyValue("--ll-tilt-decor")).toBe(card.style.getPropertyValue("--ll-tilt"))
    expect(Math.abs(parseFloat(card.style.getPropertyValue("--ll-tilt")))).toBeLessThanOrEqual(0.25)
  })

  it("passes className, ref, style, props and Paper props through; tape and fastener work", () => {
    const ref = React.createRef<HTMLElement>()
    const { container, getByTestId } = render(<Card ref={ref} className="max-w-xl" style={{ minHeight: 100 }} data-testid="c" id="c1" as="article" tape="corner" fastener="clip" />)
    expect(ref.current).toBe(getByTestId("c"))
    expect(getByTestId("c").tagName).toBe("ARTICLE")
    expect(getByTestId("c")).toHaveClass("max-w-xl")
    expect(getByTestId("c").style.minHeight).toBe("100px")
    expect(container.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(1)
    expect(container.querySelector('svg[data-slot="fastener"]')).toHaveAttribute("data-kind", "clip")
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(
      <div>
        <Card hole flag="sky" stack={3} />
        <Card as="article" aria-label="A card" />
      </div>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Card hole flag="grass" stack={1} size={[440, 264]} seed="s" />)
    expectHydrates(<Card hole seed="h" />, 'svg[data-ink="index-card"]', [440, 264])
    expectHydrates(<Card seed="plain" />)
  })
})

describe("indexCardRecipe", () => {
  const p: IndexCardParams = { hole: true, flag: "tomato", stack: 2 }

  it("is deterministic per seed, differs across seeds, clean at every size, density and tier", () => {
    const a = run(indexCardRecipe, p, 440, 264).parts.rest!
    expect(a).toBe(run(indexCardRecipe, p, 440, 264).parts.rest)
    expect(a).not.toBe(run(indexCardRecipe, p, 440, 264, { seed: "other" }).parts.rest)
    for (const [w, h] of [[60, 40], [220, 132], [440, 264], [900, 540]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [p, { hole: false, flag: "none" as const, stack: 0 }, { hole: true, flag: "sky" as const, stack: 3 }]) {
            const f = run(indexCardRecipe, params, w, h, { density, tier })
            if (!params.hole && params.flag === "none" && !params.stack) {
              expect(f.layers).toEqual([])
              continue
            }
            expect(f.layers).toEqual(["rest"])
            expectClean(f.parts.rest!)
          }
        }
      }
    }
  })

  it("puts the rod hole at the bottom center and the flag on the end edge, mirrored in RTL", () => {
    expect(INDEX_CARD.holeFromFoot).toBeGreaterThan(INDEX_CARD.holeR)
    expect(run(indexCardRecipe, p, 440, 264, { dir: "rtl" }).parts.rest).toContain("scale(-1 1)")
    expect(run(indexCardRecipe, p, 440, 264).parts.rest).not.toContain("scale(-1 1)")
  })

  it("stays small: a hole, a flag and two cards behind are a few dozen nodes", () => {
    const f = run(indexCardRecipe, p, 440, 264).parts.rest!
    expect(nodes(f)).toBeLessThan(80)
    expect(f.length).toBeLessThan(6000)
  })
})
