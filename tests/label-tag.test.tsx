import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { LabelTag, LabelTagDescription, LabelTagPrice, LabelTagTitle } from "@/components/ui/label-tag"
import { splitFaces, type FaceSpec } from "@/lib/ink/paper/faces"
import { TAG, labelTagRecipe, tagHole, tagPath, type LabelTagParams } from "@/lib/ink/recipes/label-tag-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(128, 170)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Tag(props: React.ComponentProps<typeof LabelTag>) {
  return (
    <LabelTag {...props}>
      <LabelTagTitle>Sale</LabelTagTitle>
      <LabelTagDescription>while stocks last</LabelTagDescription>
      <LabelTagPrice>12.00</LabelTagPrice>
    </LabelTag>
  )
}

describe("LabelTag", () => {
  it("renders its parts with their data-slots", () => {
    const { container } = render(<Tag />)
    for (const slot of ["label-tag", "label-tag-title", "label-tag-description", "label-tag-price"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    const t = container.firstElementChild as HTMLElement
    expect(t).toHaveAttribute("data-shape", "price")
    expect(t).toHaveClass("relative", "isolate", "w-32")
  })

  it("draws the whole tag (card, eyelet, string) as one sheet on the root, once measured", () => {
    const { container } = render(<Tag seed="t" />)
    const t = container.firstElementChild as HTMLElement
    const svg = t.querySelector(":scope > svg[data-ink='sheet']")!
    expect(svg).not.toBeNull()
    expect(t).toHaveAttribute("data-ink-ready")
    expect(t.className).not.toContain("bg-index-card")
    expectInkLayers(container, { min: 1, kinds: ["sheet"], absolute: true, layers: ["rest", "hover"] })
  })

  it("gives the tag room for its string: margin on the hanging side follows the string length", () => {
    const { container, rerender } = render(<Tag />)
    const t = container.firstElementChild as HTMLElement
    expect(t).toHaveClass("mt-(--tag-string)")
    expect(t.style.getPropertyValue("--tag-string")).toBe("36px")
    rerender(<Tag string={60} />)
    expect(t.style.getPropertyValue("--tag-string")).toBe("60px")
    rerender(<Tag shape="luggage" />)
    expect(t).toHaveClass("ms-(--tag-string)", "h-24")
    expect(t).toHaveAttribute("data-shape", "luggage")
  })

  it("is still (no hover tilt) unless it is a link or a button, which swing on the eyelet", () => {
    const plain = render(<Tag />)
    expect(plain.container.querySelector("svg[data-ink]")).toHaveAttribute("data-still")
    expect((plain.container.firstElementChild as HTMLElement).style.getPropertyValue("--ll-hover-tilt")).toBe("")
    plain.unmount()
    const link = render(
      <LabelTag asChild>
        <a href="#sale">
          <LabelTagTitle>Sale</LabelTagTitle>
        </a>
      </LabelTag>,
    )
    const a = link.getByRole("link", { name: "Sale" })
    expect(a).toHaveAttribute("data-slot", "label-tag")
    expect(a.querySelector(":scope > svg[data-ink]")).not.toHaveAttribute("data-still")
    expect(a.style.getPropertyValue("--ll-hover-tilt")).toBe("-2.6deg")
    expect(a.style.getPropertyValue("--tag-origin")).toMatch(/^50% \d+px$/)
    expect(a).toHaveClass("cursor-pointer")
  })

  it("a luggage tag that swings turns about its eyelet in right-to-left too: the pivot is mirrored", () => {
    const { getByRole } = render(
      <LabelTag asChild shape="luggage" string={36}>
        <a href="#gate">
          <LabelTagTitle>Gate 7</LabelTagTitle>
        </a>
      </LabelTag>,
    )
    const a = getByRole("link", { name: "Gate 7" })
    expect(a.style.getPropertyValue("--tag-origin")).toBe("70px 50%")
    expect(a.style.getPropertyValue("--tag-origin-rtl")).toBe("calc(100% - 70px) 50%")
    expect(a.className).toContain("rtl:[&>:is(svg,[data-slot=paper-face])]:[transform-origin:var(--tag-origin-rtl)]")
    expect(a.className).toContain("hover:[&>:is(svg,[data-slot=paper-face])]:[rotate:var(--ll-hover-tilt)]")
  })

  it("until it is measured it wears a plain card, so it is never a floating label on the desk", () => {
    restore()
    restore = () => {}
    const { container } = render(<Tag />)
    const t = container.firstElementChild as HTMLElement
    expect(t).toHaveClass("bg-index-card", "shadow-card")
    expect(container.querySelector("svg")).toBeNull()
  })

  it("passes className, ref, style and props through; takes a tilt", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByTestId } = render(<Tag ref={ref} className="w-40" style={{ minHeight: 100 }} data-testid="t" id="x" tilt={-3} />)
    expect(ref.current).toBe(getByTestId("t"))
    expect(getByTestId("t")).toHaveClass("w-40")
    expect(getByTestId("t").style.minHeight).toBe("100px")
    expect(getByTestId("t").style.getPropertyValue("--ll-tilt")).toBe("-3deg")
  })

  it("has no axe violations (plain, as a link, as a button, luggage)", async () => {
    const { container } = renderUI(
      <div>
        <Tag />
        <LabelTag asChild>
          <a href="#x">Sale tag</a>
        </LabelTag>
        <LabelTag asChild shape="luggage">
          <button type="button">Ada Lovelace</button>
        </LabelTag>
      </div>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Tag size={[128, 170]} seed="s" />)
    expectHydrates(<Tag seed="h" shape="round" />, 'svg[data-ink="sheet"]', [128, 170])
  })
})

describe("labelTagRecipe", () => {
  const p: LabelTagParams = { stock: "kraft", shape: "price", string: 44, twine: "natural", eyelet: "brass" }

  it("is deterministic per seed, differs across seeds, clean at every size, density, tier, shape and colour", () => {
    const a = run(labelTagRecipe, p, 128, 170)
    expect(a.parts.rest).toBe(run(labelTagRecipe, p, 128, 170).parts.rest)
    expect(a.parts.rest).not.toBe(run(labelTagRecipe, p, 128, 170, { seed: "x" }).parts.rest)
    expect(a.layers).toEqual(["rest", "hover"])
    for (const [w, h] of [[60, 60], [128, 170], [240, 96], [400, 300]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const shape of ["price", "round", "luggage"] as const) {
            for (const [twine, eyelet] of [["natural", "brass"], ["tomato", "steel"], ["sky", "none"]] as const) {
              const f = run(labelTagRecipe, { ...p, shape, twine, eyelet }, w, h, { density, tier })
              expectClean(f.parts.rest! + (f.parts.hover ?? ""))
            }
          }
        }
      }
    }
  })

  it("the pad covers the string, so the mount never clips it", () => {
    const pad = (string: number) => run(labelTagRecipe, { ...p, string }, 128, 170).pad
    expect(pad(44)).toBeGreaterThanOrEqual(44)
    expect(pad(80)).toBeGreaterThanOrEqual(80)
  })

  it("cuts a real hole and puts it where a tag has it", () => {
    const r = { gauss: () => 0 }
    expect(tagHole(128, 170, "price")).toEqual([64, TAG.eyelet])
    expect(tagHole(128, 170, "round")[1]).toBeGreaterThan(TAG.eyelet)
    expect(tagHole(240, 96, "luggage")).toEqual([TAG.eyelet + 2, 48])
    for (const shape of ["price", "round", "luggage"] as const) expect(tagPath(128, 170, shape, r)).not.toMatch(/NaN/)
    const rest = run(labelTagRecipe, p, 128, 170).parts.rest!
    expect(rest).toContain('fill-rule="evenodd"')
    expect(rest).toContain('"evenodd":true')
  })

  it("mirrors a luggage tag for right-to-left; a hanging tag is symmetric and needs none", () => {
    const lug = { ...p, shape: "luggage" as const }
    expect(run(labelTagRecipe, lug, 240, 96, { dir: "rtl" }).parts.rest).toContain("scale(-1 1)")
    expect(run(labelTagRecipe, p, 128, 170, { dir: "rtl" }).parts.rest).not.toContain("scale(-1 1)")
    const face = (dir: "ltr" | "rtl") => splitFaces(run(labelTagRecipe, lug, 240, 96, { dir }).parts.rest!).find((x): x is FaceSpec => typeof x !== "string")!
    expect(face("rtl").d).not.toBe(face("ltr").d)
    expect(face("ltr").d).toContain("M15.6 48a")
    expect(face("rtl").d).toContain("M215.6 48a")
    expect(face("ltr").cast?.inset[3]).toBeGreaterThan(10)
    expect(face("rtl").cast?.inset[1]).toBeGreaterThan(10)
  })

  it("stays a small drawing", () => {
    const f = run(labelTagRecipe, p, 128, 170).parts.rest!
    expect(nodes(f)).toBeLessThan(60)
    expect(f.length).toBeLessThan(9000)
  })
})
