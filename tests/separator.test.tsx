import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Separator } from "@/components/ui/separator"
import { Ink } from "@/lib/ink/builder"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { separatorRecipe, separatorVariantList, type SeparatorParams } from "@/lib/ink/recipes/separator-ink"
import { axeCheck, expectInkLayers, mockBox } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 1)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

describe("Separator structure", () => {
  it("is a Radix separator with upstream's slot, orientation and decorative default", () => {
    const { container } = render(<Separator />)
    const s = container.querySelector("[data-slot=separator]") as HTMLElement
    expect(s.tagName).toBe("DIV")
    expect(s).toHaveAttribute("data-orientation", "horizontal")
    expect(s).toHaveAttribute("role", "none")
    expect(s).toHaveClass("relative", "isolate", "shrink-0", "data-[orientation=horizontal]:h-px", "data-[orientation=horizontal]:w-full")
    expect(s).toHaveAttribute("data-variant", "pencil")
    expect(s).toHaveAttribute("data-ink-host")
    expect(s).toHaveAttribute("data-ink-ready")
  })

  it("decorative={false} is a real separator; vertical announces its orientation", () => {
    const a = render(<Separator decorative={false} aria-label="between" />)
    expect(a.getByRole("separator", { name: "between" })).toHaveAttribute("data-orientation", "horizontal")
    a.unmount()
    const b = render(<Separator decorative={false} orientation="vertical" aria-label="v" />)
    const s = b.getByRole("separator")
    expect(s).toHaveAttribute("aria-orientation", "vertical")
    expect(s).toHaveClass("data-[orientation=vertical]:h-full", "data-[orientation=vertical]:w-px")
  })

  it.each(separatorVariantList)("variant %s draws a rule svg behind the hairline", (variant) => {
    const { container } = render(<Separator variant={variant} />)
    const s = container.querySelector("[data-slot=separator]") as HTMLElement
    expect(s).toHaveAttribute("data-variant", variant)
    expectInkLayers(s, { min: 1, kinds: ["rule"], absolute: true, layers: ["rest"] })
    expect(s.querySelector(":scope > svg")?.parentElement).toBe(s)
  })

  it("draws vertical rules too (the svg spans the hairline and the pad)", () => {
    restore()
    restore = mockBox(1, 80)
    const { container } = render(<Separator orientation="vertical" variant="wavy" />)
    const svg = container.querySelector("[data-slot=separator] > svg") as SVGElement
    expect(svg.getAttribute("viewBox")).toBe("-12 -12 28 104")
  })

  it("clips its own drawing along its length, so a rule flush with the window edge cannot scroll the page sideways (the svg spills 12 px past each end)", () => {
    const { container } = render(
      <>
        <Separator />
        <Separator orientation="vertical" />
      </>
    )
    const [h, v] = Array.from(container.querySelectorAll<HTMLElement>("[data-slot=separator]"))
    expect(h).toHaveClass("data-[orientation=horizontal]:overflow-x-clip")
    expect(h).not.toHaveClass("data-[orientation=horizontal]:overflow-hidden")
    expect(v).toHaveClass("data-[orientation=vertical]:overflow-y-clip")
    for (const el of [h, v]) {
      expect(el.className).not.toMatch(/overflow-(hidden|auto|scroll)/)
      expect(el.className.split(/\s+/).filter((c) => /overflow-/.test(c) && !c.startsWith("data-["))).toEqual([])
    }
    expect(h.className).not.toContain("data-[orientation=horizontal]:overflow-y")
    expect(v.className).not.toContain("data-[orientation=vertical]:overflow-x")
  })

  it("keeps the pre-measure pencil line and silences the fat pre-measure outline of a hairline host", () => {
    const { container } = render(<Separator />)
    const s = container.querySelector("[data-slot=separator]") as HTMLElement
    expect(s).toHaveClass("bg-pencil-mark/60", "outline-hidden", "data-ink-ready:bg-transparent")
  })

  it("forwards className, ref, id and data attributes to the rule", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(<Separator ref={ref} id="sep" className="my-6" data-testid="x" />)
    const s = container.querySelector("[data-slot=separator]")
    expect(ref.current).toBe(s)
    expect(s).toHaveAttribute("id", "sep")
    expect(s).toHaveClass("my-6")
    expect(s).toHaveAttribute("data-testid", "x")
  })
})

describe("Separator with a label", () => {
  it("draws two rules around the text and keeps the text readable", () => {
    const { container, getByText } = render(<Separator variant="dashed">or</Separator>)
    const root = container.querySelector("[data-slot=separator]") as HTMLElement
    expect(root).toHaveClass("flex", "items-center")
    expect(root).toHaveAttribute("role", "none")
    const lines = root.querySelectorAll("[data-slot=separator-line]")
    expect(lines).toHaveLength(2)
    for (const l of lines) expect(l.querySelector(":scope > svg[data-ink=rule]")).toBeTruthy()
    const label = getByText("or")
    expect(label).toHaveAttribute("data-slot", "separator-label")
    expect(label.parentElement).toBe(root)
    expect(label).toHaveClass("font-hand")
    expect(root.children[1]).toBe(label)
  })

  it("the two rules are different drawings of the same kind", () => {
    const { container } = render(<Separator variant="wavy">or</Separator>)
    const [a, b] = Array.from(container.querySelectorAll("[data-slot=separator-line] > svg")).map((s) => s.innerHTML)
    expect(a).toBeTruthy()
    expect(a).not.toBe(b)
  })

  it("vertical labelled separators stack", () => {
    const { container } = render(<Separator orientation="vertical">or</Separator>)
    expect(container.querySelector("[data-slot=separator]")).toHaveClass("data-[orientation=vertical]:flex-col")
  })

  it("has no axe violations: plain, real, labelled, vertical, every variant", async () => {
    const { container } = render(
      <div>
        <Separator />
        <Separator decorative={false} aria-label="A real break" variant="torn" />
        <Separator variant="stitched">or</Separator>
        <div style={{ display: "flex", height: 20 }}>
          <Separator orientation="vertical" />
          <Separator orientation="vertical" decorative={false} aria-label="v" variant="dotted" />
        </div>
        {separatorVariantList.map((v) => (
          <Separator key={v} variant={v} />
        ))}
      </div>
    )
    await axeCheck(container)
  })
})

describe("Separator on the server and hydration", () => {
  it("renders the host marker, the fallback line and no drawing before it is measured, deterministically", () => {
    restore()
    const tree = () => (
      <>
        <Separator variant="tape" />
        <Separator variant="dotted">or</Separator>
      </>
    )
    const html = renderToString(tree())
    expect(html).toContain('data-slot="separator"')
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare and inside the provider) and then draws", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(
        <div>
          <Separator variant="wavy" />
          <Separator variant="stitched">or</Separator>
        </div>
      ) as React.ReactElement
      const container = document.createElement("div")
      document.body.appendChild(container)
      restore()
      container.innerHTML = renderToString(ui)
      restore = mockBox(200, 1)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      expect(container.querySelectorAll("svg[data-ink=rule]").length).toBe(3)
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("separatorRecipe", () => {
  const req = { params: {}, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask|rect)\b/g) ?? []).length
  const run = (params: SeparatorParams, w: number, h: number, extra: object = {}) => runRecipe(separatorRecipe, { ...req, params, box: { w, h }, ...extra })

  it("has one layer, rest, and nothing else", () => {
    for (const variant of separatorVariantList) expect(run({ variant, orientation: "horizontal" }, 200, 2).layers).toEqual(["rest"])
  })

  it("draws sane markup at many lengths, both orientations, densities and tiers (no NaN, only var(--ll-*) colours)", () => {
    for (const len of [4, 12, 40, 200, 600, 1400]) {
      for (const orientation of ["horizontal", "vertical"] as const) {
        for (const density of ["comfortable", "compact", "calm"] as const) {
          for (const tier of ["lo", "hi"] as const) {
            for (const variant of separatorVariantList) {
              const [w, h] = orientation === "horizontal" ? [len, 2] : [4, len]
              const f = run({ variant, orientation }, w, h, { density, tier, dir: len > 500 ? "rtl" : "ltr" })
              expect(Object.values(f.parts).join(""), `${len}/${orientation}/${density}/${tier}/${variant}`).not.toMatch(
                /NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i
              )
            }
          }
        }
      }
    }
  })

  it("calm density draws tape, stitched and torn as the pencil rule", () => {
    const pencil = run({ variant: "pencil", orientation: "horizontal" }, 200, 2, { density: "calm" }).parts.rest
    for (const variant of ["tape", "stitched", "torn"] as const) {
      const calm = run({ variant, orientation: "horizontal" }, 200, 2, { density: "calm" }).parts.rest ?? ""
      expect(nodes(calm)).toBeLessThanOrEqual(nodes(pencil ?? "") + 1)
      expect(calm).not.toContain("<use")
    }
  })

  it("lo tier budget for a 320 px rule: at most 12 nodes and 8 KB in every variant (the tape strip is the whole Tape prop: 14)", () => {
    for (const variant of separatorVariantList) {
      const m = run({ variant, orientation: "horizontal" }, 320, 2).parts.rest ?? ""
      expect(nodes(m), variant).toBeLessThanOrEqual(variant === "tape" ? 14 : 12)
      expect(m.length, variant).toBeLessThanOrEqual(8000)
    }
  })

  it("is deterministic per seed and different across seeds", () => {
    const a = run({ variant: "dashed", orientation: "horizontal" }, 300, 2).parts.rest
    expect(run({ variant: "dashed", orientation: "horizontal" }, 300, 2).parts.rest).toBe(a)
    expect(
      runRecipe(separatorRecipe, { ...req, seed: "other", params: { variant: "dashed", orientation: "horizontal" }, box: { w: 300, h: 2 } }).parts.rest
    ).not.toBe(a)
  })

  it("draws along the rule and nowhere else (within 2 px of its ends): what lets the host clip the length without losing any of the line", () => {
    const ctx = { tier: "lo", density: "comfortable", calm: false, knobs: DEFAULT_KNOBS, dir: "ltr", seed: "s", lazyOnly: false, wants: () => false, lazy: () => {} } as never
    for (const L of [40, 320, 1280]) {
      for (const variant of separatorVariantList) {
        const ink = new Ink(`extent|${variant}`, { tier: "lo", calm: false, knobs: DEFAULT_KNOBS })
        separatorRecipe.draw(ink, { w: L, h: 1 }, { variant, orientation: "horizontal" }, ctx)
        const [x0, , x1] = ink.toSvg({ w: L, h: 1, pad: 12 }).bbox
        expect(x0, `${variant} ${L} start`).toBeGreaterThanOrEqual(-2)
        expect(x1, `${variant} ${L} end`).toBeLessThanOrEqual(L + 2)
      }
    }
  })
})
