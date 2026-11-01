import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import DashboardAnalytics from "@/blocks/dashboard-analytics/page"
import { change, dailyRows, formatDuration, formatNumber, period, signed } from "@/blocks/dashboard-analytics/components/dashboard-analytics-data"
import { icons } from "@/lib/ink/art/icons"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

const sources = import.meta.glob("../src/blocks/dashboard-analytics/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>
const namedIcons = () => {
  const found = new Set<string>()
  for (const src of Object.values(sources)) {
    for (const m of src.matchAll(/<Icon[^>]*?name="([a-z0-9-]+)"/g)) found.add(m[1])
    for (const m of src.matchAll(/<Icon[^>]*?name=\{([^}]*)\}/g)) for (const q of m[1].matchAll(/"([a-z0-9-]+)"/g)) found.add(q[1])
    for (const m of src.matchAll(/icon: "([a-z0-9-]+)"/g)) found.add(m[1])
  }
  return found
}

let restore = () => {}
beforeEach(() => {
  restore = mockBox(520, 260)
})
afterEach(() => {
  restore()
  vi.restoreAllMocks()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

describe("dashboard-analytics numbers", () => {
  it("has 180 days ending today, in order", () => {
    expect(dailyRows).toHaveLength(180)
    expect(dailyRows.at(-1)?.[0]).toBe("2026-09-25")
    const dates = dailyRows.map((r) => r[0])
    expect([...dates].sort()).toEqual(dates)
  })

  it("compares a period with the one right before it, day for day", () => {
    const p = period(30)
    expect(p.rows).toHaveLength(30)
    expect(p.previous).toHaveLength(30)
    expect((p.previous.at(-1)?.[0] ?? "") < p.rows[0][0]).toBe(true)
    expect(p.visitors).toBe(p.rows.reduce((a, r) => a + r[1], 0))
  })

  it("formats without depending on the locale", () => {
    expect(formatNumber(1234567)).toBe("1,234,567")
    expect(formatNumber(-1200)).toBe("-1,200")
    expect(formatDuration(187)).toBe("3:07")
    expect(change(112, 100)).toBe(12)
    expect(signed(12.4)).toBe("+12.4%")
    expect(signed(-3, " pts")).toBe("-3 pts")
  })
})

describe("dashboard-analytics block", () => {

  it("only names icons that are drawn", () => {
    const names = namedIcons()
    expect(names.size).toBeGreaterThan(1)
    expect([...names].filter((n) => !(n in icons))).toEqual([])
  })
  it("is one main landmark with a level-one title and named regions", () => {
    renderUI(<DashboardAnalytics />)
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1, name: "Traffic" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Key numbers" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Live now" })).toHaveTextContent("42 people are reading the journal.")
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Visitors, day by day", "Where they came from", "Top pages", "From hello to paid"])
  })

  it("draws four sparkline cards and four charts, each with a name", () => {
    const { container } = renderUI(<DashboardAnalytics />)
    const region = screen.getByRole("region", { name: "Key numbers" })
    expect(region.querySelectorAll("[data-slot=card]")).toHaveLength(4)
    const canvases = Array.from(container.querySelectorAll("[data-chart-type]"))
    expect(canvases.length).toBeGreaterThanOrEqual(7)
    for (const c of canvases) expect(c.getAttribute("aria-label") ?? "").not.toBe("")
    expect(container.querySelector('svg[data-ink="chart"]')).toBeTruthy()
    expectInkLayers(container, { min: 1 })
  })

  it("tapes the traffic card along its top edge (a corner strip hangs past the card and is cut off by a phone's edge)", () => {
    renderUI(<DashboardAnalytics />)
    const card = screen.getByRole("heading", { level: 2, name: "Visitors, day by day" }).closest("[data-slot=card]") as HTMLElement
    const strips = card.querySelectorAll(":scope > [data-slot=tape]")
    expect(strips).toHaveLength(1)
    expect(strips[0]).toHaveClass("left-1/2")
    expect(strips[0]).not.toHaveClass("-left-7")
  })

  it("writes each trend as a sign, an arrow and a word for screen readers", () => {
    renderUI(<DashboardAnalytics />)
    const region = screen.getByRole("region", { name: "Key numbers" })
    const cards = within(region).getAllByText(/on the 30 days before/)
    expect(cards).toHaveLength(4)
    expect(within(region).getAllByText(/, (better|worse)/)).toHaveLength(4)
  })

  it("re-works every figure when the range changes", async () => {
    const { user } = renderUI(<DashboardAnalytics />)
    const region = screen.getByRole("region", { name: "Key numbers" })
    const cardTitle = () => region.querySelector("[data-slot=card-title]")?.textContent
    const thirty = cardTitle()
    expect(thirty).toBe(formatNumber(period(30).visitors))
    await user.click(screen.getByRole("radio", { name: "7 days" }))
    expect(cardTitle()).toBe(formatNumber(period(7).visitors))
    expect(cardTitle()).not.toBe(thirty)
    expect(screen.getAllByText(/on the 7 days before/)).toHaveLength(4)
    expect(screen.getByText(/How people found the studio in the last 7 days/)).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "90 days" }))
    expect(cardTitle()).toBe(formatNumber(period(90).visitors))
  })

  it("keeps a range selected: the group cannot be emptied", async () => {
    const { user } = renderUI(<DashboardAnalytics />)
    const on = screen.getByRole("radio", { name: "30 days" })
    expect(on).toBeChecked()
    await user.click(on)
    expect(screen.getByRole("radio", { name: "30 days" })).toBeChecked()
  })

  it("lists the top pages as a table with a caption and a change for each", () => {
    renderUI(<DashboardAnalytics />)
    const table = screen.getByRole("table", { name: /Top pages by views/ })
    expect(within(table).getAllByRole("row")).toHaveLength(9)
    expect(within(table).getByText("Why the margin is the best part")).toBeInTheDocument()
    expect(within(table).getAllByText(/, (up|down)/)).toHaveLength(8)
  })

  it("names the biggest drop in the funnel and circles it", () => {
    renderUI(<DashboardAnalytics />)
    const note = screen.getByText(/Most people slip away/)
    expect(note).toHaveTextContent("between looked at a notebook and added to basket")
    expect(note).toHaveTextContent("only 25% go on")
    expect(screen.getByText(/of visitors end up paying/)).toHaveTextContent("3.3%")
  })

  it("exports the rows on screen as a CSV file", async () => {
    const blobs: Blob[] = []
    const create = vi.fn((b: Blob) => (blobs.push(b), "blob:csv"))
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() })
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    const { user } = renderUI(<DashboardAnalytics />)
    await user.click(screen.getByRole("radio", { name: "7 days" }))
    await user.click(screen.getByRole("button", { name: "Export CSV" }))
    expect(click).toHaveBeenCalledTimes(1)
    const text = await blobs[0].text()
    expect(text.split("\n")).toHaveLength(8)
    expect(text.split("\n")[0]).toBe("date,visitors,pageviews,bounce_percent,average_session_seconds")
    expect(text.split("\n").at(-1)?.startsWith("2026-09-25,")).toBe(true)
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<DashboardAnalytics />)
    await axeCheck(container)
  })

  it("mounts under StrictMode without a warning", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    renderUI(
      <React.StrictMode>
        <DashboardAnalytics />
      </React.StrictMode>,
    )
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })

  it("renders the same on the server twice and hydrates without a warning", () => {
    const tree = <DashboardAnalytics />
    const html = renderToString(tree)
    expect(renderToString(tree)).toBe(html)
    expect(html.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/\bNaN\b|\bundefined\b/)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(tree) as React.ReactElement
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
