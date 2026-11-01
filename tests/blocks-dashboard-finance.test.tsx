import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import DashboardFinance from "@/blocks/dashboard-finance/page"
import { parseAmount } from "@/blocks/dashboard-finance/components/dashboard-finance-add-dialog"
import { CATEGORY_ICON, cashFlow, inMonth, money, shortDate, spentBy, transactions } from "@/blocks/dashboard-finance/components/dashboard-finance-data"
import { icons } from "@/lib/ink/art/icons"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

const sources = import.meta.glob("../src/blocks/dashboard-finance/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>
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
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const ledger = () => screen.getByRole("table", { name: /^Transactions in/ })
const dataRows = () => within(ledger()).getAllByRole("row").slice(1)
const budget = (name: RegExp) => screen.getByRole("progressbar", { name })

describe("dashboard-finance sums", () => {
  it("writes money by hand: commas, a real minus, an optional plus", () => {
    expect(money(64210)).toBe("$642.10")
    expect(money(-64210)).toBe("−$642.10")
    expect(money(123456789)).toBe("$1,234,567.89")
    expect(money(5, { sign: true })).toBe("+$0.05")
    expect(money(-5, { sign: true })).toBe("−$0.05")
    expect(shortDate("2026-09-04")).toBe("Sep 4")
  })

  it("understands amounts people type", () => {
    expect(parseAmount("12.50")).toBe(1250)
    expect(parseAmount("$ 12,5")).toBe(1250)
    expect(parseAmount("1,234.50")).toBe(123450)
    expect(parseAmount("")).toBeNull()
    expect(parseAmount("0")).toBeNull()
    expect(parseAmount("-4")).toBeNull()
    expect(parseAmount("lots")).toBeNull()
  })

  it("adds up what each pot spent, from the transactions", () => {
    const spent = spentBy(transactions, "2026-09")
    expect(spent["Eating out"]).toBe(18290)
    expect(spent.Rent).toBe(145000)
    expect(spent.Income).toBeUndefined()
    expect(inMonth(transactions, "2026-09")).toHaveLength(20)
  })

  it("draws the last two months of the cash flow from the ledger", () => {
    const flow = cashFlow(transactions)
    expect(flow).toHaveLength(6)
    expect(flow.at(-2)).toEqual({ month: "Aug", income: 4600, spending: 1946 })
    expect(flow.at(-1)).toEqual({ month: "Sep", income: 5200, spending: 2301 })
  })
})

describe("dashboard-finance block", () => {

  it("only names icons that are drawn", () => {
    const names = new Set([...namedIcons()].filter((n) => n !== "asc" && n !== "desc"))
    expect(names.size).toBeGreaterThan(1)
    expect([...names, ...Object.values(CATEGORY_ICON)].filter((n) => !(n in icons))).toEqual([])
  })
  it("is one main landmark with the month as its title and five named sections", () => {
    renderUI(<DashboardFinance />, opts)
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1, name: "September" })).toBeInTheDocument()
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Balances", "In and out", "Budgets", "Where it went", "Transactions"])
  })

  it("writes the balances up as a receipt and adds them", () => {
    renderUI(<DashboardFinance />, opts)
    const receipt = screen.getByRole("region", { name: "Balances" })
    for (const name of ["Checking", "Savings", "Credit card", "Index funds"]) expect(within(receipt).getByText(name)).toBeInTheDocument()
    expect(within(receipt).getByText("−$642.10")).toBeInTheDocument()
    expect(within(receipt).getByText("$24,931.93")).toBeInTheDocument()
    expect(within(receipt).getByRole("img", { name: /Barcode/ })).toBeInTheDocument()
  })

  it("shows a pencil bar per budget with the amounts in its name, and says so in words when a pot is overspent", () => {
    renderUI(<DashboardFinance />, opts)
    expect(screen.getAllByRole("progressbar")).toHaveLength(6)
    expect(budget(/^Eating out/)).toHaveAccessibleName("Eating out: $182.90 spent of $150.00")
    expect(screen.getByText("Over by $32.90")).toBeInTheDocument()
    expect(screen.getByText("All of it spent, exactly")).toBeInTheDocument()
    expect(screen.getByText("$199.23 left")).toBeInTheDocument()
  })

  it("puts the pots that need a look on a note: over their line, used up, or within a sixth of it", () => {
    renderUI(<DashboardFinance />, opts)
    const note = screen.getByRole("group", { name: "Heads up" })
    expect(within(note).getByText("Eating out is $32.90 over.")).toBeInTheDocument()
    expect(within(note).getByText("Rent is all spent.")).toBeInTheDocument()
    expect(within(note).getByText("Bills: $34.85 to go.")).toBeInTheDocument()
    expect(within(note).queryByText(/Groceries|Fun|Transport/)).toBeNull()
  })

  it("keeps the status under the description too, for the width where the Status column steps aside", () => {
    renderUI(<DashboardFinance />, opts)
    const [pending, , cleared] = dataRows()
    expect(within(pending).getByText(/· pending/)).toHaveClass("md:hidden")
    expect(within(cleared).queryByText(/· cleared/)).toBeNull()
    expect(within(ledger()).getByText(/· flagged/)).toHaveClass("md:hidden", "text-red")
  })

  it("stacks the Add button under the title on a narrow card and tightens the card on a phone, so the ledger keeps room for the words", () => {
    renderUI(<DashboardFinance />, opts)
    const add = screen.getByRole("button", { name: /Add transaction/ })
    expect(add.closest("[data-slot=card-action]")).toHaveClass("row-start-3", "@md/card-header:row-start-1", "@md/card-header:col-start-2")
    const card = add.closest("[data-slot=card]")
    expect(card).toHaveClass("max-sm:[&_[data-slot=card-content]]:px-4", "max-sm:[&_[data-slot=card-header]]:px-4")
  })

  it("draws the charts with names and a data table for screen readers", () => {
    const { container } = renderUI(<DashboardFinance />, opts)
    const canvases = Array.from(container.querySelectorAll("[data-chart-type]"))
    expect(canvases.length).toBeGreaterThanOrEqual(2)
    for (const c of canvases) expect(c.getAttribute("aria-label") ?? "").not.toBe("")
    expect(container.querySelector('svg[data-ink="chart"]')).toBeTruthy()
    expectInkLayers(container, { min: 1 })
  })

  it("lists this month's transactions with a status chip and a signed amount", () => {
    renderUI(<DashboardFinance />, opts)
    expect(dataRows()).toHaveLength(20)
    const first = dataRows()[0]
    expect(within(first).getByText("Oat latte at the Blue Door")).toBeInTheDocument()
    expect(within(first).getByText("Pending")).toBeInTheDocument()
    expect(within(first).getByText("−$6.50")).toBeInTheDocument()
    expect(within(ledger()).getByText("Flagged")).toBeInTheDocument()
    expect(within(ledger()).getByText("+$3,400.00")).toBeInTheDocument()
  })

  it("filters by money in or out, and by a search word", async () => {
    const { user } = renderUI(<DashboardFinance />, opts)
    await user.click(screen.getByRole("radio", { name: "Money in" }))
    expect(dataRows()).toHaveLength(2)
    await user.click(screen.getByRole("radio", { name: "All" }))
    await user.type(screen.getByRole("searchbox", { name: "Search transactions" }), "whole")
    expect(dataRows()).toHaveLength(2)
    await user.clear(screen.getByRole("searchbox", { name: "Search transactions" }))
    await user.type(screen.getByRole("searchbox", { name: "Search transactions" }), "zzz")
    expect(within(ledger()).getByText("Nothing matches")).toBeInTheDocument()
  })

  it("sorts by amount and says which way in aria-sort", async () => {
    const { user } = renderUI(<DashboardFinance />, opts)
    const dateHead = screen.getByRole("columnheader", { name: /Date/ })
    const amountHead = screen.getByRole("columnheader", { name: /Amount/ })
    expect(dateHead).toHaveAttribute("aria-sort", "descending")
    expect(amountHead).toHaveAttribute("aria-sort", "none")
    await user.click(within(amountHead).getByRole("button"))
    expect(amountHead).toHaveAttribute("aria-sort", "ascending")
    expect(dateHead).toHaveAttribute("aria-sort", "none")
    expect(dataRows()[0]).toHaveTextContent("\u2212$1,450.00")
    await user.click(within(amountHead).getByRole("button"))
    expect(dataRows()[0]).toHaveTextContent("+$3,400.00")
  })

  it("switches month: title, table and budgets all follow", async () => {
    const { user } = renderUI(<DashboardFinance />, opts)
    await user.click(screen.getByRole("combobox", { name: "Month" }))
    await user.click(await screen.findByRole("option", { name: "August 2026" }))
    expect(screen.getByRole("heading", { level: 1, name: "August" })).toBeInTheDocument()
    expect(dataRows()).toHaveLength(11)
    expect(budget(/^Eating out/)).toHaveAccessibleName("Eating out: $125.00 spent of $150.00")
    expect(screen.queryByText(/Over by/)).not.toBeInTheDocument()
  })

  it("asks for what is missing before it adds a transaction, next to the field", async () => {
    const { user } = renderUI(<DashboardFinance />, opts)
    await user.click(screen.getByRole("button", { name: "Add transaction" }))
    const dialog = await screen.findByRole("dialog", { name: "Add a transaction" })
    await user.click(within(dialog).getByRole("button", { name: "Add it" }))
    const alerts = within(dialog).getAllByRole("alert")
    expect(alerts.map((a) => a.textContent)).toEqual(["Give it a name so you can find it later.", "Write an amount above zero, like 12.50."])
    expect(within(dialog).getByRole("textbox", { name: "What was it?" })).toHaveAttribute("aria-invalid", "true")
    expect(within(dialog).getByRole("textbox", { name: "What was it?" })).toHaveAccessibleDescription("Give it a name so you can find it later.")
    await axeCheck()
  })

  it("adds a pending transaction at the top, and the budget and the count move with it", async () => {
    const { user } = renderUI(<DashboardFinance />, opts)
    await user.click(screen.getByRole("button", { name: "Add transaction" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByRole("textbox", { name: "What was it?" }), "Ramen again")
    await user.type(within(dialog).getByRole("textbox", { name: "How much?" }), "10")
    await user.click(within(dialog).getByRole("combobox", { name: "Which pot?" }))
    await user.click(await screen.findByRole("option", { name: "Eating out" }))
    await user.click(within(dialog).getByRole("button", { name: "Add it" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(dataRows()).toHaveLength(21)
    expect(within(dataRows()[0]).getByText("Ramen again")).toBeInTheDocument()
    expect(within(dataRows()[0]).getByText("−$10.00")).toBeInTheDocument()
    expect(budget(/^Eating out/)).toHaveAccessibleName("Eating out: $192.90 spent of $150.00")
    expect(screen.getByText("Over by $42.90")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<DashboardFinance />, opts)
    await axeCheck(container)
  })

  it("mounts under StrictMode without a warning", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    renderUI(
      <React.StrictMode>
        <DashboardFinance />
      </React.StrictMode>,
      opts,
    )
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })

  it("renders the same on the server twice and hydrates without a warning", () => {
    const tree = <DashboardFinance />
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
