import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Highlight } from "@/components/ui/highlight"
import { InkProvider } from "@/lib/ink/react"
import { highlightRecipe } from "@/lib/ink/recipes/highlight-ink"
import { runRecipe, DEFAULT_KNOBS } from "@/lib/ink/recipes"
import { lineMetrics } from "@/lib/ink/recipes/text-marks-ink"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"
import { THREE_LINES, fireIntersection, inkSvgs, installIntersection, mockLines } from "./_marks-lib"

let restore: Array<() => void> = []
afterEach(() => {
  restore.forEach((r) => r())
  restore = []
})
const lines = (l = THREE_LINES) => restore.push(mockLines("highlight", l))

describe("Highlight", () => {
  it("is a <mark> with the words as plain text and upstream-style slot", () => {
    lines()
    const { getByText } = render(<Highlight>the good bits</Highlight>)
    const el = getByText("the good bits")
    expect(el.tagName).toBe("MARK")
    expect(el).toHaveAttribute("data-slot", "highlight")
    expect(el).toHaveAttribute("data-tone", "yellow")
    expect(el.textContent).toBe("the good bits")
  })

  it("draws one aria-hidden swipe per line fragment, behind the words, as direct children of the host", () => {
    lines()
    const { getByText, container } = render(<Highlight>a phrase that wraps onto three lines</Highlight>)
    const host = getByText(/a phrase/)
    expect(host).toHaveAttribute("data-ink-host")
    expect(host).toHaveAttribute("data-ink-ready")
    const svgs = inkSvgs(host)
    expect(svgs).toHaveLength(3)
    for (const s of svgs) {
      expect(s).toHaveAttribute("aria-hidden", "true")
      expect(s).toHaveAttribute("focusable", "false")
      expect(s.getAttribute("data-ink")).toBe("highlight")
      expect(s.style.zIndex).toBe("-1")
      expect(s.style.pointerEvents).toBe("none")
    }
    expect(parseFloat(svgs[0].style.left)).toBeCloseTo(120 - 10, 0)
    expect(parseFloat(svgs[1].style.left)).toBeCloseTo(0 - 10, 0)
    expect(parseFloat(svgs[1].style.top)).toBeCloseTo(30 - 10, 0)
    expectInkLayers(container, { min: 3, kinds: ["highlight"], absolute: true, layers: ["rest"] })
  })

  it("never puts the words inside an svg (no svg <text>)", () => {
    lines()
    const { container } = render(<Highlight>real text</Highlight>)
    expect(container.querySelector("svg text")).toBeNull()
  })

  it("falls back to the offset box when the browser reports no fragments", () => {
    const orig = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth")
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 90 })
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 27 })
    restore.push(() => {
      if (orig) Object.defineProperty(HTMLElement.prototype, "offsetWidth", orig)
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetWidth
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetHeight
    })
    const { getByText } = render(<Highlight>one</Highlight>)
    expect(inkSvgs(getByText("one"))).toHaveLength(1)
  })

  it("draws nothing (and claims no ink host) before it has a layout: the browser <mark> is the fallback", () => {
    const { getByText } = render(<Highlight>no layout</Highlight>)
    const el = getByText("no layout")
    expect(inkSvgs(el)).toHaveLength(0)
    expect(el).not.toHaveAttribute("data-ink-host")
    expect(el).toHaveClass("data-[ink-ready]:bg-transparent")
  })

  it("show=false removes the swipe, show=true brings it back", () => {
    lines()
    const { getByText, rerender } = render(<Highlight show={false}>toggled</Highlight>)
    expect(inkSvgs(getByText("toggled"))).toHaveLength(0)
    expect(getByText("toggled")).toHaveAttribute("data-mark", "off")
    rerender(<Highlight show>toggled</Highlight>)
    expect(inkSvgs(getByText("toggled"))).toHaveLength(3)
    expect(getByText("toggled")).toHaveAttribute("data-mark", "in")
  })

  it("tone picks the marker; the same seed draws the same swipe, another seed another", () => {
    lines()
    const html = (tone: "yellow" | "pink", seed: string) => {
      const { getByText, unmount } = render(
        <Highlight tone={tone} seed={seed}>
          w{tone}
          {seed}
        </Highlight>,
      )
      const out = inkSvgs(getByText(`w${tone}${seed}`)).map((s) => s.innerHTML).join("")
      unmount()
      return out
    }
    expect(html("pink", "a")).toContain("var(--ll-bubblegum)")
    expect(html("yellow", "a")).not.toContain("var(--ll-bubblegum)")
    expect(html("yellow", "a")).toBe(html("yellow", "a"))
    expect(html("yellow", "a")).not.toBe(html("yellow", "b"))
  })

  it("merges className after the defaults and forwards props and ref", () => {
    lines()
    const ref = React.createRef<HTMLElement>()
    const { getByText } = render(
      <Highlight ref={ref} className="font-bold" id="x" data-testid="h">
        props
      </Highlight>,
    )
    expect(getByText("props")).toHaveClass("relative", "isolate", "font-bold")
    expect(getByText("props")).toHaveAttribute("id", "x")
    expect(ref.current).toBe(getByText("props"))
  })

  it("asChild puts the swipe inside the child element", () => {
    lines()
    const { container } = render(
      <Highlight asChild>
        <a href="#x">linked</a>
      </Highlight>,
    )
    const a = container.querySelector("a") as HTMLElement
    expect(a).toHaveAttribute("data-slot", "highlight")
    expect(inkSvgs(a).length).toBe(3)
    expect(a.tagName).toBe("A")
  })
})

describe("Highlight animate", () => {
  beforeEach(() => {
    restore.push(installIntersection())
    lines()
  })

  it("holds the swipe back (idle) until the host scrolls into view, then draws it on", () => {
    const { getByText } = render(<Highlight animate>slow</Highlight>)
    const el = getByText("slow")
    expect(el).toHaveAttribute("data-animate")
    expect(el).toHaveAttribute("data-mark", "idle")
    expect(el).toHaveClass("bg-transparent", "data-animate:data-[mark=idle]:[&>svg]:[clip-path:inset(-10%_var(--ll-wipe-r,100%)_-10%_var(--ll-wipe-l,-4%))]")
    act(() => fireIntersection(el))
    expect(el).toHaveAttribute("data-mark", "in")
    expect(el).toHaveClass("data-animate:data-[mark=in]:[&>svg]:animate-[ll-wipe_var(--ll-dur-draw)_var(--ll-ease-out)_var(--ll-draw-delay,0s)_both]")
  })

  it("staggers the lines and honours delay", () => {
    const { getByText } = render(
      <Highlight animate delay={200}>
        stagger
      </Highlight>,
    )
    const delays = inkSvgs(getByText("stagger")).map((s) => s.style.getPropertyValue("--ll-draw-delay"))
    expect(delays).toEqual(["200ms", "580ms", "960ms"])
  })

  it("without animate there is no gate: the swipe is simply there", () => {
    const { getByText } = render(<Highlight>plain</Highlight>)
    expect(getByText("plain")).not.toHaveAttribute("data-animate")
    expect(getByText("plain")).toHaveAttribute("data-mark", "in")
  })
})

describe("Highlight recipe", () => {
  const params = { ...lineMetrics(27, 17), first: true, last: true, n: 1, tone: "yellow" as const }
  const run = (extra: object = {}, density: "comfortable" | "calm" = "comfortable") =>
    runRecipe(highlightRecipe, { box: { w: 240, h: 26 }, params: { ...params, ...extra }, seed: "s", tier: "lo", density, dir: "ltr", knobs: DEFAULT_KNOBS })

  it("stays inside the lo-tier budget for one visible state", () => {
    const f = run()
    const nodes = (f.parts.rest?.match(/<(path|g|use|clipPath)\b/g) ?? []).length
    expect(nodes).toBeLessThanOrEqual(12)
    expect(f.parts.rest?.length ?? 0).toBeLessThan(8000)
  })

  it("is deterministic and finite", () => {
    expect(run().parts.rest).toBe(run().parts.rest)
    expect(run().parts.rest).not.toMatch(/NaN|undefined|Infinity/)
  })

  it("wide bands get a second pass; calm density does not", () => {
    const wide = (d: "comfortable" | "calm") => runRecipe(highlightRecipe, { box: { w: 400, h: 26 }, params, seed: "s", tier: "lo", density: d, dir: "ltr", knobs: DEFAULT_KNOBS }).parts.rest ?? ""
    expect(wide("comfortable").length).toBeGreaterThan(wide("calm").length)
  })
})

describe("Highlight in a page", () => {
  it("has no axe violations and adds nothing to the accessible text", async () => {
    lines()
    const { container } = renderUI(
      <p>
        Read <Highlight>this part</Highlight> twice.
      </p>,
    )
    expect(container.textContent).toBe("Read this part twice.")
    await axeCheck(container)
  })

  it("keeps rendering inside an InkProvider (calm) and follows RTL", () => {
    lines()
    const { getByText } = render(
      <div dir="rtl">
        <InkProvider density="calm">
          <Highlight>calm</Highlight>
        </InkProvider>
      </div>,
    )
    expect(inkSvgs(getByText("calm"))).toHaveLength(3)
  })

  it("renders on the server without drawing and hydrates without a warning", async () => {
    const ui = (
      <p>
        <Highlight>server</Highlight> text
      </p>
    )
    const a = renderToString(ui)
    expect(a).toBe(renderToString(ui))
    expect(a).not.toContain("<svg")
    expect(a).toContain('data-slot="highlight"')
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const div = document.createElement("div")
    div.innerHTML = a
    document.body.appendChild(div)
    await act(async () => {
      hydrateRoot(div, ui)
    })
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
    div.remove()
  })
})
