import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Napkin, NapkinContent, NapkinFooter, NapkinTitle } from "@/components/ui/napkin"
import { napkinRecipe, type NapkinParams } from "@/lib/ink/recipes/napkin-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(288, 300)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Note(props: React.ComponentProps<typeof Napkin>) {
  return (
    <Napkin {...props}>
      <NapkinTitle>Specials</NapkinTitle>
      <NapkinContent>soup of the day</NapkinContent>
      <NapkinFooter>until six</NapkinFooter>
    </Napkin>
  )
}

describe("Napkin", () => {
  it("renders its parts on the napkin stock with a pinked edge and a pressed border, drawn once measured", () => {
    const { container } = render(<Note seed="n" />)
    for (const slot of ["napkin", "napkin-title", "napkin-content", "napkin-footer"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    const n = container.firstElementChild as HTMLElement
    expect(n).toHaveAttribute("data-stock", "napkin")
    expect(n).toHaveAttribute("data-edge", "crimp")
    expect(n).toHaveAttribute("data-fold", "quarter")
    expect(container.querySelector('svg[data-ink="sheet"]')).not.toBeNull()
  })

  it("the creases are a second layer of ink on the root, turned with the sheet", () => {
    const { container } = render(<Note seed="n" />)
    const n = container.firstElementChild as HTMLElement
    const svg = container.querySelector('svg[data-ink="napkin"]')!
    expect(svg.parentElement).toBe(n)
    expect(n.style.getPropertyValue("--ll-tilt-decor")).toBe(n.style.getPropertyValue("--ll-tilt"))
    expectInkLayers(container, { min: 2, kinds: ["sheet", "napkin"], absolute: true })
  })

  it("fold none with no stain draws no creases", () => {
    const { container, rerender } = render(<Note fold="none" />)
    expect(container.querySelector('svg[data-ink="napkin"]')).toBeNull()
    rerender(<Note fold="none" stain />)
    expect(container.querySelector('svg[data-ink="napkin"]')).not.toBeNull()
  })

  it("quarter and half fold are different drawings", () => {
    const html = (fold: "quarter" | "half") => {
      const { container, unmount } = render(<Note fold={fold} seed="f" />)
      const out = container.querySelector('svg[data-ink="napkin"]')!.innerHTML
      unmount()
      return out
    }
    expect(html("quarter")).not.toBe(html("half"))
  })

  it("passes className, ref, style and props through", () => {
    const ref = React.createRef<HTMLElement>()
    const { getByTestId } = render(<Note ref={ref} className="w-96" style={{ minHeight: 100 }} data-testid="n" id="x" tape="top" />)
    expect(ref.current).toBe(getByTestId("n"))
    expect(getByTestId("n")).toHaveClass("w-96", "font-hand".slice(0, 0) + "flex")
    expect(getByTestId("n").style.minHeight).toBe("100px")
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(
      <div>
        <Note stain />
        <Note fold="half" as="article" aria-label="A napkin" />
      </div>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Note size={[288, 300]} seed="s" />)
    expectHydrates(<Note seed="h" stain />, 'svg[data-ink="napkin"]', [288, 300])
  })
})

describe("napkinRecipe", () => {
  const p: NapkinParams = { fold: "quarter", stain: true }

  it("is deterministic per seed, differs across seeds, clean at every size, density and tier", () => {
    const a = run(napkinRecipe, p, 288, 300).parts.rest!
    expect(a).toBe(run(napkinRecipe, p, 288, 300).parts.rest)
    expect(a).not.toBe(run(napkinRecipe, p, 288, 300, { seed: "x" }).parts.rest)
    for (const [w, h] of [[40, 40], [180, 180], [288, 300], [700, 500]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [p, { fold: "half" as const, stain: false }, { fold: "none" as const, stain: true }]) {
            const f = run(napkinRecipe, params, w, h, { density, tier })
            expectClean(f.parts.rest!)
          }
        }
      }
    }
  })

  it("stays a small drawing", () => {
    const f = run(napkinRecipe, { fold: "quarter", stain: false }, 288, 300).parts.rest!
    expect(nodes(f)).toBeLessThan(20)
    expect(f.length).toBeLessThan(3000)
  })
})
