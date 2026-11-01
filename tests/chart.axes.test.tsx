import * as React from "react"
import { afterEach, describe, expect, it } from "vitest"

import { buildXY } from "@/lib/ink/charts/chart-build"
import { clearLabels, labelWidth, LABEL_GAP, pickLabelIndices, textWidth } from "@/lib/ink/charts/chart-scale"
import { layoutXY } from "@/lib/ink/charts/chart-xy"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { PATTERNS, type PieSpec } from "@/lib/ink/charts/chart-types"
import { pieRecipe } from "@/lib/ink/recipes/chart-ink/polar"
import { xyRecipe } from "@/lib/ink/recipes/chart-ink/xy"
import { mockBox, renderUI } from "./helpers"

const days = (n: number, from = Date.UTC(2026, 7, 27)) =>
  Array.from({ length: n }, (_, i) => ({ day: new Date(from + i * 864e5).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), v: 800 + ((i * 37) % 400), p: 700 + ((i * 53) % 300) }))

function xGaps(L: ReturnType<typeof layoutXY>): number[] {
  const xs = L.labels.filter((l) => l.role === "x")
  return xs.slice(1).map((l, i) => l.x - xs[i].x - (labelWidth(l.text, l.size ?? 15) + labelWidth(xs[i].text, xs[i].size ?? 15)) / 2)
}

describe("category axis: labels are thinned by their measured width", () => {
  for (const kind of ["area", "bar", "line"] as const) {
    for (const w of [240, 280, 294, 320, 340, 390, 500, 700, 1000]) {
      it(`30 days, ${kind}, ${w}px: at least ${LABEL_GAP}px of air between two labels, first and last kept when they fit`, () => {
        const L = layoutXY(buildXY({ rows: days(30), xKey: "day", kind, series: [{ key: "v" }, { key: "p" }] }), { w, h: 220 })
        const xs = L.labels.filter((l) => l.role === "x")
        expect(xs.length).toBeGreaterThanOrEqual(3)
        for (const g of xGaps(L)) expect(g).toBeGreaterThanOrEqual(LABEL_GAP)
        expect(xs[0].text).toBe("Aug 27")
        expect(xs[xs.length - 1].text).toBe("Sep 25")
        expect(new Set(xs.map((l) => l.size)).size).toBe(1)
      })
    }
  }

  it("the phone chart of the analytics block keeps six evenly spaced days that end on the last one", () => {
    const L = layoutXY(buildXY({ rows: days(30), xKey: "day", kind: "area", series: [{ key: "v" }] }), { w: 340, h: 220 })
    expect(L.labels.filter((l) => l.role === "x").map((l) => l.text)).toEqual(["Aug 27", "Sep 2", "Sep 8", "Sep 14", "Sep 20", "Sep 25"])
  })

  it("every category when they all fit", () => {
    const week = [..."MTWTFSS"].map((d, i) => ({ d: `${d}${i}`, v: i }))
    const L = layoutXY(buildXY({ rows: week, xKey: "d", kind: "bar", series: [{ key: "v" }] }), { w: 390, h: 200 })
    expect(L.labels.filter((l) => l.role === "x")).toHaveLength(7)
  })

  it("long names drop to a regular stride, never overprinting, at any width", () => {
    const names = ["Registered customers", "Returning customers", "Lapsed customers", "Trial accounts", "Enterprise accounts", "Partner accounts", "Internal test accounts", "Other"].map((n, i) => ({ n, v: i + 1 }))
    for (const w of [200, 280, 390, 700]) {
      const L = layoutXY(buildXY({ rows: names, xKey: "n", kind: "bar", series: [{ key: "v" }] }), { w, h: 200 })
      for (const g of xGaps(L)) expect(g, `${w}px`).toBeGreaterThanOrEqual(LABEL_GAP)
      expect(L.labels.some((l) => l.role === "x")).toBe(true)
    }
  })

  it("a numeric x axis (scatter) and the value ticks of sideways bars also keep their air", () => {
    const pts = Array.from({ length: 40 }, (_, i) => ({ x: i * 25000, y: i % 7 }))
    for (const w of [240, 320, 700]) {
      const L = layoutXY(buildXY({ rows: pts, xKey: "x", kind: "scatter", series: [{ key: "y" }] }), { w, h: 200 })
      for (const g of xGaps(L)) expect(g, `scatter ${w}px`).toBeGreaterThanOrEqual(LABEL_GAP)
      const side = layoutXY(buildXY({ rows: names(), xKey: "n", kind: "bar", horizontal: true, series: [{ key: "v" }] }), { w, h: 200 })
      const ys = side.labels.filter((l) => l.role === "y")
      ys.slice(1).forEach((l, i) => expect(l.x - ys[i].x - (labelWidth(l.text, l.size ?? 15) + labelWidth(ys[i].text, ys[i].size ?? 15)) / 2, `sideways ${w}px`).toBeGreaterThanOrEqual(LABEL_GAP))
    }
    function names() {
      return ["Alpha", "Beta", "Gamma"].map((n, i) => ({ n, v: (i + 1) * 1250000 }))
    }
  })
})

describe("pickLabelIndices", () => {
  const uniform = (n: number, w: number) => new Array(n).fill(w)
  it("prints everything that clears by the gap, and only then thins", () => {
    expect(pickLabelIndices(uniform(5, 20), 40).idx).toEqual([0, 1, 2, 3, 4])
    expect(pickLabelIndices(uniform(5, 33), 40).idx).not.toEqual([0, 1, 2, 3, 4])
  })
  it("steps evenly from the first and lands on the last when the run can end there", () => {
    expect(pickLabelIndices(uniform(13, 28), 12).idx).toEqual([0, 3, 6, 9, 12])
  })
  it("adds the last category as a short tail only when it clears the one before", () => {
    const wide = pickLabelIndices(uniform(11, 30), 10)
    expect(wide.idx[wide.idx.length - 1]).toBe(10)
    for (let k = 1; k < wide.idx.length; k++) expect((wide.idx[k] - wide.idx[k - 1]) * 10 - 30).toBeGreaterThanOrEqual(LABEL_GAP)
  })
  it("never lets the last label touch the one before, however the counts fall", () => {
    for (let n = 2; n <= 120; n++) {
      for (const pitch of [3, 6.5, 11, 24]) {
        const w = uniform(n, 34)
        const { idx } = pickLabelIndices(w, pitch)
        expect(idx[0]).toBe(0)
        for (let k = 1; k < idx.length; k++) expect((idx[k] - idx[k - 1]) * pitch - 34, `n ${n} pitch ${pitch}`).toBeGreaterThanOrEqual(LABEL_GAP)
      }
    }
  })
  it("uses each label's own width", () => {
    const mixed = pickLabelIndices([60, 10, 60, 10, 60, 10], 30).idx
    const longOnly = pickLabelIndices([60, 60, 60, 60, 60, 60], 30).idx
    expect(mixed.length).toBeGreaterThanOrEqual(longOnly.length)
  })
  it("degenerate inputs", () => {
    expect(pickLabelIndices([], 10).idx).toEqual([])
    expect(pickLabelIndices([20], 10).idx).toEqual([0])
    expect(pickLabelIndices([20, 20], 5).idx).toEqual([0])
    expect(pickLabelIndices([20, 20], 500).idx).toEqual([0, 1])
  })
  it("clearLabels keeps the first, drops what touches, and lets the last displace the one before it", () => {
    const at = (...xs: number[]) => xs.map((x) => ({ x, w: 30 }))
    expect(clearLabels(at(0, 100, 200)).map((l) => l.x)).toEqual([0, 100, 200])
    expect(clearLabels(at(0, 20, 100, 110)).map((l) => l.x)).toEqual([0, 110])
    expect(clearLabels(at(0, 50, 100, 120)).map((l) => l.x)).toEqual([0, 50, 120])
  })
})

describe("chart weight: the color of many bars, slices and rings is one group", () => {
  const masks = (svg: string) => (svg.match(/<g[^>]*mask=/g) ?? []).length
  const run = (recipe: typeof xyRecipe | typeof pieRecipe, spec: unknown, box = { w: 520, h: 260 }) =>
    runRecipe(recipe as typeof xyRecipe, { box, params: spec as never, seed: "w", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS }).parts.rest ?? ""
  it("91 bars cost about as many masked groups as 6", () => {
    const few = run(xyRecipe, buildXY({ rows: days(6), xKey: "day", kind: "bar", series: [{ key: "v" }] }))
    const many = run(xyRecipe, buildXY({ rows: days(91), xKey: "day", kind: "bar", series: [{ key: "v" }] }))
    expect(few.match(/data-part="fill"/g)).toHaveLength(1)
    expect(many.match(/data-part="fill"/g)).toHaveLength(1)
    expect(masks(many)).toBeLessThanOrEqual(masks(few) + 3)
    expect(masks(many)).toBeLessThanOrEqual(12)
  })
  it("a pie of eight slices colors them in one group", () => {
    const slices = Array.from({ length: 8 }, (_, i) => ({ key: `s${i}`, name: `S${i}`, value: i + 1, slot: i, pattern: PATTERNS[i % 6] }))
    const pie: PieSpec = { type: "pie", slices, inner: 0.5, start: 0, labels: true, patterns: true, state: "ready" }
    const svg = run(pieRecipe, pie, { w: 300, h: 300 })
    expect(svg.match(/data-part="fill"/g)).toHaveLength(1)
    expect(svg).not.toMatch(/NaN|undefined|Infinity/)
  })
})

const modules = import.meta.glob<{ default: React.ComponentType }>("../src/docs/examples/chart/[0-9]*.tsx", { eager: true })

interface Rect {
  text: string
  role: string
  x0: number
  x1: number
  y0: number
  y1: number
}

function rects(labels: Element, w: number, h: number): Rect[] {
  const out: Rect[] = []
  for (const el of labels.querySelectorAll<HTMLElement>("[data-role]")) {
    const role = el.dataset.role ?? ""
    if (role === "center") continue
    const size = Number.parseFloat(el.style.fontSize)
    const tw = Math.min(textWidth(el.textContent ?? "", size), el.style.maxWidth ? Number.parseFloat(el.style.maxWidth) : Infinity)
    const [ax, ay] = (el.style.transform.match(/translate\((-?\d+)%,\s*(-?\d+)%\)/) ?? []).slice(1).map(Number)
    const x = (Number.parseFloat(el.style.left) / 100) * w
    const y = (Number.parseFloat(el.style.top) / 100) * h
    const left = x + (ax / 100) * tw
    const top = y + (ay / 100) * size
    out.push({ text: el.textContent ?? "", role, x0: left, x1: left + tw, y0: top, y1: top + size })
  }
  return out
}

let restore = () => {}
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

describe("axis labels never touch", () => {
  const entries = Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))
  for (const w of [280, 390, 700]) {
    for (const [path, mod] of entries) {
      it(`${path.split("/").pop()} at ${w}px`, () => {
        restore = mockBox(w, 260)
        const Example = mod.default
        const { container } = renderUI(
          <InkProvider>
            <Example />
          </InkProvider>,
        )
        const bad: string[] = []
        for (const labels of container.querySelectorAll("[data-slot=chart-labels]")) {
          const list = rects(labels, w, 260)
          for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
              const a = list[i], b = list[j]
              const dx = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)
              const dy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)
              if (dx > -4 && dy > 2) bad.push(`"${a.text}" / "${b.text}" (${dx.toFixed(1)} px over)`)
            }
          }
        }
        expect(bad).toEqual([])
      })
    }
  }
})
