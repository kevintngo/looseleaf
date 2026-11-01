import { describe, expect, it } from "vitest"

import { buildXY, buildXYRows, capRows, seriesLook, toNum, MAX_BARS, MAX_POINTS, type Row } from "@/lib/ink/charts/chart-build"
import { summarizeXY, tableXY, yScaleFor, xScaleFor, announceRow } from "@/lib/ink/charts/chart-data"
import { buildCalendar, buildGrid, dayMs, formatDay, isoDay, levelOf } from "@/lib/ink/charts/chart-heat"
import { hitIndex, layoutChart, stepIndex } from "@/lib/ink/charts/chart-layout"
import { layoutSpark, layoutTally, layoutHeat } from "@/lib/ink/charts/chart-mini"
import { layoutGauge, layoutPie, layoutRadar, layoutRadial, polar, angleOf, TAU } from "@/lib/ink/charts/chart-polar"
import { bucketOf, formatCompact, formatNumber, lttb, monotoneCurve, niceScale, strideIndices, textWidth, thinIndices, ticksIn } from "@/lib/ink/charts/chart-scale"
import { layoutXY, stackRanges } from "@/lib/ink/charts/chart-xy"
import { PATTERNS, SLOT_KEYS, slotKey, type HeatSpec, type PieSpec, type RadarSpec, type RadialSpec, type GaugeSpec, type SparkSpec, type TallySpec } from "@/lib/ink/charts/chart-types"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { xyRecipe } from "@/lib/ink/recipes/chart-ink/xy"
import { gaugeRecipe, pieRecipe, radarRecipe, radialRecipe } from "@/lib/ink/recipes/chart-ink/polar"
import { heatRecipe, sparkRecipe, tallyRecipe } from "@/lib/ink/recipes/chart-ink/mini"
import { markRecipe } from "@/lib/ink/recipes/chart-ink/mark"

const req = { seed: "t", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
const rows: Row[] = [
  { m: "Jan", a: 186, b: 80 },
  { m: "Feb", a: 305, b: 200 },
  { m: "Mar", a: 237, b: 120 },
  { m: "Apr", a: 73, b: 190 },
]

describe("scales and formats", () => {
  it("niceScale picks tidy ends and ticks", () => {
    const s = niceScale(0, 87, 5)
    expect(s.min).toBe(0)
    expect(s.max).toBe(100)
    expect(s.ticks).toEqual([0, 20, 40, 60, 80, 100])
    expect(niceScale(-3, 12, 5).ticks[0]).toBeLessThanOrEqual(-3)
    expect(niceScale(5, 5).max).toBeGreaterThan(5)
    expect(niceScale(Number.NaN, 4).ticks.length).toBeGreaterThan(1)
  })
  it("ticksIn fits a pinned range", () => {
    expect(ticksIn(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100])
    expect(ticksIn(3, 3)).toEqual([3])
  })
  it("formats numbers the same everywhere", () => {
    expect(formatNumber(1234567.5)).toBe("1,234,567.5")
    expect(formatNumber(-1200)).toBe("-1,200")
    expect(formatCompact(1200)).toBe("1.2k")
    expect(formatCompact(3_400_000)).toBe("3.4M")
    expect(formatCompact(0.25)).toBe("0.25")
    expect(formatCompact(-45)).toBe("-45")
  })
  it("buckets by width", () => {
    expect([bucketOf(200), bucketOf(400), bucketOf(800)]).toEqual(["sm", "md", "lg"])
  })
  it("estimates text width from the hand fonts", () => {
    expect(textWidth("100", 15)).toBeGreaterThan(textWidth("10", 15))
    expect(textWidth("mm", 15)).toBeGreaterThan(textWidth("ii", 15))
  })
  it("thins indices evenly, always keeping the first and last", () => {
    expect(thinIndices(20, 6)).toEqual([0, 4, 8, 11, 15, 19])
    expect(strideIndices(7, 6)).toEqual([0, 2, 4, 6])
    expect(thinIndices(3, 10)).toEqual([0, 1, 2])
  })
  it("lttb keeps peaks and the ends", () => {
    const pts = Array.from({ length: 1000 }, (_, i) => [i, i === 500 ? 100 : Math.sin(i / 20)] as [number, number])
    const idx = lttb(pts, 60)
    expect(idx.length).toBe(60)
    expect(idx[0]).toBe(0)
    expect(idx[idx.length - 1]).toBe(999)
    expect(idx.some((i) => Math.abs(i - 500) <= 12)).toBe(true)
  })
  it("monotone curves never overshoot their points", () => {
    const c = monotoneCurve([[0, 0], [10, 10], [20, 10], [30, 0]], 2)
    for (const p of c) {
      expect(p[1]).toBeLessThanOrEqual(10.0001)
      expect(p[1]).toBeGreaterThanOrEqual(-0.0001)
    }
  })
})

describe("series look", () => {
  it("gives every slot its own paint key and its own pattern", () => {
    expect(new Set(SLOT_KEYS).size).toBe(SLOT_KEYS.length)
    expect(slotKey(-1)).toBe(SLOT_KEYS[7])
    expect(slotKey(9)).toBe(SLOT_KEYS[1])
    expect(new Set(PATTERNS).size).toBe(PATTERNS.length)
  })
  it("draws patterns only when there is more than one series, or when asked", () => {
    expect(seriesLook("bar", 0, 1, "auto").pattern).toBe("solid")
    expect(seriesLook("bar", 1, 2, "auto").pattern).toBe("hatch")
    expect(seriesLook("bar", 0, 1, true).pattern).toBe("solid")
    expect(seriesLook("bar", 1, 1, true).pattern).toBe("hatch")
    expect(seriesLook("bar", 1, 3, false)).toEqual({ pattern: "solid", marker: "circle", dash: "solid" })
    expect(seriesLook("area", 0, 1, "auto").pattern).toBe("hatch")
    expect(seriesLook("line", 1, 2, "auto").dash).toBe("dashed")
    expect(seriesLook("line", 1, 2, "auto", { dash: "dotted", marker: "diamond" })).toMatchObject({ dash: "dotted", marker: "diamond" })
  })
  it("keeps a series' look when another one is hidden", () => {
    const all = buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }, { key: "b" }] })
    const one = buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }, { key: "b" }], hidden: ["a"] })
    expect(one.series).toHaveLength(1)
    expect(one.series[0].slot).toBe(1)
    expect(one.series[0].pattern).toBe(all.series[1].pattern)
  })
})

describe("building specs", () => {
  it("coerces numbers and leaves gaps", () => {
    expect(toNum("12")).toBe(12)
    expect(toNum("")).toBeNull()
    expect(toNum(Number.NaN)).toBeNull()
    expect(toNum(null)).toBeNull()
    const spec = buildXY({ rows: [{ m: "a", v: 1 }, { m: "b", v: "x" }, { m: "c", v: 3 }], xKey: "m", kind: "line", series: [{ key: "v" }] })
    expect(spec.series[0].values).toEqual([1, null, 3])
  })
  it("domain: bars include zero, lines fit the data, stacks add up, pins win", () => {
    const bars = buildXY({ rows: [{ m: "a", v: 50 }, { m: "b", v: 90 }], xKey: "m", kind: "bar", series: [{ key: "v" }] })
    expect(bars.yMin).toBe(0)
    const line = buildXY({ rows: [{ m: "a", v: 50 }, { m: "b", v: 90 }], xKey: "m", kind: "line", series: [{ key: "v" }] })
    expect(line.yMin).toBeGreaterThan(0)
    const stack = buildXY({ rows, xKey: "m", kind: "bar", stacked: true, series: [{ key: "a" }, { key: "b" }] })
    expect(stack.yMax).toBeGreaterThanOrEqual(505)
    const pinned = buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }], domain: [0, 1000] })
    expect([pinned.yMin, pinned.yMax]).toEqual([0, 1000])
    const neg = buildXY({ rows: [{ m: "a", v: -40 }, { m: "b", v: 30 }], xKey: "m", kind: "bar", series: [{ key: "v" }] })
    expect(neg.yMin).toBeLessThanOrEqual(-40)
    expect(neg.yMax).toBeGreaterThanOrEqual(30)
  })
  it("stackRanges stacks positives up and negatives down", () => {
    const s = buildXY({ rows: [{ m: "a", p: 10, q: -4, r: 6 }], xKey: "m", kind: "bar", stacked: true, series: [{ key: "p" }, { key: "q" }, { key: "r" }] })
    const r = stackRanges(s.series, true, 1)
    expect(r[0][0]).toEqual([0, 10])
    expect(r[1][0]).toEqual([-4, 0])
    expect(r[2][0]).toEqual([10, 16])
  })
  it("resolves annotations to an index", () => {
    const spec = buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }], notes: [{ at: "max", text: "best" }, { at: "Apr", text: "low" }, { at: "last", text: "end" }, { at: "nope", text: "x" }, { at: 99, text: "y" }] })
    expect(spec.notes.map((n) => n.i)).toEqual([1, 3, 3])
  })
  it("keeps the data of a long series light", () => {
    const long = Array.from({ length: 5000 }, (_, i) => ({ x: `d${i}`, v: Math.sin(i / 30) * 50 + (i === 2500 ? 300 : 0) }))
    const line = buildXYRows({ rows: long, xKey: "x", kind: "line", series: [{ key: "v" }] })
    expect(line.rows.length).toBe(MAX_POINTS)
    expect(line.spec.total).toBe(5000)
    expect(line.rows.some((r) => r.x === "d2500")).toBe(true)
    const bars = buildXYRows({ rows: long, xKey: "x", kind: "bar", series: [{ key: "v" }] })
    expect(bars.rows.length).toBeLessThanOrEqual(MAX_BARS)
    expect(capRows(rows, ["a"], "bar", "m").total).toBeUndefined()
    expect(summarizeXY(line.spec, { kind: "Line chart" })).toContain("Thinned from 5,000 rows")
  })
  it("is plain JSON with no functions, NaN or undefined", () => {
    const spec = buildXY({ rows, xKey: "m", kind: "line", series: [{ key: "a" }, { key: "b" }], notes: [{ at: "max", text: "hi" }], refs: [{ y: 100, label: "goal" }], xFormat: (v) => String(v).toUpperCase() })
    const json = JSON.stringify(spec)
    expect(json).not.toMatch(/NaN|undefined|Infinity/)
    expect(JSON.parse(json)).toEqual(JSON.parse(JSON.stringify(JSON.parse(json))))
    expect(spec.cats[0]).toBe("JAN")
  })
  it("yScaleFor / xScaleFor handle empty and degenerate data", () => {
    const y = yScaleFor([], { n: 0, stacked: false, zero: true })
    expect(y.yMax).toBeGreaterThan(y.yMin)
    const x = xScaleFor([])
    expect(x.xMax).toBeGreaterThan(x.xMin)
    expect(xScaleFor([5, 5]).xMax).toBeGreaterThan(5)
  })
})

describe("text alternatives", () => {
  const spec = buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a", name: "Desktop" }, { key: "b", name: "Mobile" }] })
  it("summarizes the chart in words", () => {
    const t = summarizeXY(spec, { kind: "Bar chart", title: "Visitors" })
    expect(t).toContain("Visitors.")
    expect(t).toContain("Bar chart with 2 series (Desktop and Mobile)")
    expect(t).toContain("4 categories from Jan to Apr")
    expect(t).toContain("Desktop: from 73 in Apr to 305 in Feb")
  })
  it("says so when there is nothing", () => {
    expect(summarizeXY(buildXY({ rows: [], xKey: "m", kind: "bar", series: [{ key: "a" }] }), { kind: "Bar chart" })).toContain("No data")
    expect(summarizeXY(buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }], state: "loading" }), { kind: "Bar chart" })).toContain("Loading")
  })
  it("makes a table with a row per category", () => {
    const t = tableXY(spec)
    expect(t.head).toEqual(["", "Desktop", "Mobile"])
    expect(t.rows[1]).toEqual(["Feb", "305", "200"])
  })
  it("caps a very long table", () => {
    const long = Array.from({ length: 500 }, (_, i) => ({ x: `${i}`, v: i }))
    const t = tableXY(buildXY({ rows: long, xKey: "x", kind: "line", series: [{ key: "v" }] }))
    expect(t.rows.length).toBeLessThan(500)
  })
  it("announces a row", () => {
    expect(announceRow("Feb", [{ name: "Desktop", value: "305" }, { name: "Mobile", value: "200" }])).toBe("Feb: Desktop 305, Mobile 200")
  })
})

describe("cartesian layout", () => {
  const box = { w: 480, h: 260 }
  it("puts the plot inside the box and the bars on their baseline", () => {
    const spec = buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }] })
    const L = layoutXY(spec, box)
    expect(L.plot.x0).toBeGreaterThan(0)
    expect(L.plot.x1).toBeLessThanOrEqual(box.w)
    expect(L.bars).toHaveLength(4)
    for (const b of L.bars) {
      expect(b.y + b.h).toBeCloseTo(L.basePx, 3)
      expect(b.h).toBeGreaterThan(0)
    }
    expect(L.targets.n).toBe(4)
    expect(L.targets.mode).toBe("x")
  })
  it("groups bars side by side and stacks them on top of each other", () => {
    const g = layoutXY(buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }, { key: "b" }] }), box)
    const first = g.bars.filter((b) => b.i === 0)
    expect(first[0].x + first[0].w).toBeLessThan(first[1].x)
    expect(first[0].y + first[0].h).toBeCloseTo(first[1].y + first[1].h, 3)
    const s = layoutXY(buildXY({ rows, xKey: "m", kind: "bar", stacked: true, series: [{ key: "a" }, { key: "b" }] }), box)
    const st = s.bars.filter((b) => b.i === 0)
    expect(st[0].x).toBeCloseTo(st[1].x, 3)
    expect(st[1].y + st[1].h).toBeCloseTo(st[0].y, 3)
  })
  it("hangs negative bars below the baseline", () => {
    const L = layoutXY(buildXY({ rows: [{ m: "a", v: 40 }, { m: "b", v: -30 }], xKey: "m", kind: "bar", series: [{ key: "v" }] }), box)
    const [pos, neg] = L.bars
    expect(pos.y + pos.h).toBeCloseTo(L.basePx, 3)
    expect(neg.y).toBeCloseTo(L.basePx, 3)
    expect(neg.neg).toBe(true)
  })
  it("runs bars sideways when every series is a bar", () => {
    const L = layoutXY(buildXY({ rows, xKey: "m", kind: "bar", horizontal: true, series: [{ key: "a" }] }), box)
    expect(L.horizontal).toBe(true)
    expect(L.targets.mode).toBe("y")
    expect(L.bars[0].x).toBeCloseTo(L.plot.x0, 3)
    expect(L.labels.some((l) => l.role === "cat")).toBe(true)
    const mixed = layoutXY(buildXY({ rows, xKey: "m", kind: "bar", horizontal: true, series: [{ key: "a" }, { key: "b", kind: "line" }] }), box)
    expect(mixed.horizontal).toBe(false)
  })
  it("thins x labels that would collide and keeps y ticks readable in a short box", () => {
    const long = Array.from({ length: 40 }, (_, i) => ({ x: `Month ${i}`, v: i }))
    const L = layoutXY(buildXY({ rows: long, xKey: "x", kind: "line", series: [{ key: "v" }] }), { w: 320, h: 200 })
    expect(L.labels.filter((l) => l.role === "x").length).toBeLessThan(12)
    const short = layoutXY(buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }] }), { w: 320, h: 90 })
    expect(short.labels.filter((l) => l.role === "y").length).toBeGreaterThanOrEqual(2)
  })
  it("width buckets drop value labels when narrow and add them when there is room", () => {
    const spec = buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }] })
    expect(layoutXY(spec, { w: 240, h: 200 }).labels.some((l) => l.role === "value")).toBe(false)
    expect(layoutXY(spec, { w: 640, h: 260 }).labels.some((l) => l.role === "value")).toBe(true)
    expect(layoutXY(spec, { w: 240, h: 200 }).bucket).toBe("sm")
  })
  it("splits lines at gaps and simplifies long ones", () => {
    const gap = layoutXY(buildXY({ rows: [{ m: "a", v: 1 }, { m: "b", v: null }, { m: "c", v: 3 }, { m: "d", v: 4 }], xKey: "m", kind: "line", series: [{ key: "v" }] }), box)
    expect(gap.lines[0].segs).toHaveLength(2)
    const long = Array.from({ length: 1400 }, (_, i) => ({ x: `${i}`, v: Math.sin(i / 25) }))
    const L = layoutXY(buildXY({ rows: long, xKey: "x", kind: "line", series: [{ key: "v" }] }), box)
    expect(L.simplified).toBeGreaterThan(0)
    expect(L.lines[0].pts).toHaveLength(1400)
  })
  it("keeps gaps where they were when a long line is simplified", () => {
    const long = Array.from({ length: 1200 }, (_, i) => ({ x: `${i}`, v: i >= 400 && i < 420 ? null : Math.sin(i / 25) }))
    const L = layoutXY(buildXY({ rows: long, xKey: "x", kind: "line", series: [{ key: "v" }] }), box)
    expect(L.lines[0].segs).toHaveLength(2)
    expect(L.lines[0].segs[0][L.lines[0].segs[0].length - 1][0]).toBeLessThan(L.lines[0].segs[1][0][0])
  })
  it("places a note near its mark, inside the box", () => {
    const spec = buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }], notes: [{ at: "max", text: "best month!" }] })
    const L = layoutXY(spec, box)
    expect(L.notes).toHaveLength(1)
    const label = L.labels.find((l) => l.role === "note")
    expect(label).toBeTruthy()
    expect(label!.x).toBeGreaterThan(0)
    expect(label!.x).toBeLessThan(box.w)
    expect(L.notes[0].loop).toBeTruthy()
  })
  it("scatter targets every point", () => {
    const pts = Array.from({ length: 20 }, (_, i) => ({ x: i, y: i * 2 }))
    const L = layoutXY(buildXY({ rows: pts, xKey: "x", kind: "scatter", series: [{ key: "y" }] }), box)
    expect(L.targets.mode).toBe("point")
    expect(L.targets.n).toBe(20)
    expect(L.pointOf[3]).toEqual({ s: 0, j: 3 })
  })
  it("cursors: a column behind bars, a guide and rings on lines", () => {
    const bars = layoutXY(buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }] }), box)
    expect(bars.cursorAt(1).map((c) => c.kind)).toEqual(["column"])
    const lines = layoutXY(buildXY({ rows, xKey: "m", kind: "line", series: [{ key: "a" }, { key: "b" }] }), box)
    expect(lines.cursorAt(1).map((c) => c.kind)).toEqual(["guide", "ring", "ring"])
    expect(lines.cursorAt(1, 0).map((c) => c.kind)).toEqual(["guide", "ring"])
    expect(lines.cursorAt(99)).toEqual([])
  })
  it("survives absurd boxes", () => {
    const spec = buildXY({ rows, xKey: "m", kind: "line", series: [{ key: "a" }, { key: "b" }], notes: [{ at: "max", text: "x" }] })
    for (const b of [{ w: 4, h: 2 }, { w: 30, h: 20 }, { w: 2000, h: 40 }, { w: 60, h: 900 }]) {
      const L = layoutXY(spec, b)
      expect(JSON.stringify(L.labels)).not.toMatch(/NaN|Infinity/)
    }
  })
})

describe("targets: pointer and keyboard", () => {
  const L = layoutXY(buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }] }), { w: 480, h: 260 })
  it("finds the nearest category on the axis", () => {
    const t = L.targets
    expect(hitIndex(t, t.pos![2] + 3, 100)).toBe(2)
    expect(hitIndex(t, -50, 100)).toBe(0)
    expect(hitIndex(t, 9999, 0)).toBe(3)
  })
  it("steps with left and right, home and end, and ignores other keys", () => {
    const t = L.targets
    expect(stepIndex(t, null, "ArrowRight")).toBe(0)
    expect(stepIndex(t, null, "ArrowLeft")).toBe(3)
    expect(stepIndex(t, 1, "ArrowRight")).toBe(2)
    expect(stepIndex(t, 0, "ArrowLeft")).toBe(0)
    expect(stepIndex(t, 3, "ArrowRight")).toBe(3)
    expect(stepIndex(t, 2, "Home")).toBe(0)
    expect(stepIndex(t, 2, "End")).toBe(3)
    expect(stepIndex(t, 2, "ArrowUp")).toBeNull()
    expect(stepIndex(t, 2, "a")).toBeNull()
  })
  it("horizontal bars move with up and down", () => {
    const H = layoutXY(buildXY({ rows, xKey: "m", kind: "bar", horizontal: true, series: [{ key: "a" }] }), { w: 480, h: 260 })
    expect(stepIndex(H.targets, 1, "ArrowDown")).toBe(2)
    expect(stepIndex(H.targets, 1, "ArrowUp")).toBe(0)
    expect(stepIndex(H.targets, 1, "ArrowRight")).toBeNull()
  })
})

describe("round layouts", () => {
  const box = { w: 360, h: 280 }
  const slices = [30, 20, 10].map((value, i) => ({ key: `s${i}`, name: `S${i}`, value, slot: i, pattern: PATTERNS[i] }))
  const pie: PieSpec = { type: "pie", slices, inner: 0.5, start: 0, labels: true, patterns: true, state: "ready" }
  it("pie: slices add up to a circle and are found by angle and radius", () => {
    const L = layoutPie(pie, box)
    expect(L.sectors).toHaveLength(3)
    expect(L.sectors[0].a0).toBeCloseTo(0, 6)
    expect(L.sectors[2].a1).toBeCloseTo(TAU, 6)
    expect(L.sectors[0].fraction).toBeCloseTo(0.5, 6)
    expect(hitIndex(L.targets, L.cx + 20, L.cy - (L.R + L.r0) / 2)).toBe(0)
    expect(hitIndex(L.targets, L.cx, L.cy)).toBeNull()
    expect(hitIndex(L.targets, L.cx - 30, L.cy - (L.R + L.r0) / 2)).toBe(2)
    expect(L.labels.filter((l) => l.role === "value")).toHaveLength(3)
    expect(L.cursorAt(1)[0].kind).toBe("slice")
  })
  it("pie: zero and hidden slices are not targets, an empty pie says so", () => {
    const L = layoutPie({ ...pie, slices: [...slices, { key: "z", name: "Z", value: 0, slot: 3, pattern: "solid" }] }, box)
    expect(L.targets.n).toBe(3)
    const e = layoutPie({ ...pie, slices: [], state: "empty" }, box)
    expect(e.labels[0].text).toBe("No data")
  })
  it("slices wrap when stepped", () => {
    const L = layoutPie(pie, box)
    expect(stepIndex(L.targets, 2, "ArrowRight")).toBe(0)
    expect(stepIndex(L.targets, 0, "ArrowLeft")).toBe(2)
  })
  it("radar: vertices sit on their spokes", () => {
    const spec: RadarSpec = { type: "radar", axes: ["a", "b", "c", "d"], series: [{ key: "x", name: "X", slot: 0, pattern: "solid", marker: "circle", values: [100, 50, 0, 25] }], max: 100, levels: 4, ringLabels: ["100", "75", "50", "25"], fill: true, patterns: true, dots: true, state: "ready" }
    const L = layoutRadar(spec, box)
    expect(L.polys[0][0]![1]).toBeLessThan(L.cy)
    expect(L.polys[0][2]![1]).toBeCloseTo(L.cy, 3)
    expect(L.targets.n).toBe(4)
    expect(hitIndex(L.targets, L.cx, L.cy - L.R + 5)).toBe(0)
    expect(L.cursorAt(0)[0].kind).toBe("spoke")
  })
  it("radial: a ring per row, found by radius", () => {
    const spec: RadialSpec = { type: "radial", start: 0, end: 270, patterns: true, state: "ready", rings: [{ key: "a", name: "A", slot: 0, pattern: "solid", value: 50, max: 100 }, { key: "b", name: "B", slot: 1, pattern: "hatch", value: 100, max: 100 }] }
    const L = layoutRadial(spec, box)
    expect(L.arcs[0].r).toBeGreaterThan(L.arcs[1].r)
    expect(L.arcs[1].a1).toBeCloseTo((270 * Math.PI) / 180, 6)
    const p = polar(L.cx, L.cy, L.arcs[1].r, 1)
    expect(hitIndex(L.targets, p[0], p[1])).toBe(1)
  })
  it("gauge: the needle follows the value and clamps", () => {
    const spec: GaugeSpec = { type: "gauge", value: 50, min: 0, max: 100, zones: [{ to: 60, slot: 2, pattern: "solid" }, { to: 100, slot: 6, pattern: "hatch" }], sweep: 180, ticks: 10, minLabel: "0", maxLabel: "100", patterns: true, state: "ready" }
    const L = layoutGauge(spec, { w: 360, h: 220 })
    expect(L.av).toBeCloseTo(0, 6)
    expect(layoutGauge({ ...spec, value: 999 }, { w: 360, h: 220 }).av).toBeCloseTo(Math.PI / 2, 6)
    expect(layoutGauge({ ...spec, value: -5 }, { w: 360, h: 220 }).av).toBeCloseTo(-Math.PI / 2, 6)
    expect(L.zones).toHaveLength(2)
    expect(L.tickAngles).toHaveLength(11)
    expect(L.cy).toBeLessThan(220)
  })
  it("polar helpers agree", () => {
    const p = polar(50, 50, 10, Math.PI / 2)
    expect(p[0]).toBeCloseTo(60, 6)
    expect(p[1]).toBeCloseTo(50, 6)
    expect(angleOf(50, 50, 60, 50)).toBeCloseTo(Math.PI / 2, 6)
    expect(angleOf(50, 50, 50, 60)).toBeCloseTo(Math.PI, 6)
  })
})

describe("small layouts", () => {
  it("sparkline: gaps split the line, the last point is found", () => {
    const spec: SparkSpec = { type: "spark", variant: "line", values: [1, 3, null, 4, 8], min: 0, max: 9, slot: 0, ends: true, extremes: true, state: "ready" }
    const L = layoutSpark(spec, { w: 112, h: 40 })
    expect(L.segs).toHaveLength(2)
    expect(L.last![0]).toBeGreaterThan(90)
    const bars = layoutSpark({ ...spec, variant: "bar", values: [1, 2, 3] }, { w: 112, h: 40 })
    expect(bars.bars).toHaveLength(3)
  })
  it("tally: marks per row follow the count, the unit grows to fit", () => {
    const spec: TallySpec = { type: "tally", rows: [{ key: "a", name: "A", slot: 0, count: 23 }, { key: "b", name: "B", slot: 1, count: 4000 }], unit: 0, totals: ["23", "4,000"], state: "ready" }
    const L = layoutTally(spec, { w: 480, h: 200 })
    expect(L.unit).toBeGreaterThan(1)
    const fixed = layoutTally({ ...spec, rows: [spec.rows[0]], totals: ["23"], unit: 1 }, { w: 480, h: 200 })
    expect(fixed.rows[0].marks).toBe(23)
    expect(L.labels.some((l) => l.text.startsWith("each mark"))).toBe(true)
  })
  it("heat: the lattice fits the box and cells are found", () => {
    const spec: HeatSpec = { type: "heat", cols: 10, rows: 7, levels: Array.from({ length: 70 }, (_, i) => (i === 69 ? -1 : i % 5)), levelCount: 5, colLabels: [{ i: 0, text: "Jan" }], rowLabels: [{ i: 1, text: "Mon" }], slot: 2, variant: "calendar", legend: { less: "Less", more: "More" }, patterns: true, state: "ready" }
    const L = layoutHeat(spec, { w: 400, h: 200 })
    expect(L.cells).toHaveLength(69)
    expect(L.gx + L.cs * 10).toBeLessThanOrEqual(400)
    const c = L.cells[13]
    expect(hitIndex(L.targets, c.x + 2, c.y + 2)).toBe(c.row * 10 + c.col)
    expect(hitIndex(L.targets, L.gx + 9 * L.cs + 2, L.gy + 6 * L.cs + 2)).toBeNull()
    expect(L.legend).toBeTruthy()
  })
  it("heat: two-dimensional keys skip cells without a day", () => {
    const spec: HeatSpec = { type: "heat", cols: 3, rows: 2, levels: [1, 2, 3, 1, 2, -1], levelCount: 5, colLabels: [], rowLabels: [], slot: 0, variant: "grid", legend: null, patterns: false, state: "ready" }
    const t = layoutHeat(spec, { w: 200, h: 100 }).targets
    expect(stepIndex(t, 0, "ArrowRight")).toBe(1)
    expect(stepIndex(t, 1, "ArrowDown")).toBe(4)
    expect(stepIndex(t, 4, "ArrowRight")).toBe(4)
    expect(stepIndex(t, 2, "ArrowDown")).toBe(2)
    expect(stepIndex(t, null, "ArrowDown")).toBe(0)
    expect(stepIndex(t, 0, "End")).toBe(4)
    expect(stepIndex(t, 4, "Home")).toBe(0)
  })
})

describe("calendar and grid data", () => {
  it("parses days in UTC", () => {
    expect(isoDay(dayMs("2026-03-05"))).toBe("2026-03-05")
    expect(formatDay(dayMs("2026-03-05"), true)).toBe("Thu, Mar 5, 2026")
    expect(Number.isNaN(dayMs("nope"))).toBe(true)
    expect(dayMs(new Date(Date.UTC(2026, 0, 2)))).toBe(dayMs("2026-01-02"))
  })
  it("levels: none, then equal steps", () => {
    expect(levelOf(0, 10, 5)).toBe(0)
    expect(levelOf(null, 10, 5)).toBe(0)
    expect(levelOf(1, 10, 5)).toBe(1)
    expect(levelOf(10, 10, 5)).toBe(4)
    expect(levelOf(5, 10, 5, [3, 6, 9])).toBe(1)
    expect(levelOf(7, 10, 5, [3, 6, 9])).toBe(2)
  })
  it("calendar: weeks across, weekdays down, later days empty", () => {
    const data = [{ date: "2026-03-01", value: 4 }, { date: "2026-03-04", value: 8 }, { date: "2026-03-10", value: 2 }]
    const c = buildCalendar(data, { levels: 5, weeks: 3 })
    expect(c.cols).toBe(3)
    expect(c.rows).toBe(7)
    expect(c.levels[1]).toBe(2)
    expect(c.levels[3 * 3 + 1]).toBe(4)
    expect(c.levels[3 * 3 + 2]).toBe(-1)
    expect(c.rowLabels.map((r) => r.text)).toEqual(["Mon", "Wed", "Fri"])
    expect(c.colLabels.map((l) => l.text)).toEqual(["Mar"])
    const monday = buildCalendar(data, { levels: 5, weeks: 3, weekStart: 1 })
    expect(monday.rowLabels.map((r) => r.i)).toEqual([0, 2, 4])
  })
  it("grid: rows and columns in order of appearance", () => {
    const g = buildGrid([{ row: "a", col: "x", value: 1 }, { row: "b", col: "y", value: 5 }], { levels: 5 })
    expect([g.rows, g.cols]).toEqual([2, 2])
    expect(g.levels).toEqual([4 - 3, 0, 0, 4].map((v, i) => (i === 0 ? levelOf(1, 5, 5) : v)))
    expect(g.rowLabels.map((r) => r.text)).toEqual(["a", "b"])
  })
})

describe("recipes draw every kind of chart", () => {
  const boxes = [{ w: 120, h: 80 }, { w: 320, h: 200 }, { w: 640, h: 300 }, { w: 1200, h: 90 }]
  const specs: Array<[string, () => unknown, unknown]> = [
    ["bars", () => buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }, { key: "b" }], notes: [{ at: "max", text: "hi" }], refs: [{ y: 150 }] }), xyRecipe],
    ["stacked", () => buildXY({ rows, xKey: "m", kind: "bar", stacked: true, series: [{ key: "a" }, { key: "b" }] }), xyRecipe],
    ["lines", () => buildXY({ rows, xKey: "m", kind: "line", series: [{ key: "a" }, { key: "b" }] }), xyRecipe],
    ["areas", () => buildXY({ rows, xKey: "m", kind: "area", stacked: true, series: [{ key: "a" }, { key: "b" }] }), xyRecipe],
    ["scatter", () => buildXY({ rows: rows.map((r, i) => ({ x: i, y: r.a })), xKey: "x", kind: "scatter", series: [{ key: "y" }] }), xyRecipe],
    ["empty", () => buildXY({ rows: [], xKey: "m", kind: "bar", series: [{ key: "a" }] }), xyRecipe],
    ["loading", () => buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }], state: "loading" }), xyRecipe],
    ["pie", () => ({ type: "pie", slices: [1, 2, 3].map((v, i) => ({ key: `${i}`, name: `${i}`, value: v, slot: i, pattern: PATTERNS[i] })), inner: 0.5, start: 0, labels: true, patterns: true, state: "ready" }), pieRecipe],
    ["radar", () => ({ type: "radar", axes: ["a", "b", "c"], series: [{ key: "x", name: "X", slot: 0, pattern: "hatch", marker: "circle", values: [1, 2, 3] }], max: 4, levels: 3, ringLabels: ["4", "3", "2"], fill: true, patterns: true, dots: true, state: "ready" }), radarRecipe],
    ["radial", () => ({ type: "radial", start: 0, end: 270, patterns: true, state: "ready", rings: [{ key: "a", name: "A", slot: 0, pattern: "solid", value: 30, max: 100 }] }), radialRecipe],
    ["gauge", () => ({ type: "gauge", value: 40, min: 0, max: 100, zones: [{ to: 50, slot: 2, pattern: "solid" }, { to: 100, slot: 6, pattern: "hatch" }], sweep: 180, ticks: 5, minLabel: "0", maxLabel: "100", patterns: true, state: "ready" }), gaugeRecipe],
    ["spark", () => ({ type: "spark", variant: "area", values: [1, 3, 2, 5], min: 0, max: 6, slot: 0, ends: true, extremes: true, state: "ready" }), sparkRecipe],
    ["tally", () => ({ type: "tally", rows: [{ key: "a", name: "A", slot: 0, count: 12 }], unit: 0, totals: ["12"], state: "ready" }), tallyRecipe],
    ["heat", () => ({ type: "heat", cols: 4, rows: 3, levels: [0, 1, 2, 3, 4, 0, 1, -1, 2, 3, 4, 1], levelCount: 5, colLabels: [{ i: 0, text: "Jan" }], rowLabels: [{ i: 1, text: "Mon" }], slot: 2, variant: "grid", legend: { less: "Less", more: "More" }, patterns: true, state: "ready" }), heatRecipe],
  ]
  for (const [name, make, recipe] of specs) {
    it(`${name}: no NaN, deterministic, layers declared, calm is lighter`, () => {
      for (const box of boxes) {
        const a = runRecipe(recipe as never, { ...req, box, params: make() as never })
        const b = runRecipe(recipe as never, { ...req, box, params: make() as never })
        const markup = Object.values(a.parts).join("")
        expect(markup).not.toMatch(/NaN|undefined|Infinity/)
        expect(Object.keys(a.parts).every((k) => ["rest", "focus"].includes(k))).toBe(true)
        expect(JSON.stringify(a.parts)).toBe(JSON.stringify(b.parts))
        expect(a.parts.rest).toBeTruthy()
      }
      const calm = runRecipe(recipe as never, { ...req, density: "calm", box: { w: 480, h: 240 }, params: make() as never })
      const rich = runRecipe(recipe as never, { ...req, box: { w: 480, h: 240 }, params: make() as never })
      expect((calm.parts.rest ?? "").length).toBeLessThanOrEqual((rich.parts.rest ?? "").length * 1.35)
    })
  }
  it("the hi tier draws the same charts without a stray number", () => {
    for (const [, make, recipe] of specs) {
      const f = runRecipe(recipe as never, { ...req, tier: "hi", box: { w: 420, h: 240 }, params: make() as never })
      expect(Object.values(f.parts).join("")).not.toMatch(/NaN|undefined|Infinity/)
    }
  })
  it("the focus ring is lazy: not in the first run, byte-identical when asked for", () => {
    const params = buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }] })
    const eager = runRecipe(xyRecipe, { ...req, box: { w: 320, h: 200 }, params })
    expect(eager.parts.focus).toBeUndefined()
    const lazy = runRecipe(xyRecipe, { ...req, box: { w: 320, h: 200 }, params, lazy: ["focus"] })
    expect(lazy.parts.focus).toBeTruthy()
    expect(lazy.parts.rest).toBe(eager.parts.rest)
  })
  it("the marks: every cursor and swatch draws", () => {
    for (const p of [
      { kind: "swatch", slot: 1, pattern: "hatch" },
      { kind: "swatch", slot: 2, pattern: "dots", line: true, marker: "triangle", dash: "dashed" },
      { kind: "column" },
      { kind: "guide" },
      { kind: "ring", slot: 3 },
      { kind: "cell" },
      { kind: "slice", cx: 30, cy: 30, r0: 10, r1: 28, a0: 0.2, a1: 1.4 },
      { kind: "spoke", x1: 2, y1: 2, x2: 40, y2: 30 },
    ] as const) {
      const f = runRecipe(markRecipe, { ...req, box: { w: 44, h: 36 }, params: p as never })
      expect(f.parts.rest).toBeTruthy()
      expect(f.parts.rest).not.toMatch(/NaN|undefined/)
    }
  })
  it("budgets: a 30-bar chart stays under 60 KB in lo, a hero chart under 36 KB", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ d: `${i + 1}`, v: Math.round(40 + 30 * Math.sin(i / 3) + ((i * 37) % 23)) }))
    const f30 = runRecipe(xyRecipe, { ...req, box: { w: 640, h: 300 }, params: buildXY({ rows: many, xKey: "d", kind: "bar", series: [{ key: "v" }] }) })
    expect((f30.parts.rest ?? "").length).toBeLessThan(60_000)
    const hero = runRecipe(xyRecipe, { ...req, box: { w: 520, h: 300 }, params: buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }, { key: "b" }] }) })
    expect((hero.parts.rest ?? "").length).toBeLessThan(36_000)
    const spark = runRecipe(sparkRecipe, { ...req, box: { w: 112, h: 40 }, params: { type: "spark", variant: "line", values: Array.from({ length: 24 }, (_, i) => Math.sin(i / 3)), min: -1, max: 1, slot: 0, ends: true, extremes: false, state: "ready" } as never })
    expect((spark.parts.rest ?? "").length).toBeLessThan(4_000)
  })
  it("layoutChart dispatches on the spec type", () => {
    expect(layoutChart(buildXY({ rows, xKey: "m", kind: "bar", series: [{ key: "a" }] }), { w: 300, h: 200 }).targets.n).toBe(4)
  })
})

describe("values outside a pinned domain", () => {
  it("stop at the plot edge instead of drawing a mile of ink", () => {
    const wild: Row[] = [{ c: "a", v: 50, w: 1e9 }, { c: "b", v: -1e9, w: 20 }, { c: "c", v: 70, w: 30 }, { c: "d", v: 1e12, w: 10 }]
    for (const kind of ["bar", "line", "area"] as const) {
      const spec = buildXY({ rows: wild, xKey: "c", kind, series: [{ key: "v" }, { key: "w" }], domain: [0, 100] })
      const L = layoutXY(spec, { w: 480, h: 260 })
      for (const b of L.bars) {
        expect(b.y).toBeGreaterThanOrEqual(L.plot.y0 - 7)
        expect(b.y + b.h).toBeLessThanOrEqual(L.plot.y1 + 7)
      }
      const f = runRecipe(xyRecipe, { ...req, box: { w: 480, h: 260 }, params: spec })
      expect((f.parts.rest ?? "").length).toBeLessThan(80_000)
    }
  })
})

describe("fuzz: odd data, odd boxes", () => {
  const lcg = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
  const pick = <T,>(r: () => number, a: readonly T[]): T => a[Math.floor(r() * a.length)]
  const values = (r: () => number): unknown => pick(r, [0, 0, 1, -1, 3.5, 250, -1e6, 1e9, 0.000123, null, undefined, "12", "x", Number.NaN, Infinity])

  it("cartesian: every kind, shape, size and kind of value", () => {
    const r = lcg(7)
    for (let run = 0; run < 160; run++) {
      const n = pick(r, [0, 1, 2, 3, 7, 40])
      const rows: Row[] = Array.from({ length: n }, (_, i) => ({ c: pick(r, [`c${i}`, "", "a very long category name indeed", 5]), a: values(r), b: values(r), s: values(r) }))
      const kind = pick(r, ["bar", "line", "area", "scatter"] as const)
      const spec = buildXY({
        rows: kind === "scatter" ? rows.map((x, i) => ({ ...x, c: i * 3 - 5 })) : rows,
        xKey: "c",
        kind,
        series: pick(r, [[{ key: "a" }], [{ key: "a" }, { key: "b" }], [{ key: "nope" }], []]),
        stacked: r() < 0.4,
        horizontal: r() < 0.3,
        curve: pick(r, ["smooth", "linear", "step"] as const),
        notes: r() < 0.5 ? [{ at: pick(r, ["max", "min", "first", "last", 0, 99] as const), text: "note" }] : [],
        refs: r() < 0.3 ? [{ y: 100, label: "goal" }] : [],
        sizeKey: kind === "scatter" ? "s" : undefined,
        values: pick(r, [true, false, "auto"] as const),
      })
      expect(JSON.stringify(spec)).not.toMatch(/NaN|Infinity/)
      for (const box of [{ w: 4, h: 2 }, { w: 120, h: 60 }, { w: 480, h: 260 }, { w: 1600, h: 40 }]) {
        const L = layoutXY(spec, box, r() < 0.3)
        expect(JSON.stringify([L.labels, L.bars, L.notes, L.refs])).not.toMatch(/NaN|Infinity/)
        const f = runRecipe(xyRecipe, { ...req, box, params: spec })
        expect(Object.values(f.parts).join("")).not.toMatch(/NaN|undefined|Infinity/)
        for (let i = 0; i < L.targets.n; i++) L.cursorAt(i)
      }
    }
  })

  it("round and small charts: empty, all zero, negative, one slice", () => {
    const r = lcg(11)
    for (let run = 0; run < 60; run++) {
      const n = pick(r, [0, 1, 2, 5, 12])
      const vs = Array.from({ length: n }, () => pick(r, [0, 0, 5, -3, 1e7, Number.NaN, 0.001]))
      const pie: PieSpec = { type: "pie", slices: vs.map((v, i) => ({ key: `${i}`, name: `S${i}`, value: v, slot: i, pattern: PATTERNS[i % 6] })), inner: pick(r, [0, 0.5, 0.95]), start: pick(r, [0, 90, -45]), labels: true, patterns: true, state: n ? "ready" : "empty" }
      const radar: RadarSpec = { type: "radar", axes: vs.map((_, i) => `a${i}`), series: [{ key: "x", name: "X", slot: 0, pattern: "solid", marker: "circle", values: vs }], max: pick(r, [0, 10, 100]), levels: 3, ringLabels: ["3", "2", "1"], fill: true, patterns: true, dots: true, state: n >= 3 ? "ready" : "empty" }
      const radial: RadialSpec = { type: "radial", start: 0, end: pick(r, [270, 360, 180]), patterns: true, state: n ? "ready" : "empty", rings: vs.map((v, i) => ({ key: `${i}`, name: `R${i}`, slot: i, pattern: "solid", value: v, max: pick(r, [0, 100]) })) }
      const gauge: GaugeSpec = { type: "gauge", value: vs[0] ?? 0, min: pick(r, [0, 5]), max: pick(r, [0, 5, 100]), zones: r() < 0.5 ? [{ to: 50, slot: 2, pattern: "solid" }, { to: 10, slot: 5, pattern: "hatch" }] : [], sweep: pick(r, [180, 240, 300]), ticks: pick(r, [0, 5, 10]), minLabel: "0", maxLabel: "9", patterns: true, state: "ready" }
      const spark: SparkSpec = { type: "spark", variant: pick(r, ["line", "area", "bar"] as const), values: vs.map((v) => (Number.isFinite(v) ? v : null)), min: -3, max: 10, slot: 0, ends: true, extremes: true, state: n ? "ready" : "empty" }
      const tally: TallySpec = { type: "tally", rows: vs.map((v, i) => ({ key: `${i}`, name: `T${i}`, slot: i, count: Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0 })), unit: pick(r, [0, 1, 5]), totals: vs.map((v) => String(Number.isFinite(v) ? v : 0)), state: n ? "ready" : "empty" }
      for (const box of [{ w: 4, h: 2 }, { w: 90, h: 50 }, { w: 400, h: 300 }, { w: 1200, h: 60 }]) {
        for (const [recipe, spec] of [[pieRecipe, pie], [radarRecipe, radar], [radialRecipe, radial], [gaugeRecipe, gauge], [sparkRecipe, spark], [tallyRecipe, tally]] as const) {
          const f = runRecipe(recipe as never, { ...req, box, params: spec as never })
          expect(Object.values(f.parts).join("")).not.toMatch(/NaN|undefined|Infinity/)
          const L = layoutChart(spec as never, box)
          expect(JSON.stringify(L.labels)).not.toMatch(/NaN|Infinity/)
          for (let i = 0; i < L.targets.n; i++) L.cursorAt(i)
        }
      }
    }
  })

  it("heat maps: empty, one cell, a lopsided grid", () => {
    for (const [cols, rows] of [[0, 0], [1, 1], [60, 7], [2, 30]] as const) {
      const levels = Array.from({ length: cols * rows }, (_, i) => (i % 5 === 4 ? -1 : i % 5))
      const spec: HeatSpec = { type: "heat", cols, rows, levels, levelCount: 5, colLabels: cols ? [{ i: 0, text: "Jan" }] : [], rowLabels: rows ? [{ i: 0, text: "Mon" }] : [], slot: 2, variant: "calendar", legend: { less: "Less", more: "More" }, patterns: true, state: cols && rows ? "ready" : "empty" }
      for (const box of [{ w: 4, h: 2 }, { w: 300, h: 100 }, { w: 1200, h: 300 }]) {
        const f = runRecipe(heatRecipe, { ...req, box, params: spec })
        expect(Object.values(f.parts).join("")).not.toMatch(/NaN|undefined|Infinity/)
        const L = layoutHeat(spec, box)
        expect(JSON.stringify(L.labels)).not.toMatch(/NaN|Infinity/)
      }
    }
  })
})
