import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { scrollThumbRecipe, scrollTrackRecipe } from "@/lib/ink/recipes/scroll-area-ink"
import Tags from "@/docs/examples/scroll-area/01-tags"
import Horizontal from "@/docs/examples/scroll-area/02-horizontal"
import Both from "@/docs/examples/scroll-area/03-both"
import Messages from "@/docs/examples/scroll-area/04-messages"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

const P = HTMLElement.prototype
const saved = ["offsetWidth", "offsetHeight", "scrollHeight", "scrollWidth", "clientWidth", "clientHeight"].map((k) => [k, Object.getOwnPropertyDescriptor(P, k)] as const)
class ReportingRO {
  constructor(private cb: ResizeObserverCallback) {}
  observe(el: Element) {
    setTimeout(() => this.cb([{ target: el } as ResizeObserverEntry], this as unknown as ResizeObserver), 0)
  }
  unobserve() {}
  disconnect() {}
}
beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ReportingRO)
  const set = (k: string, v: number) => Object.defineProperty(P, k, { configurable: true, get: () => v })
  set("offsetWidth", 200)
  set("offsetHeight", 100)
  set("clientWidth", 200)
  set("clientHeight", 100)
  set("scrollWidth", 600)
  set("scrollHeight", 500)
})
afterEach(() => {
  vi.unstubAllGlobals()
  for (const [k, d] of saved) if (d) Object.defineProperty(P, k, d)
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 90)) })

function Sample(props: React.ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea className="h-24 w-48" type="always" {...props}>
      <div style={{ width: 600, height: 500 }}>content</div>
    </ScrollArea>
  )
}

describe("ScrollArea structure", () => {
  it("has upstream's parts and slots", async () => {
    const { container } = render(<Sample />)
    await settle()
    for (const slot of ["scroll-area", "scroll-area-viewport", "scroll-area-scrollbar", "scroll-area-thumb"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    expect(container.querySelector("[data-slot=scroll-area]")).toHaveClass("relative")
    expect(container.querySelector("[data-slot=scroll-area-viewport]")).toHaveClass("size-full", "rounded-[inherit]")
    expect(container.querySelector("[data-slot=scroll-area-viewport]")!.textContent).toBe("content")
  })

  it("upstream's default is one vertical mark; a horizontal ScrollBar child still works", () => {
    const { container } = render(
      <ScrollArea type="always">
        <div>content</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>,
    )
    const bars = Array.from(container.querySelectorAll("[data-slot=scroll-area-scrollbar]")).map((b) => b.getAttribute("data-orientation"))
    expect(bars.sort()).toEqual(["horizontal", "vertical"])
  })

  it("orientation chooses which marks are mounted", () => {
    const only = (o: "vertical" | "horizontal" | "both") => {
      const { container, unmount } = render(<Sample orientation={o} />)
      const bars = Array.from(container.querySelectorAll("[data-slot=scroll-area-scrollbar]")).map((b) => b.getAttribute("data-orientation")).sort()
      unmount()
      return bars
    }
    expect(only("vertical")).toEqual(["vertical"])
    expect(only("horizontal")).toEqual(["horizontal"])
    expect(only("both")).toEqual(["horizontal", "vertical"])
  })

  it("bleed pads the viewport by 12 px", () => {
    expect(render(<Sample bleed />).container.querySelector("[data-slot=scroll-area-viewport]")).toHaveClass("p-3")
    expect(render(<Sample />).container.querySelector("[data-slot=scroll-area-viewport]")).not.toHaveClass("p-3")
  })

  it("keeps upstream's gutter geometry and lets the mark fade", async () => {
    const { container } = render(<Sample orientation="both" />)
    await settle()
    const v = container.querySelector("[data-orientation=vertical][data-slot=scroll-area-scrollbar]")!
    const h = container.querySelector("[data-orientation=horizontal][data-slot=scroll-area-scrollbar]")!
    expect(v).toHaveClass("flex", "touch-none", "p-px", "select-none", "h-full", "w-2.5", "border-l")
    expect(h).toHaveClass("h-2.5", "flex-col", "border-t")
    expect(v.className).toContain("data-[state=hidden]:animate-out")
    expect(v.className).toContain("data-[state=visible]:animate-in")
  })
})

describe("ScrollArea drawing", () => {
  it("draws the gutter and the thumb as their own small hosts", async () => {
    const { container } = render(<Sample />)
    await settle()
    const bar = container.querySelector("[data-slot=scroll-area-scrollbar]")!
    const thumb = container.querySelector("[data-slot=scroll-area-thumb]")!
    expect(bar.firstElementChild).toHaveAttribute("data-ink", "track")
    expect(thumb.firstElementChild).toHaveAttribute("data-ink", "thumb")
    expect(bar).toHaveAttribute("data-ink-host")
    expect(thumb).toHaveAttribute("data-ink-host")
    expectInkLayers(container, { kinds: ["track", "thumb"], absolute: true })
    expect(Array.from(thumb.querySelectorAll(":scope > svg > g[data-layer]")).map((g) => g.getAttribute("data-layer"))).toEqual(["rest", "hover"])
  })

  it("hides the overlay drawing but keeps the thumb visible in forced colours", async () => {
    const { container } = render(<Sample />)
    await settle()
    expect(container.querySelector("[data-slot=scroll-area-thumb]")!.className).toContain("forced-colors:bg-[CanvasText]")
    expect(container.querySelector("[data-slot=scroll-area-scrollbar]")!.className).toContain("forced-colors:outline-0!")
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<Sample orientation="both" />)
    await settle()
    await axeCheck(container)
  })
})

describe("recipes", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("draws along the long axis for either orientation, within the budget, at any length", () => {
    for (const len of [8, 24, 60, 200, 480, 1400]) {
      for (const o of ["vertical", "horizontal"] as const) {
        const box = o === "vertical" ? { w: 8, h: len } : { w: len, h: 8 }
        for (const recipe of [scrollTrackRecipe, scrollThumbRecipe]) {
          const f = runRecipe(recipe, { ...req, params: { orientation: o }, box })
          expect(f.parts.rest, `${recipe.id} ${o} ${len}`).toBeTruthy()
          expect(nodes(f.parts.rest!)).toBeLessThanOrEqual(16)
          expect(f.parts.rest!.length).toBeLessThan(len > 700 ? 14_000 : 9_000)
          expect(f.parts.rest!).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
        }
      }
    }
  })

  it("the thumb gets its grip only when long enough, and goes over the line once more on hover", () => {
    const short = runRecipe(scrollThumbRecipe, { ...req, params: { orientation: "vertical" }, box: { w: 8, h: 30 } })
    const long = runRecipe(scrollThumbRecipe, { ...req, params: { orientation: "vertical" }, box: { w: 8, h: 120 } })
    expect(long.parts.rest!.length).toBeGreaterThan(short.parts.rest!.length)
    expect(long.layers).toEqual(["rest", "hover"])
    expect(long.parts.hover).toBeTruthy()
  })

  it("is deterministic and hairline in calm density", () => {
    const a = runRecipe(scrollThumbRecipe, { ...req, params: { orientation: "vertical" }, box: { w: 8, h: 120 } })
    expect(runRecipe(scrollThumbRecipe, { ...req, params: { orientation: "vertical" }, box: { w: 8, h: 120 } }).parts.rest).toBe(a.parts.rest)
    const calm = runRecipe(scrollThumbRecipe, { ...req, density: "calm", params: { orientation: "vertical" }, box: { w: 8, h: 120 } })
    expect(calm.parts.rest!.length).toBeLessThan(a.parts.rest!.length)
  })
})

describe("SSR and hydration", () => {
  it("renders identical markup twice", () => {
    expect(renderToString(<Sample />)).toBe(renderToString(<Sample />))
  })

  it("hydrates without warnings, bare and inside the provider", () => {
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      const ui = wrap(<Sample orientation="both" />)
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
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("examples", () => {
  it("Tags lists fifty tags in a scroll area", async () => {
    const { container } = renderUI(<Tags />)
    expect(container.querySelectorAll("[data-slot=scroll-area-viewport] > div > div > div")).toHaveLength(50)
    await axeCheck()
  })

  it("Horizontal strip pads for bleed and shows only the horizontal mark", async () => {
    const { container } = renderUI(<Horizontal />)
    expect(container.querySelector("[data-slot=scroll-area-viewport]")).toHaveClass("p-3")
    expect(container.querySelectorAll("[data-slot=scroll-area-scrollbar][data-orientation=vertical]")).toHaveLength(0)
    await axeCheck()
  })

  it("Both directions", async () => {
    const { container } = renderUI(<Both />)
    expect(container.querySelector("[data-slot=paper]")).toHaveAttribute("data-stock", "paper")
    await axeCheck()
  })

  it("Message log adds a line and clears the draft", async () => {
    const original = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = vi.fn()
    const { user, getByRole, getByText } = renderUI(<Messages />)
    await user.type(getByRole("textbox", { name: "Your message" }), "Ship it")
    await user.click(getByRole("button", { name: "Send" }))
    expect(getByText("Ship it")).toBeTruthy()
    expect(getByRole("textbox", { name: "Your message" })).toHaveValue("")
    await axeCheck()
    Element.prototype.scrollIntoView = original
  })
})
