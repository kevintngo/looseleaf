import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import Dashboard01 from "@/blocks/dashboard-01/page"
import { icons } from "@/lib/ink/art/icons"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

const sources = import.meta.glob("../src/blocks/dashboard-01/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>
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
  document.cookie = "sidebar_state=; max-age=0; path=/"
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const sectionTable = () => screen.getByRole("table", { name: "Document sections" })
const tableRows = () => within(sectionTable()).getAllByRole("row").slice(1)
const updates = () => screen.getByRole("status", { name: "Table updates" })

describe("dashboard-01 block", () => {

  it("only names icons that are drawn", () => {
    const names = namedIcons()
    expect(names.size).toBeGreaterThan(1)
    expect([...names].filter((n) => !(n in icons))).toEqual([])
  })
  it("is a page: one main landmark, a level-one heading, named navigation", () => {
    renderUI(<Dashboard01 />, opts)
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1, name: "Documents" })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Secondary" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Dashboard/ })).toHaveAttribute("aria-current", "page")
  })

  it("shows four numbers with their trend written out", () => {
    renderUI(<Dashboard01 />, opts)
    const region = screen.getByRole("region", { name: "Key numbers" })
    for (const v of ["$48,230", "1,234", "45,678", "4.5%"]) expect(within(region).getByText(v)).toBeInTheDocument()
    expect(within(region).getByText("-20%")).toBeInTheDocument()
  })

  it("draws the visitors chart with a summary and a data table for screen readers", () => {
    const { container } = renderUI(<Dashboard01 />, opts)
    const chart = container.querySelector("[data-chart-type]")
    expect(chart).toBeTruthy()
    expect(chart).toHaveAttribute("aria-label")
    expect(container.querySelector('svg[data-ink="chart"]')).toBeTruthy()
    expectInkLayers(container, { min: 1 })
  })

  it("re-cuts the chart when the time range changes (toggle group)", async () => {
    const { user, container } = renderUI(<Dashboard01 />, opts)
    const chartLabel = () => container.querySelector("[data-chart-type]")?.getAttribute("aria-label") ?? ""
    expect(chartLabel()).toMatch(/last 3 months/i)
    await user.click(screen.getByRole("radio", { name: "Last 7 days" }))
    expect(chartLabel()).toMatch(/last 7 days/i)
    expect(screen.getByRole("radio", { name: "Last 7 days" })).toBeChecked()
  })

  it("pages through the table and changes the page size", async () => {
    const { user } = renderUI(<Dashboard01 />, opts)
    expect(tableRows()).toHaveLength(10)
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Go to last page" }))
    expect(tableRows()).toHaveLength(5)
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Go to first page" }))
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }))
    await user.click(await screen.findByRole("option", { name: "20" }))
    expect(tableRows()).toHaveLength(20)
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
  })

  it("hands the keyboard to the other arrow when the pager button that was pressed reaches the end and switches off", async () => {
    const { user } = renderUI(<Dashboard01 />, opts)
    const next = () => screen.getByRole("button", { name: "Go to next page" })
    const prev = () => screen.getByRole("button", { name: "Go to previous page" })
    await user.click(next())
    await user.click(next())
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument()
    expect(next()).toBeDisabled()
    expect(prev()).toHaveFocus()
    await user.click(prev())
    await user.click(prev())
    expect(prev()).toBeDisabled()
    expect(next()).toHaveFocus()
    await user.click(screen.getByRole("button", { name: "Go to last page" }))
    expect(prev()).toHaveFocus()
  })

  it("selects rows, all on the page with the header box, and counts them", async () => {
    const { user } = renderUI(<Dashboard01 />, opts)
    expect(screen.getByText("0 of 25 row(s) selected.")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: "Select Cover page" }))
    expect(screen.getByText("1 of 25 row(s) selected.")).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Select all rows on this page" })).toHaveAttribute("aria-checked", "mixed")
    await user.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }))
    expect(screen.getByText("10 of 25 row(s) selected.")).toBeInTheDocument()
    expect(tableRows()[0]).toHaveAttribute("data-state", "selected")
    await user.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }))
    expect(screen.getByText("0 of 25 row(s) selected.")).toBeInTheDocument()
  })

  it("lets the wide columns step aside on a narrow page, and keeps a long title to one line", () => {
    renderUI(<Dashboard01 />, opts)
    const heads = screen.getAllByRole("columnheader")
    const step = (name: string) => heads.find((h) => h.textContent === name)
    expect(step("Section type")).toHaveClass("hidden", "@4xl/main:table-cell")
    expect(step("Reviewer")).toHaveClass("hidden", "@3xl/main:table-cell")
    expect(step("Target")).toHaveClass("hidden", "@2xl/main:table-cell")
    expect(step("Status")).not.toHaveClass("hidden")
    const title = screen.getByRole("button", { name: "Technical approach" })
    expect(title).toHaveAttribute("title", "Technical approach")
    expect(title.querySelector(".truncate")).toHaveTextContent("Technical approach")
    expect(title.closest("td")).not.toHaveClass("whitespace-normal")
  })

  it("hides a column from the Customize columns menu", async () => {
    const { user } = renderUI(<Dashboard01 />, opts)
    expect(screen.getByRole("columnheader", { name: "Section type" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Customize columns/ }))
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "Section type" }))
    expect(screen.queryByRole("columnheader", { name: "Section type" })).not.toBeInTheDocument()
  })

  it("edits a target in place, copies and deletes a row, and says so", async () => {
    const { user } = renderUI(<Dashboard01 />, opts)
    const target = screen.getByRole("textbox", { name: "Target for Cover page" })
    await user.clear(target)
    await user.type(target, "42")
    expect(target).toHaveValue("42")

    await user.click(screen.getByRole("button", { name: "Actions for Cover page" }))
    await user.click(await screen.findByRole("menuitem", { name: "Make a copy" }))
    expect(screen.getByText("Cover page (copy)")).toBeInTheDocument()
    expect(updates()).toHaveTextContent("Made a copy of Cover page.")

    await user.click(screen.getByRole("button", { name: "Actions for Cover page (copy)" }))
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }))
    expect(screen.queryByText("Cover page (copy)")).not.toBeInTheDocument()
    expect(updates()).toHaveTextContent("Deleted Cover page (copy).")
  })

  it("adds a blank section and jumps to the page it landed on", async () => {
    const { user } = renderUI(<Dashboard01 />, opts)
    await user.click(screen.getByRole("button", { name: "Add section" }))
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument()
    expect(screen.getByText("Untitled section")).toBeInTheDocument()
  })

  it("opens a section in a drawer and saves the new header", async () => {
    const { user } = renderUI(<Dashboard01 />, opts)
    await user.click(screen.getByRole("button", { name: "Design" }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "Design" })).toBeInTheDocument()
    const header = within(dialog).getByRole("textbox", { name: "Header" })
    await user.clear(header)
    await user.type(header, "Design language")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Design language" })).toBeInTheDocument()
  })

  it("switches views; the ones without rows say so kindly", async () => {
    const { user } = renderUI(<Dashboard01 />, opts)
    await user.click(screen.getByRole("tab", { name: /Past performance/ }))
    expect(screen.getByText(/Nothing filed under past performance yet/)).toBeInTheDocument()
    expect(screen.queryByRole("table", { name: "Document sections" })).not.toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Dashboard01 />, opts)
    await axeCheck(container)
  })

  it("has no axe violations with the drawer open", async () => {
    const { user } = renderUI(<Dashboard01 />, opts)
    await user.click(screen.getByRole("button", { name: "Technical approach" }))
    await screen.findByRole("dialog")
    await axeCheck()
  })

  it("`contained` keeps the sidebar inside its parent", () => {
    const { container } = renderUI(<Dashboard01 contained />, opts)
    expect(container.querySelector("[data-slot=sidebar-wrapper]")).toHaveClass("h-full", "min-h-0")
    expect(container.querySelector("[data-slot=sidebar-container]")).toHaveClass("h-full")
    const inset = container.querySelector("[data-slot=sidebar-inset]")
    expect(inset).not.toHaveClass("overflow-y-auto")
    expect(inset).toHaveClass("ll-paper", "ll-stock-paper")
    expect(inset?.querySelector(":scope > .overflow-y-auto")).not.toBeNull()
  })

  it("does not scroll the page unless `contained`", () => {
    const { container } = renderUI(<Dashboard01 />, opts)
    expect(container.querySelector("[data-slot=sidebar-inset] > .overflow-y-auto")).toBeNull()
  })

  it("mounts under StrictMode without a warning", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    renderUI(
      <React.StrictMode>
        <Dashboard01 />
      </React.StrictMode>,
      opts,
    )
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })

  it("renders the same on the server twice and hydrates without a warning", () => {
    const tree = <Dashboard01 />
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
