import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, render, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  AreaChart,
  BarChart,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  DonutChart,
  Gauge,
  Heatmap,
  LineChart,
  PieChart,
  RadarChart,
  RadialChart,
  ScatterChart,
  Sparkline,
  TallyChart,
  ChartCenterLabel,
  type ChartConfig,
} from "@/components/ui/chart"
import { InkProvider } from "@/lib/ink/react"
import { inkCache } from "@/lib/ink/react/cache"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
let restoreRect = () => {}
function mockRect(w: number, h: number) {
  const orig = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: w, bottom: h, width: w, height: h, toJSON: () => ({}) }) as DOMRect
  return () => {
    Element.prototype.getBoundingClientRect = orig
  }
}
beforeEach(() => {
  restore = mockBox(480, 260)
  restoreRect = mockRect(480, 260)
})
afterEach(() => {
  restore()
  restoreRect()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const data = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
]
const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

const canvasOf = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-slot$="chart"][data-ink-host], [data-slot="gauge"][data-ink-host], [data-slot="heatmap"][data-ink-host], [data-slot="sparkline"][data-ink-host]') as HTMLElement
const live = (root: ParentNode = document) => root.querySelector("[data-slot=chart-live]")?.textContent ?? ""

function Basic(props: Partial<React.ComponentProps<typeof BarChart>> = {}) {
  return (
    <ChartContainer config={config} className="h-64">
      <BarChart data={data} xKey="month" label="Visitors" {...props} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend />
    </ChartContainer>
  )
}

describe("ChartContainer", () => {
  it("is the chart frame with shadcn's data-slot and colour variables", () => {
    const { container } = renderUI(<ChartContainer config={config}>{null}</ChartContainer>)
    const root = container.querySelector("[data-slot=chart]") as HTMLElement
    expect(root).toBeTruthy()
    expect(root.getAttribute("data-chart")).toMatch(/^chart-/)
    const css = container.querySelector("style")!.textContent!
    expect(css).toContain("--color-desktop: var(--chart-1)")
    expect(css).toContain("--color-mobile: var(--chart-2)")
  })
  it("switches a themed colour with the .dark selector", () => {
    const themed = { a: { label: "A", theme: { light: "#111", dark: "#eee" } } } satisfies ChartConfig
    const { container } = renderUI(<ChartContainer config={themed}>{null}</ChartContainer>)
    const css = container.querySelector("style")!.textContent!
    expect(css).toContain("--color-a: #111")
    expect(css).toMatch(/\.dark \[data-chart=[^\]]+\] \{\s*--color-a: #eee/)
  })
  it("paints the ink slot with an explicit colour one level below, so it never refers to itself", () => {
    const { container } = renderUI(<ChartContainer config={config}>{null}</ChartContainer>)
    const body = container.querySelector("[data-slot=chart-body]") as HTMLElement
    expect(body.style.getPropertyValue("--ll-marker")).toBe("var(--color-desktop)")
    expect(body.style.getPropertyValue("--ll-ink-you")).toBe("var(--color-mobile)")
    const plain = renderUI(<ChartContainer config={{ a: { label: "A" } }}>{null}</ChartContainer>)
    expect((plain.container.querySelector("[data-slot=chart-body]") as HTMLElement).getAttribute("style") ?? "").toBe("")
  })
  it("takes className and passes the rest to the div", () => {
    const { container } = renderUI(<ChartContainer config={config} className="h-40 w-96" data-testid="x">{null}</ChartContainer>)
    const root = container.querySelector("[data-slot=chart]")!
    expect(root).toHaveClass("h-40", "w-96")
    expect(root).toHaveAttribute("data-testid", "x")
  })
  it("useChart outside a container throws a clear error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<ChartLegendContent />)).toThrow(/ChartContainer/)
    spy.mockRestore()
  })
})

describe("BarChart drawing", () => {
  it("draws ink on a measured host, decorative and pointer-transparent", () => {
    const { container, getByRole } = renderUI(<Basic />)
    const canvas = getByRole("application", { name: "Visitors" })
    expect(canvas).toHaveAttribute("data-ink-host")
    expect(canvas).toHaveAttribute("data-ink-ready")
    expect(canvas).toHaveAttribute("data-slot", "bar-chart")
    expect(canvas).toHaveAttribute("dir", "ltr")
    expectInkLayers(container, { min: 1, kinds: ["chart"], absolute: true, layers: ["rest"], ready: true })
    expect(container.querySelector('svg[data-ink="chart"] [data-part="wipe"]')).toBeTruthy()
  })
  it("draws nothing before it has a size, then everything", () => {
    restore()
    const { container, getByRole } = renderUI(<Basic />)
    expect(canvasOf(container).querySelector(":scope > svg[data-ink]")).toBeNull()
    expect(getByRole("application")).not.toHaveAttribute("data-ink-ready")
    restore = mockBox(480, 260)
  })
  it("labels are real DOM text: categories, ticks and values", () => {
    const { container } = renderUI(<Basic showValues />)
    const labels = container.querySelector("[data-slot=chart-labels]") as HTMLElement
    expect(labels).toHaveAttribute("aria-hidden", "true")
    const text = Array.from(labels.querySelectorAll("span")).map((s) => s.textContent)
    expect(text).toContain("January")
    expect(text).toContain("305")
    expect(text).toContain("0")
    expect(labels.querySelector('[data-role="x"]')).toBeTruthy()
  })
  it("the focus ring is a lazy layer that arrives with the first keyboard focus", async () => {
    const { container, user } = renderUI(<Basic />)
    const layers = () => Array.from(canvasOf(container).querySelectorAll(":scope > svg > [data-layer]")).map((g) => g.getAttribute("data-layer"))
    expect(layers()).toEqual(["rest"])
    await user.tab()
    expect(layers()).toEqual(["rest", "focus"])
  })
  it("a click never redraws it", async () => {
    const { container, user } = renderUI(<Basic />)
    await user.pointer({ target: canvasOf(container), keys: "[MouseLeft]" })
    fireEvent.pointerMove(canvasOf(container), { clientX: 100, clientY: 100 })
    const runs = inkCache.stats().runs
    fireEvent.pointerMove(canvasOf(container), { clientX: 300, clientY: 100 })
    fireEvent.pointerMove(canvasOf(container), { clientX: 420, clientY: 100 })
    fireEvent.pointerLeave(canvasOf(container))
    expect(inkCache.stats().runs).toBe(runs)
  })
  it("wipes on once, then a data change stays quiet", () => {
    vi.useFakeTimers()
    const { rerender, getByRole } = renderUI(<Basic />)
    const canvas = getByRole("application")
    expect(canvas).toHaveAttribute("data-reveal", "on")
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    expect(canvas).toHaveAttribute("data-reveal", "done")
    rerender(<Basic data={data.slice(0, 3)} />)
    expect(getByRole("application")).toHaveAttribute("data-reveal", "done")
    vi.useRealTimers()
  })
  it("animate={false} starts done", () => {
    const { getByRole } = renderUI(<Basic animate={false} />)
    expect(getByRole("application")).toHaveAttribute("data-reveal", "done")
  })
})

describe("accessibility", () => {
  it("has a name, a role description and a summary the canvas is described by", () => {
    const { getByRole, container } = renderUI(<Basic />)
    const canvas = getByRole("application", { name: "Visitors" })
    expect(canvas).toHaveAttribute("aria-roledescription", "bar chart")
    const summary = container.querySelector(`#${CSS.escape(canvas.getAttribute("aria-describedby")!)}`)!
    expect(summary.textContent).toContain("Bar chart with 2 series (Desktop and Mobile)")
    expect(summary.textContent).toContain("4 categories from January to April")
  })
  it("carries the data as a table for screen readers", () => {
    const { container } = renderUI(<Basic />)
    const table = container.querySelector("[data-slot=chart-data] table") as HTMLElement
    expect(table.querySelector("caption")!.textContent).toBe("Visitors")
    const heads = Array.from(table.querySelectorAll("thead th")).map((t) => t.textContent)
    expect(heads).toEqual(["month", "Desktop", "Mobile"])
    const rows = Array.from(table.querySelectorAll("tbody tr")).map((r) => Array.from(r.children).map((c) => c.textContent))
    expect(rows[1]).toEqual(["February", "305", "200"])
    expect(table.querySelector("tbody th[scope=row]")).toBeTruthy()
    expect(container.querySelector("[data-slot=chart-data]")).toHaveClass("sr-only", "forced-colors:not-sr-only")
  })
  it("passes axe with the tooltip open, a series switched off, and each state", async () => {
    const { container, user, getByRole } = renderUI(<Basic />)
    await axeCheck(container)
    await user.tab()
    await user.keyboard("{ArrowRight}")
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Mobile" }))
    await axeCheck(container)
  })
  it("empty and loading charts are labelled images, not widgets", async () => {
    const empty = renderUI(<ChartContainer config={config}><BarChart data={[]} xKey="month" series={["desktop"]} label="Visitors" emptyText="Nothing yet" /></ChartContainer>)
    const img = within(empty.container).getByRole("img", { name: "Visitors" })
    expect(img).toHaveAttribute("data-state", "empty")
    expect(img).not.toHaveAttribute("tabindex")
    expect(within(img).getByText("Nothing yet")).toBeTruthy()
    await axeCheck(empty.container)
    const loading = renderUI(<ChartContainer config={config}><BarChart data={data} xKey="month" label="Visitors" loading /></ChartContainer>)
    const busy = within(loading.container).getByRole("img", { name: "Visitors" })
    expect(busy).toHaveAttribute("aria-busy", "true")
    expect(within(busy).getByText("Loading")).toBeTruthy()
    expect(loading.container.querySelector('[data-part="pulse"]')).toBeTruthy()
    await axeCheck(loading.container)
  })
  it("without a label, the chart still has a name", () => {
    const { getByRole } = renderUI(<ChartContainer config={config}><BarChart data={data} xKey="month" /></ChartContainer>)
    expect(getByRole("application", { name: "Bar chart" })).toBeTruthy()
  })
})

describe("keyboard", () => {
  it("Tab lands on the first category; arrows walk; the live region says where", async () => {
    const { user, getByRole } = renderUI(<Basic />)
    await user.tab()
    expect(getByRole("application")).toHaveFocus()
    expect(live()).toBe("January: Desktop 186, Mobile 80")
    await user.keyboard("{ArrowRight}")
    expect(live()).toBe("February: Desktop 305, Mobile 200")
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}")
    expect(live()).toBe("April: Desktop 73, Mobile 190")
    await user.keyboard("{Home}")
    expect(live()).toBe("January: Desktop 186, Mobile 80")
    await user.keyboard("{End}")
    expect(live()).toBe("April: Desktop 73, Mobile 190")
    await user.keyboard("{ArrowLeft}")
    expect(live()).toBe("March: Desktop 237, Mobile 120")
  })
  it("up and down step through the series, one at a time, then back to all of them", async () => {
    const { user } = renderUI(<Basic />)
    await user.tab()
    await user.keyboard("{ArrowRight}{ArrowUp}")
    expect(live()).toBe("February: Desktop 305")
    await user.keyboard("{ArrowUp}")
    expect(live()).toBe("February: Mobile 200")
    await user.keyboard("{ArrowUp}")
    expect(live()).toBe("February: Desktop 305, Mobile 200")
    await user.keyboard("{ArrowDown}")
    expect(live()).toBe("February: Mobile 200")
  })
  it("Escape closes the tooltip, keeps focus, and Tab moves on", async () => {
    const { user, getByRole, container } = renderUI(
      <>
        <Basic />
        <button>after</button>
      </>,
    )
    await user.tab()
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeTruthy()
    await user.keyboard("{Escape}")
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeNull()
    expect(getByRole("application")).toHaveFocus()
    expect(live()).toBe("")
    await user.tab()
    expect(getByRole("application")).not.toHaveFocus()
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeNull()
    await user.tab()
    await user.tab()
    expect(container.ownerDocument.activeElement).toBe(getByRole("button", { name: "after" }))
  })
  it("the tooltip follows the keys and names the point", async () => {
    const { user, container } = renderUI(<Basic />)
    await user.tab()
    await user.keyboard("{ArrowRight}")
    const tip = container.querySelector("[data-slot=chart-tooltip]") as HTMLElement
    expect(tip.textContent).toContain("February")
    expect(tip.textContent).toContain("Desktop")
    expect(tip.textContent).toContain("305")
    expect(tip.textContent).toContain("200")
    expect(container.querySelector("[data-slot=chart-tooltip-layer]")).toHaveAttribute("aria-hidden", "true")
  })
  it("keys with modifiers are left alone", async () => {
    const { user } = renderUI(<Basic />)
    await user.tab()
    await user.keyboard("{Control>}{ArrowRight}{/Control}")
    expect(live()).toBe("January: Desktop 186, Mobile 80")
  })
  it("horizontal bars are walked with up and down", async () => {
    const { user } = renderUI(<ChartContainer config={config}><BarChart data={data} xKey="month" horizontal series={["desktop"]} label="H" /></ChartContainer>)
    await user.tab()
    await user.keyboard("{ArrowDown}")
    expect(live()).toBe("February: Desktop 305")
    await user.keyboard("{ArrowUp}{ArrowUp}")
    expect(live()).toBe("January: Desktop 186")
  })
})

describe("pointer", () => {
  it("shows the tooltip and a cursor for the category under the pointer, and hides them on leave", () => {
    const { container } = renderUI(<Basic />)
    const canvas = canvasOf(container)
    fireEvent.pointerMove(canvas, { clientX: 250, clientY: 120 })
    const tip = container.querySelector("[data-slot=chart-tooltip]") as HTMLElement
    expect(tip).toBeTruthy()
    expect(container.querySelector('[data-slot=chart-cursor][data-kind="column"]')).toBeTruthy()
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 120 })
    expect((container.querySelector("[data-slot=chart-tooltip]") as HTMLElement).textContent).toContain("January")
    fireEvent.pointerLeave(canvas)
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeNull()
    expect(container.querySelector("[data-slot=chart-cursor]")).toBeNull()
  })
  it("a pointer press does not start the keyboard cursor", async () => {
    const { container, user } = renderUI(<Basic />)
    await user.pointer({ target: canvasOf(container), keys: "[MouseLeft]" })
    expect(live()).toBe("")
  })
  it("touch presses select a point too, and the tooltip stays until you press somewhere else", () => {
    const { container } = renderUI(<Basic />)
    fireEvent.pointerDown(canvasOf(container), { clientX: 400, clientY: 100, pointerType: "touch" })
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeTruthy()
    fireEvent.pointerLeave(canvasOf(container), { pointerType: "touch" })
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeTruthy()
    fireEvent.pointerDown(document.body)
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeNull()
  })
  it("cursor={false} keeps the highlighter away but not the tooltip", () => {
    const { container } = renderUI(
      <ChartContainer config={config}>
        <BarChart data={data} xKey="month" label="v" />
        <ChartTooltip cursor={false} />
      </ChartContainer>,
    )
    fireEvent.pointerMove(canvasOf(container), { clientX: 250, clientY: 120 })
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeTruthy()
    expect(container.querySelector("[data-slot=chart-cursor]")).toBeNull()
  })
  it("onActiveChange reports the point", () => {
    const seen: unknown[] = []
    const { container } = renderUI(<Basic onActiveChange={(i) => seen.push(i)} />)
    fireEvent.pointerMove(canvasOf(container), { clientX: 250, clientY: 120 })
    fireEvent.pointerLeave(canvasOf(container))
    expect(seen[0]).toMatchObject({ index: expect.any(Number) })
    expect(seen[seen.length - 1]).toBeNull()
  })
  it("an inline annotations array does not send onActiveChange round in circles", async () => {
    let renders = 0
    function Host() {
      const [n, setN] = React.useState(0)
      renders++
      return (
        <ChartContainer config={config}>
          <BarChart data={data} xKey="month" label="v" annotations={[{ at: "max", text: "hi" }]} onActiveChange={() => setN((c) => c + 1)} />
          <ChartTooltip />
          <span data-testid="n">{n}</span>
        </ChartContainer>
      )
    }
    const { container, getByTestId } = renderUI(<Host />)
    fireEvent.pointerMove(canvasOf(container), { clientX: 250, clientY: 120 })
    expect(Number(getByTestId("n").textContent)).toBe(1)
    expect(renders).toBeLessThan(6)
  })
  it("defaultIndex works with a size known up front too", () => {
    const { container } = renderUI(
      <ChartContainer config={config} initialDimension={{ width: 480, height: 260 }}>
        <BarChart data={data} xKey="month" label="v" />
        <ChartTooltip defaultIndex={1} />
      </ChartContainer>,
    )
    expect((container.querySelector("[data-slot=chart-tooltip]") as HTMLElement).textContent).toContain("February")
  })
  it("defaultIndex opens a tooltip nobody asked for", () => {
    const { container } = renderUI(
      <ChartContainer config={config}>
        <BarChart data={data} xKey="month" label="v" />
        <ChartTooltip defaultIndex={2} />
      </ChartContainer>,
    )
    expect((container.querySelector("[data-slot=chart-tooltip]") as HTMLElement).textContent).toContain("March")
    fireEvent.pointerMove(canvasOf(container), { clientX: 20, clientY: 120 })
    fireEvent.pointerLeave(canvasOf(container))
    expect((container.querySelector("[data-slot=chart-tooltip]") as HTMLElement).textContent).toContain("March")
  })
})

describe("selecting a point", () => {
  it("a click reports the data point under it", () => {
    const onSelect = vi.fn()
    const { container } = renderUI(<Basic onSelect={onSelect} />)
    fireEvent.click(canvasOf(container), { clientX: 250, clientY: 120 })
    expect(onSelect).toHaveBeenCalledWith({ index: 2, series: null })
  })
  it("Enter and Space report the point the keys are on", async () => {
    const onSelect = vi.fn()
    const { user } = renderUI(<Basic onSelect={onSelect} />)
    await user.tab()
    await user.keyboard("{ArrowRight}{Enter}")
    expect(onSelect).toHaveBeenCalledWith({ index: 1, series: null })
    await user.keyboard("{ArrowUp} ")
    expect(onSelect).toHaveBeenLastCalledWith({ index: 1, series: 0 })
  })
  it("works on a pie, too", async () => {
    const onSelect = vi.fn()
    const { user } = renderUI(<PieChart data={[{ n: "a", v: 3 }, { n: "b", v: 1 }]} nameKey="n" valueKey="v" label="P" onSelect={onSelect} />)
    await user.tab()
    await user.keyboard("{ArrowRight}{Enter}")
    expect(onSelect).toHaveBeenCalledWith({ index: 1, series: null })
  })
})

describe("tooltip content", () => {
  function Tip(props: React.ComponentProps<typeof ChartTooltipContent>) {
    return (
      <ChartContainer config={config}>
        <BarChart data={data} xKey="month" label="v" />
        <ChartTooltip content={<ChartTooltipContent {...props} />} />
      </ChartContainer>
    )
  }
  const open = (container: HTMLElement) => fireEvent.pointerMove(canvasOf(container), { clientX: 250, clientY: 120 })
  it("is a slip of paper with a label, a swatch and a value per series", () => {
    const { container } = renderUI(<Tip />)
    open(container)
    const tip = container.querySelector("[data-slot=chart-tooltip]") as HTMLElement
    expect(tip).toHaveClass("ll-paper")
    expect(tip.querySelectorAll('[data-slot=chart-swatch]')).toHaveLength(2)
    expect(tip.textContent).toMatch(/Desktop\s*\d/)
  })
  it("hideLabel, hideIndicator, labelFormatter and formatter work as in shadcn", () => {
    const { container } = renderUI(<Tip hideLabel hideIndicator formatter={(v, name) => <span data-testid="row">{`${name}=${v}`}</span>} />)
    open(container)
    const tip = container.querySelector("[data-slot=chart-tooltip]") as HTMLElement
    expect(tip.querySelector("[data-slot=chart-swatch]")).toBeNull()
    expect(within(tip).getAllByTestId("row").map((n) => n.textContent)).toHaveLength(2)
    const b = renderUI(<Tip labelFormatter={(l) => `Month: ${String(l)}`} />)
    open(b.container)
    expect(b.container.querySelector("[data-slot=chart-tooltip]")!.textContent).toContain("Month: ")
  })
  it("uses the config's icon and rich label for a row", () => {
    const Icon = () => <svg data-testid="cfg-icon" />
    const cfg = { desktop: { label: <b>Desk top</b>, icon: Icon, color: "var(--chart-1)" } } satisfies ChartConfig
    const { container, getByTestId } = renderUI(
      <ChartContainer config={cfg}>
        <BarChart data={data} xKey="month" series={["desktop"]} label="v" />
        <ChartTooltip />
      </ChartContainer>,
    )
    fireEvent.pointerMove(canvasOf(container), { clientX: 250, clientY: 120 })
    expect(getByTestId("cfg-icon")).toBeTruthy()
    expect(container.querySelector("[data-slot=chart-tooltip] b")!.textContent).toBe("Desk top")
  })
  it("indicator line and dashed change the swatch", () => {
    const l = renderUI(<Tip indicator="line" />)
    open(l.container)
    expect(l.container.querySelector("[data-slot=chart-swatch]")).toHaveClass("w-1.5")
    const d = renderUI(<Tip indicator="dashed" />)
    open(d.container)
    expect(d.container.querySelector("[data-slot=chart-tooltip] .border-dashed")).toBeTruthy()
  })
  it("a custom element gets active, payload and label", () => {
    const spy = vi.fn((_p: Record<string, unknown>) => <div data-testid="custom">custom</div>)
    const Custom = (p: Record<string, unknown>) => spy(p)
    const { container, getByTestId } = renderUI(
      <ChartContainer config={config}>
        <BarChart data={data} xKey="month" label="v" />
        <ChartTooltip content={<Custom />} />
      </ChartContainer>,
    )
    open(container)
    expect(getByTestId("custom")).toBeTruthy()
    const p = spy.mock.calls[spy.mock.calls.length - 1][0] as { active: boolean; payload: unknown[]; label: string }
    expect(p.active).toBe(true)
    expect(p.label).toBe("March")
    expect(p.payload).toHaveLength(2)
  })
  it("renders nothing when it is not active or has no payload", () => {
    const { container } = renderUI(<ChartContainer config={config}><ChartTooltipContent active={false} payload={[]} /></ChartContainer>)
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeNull()
  })
})

describe("legend", () => {
  it("lists the series with their swatches as buttons", () => {
    const { getAllByRole } = renderUI(<Basic />)
    const buttons = getAllByRole("button")
    expect(buttons.map((b) => b.textContent)).toEqual(["Desktop", "Mobile"])
    expect(buttons.every((b) => b.getAttribute("aria-pressed") === "true")).toBe(true)
    expect(buttons[0].querySelector("[data-slot=chart-swatch]")).toBeTruthy()
  })
  it("switches a series off and on, redrawing without it", async () => {
    const { user, getByRole, container } = renderUI(<Basic />)
    const before = container.querySelector('svg[data-ink="chart"]')!.innerHTML
    await user.click(getByRole("button", { name: "Mobile" }))
    expect(getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-pressed", "false")
    const heads = Array.from(container.querySelectorAll("[data-slot=chart-data] thead th")).map((t) => t.textContent)
    expect(heads).toEqual(["month", "Desktop"])
    expect(container.querySelector('svg[data-ink="chart"]')!.innerHTML).not.toBe(before)
    await user.click(getByRole("button", { name: "Mobile" }))
    expect(container.querySelector('svg[data-ink="chart"]')!.innerHTML).toBe(before)
  })
  it("keeps a series' pattern when its neighbour is hidden", async () => {
    const { user, getByRole, container } = renderUI(<Basic />)
    const plot = () => container.querySelector('svg[data-ink="chart"]') as SVGElement
    const colours = () => plot().querySelectorAll('[data-part="fill"] path').length
    expect(plot().querySelectorAll('[data-part="fill"]')).toHaveLength(1)
    const both = colours()
    expect(both).toBe(2)
    await user.click(getByRole("button", { name: "Desktop" }))
    expect(colours()).toBeLessThan(both)
    expect(container.querySelectorAll("[data-slot=chart-data] tbody tr")).toHaveLength(4)
  })
  it("can be controlled", async () => {
    const onChange = vi.fn()
    const { user, getByRole, rerender } = renderUI(
      <ChartContainer config={config} hiddenSeries={["mobile"]} onHiddenSeriesChange={onChange}>
        <BarChart data={data} xKey="month" label="v" />
        <ChartLegend />
      </ChartContainer>,
    )
    expect(getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-pressed", "false")
    await user.click(getByRole("button", { name: "Desktop" }))
    expect(onChange).toHaveBeenCalledWith(["mobile", "desktop"])
    expect(getByRole("button", { name: "Desktop" })).toHaveAttribute("aria-pressed", "true")
    rerender(
      <ChartContainer config={config} hiddenSeries={[]} onHiddenSeriesChange={onChange}>
        <BarChart data={data} xKey="month" label="v" />
        <ChartLegend />
      </ChartContainer>,
    )
    expect(getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-pressed", "true")
  })
  it("starts with series off with defaultHiddenSeries", () => {
    const { getByRole } = renderUI(
      <ChartContainer config={config} defaultHiddenSeries={["desktop"]}>
        <BarChart data={data} xKey="month" label="v" />
        <ChartLegend />
      </ChartContainer>,
    )
    expect(getByRole("button", { name: "Desktop" })).toHaveAttribute("aria-pressed", "false")
  })
  it("toggle={false} makes it a plain key; keys picks and orders", () => {
    const { container } = renderUI(
      <ChartContainer config={config}>
        <BarChart data={data} xKey="month" label="v" />
        <ChartLegend toggle={false} keys={["mobile", "desktop"]} />
      </ChartContainer>,
    )
    expect(container.querySelectorAll("button")).toHaveLength(0)
    expect(Array.from(container.querySelectorAll("[data-slot=chart-legend-item]")).map((n) => n.textContent)).toEqual(["Mobile", "Desktop"])
  })
  it("verticalAlign moves the padding, content is replaceable", () => {
    const { container } = renderUI(
      <ChartContainer config={config}>
        <ChartLegend verticalAlign="top" />
        <BarChart data={data} xKey="month" label="v" />
        <ChartLegend content={<ChartLegendContent className="custom" />} />
      </ChartContainer>,
    )
    const legends = container.querySelectorAll("[data-slot=chart-legend]")
    expect(legends[0]).toHaveClass("pb-3")
    expect(legends[1]).toHaveClass("custom")
  })
})

describe("chart types", () => {
  it("LineChart: a marker and a dash per series, dots on a few points", () => {
    const { container, getByRole } = renderUI(<ChartContainer config={config}><LineChart data={data} xKey="month" label="Trend" /></ChartContainer>)
    expect(getByRole("application", { name: "Trend" })).toHaveAttribute("data-slot", "line-chart")
    expect(container.querySelector('svg[data-ink="chart"]')!.innerHTML.length).toBeGreaterThan(2000)
  })
  it("AreaChart and stacked bars sum in their summary", () => {
    const { container } = renderUI(<ChartContainer config={config}><AreaChart data={data} xKey="month" stacked label="Traffic" /></ChartContainer>)
    expect(container.querySelector("[data-slot=chart-data] p")!.textContent).toContain("Area chart with 2 series")
    const s = renderUI(<ChartContainer config={config}><BarChart data={data} xKey="month" stacked label="S" /></ChartContainer>)
    expect(s.container.querySelector("[data-slot=chart-data] p")!.textContent).toContain("Stacked")
  })
  it("mixes bars and lines with kinds", () => {
    const { container } = renderUI(<ChartContainer config={config}><BarChart data={data} xKey="month" kinds={{ mobile: "line" }} label="Mixed" /></ChartContainer>)
    expect(container.querySelector("[data-slot=chart-data] p")!.textContent).toContain("Chart with 2 series")
  })
  it("ScatterChart walks the points and reads x and y", async () => {
    const pts = Array.from({ length: 12 }, (_, i) => ({ x: i * 3, y: 10 + ((i * 7) % 20) }))
    const { user, container } = renderUI(<ChartContainer config={{ y: { label: "Weight" } }}><ScatterChart data={pts} xKey="x" series={["y"]} label="Points" xLabel="Height" /></ChartContainer>)
    await user.tab()
    expect(live()).toBe("Weight: 0, 10")
    await user.keyboard("{ArrowRight}")
    expect(live()).toBe("Weight: 3, 17")
    expect(container.querySelector("[data-slot=chart-data] thead")!.textContent).toBe("SeriesHeighty")
  })
  it("PieChart: slices, percent, a slice per arrow, hidden slices leave the pie", async () => {
    const browsers = [{ browser: "chrome", visitors: 275 }, { browser: "safari", visitors: 200 }, { browser: "other", visitors: 25 }]
    const cfg = { chrome: { label: "Chrome", color: "var(--chart-1)" }, safari: { label: "Safari", color: "var(--chart-2)" }, other: { label: "Other", color: "var(--chart-5)" } } satisfies ChartConfig
    const { user, container, getByRole } = renderUI(
      <ChartContainer config={cfg}>
        <PieChart data={browsers} nameKey="browser" valueKey="visitors" label="Browsers" />
        <ChartTooltip />
        <ChartLegend />
      </ChartContainer>,
    )
    expect(getByRole("application", { name: "Browsers" })).toHaveAttribute("aria-roledescription", "pie chart")
    await user.tab()
    expect(live()).toBe("Chrome: 275, 55%")
    await user.keyboard("{ArrowLeft}")
    expect(live()).toBe("Other: 25, 5%")
    await user.keyboard("{ArrowRight}")
    expect(live()).toBe("Chrome: 275, 55%")
    expect(container.querySelector('[data-slot=chart-cursor][data-kind="slice"]')).toBeTruthy()
    const rows = Array.from(container.querySelectorAll("[data-slot=chart-data] tbody tr")).map((r) => Array.from(r.children).map((c) => c.textContent))
    expect(rows[0]).toEqual(["Chrome", "275", "55%"])
    await user.click(getByRole("button", { name: "Safari" }))
    expect(container.querySelectorAll("[data-slot=chart-data] tbody tr")).toHaveLength(2)
  })
  it("DonutChart: text in the hole, from a node, an object or a function of the hovered slice", () => {
    const rows = [{ n: "a", v: 3 }, { n: "b", v: 1 }]
    const a = renderUI(<DonutChart data={rows} nameKey="n" valueKey="v" label="D" centerLabel={{ value: "4", label: "total" }} />)
    expect(a.container.querySelector("[data-slot=chart-center]")!.textContent).toBe("4total")
    const b = renderUI(<DonutChart data={rows} nameKey="n" valueKey="v" label="D" centerLabel={<span data-testid="c">hi</span>} />)
    expect(within(b.container).getByTestId("c")).toBeTruthy()
    const c = renderUI(<DonutChart data={rows} nameKey="n" valueKey="v" label="D" centerLabel={({ total, active }) => <span data-testid="f">{active ? `${active.name} ${active.value}` : `all ${total}`}</span>} />)
    expect(within(c.container).getByTestId("f").textContent).toBe("all 4")
    fireEvent.pointerMove(canvasOf(c.container), { clientX: 330, clientY: 130 })
    expect(within(c.container).getByTestId("f").textContent).toBe("a 3")
    expect(renderUI(<ChartCenterLabel value="12" label="x" />).container.textContent).toBe("12x")
  })
  it("RadarChart reads one axis at a time", async () => {
    const skills = [{ skill: "Speed", ada: 80, bo: 50 }, { skill: "Power", ada: 60, bo: 85 }, { skill: "Range", ada: 90, bo: 45 }]
    const { user } = renderUI(<ChartContainer config={{ ada: { label: "Ada" }, bo: { label: "Bo" } }}><RadarChart data={skills} xKey="skill" label="Skills" /></ChartContainer>)
    await user.tab()
    expect(live()).toBe("Speed: Ada 80, Bo 50")
    await user.keyboard("{ArrowRight}")
    expect(live()).toBe("Power: Ada 60, Bo 85")
  })
  it("RadialChart: a ring per row, values against max", async () => {
    const rings = [{ name: "Move", value: 78 }, { name: "Stand", value: 91, max: 120 }]
    const { user, container } = renderUI(<RadialChart data={rings} nameKey="name" valueKey="value" label="Rings" centerLabel={{ value: "78%", label: "move" }} />)
    await user.tab()
    expect(live()).toBe("Move: 78 of 100")
    await user.keyboard("{ArrowRight}")
    expect(live()).toBe("Stand: 91 of 120")
    expect(container.querySelector("[data-slot=chart-center]")).toBeTruthy()
  })
  it("Gauge is a meter", async () => {
    const { getByRole, container } = renderUI(<Gauge value={68} label="Load" zones={[{ to: 40, tone: "good" }, { to: 75, tone: "warn" }, { to: 100, tone: "bad" }]}>68%</Gauge>)
    const meter = getByRole("meter", { name: "Load" })
    expect(meter).toHaveAttribute("aria-valuemin", "0")
    expect(meter).toHaveAttribute("aria-valuemax", "100")
    expect(meter).toHaveAttribute("aria-valuenow", "68")
    expect(meter.getAttribute("aria-valuetext")).toBe("68 of 100, warn")
    expect(meter).not.toHaveAttribute("tabindex")
    expect(container.textContent).toContain("68%")
    await axeCheck(container)
  })
  it("Gauge clamps the reading and sweeps further", () => {
    const { getByRole } = renderUI(<Gauge value={250} max={200} sweep={240} label="Speed" />)
    expect(getByRole("meter")).toHaveAttribute("aria-valuenow", "200")
  })
  it("Sparkline is a picture with a summary, and a chart when asked", async () => {
    const { getByRole, container } = renderUI(<Sparkline data={[3, 5, 4, 8, 12]} label="Visitors" />)
    const img = getByRole("img", { name: "Visitors" })
    expect(img).not.toHaveAttribute("tabindex")
    expect(container.querySelector("[data-slot=chart-data] p")!.textContent).toBe("Visitors: 5 points from 3 to 12, lowest 3, highest 12, rising.")
    expect(container.querySelector("[data-slot=chart]")).toHaveClass("h-10", "w-28")
    const live2 = renderUI(<Sparkline data={[{ d: "Mon", v: 1 }, { d: "Tue", v: 4 }]} dataKey="v" xKey="d" interactive label="S" />)
    await live2.user.tab()
    expect(live(live2.container)).toBe("Mon: 1")
    for (const v of ["line", "area", "bar"] as const) expect(renderUI(<Sparkline data={[1, 2, 3]} variant={v} />).container.querySelector("svg[data-ink]")).toBeTruthy()
  })
  it("TallyChart draws marks per row and reads counts", async () => {
    const { user, container } = renderUI(<TallyChart data={[{ cup: "Tea", n: 23 }, { cup: "Cocoa", n: 8 }]} nameKey="cup" valueKey="n" label="Cups" />)
    await user.tab()
    expect(live()).toBe("Tea: 23")
    const labels = Array.from(container.querySelectorAll("[data-slot=chart-labels] span")).map((s) => s.textContent)
    expect(labels).toEqual(expect.arrayContaining(["Tea", "23", "Cocoa", "8"]))
  })
  it("Heatmap: a calendar walked in two dimensions", async () => {
    const days = Array.from({ length: 21 }, (_, i) => ({ date: `2026-03-${String(i + 1).padStart(2, "0")}`, value: i % 6 }))
    const { user, container } = renderUI(<Heatmap data={days} unit="pages" label="Pages" />)
    await user.tab()
    expect(live()).toMatch(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), Mar \d+, 2026: \d+ pages$/)
    const first = live()
    await user.keyboard("{ArrowRight}")
    expect(live()).not.toBe(first)
    await user.keyboard("{ArrowDown}")
    expect(live()).toMatch(/pages$/)
    expect(container.querySelector("[data-slot=chart-data] p")!.textContent).toContain("Calendar heat map of")
    const grid = renderUI(<Heatmap variant="grid" data={[{ row: "Mon", col: "9am", value: 2 }, { row: "Tue", col: "9am", value: 5 }]} rowKey="row" colKey="col" label="Busy" />)
    await grid.user.tab()
    expect(live(grid.container)).toBe("Mon, 9am: 2")
  })
})

describe("standalone", () => {
  it("wraps itself in a container with a tooltip and, for several series, a legend", async () => {
    const { container, getAllByRole, user } = renderUI(<BarChart data={data} xKey="month" className="h-48" label="Standalone" />)
    expect(container.querySelector("[data-slot=chart]")).toHaveClass("h-48")
    expect(getAllByRole("button").map((b) => b.textContent)).toEqual(["desktop", "mobile"])
    await user.tab()
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeTruthy()
    await axeCheck(container)
  })
  it("tooltip={false} and legend={false} leave them out; a single series has no legend", () => {
    const a = renderUI(<BarChart data={data} xKey="month" tooltip={false} legend={false} label="A" />)
    expect(a.container.querySelector("[data-slot=chart-legend]")).toBeNull()
    fireEvent.pointerMove(canvasOf(a.container), { clientX: 250, clientY: 120 })
    expect(a.container.querySelector("[data-slot=chart-tooltip]")).toBeNull()
    const b = renderUI(<BarChart data={data} xKey="month" series={["desktop"]} label="B" />)
    expect(b.container.querySelector("[data-slot=chart-legend]")).toBeNull()
    const c = renderUI(<BarChart data={data} xKey="month" legend="top" label="C" />)
    expect(c.container.querySelector("[data-slot=chart-legend]")!.nextElementSibling).toBe(c.container.querySelector("[data-slot=bar-chart]"))
  })
  it("infers the category key and the series from the data", () => {
    const { container } = renderUI(<LineChart data={data} label="I" />)
    expect(Array.from(container.querySelectorAll("[data-slot=chart-data] thead th")).map((t) => t.textContent)).toEqual(["month", "desktop", "mobile"])
  })
})

describe("annotations and references", () => {
  it("writes the note as DOM text and draws its loop in a note group", () => {
    const { container } = renderUI(<ChartContainer config={config}><BarChart data={data} xKey="month" series={["desktop"]} label="N" annotations={[{ at: "max", text: "best month!", pen: "blue" }]} /></ChartContainer>)
    const note = container.querySelector('[data-role="note"]') as HTMLElement
    expect(note.textContent).toBe("best month!")
    expect(note).toHaveClass("text-ink-you")
    expect(container.querySelector('svg[data-ink="chart"] [data-part="note"]')).toBeTruthy()
  })
  it("marks a stretch of categories with a highlighter and says so", () => {
    const { container } = renderUI(<ChartContainer config={config}><BarChart data={data} xKey="month" series={["desktop"]} label="H" highlights={[{ from: "February", to: "March", text: "launch" }]} /></ChartContainer>)
    expect(Array.from(container.querySelectorAll('[data-role="note"]')).map((n) => n.textContent)).toContain("launch")
    expect(container.querySelector("[data-slot=chart-data] p")!.textContent).toContain("Marked: launch, February to March.")
  })
  it("draws a goal line with its label", () => {
    const { container } = renderUI(<ChartContainer config={config}><BarChart data={data} xKey="month" series={["desktop"]} label="R" references={[{ y: 200, label: "goal" }]} /></ChartContainer>)
    expect(container.querySelector('[data-role="ref"]')!.textContent).toBe("goal")
  })
})

describe("very long data", () => {
  it("thins it, says so, and stays light", () => {
    const long = Array.from({ length: 4000 }, (_, i) => ({ t: `t${i}`, v: Math.sin(i / 40) * 100 }))
    const { container } = renderUI(<ChartContainer config={{ v: { label: "V" } }}><LineChart data={long} xKey="t" series={["v"]} label="Long" /></ChartContainer>)
    expect(container.querySelector("[data-slot=chart-data] p")!.textContent).toContain("Thinned from 4,000 rows")
    expect(container.querySelector('svg[data-ink="chart"]')!.innerHTML.length).toBeLessThan(40_000)
    expect(container.querySelectorAll("[data-slot=chart-data] tbody tr").length).toBeLessThanOrEqual(240)
  })
})

describe("density, motion, direction", () => {
  it("calm draws a lighter chart and small hand text", () => {
    const rich = renderUI(<Basic />)
    const richSize = rich.container.querySelector('svg[data-ink="chart"]')!.innerHTML.length
    rich.unmount()
    const calm = render(
      <InkProvider density="calm">
        <Basic />
      </InkProvider>,
    )
    expect(calm.container.querySelector('svg[data-ink="chart"]')!.innerHTML.length).toBeLessThan(richSize)
    expect(calm.container.querySelector("[data-slot=chart-labels] span")).toHaveClass("calm:font-hand")
  })
  it("keeps the plot left to right in a right-to-left page, and the text in the page's direction", () => {
    const { container, getByRole } = renderUI(
      <div dir="rtl">
        <Basic />
      </div>,
    )
    expect(getByRole("application")).toHaveAttribute("dir", "ltr")
    expect(container.querySelector("[data-slot=chart-legend]")).toBeTruthy()
  })
  it("hides the drawing and shows the table in forced colours (by class)", () => {
    const { container, getByRole } = renderUI(<Basic />)
    expect(getByRole("application")).toHaveClass("forced-colors:hidden")
    expect(container.querySelector("[data-slot=chart-labels]")).toHaveClass("forced-colors:hidden")
    expect(container.querySelector("[data-slot=chart-data]")).toHaveClass("forced-colors:not-sr-only")
  })
  it("the wipe classes read the theme's motion tokens, so reduced motion collapses them", () => {
    const { getByRole } = renderUI(<Basic />)
    expect(getByRole("application").className).toContain("var(--ll-dur-draw)")
  })
})

describe("server rendering and hydration", () => {
  const tree = (
    <InkProvider>
      <ChartContainer config={config} initialDimension={{ width: 480, height: 260 }}>
        <BarChart data={data} xKey="month" label="Visitors" annotations={[{ at: "max", text: "best" }]} />
        <ChartTooltip />
        <ChartLegend />
      </ChartContainer>
    </InkProvider>
  )
  it("renders the same markup twice, with the drawing in it when the size is known", () => {
    const a = renderToString(tree)
    const b = renderToString(tree)
    expect(a).toBe(b)
    expect(a).toContain('data-ink="chart"')
    expect(a).not.toMatch(/NaN|undefined/)
    expect(a).toContain("<table>")
  })
  it("renders the text alternative even without a size", () => {
    const html = renderToString(
      <ChartContainer config={config}>
        <BarChart data={data} xKey="month" label="Visitors" />
      </ChartContainer>,
    )
    expect(html).not.toContain("<svg")
    expect(html).toContain("Bar chart with 2 series")
  })
  it("hydrates without a mismatch", async () => {
    const html = renderToString(tree)
    const host = document.createElement("div")
    host.innerHTML = html
    document.body.appendChild(host)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(host, tree)
    })
    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
    host.remove()
  })
})
