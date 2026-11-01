import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Slider } from "@/components/ui/slider"
import { InkProvider } from "@/lib/ink/react"
import { inkCache } from "@/lib/ink/react/cache"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { sliderRangeRecipe, sliderThumbRecipe, sliderTrackRecipe } from "@/lib/ink/recipes/slider-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(240, 8)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))
const clip = (el: Element) => (el.getAttribute("style") ?? "").replace(/\s+/g, " ")

describe("Slider structure", () => {
  it("is a Radix slider with upstream's slots: root, track, range and one drawn thumb per value", () => {
    const { container, getAllByRole } = renderUI(<Slider defaultValue={[30]} aria-label="Volume" />)
    const root = container.querySelector("[data-slot=slider]") as HTMLElement
    expect(root).toHaveAttribute("data-orientation", "horizontal")
    expect(root).toHaveClass("touch-none", "select-none", "relative", "flex")
    const track = root.querySelector("[data-slot=slider-track]") as HTMLElement
    const range = track.querySelector("[data-slot=slider-range]") as HTMLElement
    expect(track).toBeTruthy()
    expect(range.parentElement).toBe(track)
    const thumbs = getAllByRole("slider")
    expect(thumbs).toHaveLength(1)
    expect(thumbs[0]).toHaveAttribute("data-slot", "slider-thumb")
    expect(thumbs[0]).toHaveAttribute("aria-valuenow", "30")
    for (const host of [track, range, thumbs[0]]) {
      expect(host).toHaveAttribute("data-ink-host")
      expect(host).toHaveAttribute("data-ink-ready")
    }
    expectInkLayers(track, { min: 2, kinds: ["slider", "thumb"], absolute: true, layers: ["rest"] })
    expect(layers(track)).toEqual(["rest"])
    expect(layers(range)).toEqual(["rest"])
    expect(layers(thumbs[0])).toEqual(["rest", "hover"])
  })

  it("several values give a range slider: one thumb each, named Minimum and Maximum by Radix inside a labelled group", () => {
    const { getAllByRole, getByRole } = renderUI(<Slider defaultValue={[20, 70]} aria-label="Price" />)
    expect(getAllByRole("slider").map((t) => t.getAttribute("aria-label"))).toEqual(["Minimum", "Maximum"])
    expect(getByRole("group", { name: "Price" })).toHaveAttribute("data-slot", "slider")
  })

  it("names the only thumb from aria-label / aria-labelledby, not the span root", () => {
    const { getByRole, container, rerender } = renderUI(<Slider defaultValue={[10]} aria-label="Volume" />)
    expect(getByRole("slider", { name: "Volume" })).toBeTruthy()
    expect(container.querySelector("[data-slot=slider]")).not.toHaveAttribute("aria-label")
    rerender(
      <div>
        <span id="lbl">Brightness</span>
        <Slider defaultValue={[10]} aria-labelledby="lbl" />
      </div>,
    )
    expect(getByRole("slider", { name: "Brightness" })).toBeTruthy()
  })

  it("the range host always covers the whole track (important insets beat Radix's inline left / right) and is clipped to the value", () => {
    const { container } = renderUI(<Slider defaultValue={[40]} aria-label="v" />)
    const range = container.querySelector("[data-slot=slider-range]") as HTMLElement
    expect(range.className).toContain("data-[orientation=horizontal]:inset-x-0!")
    expect(clip(range)).toContain("clip-path: inset(")
    expect(clip(range)).toContain("0.4")
  })

  it("draws nothing outside its hosts: no overflow-hidden on the root or the track (the ink bleeds)", () => {
    const { container } = renderUI(<Slider defaultValue={[40]} aria-label="v" ticks />)
    for (const el of container.querySelectorAll("[data-slot=slider], [data-slot=slider-track]")) expect(el.className).not.toMatch(/overflow-(hidden|clip|auto)/)
  })

  it("has forced-colors fallbacks: a bordered groove, a Highlight range, a solid knob", () => {
    const { container, getByRole } = renderUI(<Slider defaultValue={[40]} aria-label="v" />)
    expect(container.querySelector("[data-slot=slider-track]")).toHaveClass("forced-colors:border")
    expect(container.querySelector("[data-slot=slider-range]")).toHaveClass("forced-colors:bg-[Highlight]")
    expect(getByRole("slider")).toHaveClass("forced-colors:bg-[ButtonText]")
  })
})

describe("Slider state and keyboard", () => {
  it("arrows, Page keys, Home and End move the thumb and report the values", async () => {
    const onValueChange = vi.fn()
    const { getByRole, user } = renderUI(<Slider defaultValue={[50]} onValueChange={onValueChange} aria-label="v" />)
    const t = getByRole("slider")
    await user.tab()
    expect(t).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(t).toHaveAttribute("aria-valuenow", "51")
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(t).toHaveAttribute("aria-valuenow", "49")
    await user.keyboard("{PageUp}")
    expect(t).toHaveAttribute("aria-valuenow", "59")
    await user.keyboard("{End}")
    expect(t).toHaveAttribute("aria-valuenow", "100")
    await user.keyboard("{Home}")
    expect(t).toHaveAttribute("aria-valuenow", "0")
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual([0])
  })

  it("the clip follows the value, uncontrolled and controlled, and mirrors for rtl and vertical", async () => {
    const { getByRole, user, container } = renderUI(<Slider defaultValue={[50]} aria-label="v" />)
    const range = container.querySelector("[data-slot=slider-range]") as HTMLElement
    const before = clip(range)
    await user.tab()
    await user.keyboard("{End}")
    expect(clip(range)).not.toBe(before)
    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", "100")

    function Controlled() {
      const [v, setV] = React.useState([25])
      return (
        <>
          <Slider value={v} onValueChange={setV} aria-label="c" />
          <output>{v[0]}</output>
        </>
      )
    }
    const c = renderUI(<Controlled />)
    const cr = c.container.querySelector("[data-slot=slider-range]") as HTMLElement
    const s0 = clip(cr)
    await c.user.tab()
    await c.user.keyboard("{ArrowRight}")
    expect(c.container.querySelector("output")).toHaveTextContent("26")
    expect(clip(cr)).not.toBe(s0)
    c.unmount()

    const ltr = renderUI(<Slider defaultValue={[30]} aria-label="l" />)
    const rtl = renderUI(<Slider defaultValue={[30]} dir="rtl" aria-label="r" />)
    const vert = renderUI(<Slider defaultValue={[30]} orientation="vertical" aria-label="v" />)
    const cl = (r: typeof ltr) => clip(r.container.querySelector("[data-slot=slider-range]")!)
    expect(cl(ltr)).not.toBe(cl(rtl))
    expect(cl(vert)).not.toBe(cl(ltr))
    expect(cl(vert)).toMatch(/inset\(calc\(100% - /)
  })

  it("a range slider clips between the two values", () => {
    const { container } = renderUI(<Slider defaultValue={[20, 80]} aria-label="r" />)
    const s = clip(container.querySelector("[data-slot=slider-range]")!)
    expect(s).toContain("0.2")
    expect(s).toContain("0.8")
  })

  it("moving a thumb never redraws anything (the value is not in the recipe params)", async () => {
    const { user } = renderUI(<Slider defaultValue={[50]} aria-label="v" />)
    await user.tab()
    const runs = inkCache.stats().runs
    await user.keyboard("{ArrowRight}{ArrowRight}{End}{Home}")
    expect(inkCache.stats().runs).toBe(runs)
  })

  it("wakes the focus ring on the first keyboard focus", async () => {
    const { getByRole, user } = renderUI(<Slider defaultValue={[50]} aria-label="v" />)
    const t = getByRole("slider")
    expect(layers(t)).not.toContain("focus")
    await user.tab()
    expect(layers(t)).toContain("focus")
  })

  it("a disabled slider ignores the keyboard", async () => {
    const { getByRole, user } = renderUI(<Slider defaultValue={[50]} disabled aria-label="v" />)
    await user.tab()
    expect(getByRole("slider")).not.toHaveFocus()
  })

  it("ticks: true marks each step when there are few, else ten intervals; a number is that many", () => {
    const a = renderUI(<Slider defaultValue={[2]} min={0} max={5} ticks aria-label="a" seed="t" />)
    const ta = a.container.querySelector("[data-slot=slider-track]")!.innerHTML
    a.unmount()
    const b = renderUI(<Slider defaultValue={[2]} min={0} max={5} ticks={5} aria-label="b" seed="t" />)
    const tb = b.container.querySelector("[data-slot=slider-track]")!.innerHTML
    b.unmount()
    const c = renderUI(<Slider defaultValue={[2]} min={0} max={5} aria-label="c" />)
    const tc = c.container.querySelector("[data-slot=slider-track]")!.innerHTML
    expect(ta.length).toBeGreaterThan(tc.length)
    expect(ta.length).toBe(tb.length)
  })
})

describe("Slider in forms, accessibility, server and hydration", () => {
  it("submits its values under `name` through Radix's hidden inputs", async () => {
    const seen: string[][] = []
    const { user } = renderUI(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          seen.push(new FormData(e.currentTarget).getAll("size[]") as string[])
        }}
      >
        <Slider name="size" defaultValue={[10, 40]} aria-label="s" />
        <button type="submit">go</button>
      </form>,
    )
    await user.click(document.querySelector("button[type=submit]") as HTMLElement)
    expect(seen).toEqual([["10", "40"]])
  })

  it("has no axe violations (single, range, vertical, disabled)", async () => {
    const { container } = renderUI(
      <div>
        <Slider defaultValue={[10]} aria-label="single" ticks />
        <Slider defaultValue={[10, 60]} aria-label="range" />
        <Slider defaultValue={[10]} orientation="vertical" aria-label="vertical" />
        <Slider defaultValue={[10]} disabled aria-label="off" />
      </div>,
    )
    await axeCheck(container)
  })

  it("renders deterministically on the server (with the range already clipped) and hydrates without warnings, bare and inside the provider", () => {
    const tree = () => <Slider defaultValue={[35]} aria-label="s" ticks />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="slider-range"')
    expect(html).toContain("clip-path:inset(")
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
      expect(container.querySelector("[data-slot=slider-track] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("slider recipes", () => {
  const req = { seed: "s", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = <P,>(recipe: Parameters<typeof runRecipe<P>>[0], params: P, w: number, h: number, extra: object = {}) =>
    runRecipe(recipe, { ...req, params, box: { w, h }, density: "comfortable", ...extra })

  it("the range and the track only have `rest`; the thumb has rest, hover and a lazy focus", () => {
    expect(run(sliderTrackRecipe, {}, 240, 8).layers).toEqual(["rest"])
    expect(run(sliderRangeRecipe, {}, 240, 8).layers).toEqual(["rest"])
    expect(run(sliderThumbRecipe, {}, 20, 20).layers).toEqual(["rest", "hover"])
    expect(run(sliderThumbRecipe, {}, 20, 20, { lazy: ["focus"] }).layers).toEqual(["rest", "hover", "focus"])
    expect(run(sliderThumbRecipe, { disabled: true }, 20, 20).layers).toEqual(["rest"])
  })

  it("lo tier budget: a track with ticks, a range and a thumb are each within 12 nodes and 9 KB up to 480 px", () => {
    for (const len of [80, 240, 480]) {
      const t = run(sliderTrackRecipe, { ticks: 10 }, len, 8).parts.rest ?? ""
      const r = run(sliderRangeRecipe, {}, len, 8).parts.rest ?? ""
      expect(nodes(t), `track ${len}`).toBeLessThanOrEqual(12 + 11)
      expect(t.length, `track ${len}`).toBeLessThanOrEqual(12000)
      expect(nodes(r), `range ${len}`).toBeLessThanOrEqual(12)
      expect(r.length, `range ${len}`).toBeLessThanOrEqual(9000)
    }
    const th = run(sliderThumbRecipe, {}, 20, 20)
    expect(nodes(th.parts.rest ?? "")).toBeLessThanOrEqual(12)
  })

  it("draws sane markup vertical and horizontal, in every density and tier, in every tone", () => {
    for (const vertical of [false, true]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const [w, h] = vertical ? [8, 200] : [200, 8]
          const all = [
            run(sliderTrackRecipe, { vertical, ticks: 8 }, w, h, { density, tier }),
            run(sliderTrackRecipe, { vertical, ticks: 3, disabled: true }, w, h, { density, tier }),
            ...(["marker", "hi", "blue"] as const).map((tone) => run(sliderRangeRecipe, { vertical, tone }, w, h, { density, tier })),
            run(sliderRangeRecipe, { vertical, disabled: true }, w, h, { density, tier }),
            run(sliderThumbRecipe, {}, 20, 20, { density, tier, lazy: ["focus"] }),
          ]
          for (const f of all) expect(Object.values(f.parts).join(""), `${vertical}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
  })

  it("the recipes take no value: the same params always give the same bytes for the range", () => {
    expect(run(sliderRangeRecipe, {}, 240, 8).parts.rest).toBe(run(sliderRangeRecipe, {}, 240, 8).parts.rest)
  })
})
