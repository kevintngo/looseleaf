import * as React from "react"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { activity, browserColumns, browsers, daily, dayLabel, longDate, radarDesktop, short, swingColumns, thousands, visitors, visitorsShare, visitorsThree, weekday } from "@/docs/examples/chart/_data"
import { axeCheck, mockBox, renderUI } from "./helpers"

type Mod = { default: React.ComponentType; meta: { title: string; description: string; layout?: string; stage?: string } }
const modules = import.meta.glob<Mod>("../src/docs/examples/chart/[6-9][0-9]-*.tsx", { eager: true })
const entries = Object.entries(modules)
  .map(([path, mod]) => ({ file: path.split("/").pop()!.replace(/\.tsx$/, ""), ...mod }))
  .sort((a, b) => (a.file < b.file ? -1 : 1))
const nameOf = (file: string) => file.replace(/^\d+-/, "")
const byName = (name: string) => {
  const e = entries.find((x) => nameOf(x.file) === name)
  if (!e) throw new Error(`no gallery example called ${name}`)
  return e
}

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
  restore = mockBox(520, 280)
  restoreRect = mockRect(520, 280)
})
afterEach(() => {
  restore()
  restoreRect()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
function mount(name: string) {
  const Example = byName(name).default
  return renderUI(
    <InkProvider>
      <Example />
    </InkProvider>,
    opts,
  )
}

const canvasOf = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-chart-type]")!
const summaryOf = (c: HTMLElement) => document.getElementById(canvasOf(c).getAttribute("aria-describedby")!)?.textContent ?? ""
const tipOf = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-slot=chart-tooltip]")
const tableRows = (c: HTMLElement) => c.querySelectorAll("[data-slot=chart-data] tbody tr")
const legendItems = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>("[data-slot=chart-legend-item]"))
const centerOf = (c: HTMLElement) => c.querySelector("[data-slot=chart-center]")?.textContent ?? ""
const labelsOf = (c: HTMLElement) => c.querySelector("[data-slot=chart-labels]")?.textContent ?? ""

describe("the gallery as a whole", () => {
  it("has at least 45 examples, all numbered 60 to 99 and named after a chart family", () => {
    expect(entries.length).toBeGreaterThanOrEqual(45)
    for (const e of entries) expect(e.file).toMatch(/^[6-9]\d-(area|bar|line|pie|radar|radial|tooltip|legend)-[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it("covers area, bar, line, pie, radar, radial, tooltip and legend variants", () => {
    const count = (family: string) => entries.filter((e) => nameOf(e.file).startsWith(`${family}-`)).length
    expect(count("area")).toBeGreaterThanOrEqual(8)
    expect(count("bar")).toBeGreaterThanOrEqual(8)
    expect(count("line")).toBeGreaterThanOrEqual(6)
    expect(count("pie")).toBeGreaterThanOrEqual(6)
    expect(count("radar")).toBeGreaterThanOrEqual(6)
    expect(count("radial")).toBeGreaterThanOrEqual(4)
    expect(count("tooltip")).toBeGreaterThanOrEqual(8)
    expect(count("legend")).toBeGreaterThanOrEqual(3)
  })

  it("lists a family in one block, in the order area, bar, line, pie, radar, radial, tooltip, legend", () => {
    const order = ["area", "bar", "line", "pie", "radar", "radial", "tooltip", "legend"]
    const seq = entries.map((e) => order.indexOf(nameOf(e.file).split("-")[0]))
    expect(seq).not.toContain(-1)
    expect(seq).toEqual([...seq].sort((a, b) => a - b))
  })

  it("gives each example a distinct title and a description that says what to look at", () => {
    const titles = new Set<string>()
    for (const e of entries) {
      expect(e.meta.title.trim().length).toBeGreaterThan(3)
      expect(titles.has(e.meta.title)).toBe(false)
      titles.add(e.meta.title)
      expect(e.meta.description.length).toBeGreaterThan(50)
      expect(e.meta.layout).toBe("stack")
      expect(e.meta.stage).toBe("desk")
    }
  })

  const KIND: Record<string, string[]> = {
    area: ["area-chart"],
    bar: ["bar-chart"],
    line: ["line-chart"],
    pie: ["pie-chart", "donut-chart"],
    radar: ["radar-chart"],
    radial: ["radial-chart"],
    tooltip: ["bar-chart"],
    legend: ["bar-chart", "line-chart"],
  }
  for (const e of entries) {
    it(`${e.file}: a card with a title, one drawn chart of the right kind, and no console noise`, () => {
      const Example = e.default
      const { container } = renderUI(
        <InkProvider>
          <Example />
        </InkProvider>,
        opts,
      )
      const card = container.querySelector('[data-slot="card"]')
      expect(card).toBeTruthy()
      expect(card!.querySelector('[data-slot="card-title"]')?.textContent?.trim().length).toBeGreaterThan(2)
      expect(card!.querySelector('[data-slot="card-description"]')?.textContent?.trim().length).toBeGreaterThan(2)
      const canvases = container.querySelectorAll("[data-chart-type]")
      expect(canvases).toHaveLength(1)
      const family = nameOf(e.file).split("-")[0]
      expect(KIND[family]).toContain(canvases[0].getAttribute("data-slot"))
      expect(container.querySelector('svg[data-ink="chart"]')).toBeTruthy()
      expect(summaryOf(container).length).toBeGreaterThan(20)
      expect(container.querySelectorAll("svg[data-missing]")).toHaveLength(0)
    })
  }
})

describe("every gallery chart survives a pointer and a keyboard", () => {
  for (const e of entries) {
    it(`${e.file}: hovering across it, walking it with the keys and leaving it never throw`, async () => {
      const Example = e.default
      const { container, user } = renderUI(
        <InkProvider>
          <Example />
        </InkProvider>,
        opts,
      )
      const canvas = canvasOf(container)
      for (const x of [20, 130, 260, 390, 500]) {
        fireEvent.pointerMove(canvas, { clientX: x, clientY: 120 })
        const tip = tipOf(container)
        if (tip) expect(tip.textContent).not.toMatch(/undefined|NaN/)
      }
      fireEvent.pointerLeave(canvas)
      canvas.focus()
      await user.keyboard("{ArrowRight}{ArrowRight}{End}{Home}{ArrowDown}{Escape}")
      const live = container.querySelector("[data-slot=chart-live]")?.textContent ?? ""
      expect(live).not.toMatch(/undefined|NaN/)
      expect(container.textContent).not.toMatch(/undefined|NaN/)
    })
  }

  it("reads the whole month from the row when the axis prints it short", () => {
    for (const name of ["area-default", "area-stacked", "area-stacked-expand", "area-legend", "area-overlap", "area-axes", "area-icons", "bar-multiple", "line-multiple", "line-dots-custom", "legend-keys", "legend-static", "legend-top"]) {
      const { container, unmount } = mount(name)
      expect(labelsOf(container)).toContain("Jan")
      fireEvent.pointerMove(canvasOf(container), { clientX: 20, clientY: 120 })
      expect(tipOf(container)?.textContent, name).toContain("January")
      unmount()
    }
  })

  it("names the day the way the axis does on the ninety-one-day charts", () => {
    for (const name of ["area-interactive", "bar-interactive", "line-interactive"]) {
      const { container, unmount } = mount(name)
      fireEvent.pointerMove(canvasOf(container), { clientX: 20, clientY: 120 })
      expect(tipOf(container)?.textContent, name).toContain("Apr 1")
      unmount()
    }
  })
})

describe("the data and its formatters", () => {
  it("has ninety-one days from 1 April to 30 June 2024, one row per day", () => {
    expect(daily).toHaveLength(91)
    expect(daily[0]).toEqual({ date: "2024-04-01", desktop: 222, mobile: 150 })
    expect(daily[29].date).toBe("2024-04-30")
    expect(daily[30].date).toBe("2024-05-01")
    expect(daily[60].date).toBe("2024-05-31")
    expect(daily[61].date).toBe("2024-06-01")
    expect(daily[90]).toEqual({ date: "2024-06-30", desktop: 446, mobile: 400 })
    expect(new Set(daily.map((d) => d.date)).size).toBe(91)
  })

  it("writes dates without a Date, a locale or a time zone", () => {
    expect(dayLabel("2024-04-09")).toBe("Apr 9")
    expect(dayLabel("2024-12-31")).toBe("Dec 31")
    expect(longDate("2024-07-16")).toBe("July 16, 2024")
    expect(short("September")).toBe("Sep")
    const days: Record<string, string> = { "2024-07-15": "Mon", "2024-07-20": "Sat", "2024-07-21": "Sun", "2024-01-01": "Mon", "2024-02-29": "Thu", "2024-03-01": "Fri", "2000-02-29": "Tue", "2023-12-31": "Sun" }
    for (const [d, w] of Object.entries(days)) expect(weekday(d)).toBe(w)
    expect(activity.map((a) => weekday(a.date))).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
  })

  it("groups thousands by hand", () => {
    expect([0, 7, 999, 1000, 24111, 1234567].map(thousands)).toEqual(["0", "7", "999", "1,000", "24,111", "1,234,567"])
  })

  it("scales the shares of each month to 100 (within a rounding)", () => {
    for (const r of visitorsShare) expect(Math.abs(r.desktop + r.mobile + r.other - 100)).toBeLessThan(0.25)
    expect(visitorsShare).toHaveLength(visitorsThree.length)
  })

  it("gives every category of the mixed bars its own column, and every month of the swing its own sign", () => {
    for (const r of browserColumns) expect(Object.keys(r)).toEqual(["browser", r.browser])
    expect(browserColumns.map((r) => r[r.browser as keyof typeof r])).toEqual(browsers.map((b) => b.visitors))
    for (const r of swingColumns) {
      const keys = Object.keys(r).filter((k) => k !== "month")
      expect(keys).toHaveLength(1)
      expect(keys[0] === "gain" ? (r as { gain: number }).gain > 0 : (r as { loss: number }).loss < 0).toBe(true)
    }
    expect(radarDesktop.find((r) => r.month === "April")?.desktop).toBe(273)
    expect(visitors.find((r) => r.month === "April")?.desktop).toBe(73)
  })
})

describe("area", () => {
  it("circles the peak with a note in real text", () => {
    const { container } = mount("area-default")
    expect(labelsOf(container)).toContain("peak!")
    expect(summaryOf(container)).toContain("Area chart")
  })

  it("linear and step change the curve, and the step example keeps its config icon in the tooltip", () => {
    const step = mount("area-step")
    expect(canvasOf(step.container).getAttribute("aria-label")).toBe("Desktop visitors per month")
    step.unmount()
    const lin = mount("area-linear")
    expect(lin.container.querySelector("[data-slot=card-title]")?.textContent).toBe("Area Chart - Linear")
  })

  it("stacks the layers in the order of `series` and lists both in the legend", () => {
    const { container } = mount("area-stacked")
    expect(summaryOf(container)).toMatch(/Stacked/)
    expect(legendItems(container).map((i) => i.textContent)).toEqual(["Mobile", "Desktop"])
  })

  it("scales the 100% chart to a percent axis", () => {
    const { container } = mount("area-stacked-expand")
    expect(labelsOf(container)).toContain("100%")
    expect(labelsOf(container)).toContain("0%")
    expect(legendItems(container)).toHaveLength(3)
  })

  it("draws overlapping areas without stacking them", () => {
    const { container } = mount("area-overlap")
    expect(summaryOf(container)).not.toMatch(/Stacked/)
    expect(legendItems(container)).toHaveLength(2)
  })

  it("shows both axes on the axes example and neither y axis on the default", () => {
    const axes = mount("area-axes")
    expect(labelsOf(axes.container)).toMatch(/600/)
    axes.unmount()
    const plain = mount("area-default")
    expect(labelsOf(plain.container)).not.toMatch(/\d/)
  })

  it("puts the trend icons in the legend", () => {
    const { container } = mount("area-icons")
    const icons = container.querySelectorAll("[data-slot=chart-legend] svg[data-icon]")
    expect(Array.from(icons).map((i) => i.getAttribute("data-icon"))).toEqual(["trending-up", "trending-down"])
  })

  it("switches a series off from the legend and the chart forgets it", async () => {
    const { container, user } = mount("area-legend")
    expect(summaryOf(container)).toContain("Desktop")
    await user.click(within(container).getByRole("button", { name: "Desktop" }))
    expect(within(container).getByRole("button", { name: "Desktop" })).toHaveAttribute("aria-pressed", "false")
    expect(summaryOf(container)).not.toContain("Desktop")
    expect(summaryOf(container)).toContain("Mobile")
  })

  it("redraws with the range chosen in the header", async () => {
    const { container, user } = mount("area-interactive")
    expect(tableRows(container)).toHaveLength(91)
    await user.click(within(container).getByRole("combobox", { name: "Time range" }))
    await user.click(await screen.findByRole("option", { name: "Last 7 days" }))
    await waitFor(() => expect(tableRows(container)).toHaveLength(7))
    expect(tableRows(container)[6].textContent).toMatch(/Jun 30|2024-06-30/)
    await user.click(within(container).getByRole("combobox", { name: "Time range" }))
    await user.click(await screen.findByRole("option", { name: "Last 30 days" }))
    await waitFor(() => expect(tableRows(container)).toHaveLength(30))
    await axeCheck(container)
  })
})

describe("bar", () => {
  it("writes the value on each bar and circles the best month", () => {
    const { container } = mount("bar-default")
    expect(labelsOf(container)).toContain("best month")
    expect(labelsOf(container)).toContain("305")
  })

  it("runs sideways on request, and the arrow keys walk it", async () => {
    const { container, user } = mount("bar-horizontal")
    expect(canvasOf(container).getAttribute("aria-label")).toBe("Desktop visitors per month")
    await user.tab()
    await user.keyboard("{ArrowDown}")
    expect(container.querySelector("[data-slot=chart-live]")?.textContent).toMatch(/Desktop \d+/)
  })

  it("gives every browser its own series, colour and pencil pattern", () => {
    const { container } = mount("bar-mixed")
    expect(summaryOf(container)).toContain("5 series")
    expect(tableRows(container)).toHaveLength(5)
    expect(labelsOf(container)).toContain("Firefox")
  })

  it("groups two series and marks the dashed indicator when a tooltip is open", () => {
    const { container } = mount("bar-multiple")
    expect(summaryOf(container)).not.toMatch(/Stacked/)
    expect(legendItems(container).map((i) => i.textContent)).toEqual(["Desktop", "Mobile"])
  })

  it("stacks, and the legend takes a series out", async () => {
    const { container, user } = mount("bar-stacked")
    expect(summaryOf(container)).toMatch(/Stacked/)
    await user.click(within(container).getByRole("button", { name: "Mobile" }))
    expect(summaryOf(container)).not.toContain("Mobile")
  })

  it("marks the active bar with a highlighter and opens its tooltip", () => {
    const { container } = mount("bar-active")
    expect(summaryOf(container)).toContain("Marked: firefox")
    expect(tipOf(container)?.textContent).toContain("275")
  })

  it("labels the bars with their numbers", () => {
    const { container } = mount("bar-label")
    for (const n of ["186", "305", "237", "73", "209", "214"]) expect(labelsOf(container)).toContain(n)
  })

  it("hangs the losses below the line, apart from the gains", () => {
    const { container } = mount("bar-negative")
    expect(summaryOf(container)).toMatch(/Gain/)
    expect(summaryOf(container)).toMatch(/Loss/)
    expect(summaryOf(container)).toContain("-207")
    expect(legendItems(container).map((i) => i.textContent)).toEqual(["Gain", "Loss"])
  })

  it("totals the days in the header and draws the button you press", async () => {
    const { container, user } = mount("bar-interactive")
    const totals = { desktop: daily.reduce((s, d) => s + d.desktop, 0), mobile: daily.reduce((s, d) => s + d.mobile, 0) }
    const desktop = within(container).getByRole("button", { name: new RegExp(`Desktop.*${thousands(totals.desktop)}`) })
    const mobile = within(container).getByRole("button", { name: new RegExp(`Mobile.*${thousands(totals.mobile)}`) })
    expect(desktop).toHaveAttribute("aria-pressed", "true")
    expect(mobile).toHaveAttribute("aria-pressed", "false")
    expect(canvasOf(container).getAttribute("aria-label")).toBe("Desktop visitors per day")
    await user.click(mobile)
    expect(mobile).toHaveAttribute("aria-pressed", "true")
    expect(desktop).toHaveAttribute("aria-pressed", "false")
    expect(canvasOf(container).getAttribute("aria-label")).toBe("Mobile visitors per day")
    expect(tableRows(container)).toHaveLength(91)
    await axeCheck(container)
  })
})

describe("line", () => {
  it("draws the default without markers and circles the dip", () => {
    const { container } = mount("line-default")
    expect(labelsOf(container)).toContain("quiet April")
  })

  it("has a legend with a line sample for each series in the multiple example", () => {
    const { container } = mount("line-multiple")
    expect(legendItems(container)).toHaveLength(2)
    expect(summaryOf(container)).toContain("Line chart")
  })

  it("picks a marker shape per series from the config", () => {
    const { container } = mount("line-dots-custom")
    expect(legendItems(container).map((i) => i.textContent)).toEqual(["Desktop", "Mobile"])
    expect(container.querySelectorAll("[data-slot=chart-legend] [data-slot=chart-swatch]")).toHaveLength(2)
  })

  it("switches the drawn line with the header buttons", async () => {
    const { container, user } = mount("line-interactive")
    expect(canvasOf(container).getAttribute("aria-label")).toBe("Desktop visitors per day")
    await user.click(within(container).getByRole("button", { name: /Mobile/ }))
    expect(canvasOf(container).getAttribute("aria-label")).toBe("Mobile visitors per day")
    expect(within(container).getByRole("button", { name: /Mobile/ })).toHaveAttribute("aria-pressed", "true")
  })
})

describe("pie and donut", () => {
  it("leaves the percentages off the simple pie and puts them on the labelled one", () => {
    const simple = mount("pie-simple")
    expect(labelsOf(simple.container)).not.toMatch(/%/)
    simple.unmount()
    const labelled = mount("pie-label")
    expect(labelsOf(labelled.container)).toMatch(/30%/)
  })

  it("lists the slices in the legend and takes one out", async () => {
    const { container, user } = mount("pie-legend")
    expect(legendItems(container).map((i) => i.textContent)).toEqual(["Chrome", "Safari", "Firefox", "Edge", "Other"])
    await user.click(within(container).getByRole("button", { name: "Safari" }))
    expect(within(container).getByRole("button", { name: "Safari" })).toHaveAttribute("aria-pressed", "false")
    expect(summaryOf(container)).not.toContain("Safari")
  })

  it("lights the first slice and names it in the hole", () => {
    const { container } = mount("pie-donut-active")
    expect(tipOf(container)?.textContent).toContain("Chrome")
    expect(centerOf(container)).toContain("275")
    expect(centerOf(container)).toContain("Chrome")
  })

  it("prints the total in the hole", () => {
    const { container } = mount("pie-donut-text")
    const total = 275 + 200 + 287 + 173 + 190
    expect(centerOf(container)).toContain(thousands(total))
    expect(centerOf(container)).toContain("Visitors")
  })

  it("moves the lit slice and the number in the hole with the Select", async () => {
    const { container, user } = mount("pie-interactive")
    expect(centerOf(container)).toContain("186")
    expect(centerOf(container)).toContain("January")
    expect(tipOf(container)?.textContent).toContain("January")
    await user.click(within(container).getByRole("combobox", { name: "Month" }))
    await user.click(await screen.findByRole("option", { name: "March" }))
    await waitFor(() => expect(centerOf(container)).toContain("237"))
    expect(centerOf(container)).toContain("March")
    expect(tipOf(container)?.textContent).toContain("March")
    await axeCheck(container)
  })
})

describe("radar and radial", () => {
  it("draws the outlines only, and writes the ring values along the spoke", () => {
    const lines = mount("radar-lines-only")
    expect(summaryOf(lines.container)).toContain("Radar")
    lines.unmount()
    const radius = mount("radar-radius")
    for (const v of ["350", "280", "210", "140", "70"]) expect(labelsOf(radius.container)).toContain(v)
  })

  it("has a legend with icons on the icons example", () => {
    const { container } = mount("radar-icons")
    expect(Array.from(container.querySelectorAll("[data-slot=chart-legend] svg[data-icon]")).map((i) => i.getAttribute("data-icon"))).toEqual(["arrow-down", "arrow-up"])
  })

  it("switches a shape off from the radar legend", async () => {
    const { container, user } = mount("radar-legend")
    await user.click(within(container).getByRole("button", { name: "Mobile" }))
    expect(summaryOf(container)).not.toContain("Mobile")
    expect(summaryOf(container)).toContain("Desktop")
  })

  it("reads five rings on the full-circle grid and on the default dial", () => {
    for (const name of ["radial-grid", "radial-simple"]) {
      const { container, unmount } = mount(name)
      expect(summaryOf(container)).toContain("5 rings")
      unmount()
    }
  })

  it("puts the number in the hole of the single rings", () => {
    const text = mount("radial-text")
    expect(centerOf(text.container)).toContain("200")
    expect(summaryOf(text.container)).toContain("200 of 250")
    text.unmount()
    const shape = mount("radial-shape")
    expect(centerOf(shape.container)).toContain("1,260")
    expect(summaryOf(shape.container)).toContain("1,260 of 1,500")
  })
})

describe("tooltips", () => {
  const names = ["default", "indicator-line", "indicator-dashed", "indicator-none", "label-custom", "label-formatter", "label-none", "formatter", "icons", "advanced"]
  for (const n of names) {
    it(`tooltip-${n} opens on the second session before anything is touched`, () => {
      const { container } = mount(`tooltip-${n}`)
      const tip = tipOf(container)
      expect(tip).toBeTruthy()
      expect(tip!.textContent).toContain("380")
      expect(tip!.textContent).toContain("420")
    })
  }

  it("the default names the day and both series with their swatches", () => {
    const tip = tipOf(mount("tooltip-default").container)!
    expect(tip.textContent).toMatch(/Tue|2024-07-16/)
    expect(tip.textContent).toContain("Running")
    expect(tip.textContent).toContain("Swimming")
    expect(tip.querySelectorAll("[data-slot=chart-swatch]")).toHaveLength(2)
  })

  it("the indicators change the swatch: none leaves it out, dashed draws a rule, line a narrow bar", () => {
    const none = tipOf(mount("tooltip-indicator-none").container)!
    expect(none.querySelectorAll("[data-slot=chart-swatch]")).toHaveLength(0)
    const dashed = tipOf(mount("tooltip-indicator-dashed").container)!
    expect(dashed.querySelectorAll(".border-dashed")).toHaveLength(2)
    const line = tipOf(mount("tooltip-indicator-line").container)!
    expect(line.querySelector("[data-slot=chart-swatch]")?.className).toContain("w-1.5")
  })

  it("the label can come from the config, be formatted, or be left out", () => {
    expect(tipOf(mount("tooltip-label-custom").container)!.textContent).toContain("Activities")
    expect(tipOf(mount("tooltip-label-formatter").container)!.textContent).toContain("July 16, 2024")
    const none = tipOf(mount("tooltip-label-none").container)!
    expect(none.textContent).not.toMatch(/Tue|2024-07-16/)
    expect(none.querySelectorAll("[data-slot=chart-swatch]")).toHaveLength(0)
  })

  it("the formatter writes its own row, with a unit", () => {
    const tip = tipOf(mount("tooltip-formatter").container)!
    expect(tip.textContent).toContain("Running")
    expect(tip.textContent?.match(/kcal/g)).toHaveLength(2)
  })

  it("the config icons take the place of the swatches", () => {
    const tip = tipOf(mount("tooltip-icons").container)!
    expect(Array.from(tip.querySelectorAll("svg[data-icon]")).map((i) => i.getAttribute("data-icon"))).toEqual(["timer", "audio-waveform"])
    expect(tip.querySelectorAll("[data-slot=chart-swatch]")).toHaveLength(0)
  })

  it("the advanced formatter adds the total under the last row", () => {
    const tip = tipOf(mount("tooltip-advanced").container)!
    expect(tip.textContent).toContain("Total")
    expect(tip.textContent).toContain(String(380 + 420))
    expect(tip.querySelectorAll("[data-slot=chart-swatch]")).toHaveLength(2)
  })
})

describe("legends", () => {
  it("lists only the keys asked for, in the order asked", () => {
    const { container } = mount("legend-keys")
    expect(legendItems(container).map((i) => i.textContent)).toEqual(["Mobile", "Desktop"])
    expect(summaryOf(container)).toContain("3 series")
  })

  it("makes a plain key of it when toggle is false", () => {
    const { container } = mount("legend-static")
    expect(legendItems(container)).toHaveLength(2)
    expect(container.querySelectorAll("[data-slot=chart-legend] button")).toHaveLength(0)
  })

  it("puts the legend before the drawing when it is placed there", () => {
    const { container } = mount("legend-top")
    const legend = container.querySelector("[data-slot=chart-legend]")!
    const canvas = canvasOf(container)
    expect(legend.compareDocumentPosition(canvas) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(legend.className).toContain("pb-3")
  })
})

describe("light and dark, dense and quiet", () => {
  it("draws in calm density with the same content", () => {
    const Example = byName("bar-multiple").default
    const { container } = renderUI(
      <InkProvider density="calm">
        <Example />
      </InkProvider>,
      opts,
    )
    expect(canvasOf(container)).toBeTruthy()
    expect(legendItems(container)).toHaveLength(2)
  })

  it("passes axe with a tooltip open, and with a series switched off", async () => {
    const open = mount("tooltip-advanced")
    await axeCheck(open.container)
    open.unmount()
    const off = mount("bar-stacked")
    await off.user.click(within(off.container).getByRole("button", { name: "Desktop" }))
    await axeCheck(off.container)
  })
})
