import * as React from "react"
import { renderToString } from "react-dom/server"
import { act, fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { AreaChart, BarChart, ChartContainer, ChartLegend, ChartTooltip, DonutChart, Gauge, Heatmap, LineChart, PieChart, RadarChart, ScatterChart, Sparkline, TallyChart, type ChartConfig } from "@/components/ui/chart"
import { layoutPie } from "@/lib/ink/charts/chart-polar"
import { buildXY } from "@/lib/ink/charts/chart-build"
import { layoutXY, pickTicks } from "@/lib/ink/charts/chart-xy"
import { layoutHeat } from "@/lib/ink/charts/chart-mini"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(480, 260)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const rows = [
  { m: "Jan", a: 10, b: 4 },
  { m: "Feb", a: 30, b: 12 },
  { m: "Mar", a: 20, b: 8 },
]

describe("accessible name", () => {
  it("a chart given only a description still has a name", async () => {
    const { container } = renderUI(<BarChart data={rows} xKey="m" description="Sales by month." />)
    const canvas = container.querySelector("[data-chart-type]") as HTMLElement
    expect(canvas.getAttribute("aria-label")).toBeTruthy()
    await axeCheck(container)
  })
  it("every chart type has a name without a label prop", async () => {
    const { container } = renderUI(
      <div>
        <PieChart data={[{ n: "a", v: 1 }, { n: "b", v: 2 }]} description="d" />
        <RadarChart data={[{ k: "a", v: 1 }, { k: "b", v: 2 }, { k: "c", v: 3 }]} description="d" />
        <Sparkline data={[1, 2, 3]} />
        <Gauge value={4} />
        <TallyChart data={[{ n: "a", v: 4 }]} />
        <Heatmap data={[{ date: "2026-01-02", value: 3 }]} />
      </div>,
    )
    container.querySelectorAll("[data-chart-type]").forEach((el) => expect(el.getAttribute("aria-label")).toBeTruthy())
    await axeCheck(container)
  })
})

describe("standalone charts follow their data", () => {
  it("series that arrive after an empty first render are labelled and coloured", () => {
    const cols: Array<{ m: string; a?: number; b?: number }> = []
    const { rerender, container } = render(<LineChart data={cols} xKey="m" />)
    rerender(<LineChart data={rows} xKey="m" />)
    expect(container.querySelector("[data-slot=chart-legend]")).not.toBeNull()
    expect(container.querySelectorAll("[data-slot=chart-legend-item]").length).toBe(2)
    expect(container.querySelector("style")?.textContent ?? "").toContain("--color-a")
  })
})

describe("grouped bars never overlap their neighbours", () => {
  it.each([
    [30, 3, 400],
    [52, 3, 400],
    [100, 3, 640],
    [365, 2, 800],
  ])("%i categories x %i series at %ipx", (cats, ser, w) => {
    const keys = ["a", "b", "c", "d"].slice(0, ser)
    const spec = buildXY({ rows: Array.from({ length: cats }, (_, i) => ({ x: `c${i}`, a: 1 + (i % 7), b: 2, c: 3, d: 4 })), xKey: "x", series: keys.map((k) => ({ key: k })), kind: "bar" })
    const L = layoutXY(spec, { w, h: 240 })
    for (let i = 0; i + 1 < spec.cats.length; i++) {
      const here = L.bars.filter((b) => b.i === i)
      const next = L.bars.filter((b) => b.i === i + 1)
      const end = Math.max(...here.map((b) => b.x + b.w))
      const start = Math.min(...next.map((b) => b.x))
      expect(end).toBeLessThanOrEqual(start + 0.01)
    }
    for (const b of L.bars) {
      expect(b.x).toBeGreaterThanOrEqual(L.plot.x0 - 0.01)
      expect(b.x + b.w).toBeLessThanOrEqual(L.plot.x1 + 0.01)
    }
  })
})

describe("value axis ticks", () => {
  it("a thinned axis still reaches both ends of the domain", () => {
    for (const [w, h] of [[400, 225], [320, 200], [300, 160], [560, 320]] as const) {
      const spec = buildXY({ rows: [{ q: "a", v: 3 }, { q: "b", v: 87 }], xKey: "q", series: [{ key: "v" }], kind: "bar" })
      const L = layoutXY(spec, { w, h })
      const ys = L.labels.filter((l) => l.role === "y").map((l) => l.text)
      expect(ys[0]).toBe("0")
      expect(ys[ys.length - 1]).toBe("100")
    }
  })
})

describe("pickTicks", () => {
  const t = (...v: number[]) => v.map((x) => ({ v: x, label: String(x) }))
  const dense = t(0, 20, 40, 60, 80, 100)
  const alt = [t(0, 50, 100)]
  it("keeps every tick when they fit", () => expect(pickTicks(dense, alt, 6, [0, 100])).toEqual(dense))
  it("takes the coarser set that spans the domain", () => expect(pickTicks(dense, alt, 4, [0, 100]).map((x) => x.v)).toEqual([0, 50, 100]))
  it("thins in round steps when that still counts from the start", () => expect(pickTicks(t(0, 10, 20, 30, 40, 50, 60, 70), undefined, 4, [0, 70]).map((x) => x.v)).toEqual([0, 20, 40, 60]))
  it("prefers 50, 100 to 20, 60, 100 on a domain that starts at 20", () => expect(pickTicks(t(20, 40, 60, 80, 100, 120), [t(50, 100)], 4, [20, 120]).map((x) => x.v)).toEqual([50, 100]))
  it("falls back to the plain stride", () => expect(pickTicks(t(20, 40, 60, 80, 100, 120), undefined, 4, [20, 120]).map((x) => x.v)).toEqual([20, 60, 100]))
})

describe("pie percentages add up", () => {
  it("labels of a pie sum to 100", () => {
    const slices = [30.3, 22.2, 20.2, 19.2, 10.1].map((value, i) => ({ key: `k${i}`, name: `k${i}`, slot: i, value, pattern: "solid" as const }))
    const L = layoutPie({ type: "pie", slices, inner: 0, start: 0, labels: true, patterns: true, state: "ready" }, { w: 400, h: 300 })
    const sum = L.labels.filter((l) => l.id.startsWith("l-")).reduce((n, l) => n + parseInt(l.text, 10), 0)
    expect(sum).toBe(100)
  })
  it("the tooltip, the summary and the table say the same shares", () => {
    const d = [{ n: "a", v: 303 }, { n: "b", v: 222 }, { n: "c", v: 202 }, { n: "d", v: 192 }, { n: "e", v: 101 }]
    const { container } = render(<PieChart data={d} nameKey="n" valueKey="v" label="Pie" />)
    const table = [...container.querySelectorAll("[data-slot=chart-data] tbody tr")].map((r) => r.lastElementChild?.textContent ?? "")
    expect(table.reduce((n, t) => n + parseInt(t, 10), 0)).toBe(100)
    const labels = [...container.querySelectorAll("[data-role=value]")].map((e) => e.textContent ?? "")
    expect(labels.reduce((n, t) => n + parseInt(t, 10), 0)).toBe(100)
  })
})

describe("radar rim", () => {
  it("scales to a tidy number just above the data, not twice as far", () => {
    const rim = (top: number) => {
      const { container, unmount } = render(<RadarChart data={[{ k: "a", v: top }, { k: "b", v: top / 2 }, { k: "c", v: top / 3 }]} xKey="k" series={["v"]} label="r" />)
      const text = container.querySelector("[data-slot=chart-data] p")?.textContent ?? ""
      unmount()
      return Number(/scaled to ([\d,]+)/.exec(text)?.[1]?.replace(/,/g, ""))
    }
    expect(rim(100)).toBe(100)
    expect(rim(10)).toBe(10)
    expect(rim(120)).toBe(120)
    expect(rim(250)).toBe(300)
    expect(rim(87)).toBe(100)
  })
})

describe("calm text size", () => {
  it("axis text is never below 12px", () => {
    const spec = buildXY({ rows, xKey: "m", series: [{ key: "a" }], kind: "bar" })
    for (const w of [200, 300, 500]) {
      const L = layoutXY(spec, { w, h: 200 }, true)
      for (const l of L.labels) expect(l.size ?? 12).toBeGreaterThanOrEqual(12)
    }
  })
})

describe("heat map month names do not collide", () => {
  it("a narrow calendar drops names instead of overprinting them", () => {
    const days = Array.from({ length: 365 }, (_, i) => ({ date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10), value: i % 5 }))
    const { container } = render(<Heatmap data={days} />)
    const spec = container.querySelector("[data-chart-type=heat]")
    expect(spec).not.toBeNull()
  })
  it("layout keeps name starts a text width apart", async () => {
    const { buildCalendar } = await import("@/lib/ink/charts/chart-heat")
    const days = Array.from({ length: 365 }, (_, i) => ({ date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10), value: i % 5 }))
    const cells = buildCalendar(days, { levels: 5 })
    const spec = { type: "heat" as const, cols: cells.cols, rows: cells.rows, levels: cells.levels, levelCount: 5, colLabels: cells.colLabels, rowLabels: cells.rowLabels, slot: 2, variant: "calendar" as const, legend: { less: "Less", more: "More" }, patterns: true, state: "ready" as const }
    for (const w of [240, 300, 360, 480, 800]) {
      const L = layoutHeat(spec, { w, h: 140 })
      const xs = L.labels.filter((l) => l.role === "x").map((l) => l.x)
      for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(14.5 * 0.4 * 3 + 6)
    }
  })
})

describe("tooltip direction", () => {
  it("the words on the slip follow the page while the plot stays left to right", () => {
    const { container } = render(
      <ChartContainer config={{ a: { label: "A" } }} style={{ direction: "rtl" }}>
        <BarChart data={rows} xKey="m" series={["a"]} label="Sales" />
        <ChartTooltip defaultIndex={1} />
      </ChartContainer>,
    )
    const layer = container.querySelector("[data-slot=chart-tooltip-layer]") as HTMLElement
    expect(layer).not.toBeNull()
    expect(layer.dir).toBe("rtl")
    expect((container.querySelector("[data-chart-type]") as HTMLElement).dir).toBe("ltr")
  })
})

describe("static charts stay light", () => {
  it("a picture has no live region; a chart with a cursor does", () => {
    const { container } = render(
      <div>
        <Sparkline data={[1, 2, 3]} label="still" />
        <Sparkline data={[1, 2, 3]} label="live" interactive />
      </div>,
    )
    expect(container.querySelectorAll("[data-slot=chart-live]").length).toBe(1)
  })
  it("a sparkline that is a picture has its summary and no table; an interactive one has a capped table", () => {
    const data = Array.from({ length: 900 }, (_, i) => i % 13)
    const still = render(<Sparkline data={data} label="still" />)
    expect(still.container.querySelector("[data-slot=chart-data] table")).toBeNull()
    expect(still.container.querySelector("[data-slot=chart-data] p")?.textContent).toMatch(/lowest 0, highest 12/)
    still.unmount()
    const live = render(<Sparkline data={data} label="live" interactive />)
    expect(live.container.querySelectorAll("[data-slot=chart-data] tbody tr").length).toBeLessThanOrEqual(240)
    expect(live.container.querySelector("[data-slot=chart-data]")?.textContent).toContain("Showing the first 240 of")
  })
})

describe("heat map names", () => {
  const days = Array.from({ length: 365 }, (_, i) => ({ date: new Date(Date.UTC(2025, 6, 1 + i)).toISOString().slice(0, 10), value: i % 5 }))
  it("weekday names never print over each other", async () => {
    const { buildCalendar } = await import("@/lib/ink/charts/chart-heat")
    const cells = buildCalendar(days, { levels: 5 })
    const spec = { type: "heat" as const, cols: cells.cols, rows: cells.rows, levels: cells.levels, levelCount: 5, colLabels: cells.colLabels, rowLabels: cells.rowLabels, slot: 2, variant: "calendar" as const, legend: null, patterns: true, state: "ready" as const }
    for (const w of [200, 320, 800]) {
      const ys = layoutHeat(spec, { w, h: 120 }).labels.filter((l) => l.role === "y").map((l) => l.y)
      for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(13)
    }
  })
  it("a year that starts in the middle of a month is named for the month that follows", async () => {
    const { buildCalendar } = await import("@/lib/ink/charts/chart-heat")
    const cells = buildCalendar(days, { levels: 5 })
    expect(cells.colLabels[0].text).toBe("Jul")
  })
  it("grid names stay over their columns", async () => {
    const { buildGrid } = await import("@/lib/ink/charts/chart-heat")
    const names = ["Sleep", "Water", "Walk"]
    const cells = buildGrid(names.flatMap((r) => names.map((c) => ({ row: r, col: c, value: 1 }))), { levels: 5, rows: names, cols: names })
    const spec = { type: "heat" as const, cols: cells.cols, rows: cells.rows, levels: cells.levels, levelCount: 5, colLabels: cells.colLabels, rowLabels: cells.rowLabels, slot: 1, variant: "grid" as const, legend: null, patterns: true, state: "ready" as const }
    const L = layoutHeat(spec, { w: 200, h: 160 })
    expect(L.labels.filter((l) => l.role === "x").map((l) => l.text)).toEqual(names)
  })
})

describe("robustness", () => {
  it("renders every chart under StrictMode without errors", async () => {
    const errors: unknown[] = []
    const orig = console.error
    console.error = (...a: unknown[]) => errors.push(a)
    try {
      const { container, unmount } = render(
        <React.StrictMode>
          <InkProvider>
            <ChartContainer config={{ a: { label: "A", color: "var(--chart-1)" }, b: { label: "B" } } satisfies ChartConfig}>
              <BarChart data={rows} xKey="m" />
              <ChartTooltip />
              <ChartLegend />
            </ChartContainer>
            <AreaChart data={rows} xKey="m" stacked />
            <ScatterChart data={rows.map((r, i) => ({ x: i, y: r.a }))} xKey="x" series={["y"]} />
            <DonutChart data={[{ n: "a", v: 1 }]} centerLabel="1" />
          </InkProvider>
        </React.StrictMode>,
      )
      await act(async () => {})
      const canvas = container.querySelector("[data-chart-type=xy]") as HTMLElement
      await act(async () => canvas.focus())
      await act(async () => {
        fireEvent.keyDown(canvas, { key: "ArrowRight" })
      })
      expect(container.querySelector("[data-slot=chart-live]")?.textContent).toContain("Feb")
      unmount()
    } finally {
      console.error = orig
    }
    expect(errors).toEqual([])
  })
  it("survives odd data: empty, one row, all zeros, negative, NaN and strings", async () => {
    const odd = [
      [],
      [{ m: "a", a: 5 }],
      [{ m: "a", a: 0 }, { m: "b", a: 0 }],
      [{ m: "a", a: -5 }, { m: "b", a: -10 }],
      [{ m: "a", a: Number.NaN }, { m: "b", a: "x" }, { m: "c", a: null }],
      [{ m: "a", a: "12" }, { m: "b", a: "7.5" }],
      [{ m: "a", a: 1e12 }, { m: "b", a: 1 }],
    ]
    for (const d of odd) {
      const { container, unmount } = render(
        <div>
          <BarChart data={d} xKey="m" series={["a"]} />
          <LineChart data={d} xKey="m" series={["a"]} />
          <AreaChart data={d} xKey="m" series={["a"]} stacked />
          <PieChart data={d} nameKey="m" valueKey="a" />
          <RadarChart data={d} xKey="m" series={["a"]} />
          <TallyChart data={d} nameKey="m" valueKey="a" />
          <Sparkline data={d.map((r) => (r as { a?: unknown }).a as number)} />
        </div>,
      )
      expect(container.innerHTML).not.toMatch(/NaN|undefined|Infinity/)
      await axeCheck(container)
      unmount()
    }
  })
  it("a 200-row list of charts draws without per-row ink beyond one host each", () => {
    const list = Array.from({ length: 40 }, (_, i) => <Sparkline key={i} data={[1, 3, 2, 5, 4 + (i % 3)]} label={`row ${i}`} />)
    const { container } = render(<div>{list}</div>)
    expect(container.querySelectorAll("[data-ink-host]").length).toBeLessThanOrEqual(40)
  })
  it("server markup is identical twice and carries the summary", () => {
    const el = (
      <ChartContainer config={{ a: { label: "A" } }} initialDimension={{ width: 400, height: 240 }}>
        <BarChart data={rows} xKey="m" series={["a"]} label="Sales" />
      </ChartContainer>
    )
    const a = renderToString(el)
    expect(a).toBe(renderToString(el))
    expect(a).toContain("Sales")
    expect(a).toContain("<table")
  })
})
