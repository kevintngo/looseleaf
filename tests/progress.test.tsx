import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Progress } from "@/components/ui/progress"
import { InkProvider } from "@/lib/ink/react"
import { inkCache } from "@/lib/ink/react/cache"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { progressFillRecipe, progressRecipe } from "@/lib/ink/recipes/progress-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(300, 16)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("Progress structure", () => {
  it("is a Radix progressbar with upstream's slots, a hatched box and a marker indicator, both drawn", () => {
    const { getByRole } = renderUI(<Progress value={40} aria-label="Chapter" />)
    const p = getByRole("progressbar", { name: "Chapter" })
    expect(p).toHaveAttribute("data-slot", "progress")
    expect(p).toHaveAttribute("aria-valuenow", "40")
    expect(p).toHaveAttribute("aria-valuemin", "0")
    expect(p).toHaveAttribute("aria-valuemax", "100")
    expect(p).toHaveAttribute("data-state", "loading")
    expect(p).toHaveClass("relative", "isolate", "w-full", "h-4")
    const ind = p.querySelector("[data-slot=progress-indicator]") as HTMLElement
    expect(ind).toBeTruthy()
    expect(ind.parentElement).toBe(p)
    for (const host of [p, ind]) {
      expect(host).toHaveAttribute("data-ink-host")
      expect(host).toHaveAttribute("data-ink-ready")
    }
    expectInkLayers(p, { min: 2, kinds: ["progress"], absolute: true, layers: ["rest"], intrinsic: false })
    expect(layers(p)).toEqual(["rest"])
    expect(layers(ind)).toEqual(["rest"])
  })

  it("no overflow-hidden anywhere (the ink bleeds and the indicator is clipped by clip-path instead)", () => {
    const { getByRole } = renderUI(<Progress value={40} aria-label="p" />)
    const p = getByRole("progressbar")
    expect(p.className).not.toMatch(/overflow-/)
    expect(p.querySelector("[data-slot=progress-indicator]")!.className).not.toMatch(/overflow-/)
  })

  it("sizes: sm, default, lg set the height; a class overrides", () => {
    const { getByRole, rerender } = renderUI(<Progress value={1} size="sm" aria-label="p" />)
    expect(getByRole("progressbar")).toHaveClass("h-3")
    rerender(<Progress value={1} size="lg" aria-label="p" />)
    expect(getByRole("progressbar")).toHaveClass("h-5")
    rerender(<Progress value={1} className="h-8" aria-label="p" />)
    expect(getByRole("progressbar").className).toContain("h-8")
  })

  it("the ref reaches the root", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByRole } = renderUI(<Progress ref={ref} value={1} aria-label="p" />)
    expect(ref.current).toBe(getByRole("progressbar"))
  })

  it("the drawing is behind, decorative and never focusable", () => {
    const { getByRole } = renderUI(<Progress value={1} aria-label="p" />)
    const svg = getByRole("progressbar").querySelector(":scope > svg") as SVGElement
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg.style.zIndex).toBe("-1")
  })

  it("has forced-colors fallbacks: a border and a Highlight indicator", () => {
    const { getByRole } = renderUI(<Progress value={1} aria-label="p" />)
    const p = getByRole("progressbar")
    expect(p).toHaveClass("forced-colors:border")
    expect(p.querySelector("[data-slot=progress-indicator]")).toHaveClass("forced-colors:bg-[Highlight]")
  })
})

describe("Progress value", () => {
  it("sets --ll-progress from value / max (clamped) on the indicator, which a CSS clip follows", () => {
    const pct = (el: Element) => (el.querySelector("[data-slot=progress-indicator]") as HTMLElement).style.getPropertyValue("--ll-progress")
    const a = renderUI(<Progress value={40} aria-label="a" />)
    expect(pct(a.getByRole("progressbar"))).toBe("40")
    a.unmount()
    const b = renderUI(<Progress value={3} max={5} aria-label="b" />)
    expect(pct(b.getByRole("progressbar"))).toBe("60")
    b.unmount()
    const c = renderUI(<Progress value={150} aria-label="c" />)
    expect(Number(pct(c.getByRole("progressbar")) || 100)).toBeLessThanOrEqual(100)
    const ind = c.getByRole("progressbar").querySelector("[data-slot=progress-indicator]")!
    expect(ind.className).toContain("[clip-path:inset(-12px_calc(100%_-_var(--ll-progress,100)_*_1%)_-12px_0)]")
    expect(ind.className).toContain("rtl:[clip-path:inset(-12px_0_-12px_calc(100%_-_var(--ll-progress,100)_*_1%))]")
    expect(ind.className).toContain("transition-[clip-path]")
  })

  it("value 100 is complete; no value (or null) is indeterminate with no aria-valuenow and a sliding scribble", () => {
    const a = renderUI(<Progress value={100} aria-label="a" />)
    expect(a.getByRole("progressbar")).toHaveAttribute("data-state", "complete")
    a.unmount()
    const b = renderUI(<Progress aria-label="b" />)
    const p = b.getByRole("progressbar")
    expect(p).toHaveAttribute("data-state", "indeterminate")
    expect(p).not.toHaveAttribute("aria-valuenow")
    const ind = p.querySelector("[data-slot=progress-indicator]") as HTMLElement
    expect(ind.className).toContain("data-[state=indeterminate]:animate-[ll-progress-slide_1.6s_linear_infinite]")
    expect(ind.className).toContain("motion-reduce:data-[state=indeterminate]:animate-none")
    expect(ind.style.getPropertyValue("--ll-progress")).toBe("")
    b.unmount()
    const c = renderUI(<Progress value={null} aria-label="c" />)
    expect(c.getByRole("progressbar")).toHaveAttribute("data-state", "indeterminate")
  })

  it("ships the keyframes once, in a hoisted style, with an rtl twin", () => {
    renderUI(
      <div>
        <Progress aria-label="a" />
        <Progress aria-label="b" />
      </div>,
    )
    const styles = Array.from(document.querySelectorAll('style[data-href="ll-progress"], style[href="ll-progress"]'))
    expect(styles.length).toBeLessThanOrEqual(1)
    const html = renderToString(<Progress aria-label="a" />)
    expect(html).toContain("@keyframes ll-progress-slide{")
    expect(html).toContain("@keyframes ll-progress-slide-rtl{")
  })

  it("changing the value never redraws (the value is not in the recipe params)", () => {
    const { rerender } = renderUI(<Progress value={10} aria-label="p" />)
    const runs = inkCache.stats().runs
    rerender(<Progress value={55} aria-label="p" />)
    rerender(<Progress value={90} aria-label="p" />)
    expect(inkCache.stats().runs).toBe(runs)
  })

  it("switching to indeterminate and back does redraw the indicator (a scribble instead of a fill)", () => {
    const { rerender, getByRole } = renderUI(<Progress value={10} aria-label="p" />)
    const fill = () => getByRole("progressbar").querySelector("[data-slot=progress-indicator] [data-layer=rest]")!.innerHTML
    const a = fill()
    rerender(<Progress aria-label="p" />)
    expect(fill()).not.toBe(a)
  })
})

describe("Progress accessibility, server and hydration", () => {
  it("has no axe violations (valued, complete, indeterminate)", async () => {
    const { container } = renderUI(
      <div>
        <Progress value={30} aria-label="a" />
        <Progress value={100} aria-label="b" />
        <Progress aria-label="c" />
        <Progress value={2} max={5} aria-label="d" aria-valuetext="Step 2 of 5" />
      </div>,
    )
    await axeCheck(container)
  })

  it("renders deterministically on the server with the marker already clipped, and hydrates without warnings, bare and inside the provider", () => {
    const tree = () => <Progress value={35} aria-label="s" />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="progress"')
    expect(html).toContain("--ll-progress:35")
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(tree()) as React.ReactElement
      const container = document.createElement("div")
      document.body.appendChild(container)
      container.innerHTML = renderToString(ui)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      expect(container.querySelector("[data-slot=progress] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("progress recipes", () => {
  const req = { seed: "p", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = <P,>(recipe: Parameters<typeof runRecipe<P>>[0], params: P, w: number, h: number, extra: object = {}) =>
    runRecipe(recipe, { ...req, params, box: { w, h }, density: "comfortable", ...extra })

  it("both recipes have only `rest`", () => {
    expect(run(progressRecipe, {}, 300, 12).layers).toEqual(["rest"])
    expect(run(progressFillRecipe, {}, 300, 12).layers).toEqual(["rest"])
    expect(run(progressFillRecipe, { indeterminate: true }, 300, 12).layers).toEqual(["rest"])
  })

  it("lo tier budget: within 12 nodes and 9 KB (the indeterminate scribble 11.5 KB) up to 480 px, and a full-width bar stays sane", () => {
    for (const w of [80, 200, 300, 480]) {
      const box = run(progressRecipe, {}, w, 12).parts.rest ?? ""
      const fill = run(progressFillRecipe, {}, w, 12).parts.rest ?? ""
      const scribble = run(progressFillRecipe, { indeterminate: true }, w, 12).parts.rest ?? ""
      for (const [name, m] of [["box", box], ["fill", fill], ["scribble", scribble]] as const) {
        expect(nodes(m), `${name} ${w}`).toBeLessThanOrEqual(12)
        expect(m.length, `${name} ${w}`).toBeLessThanOrEqual(name === "scribble" ? 11500 : 9000)
      }
    }
    expect((run(progressRecipe, {}, 1200, 12).parts.rest ?? "").length).toBeLessThanOrEqual(20000)
  })

  it("draws sane markup for every tone, size, density and tier", () => {
    for (const h of [8, 12, 20]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const all = [
            run(progressRecipe, {}, 240, h, { density, tier }),
            ...(["marker", "hi", "green", "blue"] as const).flatMap((tone) => [run(progressFillRecipe, { tone }, 240, h, { density, tier }), run(progressFillRecipe, { tone, indeterminate: true }, 240, h, { density, tier })]),
          ]
          for (const f of all) expect(Object.values(f.parts).join(""), `${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
  })

  it("the fill is a data-part=fill group the CSS can nudge", () => {
    expect(run(progressFillRecipe, {}, 300, 12).parts.rest).toContain('data-part="fill"')
  })
})
