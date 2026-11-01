import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { DateRange } from "react-day-picker"
import { es } from "react-day-picker/locale"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { calendarCss, calendarDropdownRecipe, calendarGridRecipe, RING_HANDS } from "@/lib/ink/recipes/calendar-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(280, 268)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const TODAY = new Date(2026, 8, 15)
const MONTH = new Date(2026, 8, 1)
const base = { today: TODAY, defaultMonth: MONTH }
const day = (n: number, month = "September") => screen.getByRole("button", { name: new RegExp(`${month} ${n}(st|nd|rd|th), 2026`) })

describe("Calendar structure and slots", () => {
  it("renders a month as an accessible grid inside data-slot=calendar", () => {
    const { container } = renderUI(<Calendar mode="single" {...base} />)
    expect(container.querySelector('[data-slot="calendar"]')).not.toBeNull()
    const grid = screen.getByRole("grid", { name: "September 2026" })
    expect(grid.tagName).toBe("TABLE")
    expect(within(grid).getAllByRole("gridcell").length).toBeGreaterThanOrEqual(35)
    expect(screen.getByRole("button", { name: /previous month/i })).toHaveAttribute("data-slot", "button")
    expect(screen.getByRole("button", { name: /next month/i })).toHaveAttribute("data-slot", "button")
    expect(screen.getByText("September 2026")).toBeInTheDocument()
  })

  it("the day buttons are plain buttons with no ink of their own, and carry the hand that draws their marks", () => {
    const { container } = renderUI(<Calendar mode="single" selected={new Date(2026, 8, 17)} {...base} />)
    const cells = container.querySelectorAll("td[data-day]")
    expect(cells.length).toBeGreaterThanOrEqual(35)
    expect(container.querySelectorAll("td svg")).toHaveLength(0)
    const b = day(17)
    expect(b.tagName).toBe("BUTTON")
    expect(b).toHaveAttribute("data-slot", "calendar-day")
    expect(b).toHaveAttribute("data-day", "2026-09-17")
    expect(Number(b.getAttribute("data-v"))).toBe(17 % RING_HANDS)
    expect(b).toHaveAttribute("data-selected-single", "true")
  })

  it("today is marked with aria-current and an aria-hidden underline part", () => {
    renderUI(<Calendar mode="single" {...base} />)
    const b = day(15)
    expect(b).toHaveAttribute("aria-current", "date")
    const part = b.querySelector('[data-part="today"]')
    expect(part).toHaveAttribute("aria-hidden", "true")
    expect(day(16)).not.toHaveAttribute("aria-current")
  })

  it("hoists one stylesheet with the mask tiles and the state rules", () => {
    renderUI(
      <>
        <Calendar mode="single" {...base} />
        <Calendar mode="single" {...base} />
      </>,
    )
    const styles = document.querySelectorAll('style[data-href="ll-calendar"]')
    expect(styles).toHaveLength(1)
    const css = styles[0].textContent ?? ""
    expect(css).toContain("--ll-cal-ring0:url(")
    expect(css).toContain("[data-range=start]")
    expect(css).toContain("forced-colors")
    expect(css).not.toMatch(/#[0-9a-f]{6}\b|NaN|undefined/i)
  })

  it("calendarCss is deterministic and stays small (a page pays for it once)", () => {
    expect(calendarCss()).toBe(calendarCss())
    expect(calendarCss().length).toBeLessThan(40_000)
  })
})

describe("Calendar single selection", () => {
  it("uncontrolled: clicking a day selects it (aria-selected), clicking it again clears it", async () => {
    const { user } = renderUI(<Calendar mode="single" {...base} />)
    await user.click(day(9))
    expect(day(9).closest("td")).toHaveAttribute("aria-selected", "true")
    expect(day(9)).toHaveAttribute("data-selected-single", "true")
    await user.click(day(12))
    expect(day(9).closest("td")).not.toHaveAttribute("aria-selected")
    expect(day(12).closest("td")).toHaveAttribute("aria-selected", "true")
    await user.click(day(12))
    expect(day(12).closest("td")).not.toHaveAttribute("aria-selected")
  })

  it("controlled: onSelect fires and the value comes from props", async () => {
    const onSelect = vi.fn()
    const { user, rerender } = renderUI(<Calendar mode="single" selected={new Date(2026, 8, 3)} onSelect={onSelect} {...base} />)
    expect(day(3).closest("td")).toHaveAttribute("aria-selected", "true")
    await user.click(day(20))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0]).toEqual(new Date(2026, 8, 20))
    expect(day(20).closest("td")).not.toHaveAttribute("aria-selected")
    rerender(<Calendar mode="single" selected={new Date(2026, 8, 20)} onSelect={onSelect} {...base} />)
    expect(day(20).closest("td")).toHaveAttribute("aria-selected", "true")
    expect(day(3).closest("td")).not.toHaveAttribute("aria-selected")
  })

  it("required keeps one day selected", async () => {
    const { user } = renderUI(<Calendar mode="single" required defaultMonth={MONTH} today={TODAY} selected={new Date(2026, 8, 5)} onSelect={() => {}} />)
    await user.click(day(5))
    expect(day(5).closest("td")).toHaveAttribute("aria-selected", "true")
  })

  it("multiple mode circles several days", async () => {
    const { user } = renderUI(<Calendar mode="multiple" {...base} />)
    await user.click(day(2))
    await user.click(day(4))
    await user.click(day(6))
    expect(document.querySelectorAll('button[data-selected-single="true"]')).toHaveLength(3)
  })
})

describe("Calendar range", () => {
  it("marks start, middle and end cells for the highlighter swipe (the first click is a one-day pill)", async () => {
    const { user, container } = renderUI(<Calendar mode="range" {...base} />)
    await user.click(day(9))
    expect(Array.from(container.querySelectorAll("td[data-range]")).map((td) => td.getAttribute("data-range"))).toEqual(["single"])
    await user.click(day(12))
    const ranges = Array.from(container.querySelectorAll("td[data-range]")).map((td) => td.getAttribute("data-range"))
    expect(ranges).toEqual(["start", "mid", "mid", "end"])
    expect(container.querySelectorAll('button[data-selected-single="true"]')).toHaveLength(0)
    expect(day(9)).toHaveAttribute("data-range-start", "true")
    expect(day(12)).toHaveAttribute("data-range-end", "true")
  })

  it("controlled range: onSelect gets {from, to}", async () => {
    const onSelect = vi.fn()
    const sel: DateRange = { from: new Date(2026, 8, 9), to: new Date(2026, 8, 10) }
    const { user } = renderUI(<Calendar mode="range" selected={sel} onSelect={onSelect} {...base} />)
    await user.click(day(14))
    expect(onSelect).toHaveBeenCalled()
    const next = onSelect.mock.calls[0][0] as DateRange
    expect(next.from).toBeInstanceOf(Date)
  })

  it("a range of one day is a single pill", () => {
    const { container } = renderUI(<Calendar mode="range" selected={{ from: new Date(2026, 8, 9), to: new Date(2026, 8, 9) }} onSelect={() => {}} {...base} />)
    expect(Array.from(container.querySelectorAll("td[data-range]")).map((td) => td.getAttribute("data-range"))).toEqual(["single"])
  })
})

describe("Calendar keyboard", () => {
  it("roving tab stop: one day is tabbable, arrows move focus by day and week, Home/End by week edge", async () => {
    const { user } = renderUI(<Calendar mode="single" selected={new Date(2026, 8, 17)} {...base} />)
    expect(day(17)).toHaveAttribute("tabindex", "0")
    expect(day(18)).toHaveAttribute("tabindex", "-1")
    day(17).focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(day(18)).toHaveFocus())
    await user.keyboard("{ArrowDown}")
    await waitFor(() => expect(day(25)).toHaveFocus())
    await user.keyboard("{ArrowLeft}{ArrowUp}")
    await waitFor(() => expect(day(17)).toHaveFocus())
    await user.keyboard("{Home}")
    await waitFor(() => expect(day(13)).toHaveFocus())
    await user.keyboard("{End}")
    await waitFor(() => expect(day(19)).toHaveFocus())
  })

  it("PageDown / PageUp change month, Enter and Space select the focused day", async () => {
    const onSelect = vi.fn()
    const { user } = renderUI(<Calendar mode="single" onSelect={onSelect} {...base} />)
    const b = day(15)
    b.focus()
    await user.keyboard("{PageDown}")
    await waitFor(() => expect(screen.getByRole("grid", { name: "October 2026" })).toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole("button", { name: /October 15th, 2026/ })).toHaveFocus())
    await user.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0]).toEqual(new Date(2026, 9, 15))
    await user.keyboard("{ArrowRight} ")
    expect(onSelect).toHaveBeenCalledTimes(2)
    await user.keyboard("{PageUp}")
    await waitFor(() => expect(screen.getByRole("grid", { name: "September 2026" })).toBeInTheDocument())
  })

  it("the month buttons move the month, and stay focusable-in-place at the end of the range (aria-disabled, focus is not lost)", async () => {
    const { user } = renderUI(<Calendar mode="single" {...base} startMonth={new Date(2026, 7, 1)} endMonth={new Date(2026, 9, 1)} />)
    const next = screen.getByRole("button", { name: /next month/i })
    await user.click(next)
    expect(screen.getByRole("grid", { name: "October 2026" })).toBeInTheDocument()
    expect(next).toHaveAttribute("aria-disabled", "true")
    expect(next).not.toBeDisabled()
    expect(next).toHaveAttribute("data-disabled")
    await user.click(next)
    expect(screen.getByRole("grid", { name: "October 2026" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /previous month/i }))
    await user.click(screen.getByRole("button", { name: /previous month/i }))
    expect(screen.getByRole("grid", { name: "August 2026" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /previous month/i })).toHaveAttribute("aria-disabled", "true")
  })
})

describe("Calendar disabled days, outside days, week numbers", () => {
  it("disabled days are marked, hatched by CSS, and cannot be chosen", async () => {
    const onSelect = vi.fn()
    const { user, container } = renderUI(<Calendar mode="single" disabled={{ before: new Date(2026, 8, 10) }} onSelect={onSelect} {...base} />)
    expect(day(9)).toBeDisabled()
    expect(day(9).closest("td")).toHaveAttribute("data-disabled", "true")
    expect(day(10)).not.toBeDisabled()
    await user.click(day(9))
    expect(onSelect).not.toHaveBeenCalled()
    expect(container.querySelectorAll("td[data-disabled] svg")).toHaveLength(0)
  })

  it("outside days show by default and hide with showOutsideDays={false}", () => {
    const { container, unmount } = renderUI(<Calendar mode="single" {...base} />)
    expect(container.querySelectorAll("td[data-outside]").length).toBeGreaterThan(0)
    unmount()
    const r = renderUI(<Calendar mode="single" showOutsideDays={false} {...base} />)
    expect(r.container.querySelectorAll("td[data-outside] button")).toHaveLength(0)
  })

  it("showWeekNumber adds a row header per week and the red margin rule", () => {
    const { container } = renderUI(<Calendar mode="single" showWeekNumber {...base} />)
    expect(container.querySelectorAll("th[role=rowheader]").length).toBeGreaterThanOrEqual(5)
    expect(container.querySelector('[data-slot="calendar"]')).toHaveAttribute("data-week-numbers", "true")
  })
})

describe("Calendar caption, dropdowns, locale, direction", () => {
  it("captionLayout=dropdown renders native month / year selects inside a drawn field frame", async () => {
    const { user, container } = renderUI(<Calendar mode="single" captionLayout="dropdown" startMonth={new Date(2020, 0)} endMonth={new Date(2030, 11)} {...base} />)
    const month = screen.getByRole("combobox", { name: /choose the month/i })
    const year = screen.getByRole("combobox", { name: /choose the year/i })
    expect(month.parentElement).toHaveAttribute("data-slot", "calendar-dropdown")
    expect(month.parentElement).toHaveAttribute("data-ink-host")
    expect(year).toHaveValue("2026")
    await user.selectOptions(month, "Nov")
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeInTheDocument()
    await user.selectOptions(year, "2028")
    expect(screen.getByRole("grid", { name: "November 2028" })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="calendar-dropdown"]')).toHaveLength(2)
  })

  it("locale and numerals come from react-day-picker (Spanish, Monday first)", () => {
    renderUI(<Calendar mode="single" locale={es} weekStartsOn={1} {...base} />)
    expect(screen.getByRole("grid", { name: /septiembre de 2026|septiembre 2026/i })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="calendar"]')).toHaveAttribute("lang", "es")
  })

  it("dir=rtl sets the direction on the root", () => {
    renderUI(<Calendar mode="single" dir="rtl" {...base} />)
    expect(document.querySelector('[data-slot="calendar"]')).toHaveAttribute("dir", "rtl")
  })

  it("numberOfMonths draws one ruled grid per month", () => {
    const { container } = renderUI(<Calendar mode="single" numberOfMonths={2} {...base} />)
    expect(screen.getAllByRole("grid")).toHaveLength(2)
    expect(container.querySelectorAll('[data-slot="calendar-grid"]')).toHaveLength(2)
    expect(container.querySelectorAll('svg[data-ink="calendar"]')).toHaveLength(2)
  })

  it("footer is a polite live region", () => {
    renderUI(<Calendar mode="single" footer="Pick a day." {...base} />)
    expect(screen.getByText("Pick a day.")).toHaveAttribute("role", "status")
  })
})

describe("Calendar ink", () => {
  it("draws ONE ruled grid per month on the div around the table (a table cannot host an svg)", () => {
    const { container } = renderUI(<Calendar mode="single" {...base} />)
    const host = container.querySelector('[data-slot="calendar-grid"]') as HTMLElement
    expect(host).toHaveAttribute("data-ink-host")
    expect(host.querySelector(":scope > table")).not.toBeNull()
    expect(host.querySelector(":scope > svg[data-ink='calendar']")).not.toBeNull()
    expectInkLayers(host, { min: 1, kinds: ["calendar"], absolute: true, layers: ["rest"], ready: true })
    expect(container.querySelector("table svg")).toBeNull()
  })

  it("ruled={false} leaves the page plain (no grid svg)", () => {
    const { container } = renderUI(<Calendar mode="single" ruled={false} {...base} />)
    expect(container.querySelector('svg[data-ink="calendar"]')).toBeNull()
  })

  it("a seed pins the hand", () => {
    const grid = (seed: string) => {
      const r = renderUI(<Calendar mode="single" seed={seed} {...base} />)
      const html = r.container.querySelector('svg[data-ink="calendar"]')?.innerHTML ?? ""
      r.unmount()
      return html
    }
    expect(grid("a")).toBe(grid("a"))
    expect(grid("a")).not.toBe(grid("b"))
  })

  it("sheet puts the calendar on a sheet of paper", () => {
    const { container } = renderUI(<Calendar mode="single" sheet={{ stock: "graph", tape: "top" }} {...base} />)
    const root = container.querySelector('[data-slot="calendar"]') as HTMLElement
    expect(root).toHaveClass("ll-paper")
    expect(root).toHaveAttribute("data-stock", "graph")
    expect(root.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(1)
  })

  it("a paper clip on the sheet stands between the next-month arrow and the caption, not on the arrow (fastenerClassName still wins)", () => {
    const a = renderUI(<Calendar mode="single" sheet={{ stock: "card", fastener: "clip" }} {...base} />)
    const clip = a.container.querySelector('svg[data-slot="fastener"]')!
    expect(clip).toHaveClass("right-[3.125rem]", "-top-5")
    expect(clip).not.toHaveClass("right-8")
    a.unmount()
    const b = renderUI(<Calendar mode="single" sheet={{ stock: "card", fastener: "clip", fastenerClassName: "left-16 right-auto" }} {...base} />)
    expect(b.container.querySelector('svg[data-slot="fastener"]')).toHaveClass("left-16", "right-auto")
    b.unmount()
    const c = renderUI(<Calendar mode="single" sheet={{ stock: "card", fastener: "pin" }} {...base} />)
    expect(c.container.querySelector('svg[data-slot="fastener"]')).toHaveClass("left-1/2")
  })

  it("is not affected by a custom DayButton being passed (components merge)", () => {
    renderUI(
      <Calendar
        mode="single"
        {...base}
        components={{ DayButton: (p) => <CalendarDayButton {...p} className="custom-day" /> }}
      />,
    )
    expect(day(9)).toHaveClass("custom-day")
  })
})

describe("Calendar recipes", () => {
  const req = { seed: "s", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

  it("the grid is a single cheap layer whatever the month (<= 12 nodes, <= 8 KB) and follows the box", () => {
    for (const rows of [4, 5, 6]) {
      for (const weekNumbers of [false, true]) {
        for (const density of ["comfortable", "compact", "calm"] as const) {
          const f = runRecipe(calendarGridRecipe, { ...req, density, params: { rows, weekNumbers }, box: { w: 280 + (weekNumbers ? 32 : 0), h: 28 + rows * 40 } })
          const all = Object.values(f.parts).join("")
          expect(f.layers, `${rows}/${weekNumbers}/${density}`).toEqual(["rest"])
          expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(12)
          expect((f.parts.rest ?? "").length).toBeLessThanOrEqual(8000)
          expect(all).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
  })

  it("week numbers give the first rule the red margin pencil; right-to-left mirrors the rules", () => {
    const p = { rows: 5, weekNumbers: true }
    const box = { w: 312, h: 228 }
    const ltr = runRecipe(calendarGridRecipe, { ...req, params: p, box }).parts.rest ?? ""
    const rtl = runRecipe(calendarGridRecipe, { ...req, params: p, box, dir: "rtl" }).parts.rest ?? ""
    expect(ltr).toContain("var(--ll-red)")
    expect(rtl).toContain("var(--ll-red)")
    expect(rtl).not.toBe(ltr)
    expect(runRecipe(calendarGridRecipe, { ...req, params: { rows: 5, weekNumbers: false }, box: { w: 280, h: 228 } }).parts.rest).not.toContain("var(--ll-red)")
  })

  it("the dropdown frame has the field layers (hover and focus lazy) and a disabled alternative", () => {
    const f = runRecipe(calendarDropdownRecipe, { ...req, params: {}, box: { w: 76, h: 32 }, lazy: ["focus", "hover"] })
    expect(f.layers).toEqual(["rest", "hover", "focus"])
    expect(runRecipe(calendarDropdownRecipe, { ...req, params: { disabled: true }, box: { w: 76, h: 32 } }).layers).toEqual(["disabled"])
  })
})

describe("Calendar accessibility and rendering", () => {
  it("has no axe violations (single, range, dropdown, week numbers)", async () => {
    const { container, rerender } = renderUI(<Calendar mode="single" selected={new Date(2026, 8, 17)} onSelect={() => {}} {...base} />)
    await axeCheck(container)
    rerender(<Calendar mode="range" selected={{ from: new Date(2026, 8, 9), to: new Date(2026, 8, 12) }} onSelect={() => {}} showWeekNumber {...base} />)
    await axeCheck(container)
    rerender(<Calendar mode="single" captionLayout="dropdown" startMonth={new Date(2020, 0)} endMonth={new Date(2030, 11)} {...base} />)
    await axeCheck(container)
  })

  it("renders on the server twice with the same markup, and hydrates without a mismatch (bare and in a provider)", async () => {
    const el = <Calendar mode="range" selected={{ from: new Date(2026, 8, 9), to: new Date(2026, 8, 12) }} onSelect={() => {}} showWeekNumber {...base} />
    const a = renderToString(el)
    expect(renderToString(el)).toBe(a)
    expect(a).not.toMatch(/NaN|undefined|\[object/)
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      cleanup()
      const html = renderToString(wrap(el))
      const host = document.createElement("div")
      document.body.appendChild(host)
      host.innerHTML = html
      const err = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(el))
      })
      expect(err.mock.calls.map((c) => String(c[0])).filter((m) => !/act\(/.test(m))).toEqual([])
      err.mockRestore()
      host.remove()
    }
  })

  it("survives StrictMode", () => {
    const { container } = renderUI(
      <React.StrictMode>
        <Calendar mode="single" {...base} />
      </React.StrictMode>,
    )
    expect(container.querySelectorAll('svg[data-ink="calendar"]')).toHaveLength(1)
  })
})
