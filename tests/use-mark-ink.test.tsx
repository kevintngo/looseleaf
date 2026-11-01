import * as React from "react"
import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mergeLineRects, useMarkInk } from "@/hooks/use-mark-ink"
import { useMergedRef } from "@/lib/ink/react"
import { inkFrame } from "@/lib/ink/react/cache"
import { DEFAULT_KNOBS } from "@/lib/ink/recipes"
import { highlightRecipe, type HighlightParams } from "@/lib/ink/recipes/highlight-ink"
import { GUESS_RATIOS, lineMetrics } from "@/lib/ink/recipes/text-marks-ink"
import { THREE_LINES, inkSvgs, type LineRect } from "./_marks-lib"

describe("mergeLineRects", () => {
  it("drops empty fragments and keeps document order", () => {
    const out = mergeLineRects([
      { left: 0, top: 0, width: 0, height: 27 },
      { left: 10, top: 0, width: 80, height: 27 },
      { left: 0, top: 30, width: 50, height: 27 },
    ])
    expect(out).toEqual([
      { left: 10, top: 0, width: 80, height: 27 },
      { left: 0, top: 30, width: 50, height: 27 },
    ])
  })

  it("joins fragments that share a line (a bidi run, an inline child) into one", () => {
    const out = mergeLineRects([
      { left: 100, top: 2, width: 40, height: 27 },
      { left: 10, top: 3, width: 60, height: 26 },
      { left: 0, top: 40, width: 30, height: 27 },
    ])
    expect(out).toHaveLength(2)
    expect(out[0]).toEqual({ left: 10, top: 2, width: 130, height: 27 })
  })
})

function Probe({ rects, mode = "lines" }: { rects: LineRect[]; mode?: "lines" | "box" }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const { hostRef, hostProps, nodes } = useMarkInk<HighlightParams>({ recipe: highlightRecipe, params: { tone: "yellow" }, kind: "highlight", seed: "probe", mode })
  React.useEffect(() => {
    if (ref.current) (ref.current as unknown as { __rects: LineRect[] }).__rects = rects
  })
  return (
    <span data-slot="probe" data-rects={JSON.stringify(rects)} ref={useMergedRef(hostRef, ref)} {...hostProps}>
      text
      {nodes}
    </span>
  )
}

const stubRects = () =>
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    const list: LineRect[] = JSON.parse(this.getAttribute("data-rects") ?? "[]")
    return Object.assign(list.map((r) => ({ ...r, x: r.left, y: r.top, right: r.left + r.width, bottom: r.top + r.height, toJSON: () => r })), { item: (i: number) => list[i] }) as unknown as DOMRectList
  })

describe("useMarkInk", () => {
  afterEach(() => vi.restoreAllMocks())

  it("draws one svg per fragment, placed by pixels from the origin marker", () => {
    stubRects()
    const { container } = render(<Probe rects={THREE_LINES} />)
    const host = container.querySelector("[data-slot=probe]") as HTMLElement
    const svgs = inkSvgs(host)
    expect(svgs).toHaveLength(3)
    expect(parseFloat(svgs[0].style.left)).toBe(THREE_LINES[0].left - 10)
    expect(parseFloat(svgs[2].style.top)).toBe(THREE_LINES[2].top - 10)
    expect(parseFloat(svgs[1].style.width)).toBe(THREE_LINES[1].width + 20)
    expect(host.querySelector("[data-part=mark-origin]")).toHaveAttribute("aria-hidden", "true")
  })

  it("box mode draws one svg for the union of the fragments", () => {
    stubRects()
    const box = render(<Probe rects={THREE_LINES} mode="box" />)
    const svgs = inkSvgs(box.container.querySelector("[data-slot=probe]")!)
    expect(svgs).toHaveLength(1)
    expect(parseFloat(svgs[0].style.width)).toBe(300 + 20)
  })

  it("redraws when the browser reports new line breaks (ResizeObserver on the host and its container)", () => {
    stubRects()
    const observers: Array<{ cb: ResizeObserverCallback; targets: Element[] }> = []
    const Prev = globalThis.ResizeObserver
    globalThis.ResizeObserver = class {
      o = { cb: (() => {}) as ResizeObserverCallback, targets: [] as Element[] }
      constructor(cb: ResizeObserverCallback) {
        this.o.cb = cb
        observers.push(this.o)
      }
      observe(el: Element) {
        this.o.targets.push(el)
      }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
    try {
      const { container, rerender } = render(<Probe rects={THREE_LINES} />)
      const host = container.querySelector("[data-slot=probe]") as HTMLElement
      expect(inkSvgs(host)).toHaveLength(3)
      expect(observers.some((o) => o.targets.includes(host))).toBe(true)
      expect(observers.some((o) => o.targets.includes(host.parentElement as Element))).toBe(true)
      host.setAttribute("data-rects", JSON.stringify(THREE_LINES.slice(0, 2)))
      act(() => observers.forEach((o) => o.cb([], {} as ResizeObserver)))
      expect(inkSvgs(host)).toHaveLength(2)
      rerender(<Probe rects={THREE_LINES} />)
    } finally {
      globalThis.ResizeObserver = Prev
    }
  })

  it("the params it builds are the ones lineMetrics gives for the fragment (what the look-dev specimens use)", () => {
    stubRects()
    const { container } = render(<Probe rects={[{ left: 0, top: 0, width: 200, height: 27 }]} />)
    const svg = inkSvgs(container.querySelector("[data-slot=probe]")!)[0]
    const params: HighlightParams = { tone: "yellow", ...lineMetrics(27, 16, GUESS_RATIOS), first: true, last: true, n: 1, animate: false }
    const frame = inkFrame(highlightRecipe, { box: { w: 200, h: 27 }, params, seed: "probe:0", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
    const expected = document.createElementNS("http://www.w3.org/2000/svg", "g")
    expected.innerHTML = frame.parts.rest ?? ""
    expect(svg.querySelector("[data-layer=rest]")!.innerHTML).toBe(expected.innerHTML)
  })
})
