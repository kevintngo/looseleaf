import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Arrow } from "@/components/ui/arrow"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { arrowRecipe, type ArrowCurve, type ArrowDirection, type ArrowHead, type ArrowParams } from "@/lib/ink/recipes/arrow-ink"
import { axeCheck, expectInkLayers, mockBox } from "./helpers"
import { fireIntersection, inkSvgs, installIntersection } from "./_marks-lib"

let restore: Array<() => void> = []
beforeEach(() => restore.push(mockBox(80, 40)))
afterEach(() => {
  restore.forEach((r) => r())
  restore = []
})

describe("Arrow", () => {
  it("is a span with upstream-style slot, aria-hidden ink as a direct child of the host", () => {
    const { container, getByTestId } = render(<Arrow data-testid="a" />)
    const host = getByTestId("a")
    expect(host).toHaveAttribute("data-slot", "arrow")
    expect(host).toHaveAttribute("data-direction", "right")
    expect(host).toHaveAttribute("data-ink-host")
    const svgs = inkSvgs(host)
    expect(svgs).toHaveLength(1)
    expect(svgs[0]).toHaveAttribute("aria-hidden", "true")
    expect(svgs[0].getAttribute("data-ink")).toBe("arrow")
    expectInkLayers(container, { min: 1, kinds: ["arrow"], absolute: true, layers: ["rest"] })
  })

  it("every direction, curve and head draws something different and finite", () => {
    const seen = new Set<string>()
    const dirs: ArrowDirection[] = ["right", "left", "up", "down", "up-right", "up-left", "down-right", "down-left"]
    for (const direction of dirs) {
      const { getByTestId, unmount } = render(<Arrow data-testid="d" direction={direction} seed="s" />)
      const html = inkSvgs(getByTestId("d"))[0].innerHTML
      expect(html).not.toMatch(/NaN|undefined|Infinity/)
      seen.add(html)
      unmount()
    }
    expect(seen.size).toBe(dirs.length)
    const html = (props: object) => {
      const { getByTestId, unmount } = render(<Arrow data-testid="d" seed="s" {...props} />)
      const out = inkSvgs(getByTestId("d"))[0].innerHTML
      unmount()
      return out
    }
    expect(html({ curve: "curved" })).not.toBe(html({}))
    expect(html({ curve: "curl" })).not.toBe(html({ curve: "curved" }))
    expect(html({ head: "solid" })).not.toBe(html({ head: "v" }))
    expect(html({ tone: "blue" })).toContain("var(--ll-ink-you)")
  })

  it("the label is real text placed outside the tail by direction", () => {
    const { getByText } = render(<Arrow direction="down-left">look here</Arrow>)
    const label = getByText("look here")
    expect(label).toHaveAttribute("data-slot", "arrow-label")
    expect(label.className).toContain("start-full")
    expect(label.closest("[data-slot=arrow]")).toHaveTextContent("look here")
  })

  it("aims at another element: leaves its own box and stops short of the target", () => {
    const rects = new Map<string, DOMRect>()
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      return rects.get(this.id) ?? ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect)
    })
    restore.push(() => spy.mockRestore())
    const box = (l: number, t: number, w: number, h: number) => ({ left: l, top: t, right: l + w, bottom: t + h, width: w, height: h, x: l, y: t, toJSON: () => ({}) }) as DOMRect
    rects.set("from", box(0, 0, 24, 24))
    rects.set("to", box(200, 0, 100, 24))
    const { getByTestId } = render(
      <div>
        <Arrow id="from" data-testid="a" pointAt="#to" gap={6} />
        <div id="to" />
      </div>,
    )
    const svg = inkSvgs(getByTestId("a"))[0]
    expect(parseFloat(svg.style.left)).toBeLessThan(-190)
    expect(getByTestId("a")).not.toHaveAttribute("data-direction")
  })

  it("draws nothing yet when the target cannot be found", () => {
    const { getByTestId } = render(<Arrow data-testid="a" pointAt="#nowhere" />)
    expect(inkSvgs(getByTestId("a"))).toHaveLength(0)
    expect(getByTestId("a")).not.toHaveAttribute("data-ink-host")
  })

  it("show=false hides it; seed pins the hand; className merges", () => {
    const { getByTestId, rerender } = render(<Arrow data-testid="a" show={false} className="h-16 w-32" />)
    expect(inkSvgs(getByTestId("a"))).toHaveLength(0)
    expect(getByTestId("a")).toHaveAttribute("data-mark", "off")
    expect(getByTestId("a")).toHaveClass("h-16", "w-32", "relative", "isolate")
    expect(getByTestId("a")).not.toHaveClass("h-10")
    rerender(<Arrow data-testid="a" show className="h-16 w-32" />)
    expect(inkSvgs(getByTestId("a"))).toHaveLength(1)
  })
})

describe("Arrow animate", () => {
  beforeEach(() => restore.push(installIntersection()))

  it("is written on through a mask once it scrolls into view", () => {
    const { getByTestId } = render(<Arrow data-testid="a" animate delay={150} />)
    const el = getByTestId("a")
    expect(el).toHaveAttribute("data-mark", "idle")
    expect(el.className).toContain("stroke-dasharray:1")
    expect(inkSvgs(el)[0].innerHTML).toContain('data-part="reveal"')
    expect(el.style.getPropertyValue("--ll-draw-delay")).toBe("150ms")
    act(() => fireIntersection(el))
    expect(el).toHaveAttribute("data-mark", "in")
    expect(el.className).toContain("animate-[ll-draw")
  })
})

describe("Arrow recipe", () => {
  const base: ArrowParams = { direction: "right", curve: "straight", head: "v", tone: "ink", weight: "regular", bend: "up", mirror: true }
  const run = (p: Partial<ArrowParams>, dir: "ltr" | "rtl" = "ltr", box = { w: 80, h: 40 }) =>
    runRecipe(arrowRecipe, { box, params: { ...base, ...p }, seed: "s", tier: "lo", density: "comfortable", dir, knobs: DEFAULT_KNOBS })

  it("stays in the lo-tier budget for every combination", () => {
    for (const curve of ["straight", "curved", "curl"] as ArrowCurve[]) {
      for (const head of ["v", "two", "open", "solid", "none"] as ArrowHead[]) {
        for (const animate of [false, true]) {
          const f = run({ curve, head, animate })
          const nodes = (f.parts.rest?.match(/<(path|g|use|clipPath|mask)\b/g) ?? []).length
          expect(nodes, `${curve} ${head} ${animate}`).toBeLessThanOrEqual(16)
          expect(f.parts.rest?.length ?? 0, `${curve} ${head}`).toBeLessThan(9000)
          expect(f.parts.rest).not.toMatch(/NaN|undefined|Infinity/)
        }
      }
    }
  })

  it("a horizontal arrow flips in a right-to-left page, unless told not to; a vertical one does not", () => {
    expect(run({}, "rtl").parts.rest).not.toBe(run({}).parts.rest)
    expect(run({ mirror: false }, "rtl").parts.rest).toBe(run({}).parts.rest)
    expect(run({ direction: "down" }, "rtl").parts.rest).toBe(run({ direction: "down" }).parts.rest)
  })

  it("pad grows with the distance when aimed at a point", () => {
    expect(run({ dx: 300, dy: 0 }).pad).toBeGreaterThan(run({}).pad)
  })
})

describe("Arrow in a page", () => {
  it("has no axe violations, inside a calm provider too", async () => {
    const { container } = render(
      <InkProvider density="calm">
        <p>
          Note <Arrow direction="down-right">here</Arrow>
        </p>
      </InkProvider>,
    )
    await axeCheck(container)
  })

  it("renders on the server without a drawing and hydrates without a warning", async () => {
    const ui = <Arrow>look</Arrow>
    const a = renderToString(ui)
    expect(a).toBe(renderToString(ui))
    expect(a).not.toContain("<svg")
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
