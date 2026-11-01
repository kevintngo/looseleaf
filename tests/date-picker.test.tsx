import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { DateRange } from "react-day-picker"
import { de } from "date-fns/locale"

import { DatePicker, DateRangePicker, parseDateInput, toIsoDate } from "@/components/ui/date-picker"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { datePickerRecipe } from "@/lib/ink/recipes/date-picker-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(300, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const MONTH = { today: new Date(2026, 8, 15), defaultMonth: new Date(2026, 8, 1) }
const day = (n: number, month = "September") => screen.findByRole("button", { name: new RegExp(`${month} ${n}(st|nd|rd|th), 2026`) })
const input = () => screen.getByRole("textbox") as HTMLInputElement

describe("parseDateInput", () => {
  const ref = new Date(2026, 8, 15)
  const p = (t: string, o: Parameters<typeof parseDateInput>[1] = {}) => parseDateInput(t, { reference: ref, ...o })
  it("reads the forms people type", () => {
    const d = new Date(2026, 8, 17)
    expect(p("Sep 17, 2026")).toEqual(d)
    expect(p("September 17, 2026")).toEqual(d)
    expect(p("2026-09-17")).toEqual(d)
    expect(p("9/17/2026")).toEqual(d)
    expect(p("9/17/26")).toEqual(d)
    expect(p("17 Sep 2026")).toEqual(d)
    expect(p("  Sep 17, 2026  ")).toEqual(d)
  })
  it("reads today, tomorrow and yesterday from the reference, and nothing else", () => {
    expect(p("today")).toEqual(new Date(2026, 8, 15))
    expect(p("Tomorrow")).toEqual(new Date(2026, 8, 16))
    expect(p("yesterday")).toEqual(new Date(2026, 8, 14))
    expect(parseDateInput("today")).toBeUndefined()
  })
  it("rejects nonsense and impossible dates", () => {
    expect(p("")).toBeUndefined()
    expect(p("soon")).toBeUndefined()
    expect(p("Sep 31, 2026")).toBeUndefined()
    expect(p("13/45/2026")).toBeUndefined()
  })
  it("uses the given format first and the locale for names", () => {
    expect(p("17.09.2026", { format: "dd.MM.yyyy" })).toEqual(new Date(2026, 8, 17))
    expect(p("17. September 2026", { format: "d. MMMM yyyy", locale: de })).toEqual(new Date(2026, 8, 17))
  })
  it("toIsoDate is what forms submit", () => {
    expect(toIsoDate(new Date(2026, 8, 7))).toBe("2026-09-07")
  })
})

describe("DatePicker typed field", () => {
  it("is a text input with a calendar button inside one drawn frame", () => {
    const { container } = renderUI(<DatePicker aria-label="Due date" />)
    const host = container.querySelector('[data-slot="date-picker"]') as HTMLElement
    expect(host).toHaveAttribute("data-ink-host")
    expect(host).toHaveAttribute("data-ink-focus", "within")
    const field = screen.getByRole("textbox", { name: "Due date" })
    expect(field).toHaveAttribute("placeholder", "Pick a date")
    expect(field.parentElement).toBe(host)
    expect(screen.getByRole("button", { name: "Choose date" })).toHaveAttribute("aria-expanded", "false")
    const ink = host.querySelector(":scope > svg[data-ink]") as SVGElement
    expect(ink).toHaveAttribute("data-ink", "field")
    expect(ink).toHaveAttribute("aria-hidden", "true")
    expect(ink).toHaveAttribute("focusable", "false")
    expect(host).toHaveAttribute("data-ink-ready")
    expect(Array.from(ink.querySelectorAll(":scope > g")).map((g) => g.getAttribute("data-layer"))).toEqual(["rest", "open"])
  })

  it("reads a typed date when you press Enter or leave the field, and shows it formatted", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DatePicker aria-label="Due" onValueChange={onValueChange} />, opts)
    await user.type(input(), "9/17/2026{Enter}")
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0][0]).toEqual(new Date(2026, 8, 17))
    expect(input()).toHaveValue("Sep 17, 2026")
    await user.clear(input())
    await user.type(input(), "2026-10-01")
    await user.tab()
    expect(onValueChange).toHaveBeenCalledTimes(2)
    expect(input()).toHaveValue("Oct 1, 2026")
  })

  it("does not commit while typing, and an unreadable date is invalid until the next edit", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DatePicker aria-label="Due" onValueChange={onValueChange} />, opts)
    await user.type(input(), "Sep 31, 2026")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input()).not.toHaveAttribute("aria-invalid")
    await user.tab()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input()).toHaveAttribute("aria-invalid", "true")
    expect(input()).toHaveValue("Sep 31, 2026")
    await user.type(input(), "{Backspace}")
    expect(input()).not.toHaveAttribute("aria-invalid")
  })

  it("Enter on an unreadable date does not submit the form; on a readable one it does", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const { user } = renderUI(
      <form onSubmit={onSubmit}>
        <DatePicker aria-label="Due" />
        <button type="submit">Go</button>
      </form>,
      opts,
    )
    await user.type(input(), "nope{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.clear(input())
    await user.type(input(), "9/17/2026{Enter}")
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("clearing the text clears the value; Escape drops what was typed", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DatePicker aria-label="Due" defaultValue={new Date(2026, 8, 17)} onValueChange={onValueChange} />, opts)
    expect(input()).toHaveValue("Sep 17, 2026")
    await user.type(input(), "x{Escape}")
    expect(input()).toHaveValue("Sep 17, 2026")
    await user.clear(input())
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
    expect(input()).toHaveValue("")
  })

  it("min, max and disabledDates make typed dates invalid too", async () => {
    const { user } = renderUI(<DatePicker aria-label="Due" min={new Date(2026, 8, 10)} max={new Date(2026, 8, 20)} disabledDates={{ dayOfWeek: [0] }} />, opts)
    for (const t of ["Sep 5, 2026", "Sep 25, 2026", "Sep 13, 2026"]) {
      await user.clear(input())
      await user.type(input(), `${t}{Enter}`)
      expect(input(), t).toHaveAttribute("aria-invalid", "true")
    }
    await user.clear(input())
    await user.type(input(), "Sep 15, 2026{Enter}")
    expect(input()).toHaveValue("Sep 15, 2026")
    expect(input()).not.toHaveAttribute("aria-invalid")
  })

  it("format and locale change how a date is shown", () => {
    renderUI(<DatePicker aria-label="Due" defaultValue={new Date(2026, 8, 17)} format="dd.MM.yyyy" locale={de} />)
    expect(input()).toHaveValue("17.09.2026")
  })
})

describe("DatePicker calendar", () => {
  it("the button opens a dialog with the Calendar; choosing a day fills the field and closes it", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DatePicker aria-label="Due" onValueChange={onValueChange} calendarProps={MONTH} />, opts)
    const btn = screen.getByRole("button", { name: "Choose date" })
    await user.click(btn)
    const dialog = await screen.findByRole("dialog", { name: "Choose date" })
    expect(btn).toHaveAttribute("aria-expanded", "true")
    expect(dialog.querySelector('[data-slot="calendar"]')).not.toBeNull()
    await user.click(await day(9))
    expect(onValueChange.mock.calls[0][0]).toEqual(new Date(2026, 8, 9))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(input()).toHaveValue("Sep 9, 2026")
  })

  it("ArrowDown in the field opens it; the calendar starts on the chosen month", async () => {
    const { user } = renderUI(<DatePicker aria-label="Due" defaultValue={new Date(2026, 10, 3)} />, opts)
    input().focus()
    await user.keyboard("{ArrowDown}")
    expect(await screen.findByRole("grid", { name: "November 2026" })).toBeInTheDocument()
  })

  it("Escape puts the slip away and the value stays", async () => {
    const { user } = renderUI(<DatePicker aria-label="Due" defaultValue={new Date(2026, 8, 17)} calendarProps={MONTH} />, opts)
    await user.click(screen.getByRole("button", { name: "Choose date" }))
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(input()).toHaveValue("Sep 17, 2026")
  })

  it("closeOnSelect={false} keeps it open", async () => {
    const { user } = renderUI(<DatePicker aria-label="Due" closeOnSelect={false} calendarProps={MONTH} />, opts)
    await user.click(screen.getByRole("button", { name: "Choose date" }))
    await user.click(await day(9))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("min / max hatch days out in the calendar", async () => {
    const { user } = renderUI(<DatePicker aria-label="Due" min={new Date(2026, 8, 10)} calendarProps={MONTH} />, opts)
    await user.click(screen.getByRole("button", { name: "Choose date" }))
    expect(await day(9)).toBeDisabled()
    expect(await day(10)).not.toBeDisabled()
  })

  it("presets sit beside the calendar; a function preset is evaluated when chosen", async () => {
    const onValueChange = vi.fn()
    const later = vi.fn(() => new Date(2026, 8, 22))
    const { user } = renderUI(
      <DatePicker aria-label="Due" onValueChange={onValueChange} presets={[{ label: "Today", value: new Date(2026, 8, 15) }, { label: "In a week", value: later }]} calendarProps={MONTH} />,
      opts,
    )
    await user.click(screen.getByRole("button", { name: "Choose date" }))
    const group = await screen.findByRole("group", { name: "Presets" })
    expect(later).not.toHaveBeenCalled()
    await user.click(within(group).getByRole("button", { name: "In a week" }))
    expect(later).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 8, 22))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(input()).toHaveValue("Sep 22, 2026")
  })

  it("open / onOpenChange control the slip", async () => {
    const onOpenChange = vi.fn()
    const { user, rerender } = renderUI(<DatePicker aria-label="Due" open={false} onOpenChange={onOpenChange} calendarProps={MONTH} />, opts)
    await user.click(screen.getByRole("button", { name: "Choose date" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("dialog")).toBeNull()
    rerender(<DatePicker aria-label="Due" open onOpenChange={onOpenChange} calendarProps={MONTH} />)
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("the host shows the open state to the drawing (data-state)", async () => {
    const { user, container } = renderUI(<DatePicker aria-label="Due" calendarProps={MONTH} />, opts)
    const host = container.querySelector('[data-slot="date-picker"]')!
    expect(host).toHaveAttribute("data-state", "closed")
    await user.click(screen.getByRole("button", { name: "Choose date" }))
    expect(host).toHaveAttribute("data-state", "open")
  })
})

describe("DatePicker value, form, states", () => {
  it("controlled: the value comes from props (an undefined value is a controlled, empty field)", async () => {
    const onValueChange = vi.fn()
    const { user, rerender } = renderUI(<DatePicker aria-label="Due" value={undefined} onValueChange={onValueChange} />, opts)
    await user.type(input(), "9/17/2026{Enter}")
    expect(onValueChange).toHaveBeenCalled()
    expect(input()).toHaveValue("")
    rerender(<DatePicker aria-label="Due" value={new Date(2026, 8, 17)} onValueChange={onValueChange} />)
    expect(input()).toHaveValue("Sep 17, 2026")
  })

  it("name adds a hidden input with yyyy-MM-dd that FormData sees", async () => {
    const { container } = renderUI(
      <form>
        <DatePicker aria-label="Due" name="due" defaultValue={new Date(2026, 8, 7)} />
      </form>,
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(new FormData(form).get("due")).toBe("2026-09-07")
  })

  it("disabled and readOnly: nothing to type, nothing to open", async () => {
    const { user, rerender } = renderUI(<DatePicker aria-label="Due" disabled defaultValue={new Date(2026, 8, 17)} />, opts)
    expect(input()).toBeDisabled()
    expect(screen.getByRole("button", { name: "Choose date" })).toBeDisabled()
    rerender(<DatePicker aria-label="Due" readOnly defaultValue={new Date(2026, 8, 17)} />)
    expect(input()).toHaveAttribute("readonly")
    await user.click(screen.getByRole("button", { name: "Choose date" }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("invalid draws the red box (a static alternative) and marks the input", () => {
    const { container } = renderUI(<DatePicker aria-label="Due" invalid />)
    expect(input()).toHaveAttribute("aria-invalid", "true")
    expect(Array.from(container.querySelectorAll('[data-slot="date-picker"] > svg > g')).map((g) => g.getAttribute("data-layer"))).toEqual(["invalid"])
  })

  it("typeable={false} makes the whole field a button that shows the date", async () => {
    const { user } = renderUI(<DatePicker aria-label="Due" typeable={false} defaultValue={new Date(2026, 8, 17)} calendarProps={MONTH} />, opts)
    const b = screen.getByRole("button", { name: "Due" })
    expect(b).toHaveTextContent("Sep 17, 2026")
    expect(b).toHaveAttribute("data-slot", "date-picker")
    expect(screen.queryByRole("textbox")).toBeNull()
    await user.click(b)
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(b).toHaveAttribute("data-state", "open")
  })
})

describe("DateRangePicker", () => {
  it("reads two typed dates with a dash or 'to' between them", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DateRangePicker aria-label="Stay" onValueChange={onValueChange} />, opts)
    await user.type(input(), "Sep 9, 2026 - Sep 24, 2026{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 8, 9), to: new Date(2026, 8, 24) })
    expect(input()).toHaveValue("Sep 9, 2026 – Sep 24, 2026")
    await user.clear(input())
    await user.type(input(), "2026-10-05 to 2026-10-01{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 1), to: new Date(2026, 9, 5) })
  })

  it("a single typed date is a range with no end; nonsense is invalid", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DateRangePicker aria-label="Stay" onValueChange={onValueChange} />, opts)
    await user.type(input(), "9/9/2026{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 8, 9), to: undefined })
    await user.clear(input())
    await user.type(input(), "Sep 9 to soon{Enter}")
    expect(input()).toHaveAttribute("aria-invalid", "true")
  })

  it("two clicks in the two-month calendar complete the range and close the slip", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DateRangePicker aria-label="Stay" onValueChange={onValueChange} calendarProps={MONTH} />, opts)
    await user.click(screen.getByRole("button", { name: "Choose dates" }))
    expect(await screen.findAllByRole("grid")).toHaveLength(2)
    await user.click(await day(9))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await user.click((await screen.findAllByRole("button", { name: /October 3rd, 2026/ })).at(-1)!)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    const last = onValueChange.mock.calls.at(-1)![0] as DateRange
    expect(last.from).toEqual(new Date(2026, 8, 9))
    expect(last.to).toEqual(new Date(2026, 9, 3))
    expect(input()).toHaveValue("Sep 9, 2026 – Oct 3, 2026")
  })

  it("range presets and the two hidden inputs", async () => {
    const { user, container } = renderUI(
      <form>
        <DateRangePicker aria-label="Stay" name="from" nameTo="to" presets={[{ label: "This week", value: { from: new Date(2026, 8, 13), to: new Date(2026, 8, 19) } }]} calendarProps={MONTH} />
      </form>,
      opts,
    )
    await user.click(screen.getByRole("button", { name: "Choose dates" }))
    await user.click(await screen.findByRole("button", { name: "This week" }))
    const fd = new FormData(container.querySelector("form") as HTMLFormElement)
    expect(fd.get("from")).toBe("2026-09-13")
    expect(fd.get("to")).toBe("2026-09-19")
    expect(input()).toHaveValue("Sep 13, 2026 – Sep 19, 2026")
  })

  it("a range value is shown, controlled or not", () => {
    const { unmount } = renderUI(<DateRangePicker aria-label="Stay" defaultValue={{ from: new Date(2026, 8, 9), to: new Date(2026, 8, 24) }} />)
    expect(input()).toHaveValue("Sep 9, 2026 – Sep 24, 2026")
    unmount()
    renderUI(<DateRangePicker aria-label="Stay" value={{ from: new Date(2026, 8, 9), to: undefined }} />)
    expect(input()).toHaveValue("Sep 9, 2026 –")
  })
})

describe("DatePicker recipe, accessibility, rendering", () => {
  const req = { seed: "s", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

  it("draws the select frame: rest with hover / focus lazy, an open wash, static invalid and disabled", () => {
    const f = runRecipe(datePickerRecipe, { ...req, params: {}, box: { w: 260, h: 36 }, lazy: ["focus", "hover"] })
    expect(f.layers).toEqual(["rest", "open", "hover", "focus"])
    expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(12)
    expect((f.parts.rest ?? "").length).toBeLessThanOrEqual(8000)
    expect(runRecipe(datePickerRecipe, { ...req, params: { invalid: true }, box: { w: 260, h: 36 } }).layers).toEqual(["invalid"])
    expect(runRecipe(datePickerRecipe, { ...req, params: { disabled: true }, box: { w: 260, h: 36 } }).layers).toEqual(["disabled"])
    for (const density of ["compact", "calm"] as const) for (const dir of ["ltr", "rtl"] as const) {
      const g = Object.values(runRecipe(datePickerRecipe, { ...req, density, dir, params: {}, box: { w: 260, h: 36 }, lazy: ["focus", "hover"] }).parts).join("")
      expect(g).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
    }
  })

  it("has no axe violations closed, open, invalid, as a button and as a range", async () => {
    const { container, user, rerender } = renderUI(<DatePicker aria-label="Due" defaultValue={new Date(2026, 8, 17)} calendarProps={MONTH} />, opts)
    await axeCheck(container)
    await user.click(screen.getByRole("button", { name: "Choose date" }))
    await screen.findByRole("dialog")
    await axeCheck()
    await user.keyboard("{Escape}")
    rerender(<DatePicker aria-label="Due" invalid />)
    await axeCheck(container)
    rerender(<DatePicker aria-label="Due" typeable={false} />)
    await axeCheck(container)
    rerender(<DateRangePicker aria-label="Stay" />)
    await axeCheck(container)
  })

  it("renders on the server twice the same, and hydrates cleanly (bare and in a provider)", async () => {
    const el = <DatePicker aria-label="Due" name="due" defaultValue={new Date(2026, 8, 17)} />
    const a = renderToString(el)
    expect(renderToString(el)).toBe(a)
    expect(a).not.toMatch(/NaN|undefined|\[object/)
    expect(a).toContain('value="Sep 17, 2026"')
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      cleanup()
      const host = document.createElement("div")
      document.body.appendChild(host)
      host.innerHTML = renderToString(wrap(el))
      const err = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(el))
      })
      expect(err.mock.calls.map((c) => String(c[0])).filter((m) => !/act\(/.test(m))).toEqual([])
      err.mockRestore()
      host.remove()
    }
  })
})

describe("DatePicker review fixes (two-digit years, invalid dates, confirming a day, unreadable text in a form)", () => {
  it("parseDateInput reads a two-digit year as 2026 even without a reference, and a few more written forms", () => {
    expect(parseDateInput("9/17/26")).toEqual(new Date(2026, 8, 17))
    expect(parseDateInput("9/17/75")).toEqual(new Date(1975, 8, 17))
    expect(parseDateInput("17.9.26")).toEqual(new Date(2026, 8, 17))
    expect(parseDateInput("Sep 17 2026")).toEqual(new Date(2026, 8, 17))
    expect(parseDateInput("September 17 2026")).toEqual(new Date(2026, 8, 17))
    expect(parseDateInput("2026/9/17")).toEqual(new Date(2026, 8, 17))
    expect(parseDateInput("2/29/2027")).toBeUndefined()
    expect(parseDateInput("0026-09-17")).toBeUndefined()
  })

  it("an Invalid Date value is an empty field (it used to throw a RangeError from date-fns)", () => {
    const bad = new Date("nope")
    const { unmount } = renderUI(<DatePicker aria-label="Due" value={bad} name="due" />, opts)
    expect(input()).toHaveValue("")
    expect((document.querySelector('input[name="due"]') as HTMLInputElement).value).toBe("")
    unmount()
    renderUI(<DateRangePicker aria-label="Stay" value={{ from: bad, to: new Date(2026, 8, 20) }} name="a" nameTo="b" />, opts)
    expect(input()).toHaveValue("")
    expect(toIsoDate(bad)).toBe("")
  })

  it("Enter on the day that is already chosen confirms it and puts the slip away; it does not clear the field", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DatePicker aria-label="Due" defaultValue={new Date(2026, 8, 17)} onValueChange={onValueChange} calendarProps={MONTH} />, opts)
    input().focus()
    await user.keyboard("{ArrowDown}")
    await screen.findByRole("dialog")
    await user.keyboard("{Enter}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(input()).toHaveValue("Sep 17, 2026")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("a field you cannot type in has no other way to empty itself, so a second click on the chosen day still clears it", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DatePicker typeable={false} aria-label="Due" defaultValue={new Date(2026, 8, 17)} onValueChange={onValueChange} calendarProps={MONTH} />, opts)
    await user.click(screen.getByRole("button", { name: "Due" }))
    await user.click(await day(17))
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
  })

  it("typing something and putting the text back exactly as it was reads nothing (no onValueChange, no change of day)", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(<DatePicker aria-label="Due" defaultValue={new Date(2026, 8, 17)} onValueChange={onValueChange} />, opts)
    await user.type(input(), "x{Backspace}")
    await user.tab()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input()).toHaveValue("Sep 17, 2026")
    expect(input()).not.toHaveAttribute("aria-invalid")
  })

  it("text that cannot be read blocks the form (custom validity) until it is fixed or a day is chosen; the red box goes with it", async () => {
    const { container, user } = renderUI(
      <form>
        <DatePicker aria-label="Due" name="due" invalidMessage="Not a date." calendarProps={MONTH} />
      </form>,
      opts,
    )
    const form = container.querySelector("form") as HTMLFormElement
    expect(form.checkValidity()).toBe(true)
    await user.type(input(), "someday")
    await user.tab()
    expect(input()).toHaveAttribute("aria-invalid", "true")
    expect(form.checkValidity()).toBe(false)
    expect(input().validationMessage).toBe("Not a date.")
    await user.click(screen.getByRole("button", { name: "Choose date" }))
    await user.click(await day(9))
    expect(form.checkValidity()).toBe(true)
    expect(input()).toHaveValue("Sep 9, 2026")
    expect(input()).not.toHaveAttribute("aria-invalid")
    await user.clear(input())
    await user.type(input(), "someday")
    await user.tab()
    expect(form.checkValidity()).toBe(false)
    await user.clear(input())
    expect(form.checkValidity()).toBe(true)
  })
})

describe("Form reset", () => {
  it("a reset button puts an uncontrolled date (and range) back to its default and clears unreadable text; a controlled one is left to its parent", async () => {
    const { container, user } = renderUI(
      <form>
        <DatePicker aria-label="Due" name="due" defaultValue={new Date(2026, 8, 7)} calendarProps={MONTH} />
        <DateRangePicker aria-label="Stay" name="a" nameTo="b" defaultValue={{ from: new Date(2026, 8, 9), to: new Date(2026, 8, 12) }} />
        <DatePicker aria-label="Held" value={new Date(2026, 8, 1)} onValueChange={() => {}} />
        <button type="reset">Reset</button>
      </form>,
      opts,
    )
    const form = container.querySelector("form") as HTMLFormElement
    const [due, stay, held] = screen.getAllByRole("textbox") as HTMLInputElement[]
    await user.clear(due)
    await user.type(due, "someday")
    await user.tab()
    expect(due).toHaveAttribute("aria-invalid", "true")
    await user.clear(stay)
    await user.tab()
    expect(stay).toHaveValue("")
    expect(new FormData(form).get("a")).toBe("")
    await user.click(screen.getByRole("button", { name: "Reset" }))
    expect(due).toHaveValue("Sep 7, 2026")
    expect(due).not.toHaveAttribute("aria-invalid")
    expect(due.validity.valid).toBe(true)
    expect(stay).toHaveValue("Sep 9, 2026 – Sep 12, 2026")
    expect(new FormData(form).get("due")).toBe("2026-09-07")
    expect(new FormData(form).get("a")).toBe("2026-09-09")
    expect(new FormData(form).get("b")).toBe("2026-09-12")
    expect(held).toHaveValue("Sep 1, 2026")
  })

  it("the button-field variant resets too", async () => {
    const { user } = renderUI(
      <form>
        <DatePicker typeable={false} aria-label="Due" defaultValue={new Date(2026, 8, 7)} calendarProps={MONTH} />
        <button type="reset">Reset</button>
      </form>,
      opts,
    )
    await user.click(screen.getByRole("button", { name: "Due" }))
    await user.click(await day(9))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByRole("button", { name: "Due" })).toHaveTextContent("Sep 9, 2026")
    await user.click(screen.getByRole("button", { name: "Reset" }))
    expect(screen.getByRole("button", { name: "Due" })).toHaveTextContent("Sep 7, 2026")
  })
})
