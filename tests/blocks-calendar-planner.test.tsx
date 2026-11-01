import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import CalendarPlanner from "@/blocks/calendar-planner/page"
import { after, clock, dayKey, events, onDay, parseDay } from "@/blocks/calendar-planner/components/calendar-planner-data"
import { icons } from "@/lib/ink/art/icons"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

const sources = import.meta.glob("../src/blocks/calendar-planner/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>
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
  restore = mockBox(320, 320)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const day = (name: RegExp) => screen.getByRole("button", { name })
const dayCard = () => screen.getByRole("heading", { level: 2, name: /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) \d/ }).closest("[data-slot=index-card]") as HTMLElement
const updates = () => screen.getByRole("status", { name: "Planner updates" })

describe("calendar-planner dates", () => {
  it("turns text days into local dates and back without drifting", () => {
    const d = parseDay("2026-03-01")
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 2, 1, 0])
    expect(dayKey(d)).toBe("2026-03-01")
    expect(clock("09:30")).toBe("9:30")
  })

  it("orders a day by start time and finds what comes after it", () => {
    expect(onDay(events, "2026-09-25").map((e) => e.start)).toEqual(["09:30", "12:30", "16:00"])
    expect(after(events, "2026-09-25", 3).map((e) => e.date)).toEqual(["2026-09-26", "2026-09-26", "2026-09-28"])
  })
})

describe("calendar-planner block", () => {

  it("only names icons that are drawn", () => {
    const names = namedIcons()
    expect(names.size).toBeGreaterThan(1)
    expect([...names].filter((n) => !(n in icons))).toEqual([])
  })
  it("keeps the key to the dots under the month it explains, as a list a screen reader can count", () => {
    renderUI(<CalendarPlanner />, opts)
    const key = screen.getByRole("list", { name: "What the dots mean" })
    expect(within(key).getAllByRole("listitem")).toHaveLength(5)
    expect(screen.getByRole("grid").compareDocumentPosition(key) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(key.compareDocumentPosition(dayCard()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(key).toHaveAttribute("role", "list")
  })

  it("starts on today: a level-one month, a hand-ruled grid, today's card with three lines", () => {
    const { container } = renderUI(<CalendarPlanner />, opts)
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1, name: "September 2026" })).toBeInTheDocument()
    expect(screen.getByRole("grid")).toBeInTheDocument()
    const card = dayCard()
    expect(within(card).getByRole("heading", { level: 2, name: "Friday 25 September" })).toBeInTheDocument()
    expect(within(card).getByText("today")).toBeInTheDocument()
    expect(within(card).getAllByRole("listitem")).toHaveLength(3)
    expect(within(card).getByText("Studio stand-up")).toBeInTheDocument()
    expect(within(card).getByText("three things")).toBeInTheDocument()
    expect(container.querySelector('svg[data-ink="calendar"]')).toBeTruthy()
    expectInkLayers(container, { min: 1 })
  })

  it("hangs the clip between the two month arrows, not on the sheet where it would cover the next one", () => {
    const { container } = renderUI(<CalendarPlanner />, opts)
    const sheet = container.querySelector("[data-slot=calendar]") as HTMLElement
    const clips = container.querySelectorAll("[data-slot=fastener]")
    expect(clips).toHaveLength(1)
    expect(sheet.contains(clips[0])).toBe(false)
    expect(clips[0]).toHaveClass("right-[3.125rem]")
    expect(clips[0].parentElement).toContainElement(sheet)
  })

  it("names a day with its events for a screen reader, and draws dots for them", () => {
    const { container } = renderUI(<CalendarPlanner />, opts)
    expect(day(/^Today, Friday, September 25th, 2026, selected, 3 events$/)).toBeInTheDocument()
    expect(day(/^Sunday, September 27th, 2026$/)).toBeInTheDocument()
    expect(day(/^Saturday, September 26th, 2026, 2 events$/)).toBeInTheDocument()
    expect(container.querySelector('[data-day="2026-09-26"] [aria-hidden=true]')).toBeTruthy()
    expect(container.querySelector('[data-day="2026-09-27"] span[aria-hidden=true]')).toBeNull()
  })

  it("chooses another day: the card and the coming-up list follow", async () => {
    const { user } = renderUI(<CalendarPlanner />, opts)
    await user.click(day(/^Saturday, September 26th, 2026/))
    expect(within(dayCard()).getByRole("heading", { level: 2, name: "Saturday 26 September" })).toBeInTheDocument()
    expect(within(dayCard()).getByText("Ada's birthday supper")).toBeInTheDocument()
    expect(within(dayCard()).queryByText("today")).not.toBeInTheDocument()
    const next = screen.getByRole("heading", { level: 2, name: "Coming up" }).closest("[data-slot=index-card]") as HTMLElement
    expect(within(next).getAllByRole("listitem")).toHaveLength(5)
    expect(within(next).queryByText("Ada's birthday supper")).not.toBeInTheDocument()
    expect(within(next).getByText("Print the price tags")).toBeInTheDocument()
  })

  it("says so on a free day and keeps a day selected when it is pressed again", async () => {
    const { user } = renderUI(<CalendarPlanner />, opts)
    await user.click(day(/^Sunday, September 27th, 2026/))
    expect(within(dayCard()).getByText("Nothing planned. Leave it that way?")).toBeInTheDocument()
    await user.click(day(/^Sunday, September 27th, 2026, selected/))
    expect(day(/^Sunday, September 27th, 2026, selected/)).toBeInTheDocument()
  })

  it("moves to another month with the arrows, and Today comes back", async () => {
    const { user } = renderUI(<CalendarPlanner />, opts)
    await user.click(screen.getByRole("button", { name: /next month/i }))
    expect(screen.getByRole("heading", { level: 1, name: "October 2026" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Today" }))
    expect(screen.getByRole("heading", { level: 1, name: "September 2026" })).toBeInTheDocument()
  })

  it("adds an event: checks it first, then puts it on the chosen day and says so", async () => {
    const { user } = renderUI(<CalendarPlanner />, opts)
    await user.click(day(/^Sunday, September 27th, 2026/))
    await user.click(screen.getByRole("button", { name: "New event" }))
    const dialog = await screen.findByRole("dialog", { name: "A new event" })
    expect(within(dialog).getByLabelText("Which day?")).toHaveValue("2026-09-27")
    await user.click(within(dialog).getByRole("button", { name: "Add it" }))
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Give the event a name.")
    expect(within(dialog).getByLabelText("What is happening?")).toHaveAttribute("aria-invalid", "true")
    await user.type(within(dialog).getByLabelText("What is happening?"), "Long walk")
    await user.clear(within(dialog).getByLabelText("To"))
    await user.type(within(dialog).getByLabelText("To"), "08:00")
    await user.click(within(dialog).getByRole("button", { name: "Add it" }))
    expect(within(dialog).getByRole("alert")).toHaveTextContent("The end has to come after the start.")
    await user.clear(within(dialog).getByLabelText("To"))
    await user.type(within(dialog).getByLabelText("To"), "11:30")
    await user.click(within(dialog).getByRole("button", { name: "Add it" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(within(dayCard()).getByText("Long walk")).toBeInTheDocument()
    expect(updates()).toHaveTextContent("Added “Long walk” on Sunday 27 September.")
    expect(day(/^Sunday, September 27th, 2026, selected, 1 event$/)).toBeInTheDocument()
  })

  it("changes an event from its line, and gives the keyboard back to that line", async () => {
    const { user } = renderUI(<CalendarPlanner />, opts)
    const line = within(dayCard()).getByRole("button", { name: /Lunch with Ada/ })
    await user.click(line)
    const dialog = await screen.findByRole("dialog", { name: "Change the event" })
    const title = within(dialog).getByLabelText("What is happening?")
    expect(title).toHaveValue("Lunch with Ada")
    await user.clear(title)
    await user.type(title, "Lunch with Ada and Jo")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    const changed = within(dayCard()).getByRole("button", { name: /Lunch with Ada and Jo/ })
    expect(updates()).toHaveTextContent("Saved “Lunch with Ada and Jo”")
    await waitFor(() => expect(changed).toHaveFocus())
  })

  it("moves an event to another day when its date is changed", async () => {
    const { user } = renderUI(<CalendarPlanner />, opts)
    await user.click(within(dayCard()).getByRole("button", { name: /Post office run/ }))
    const dialog = await screen.findByRole("dialog")
    const date = within(dialog).getByLabelText("Which day?")
    await user.clear(date)
    await user.type(date, "2026-09-28")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(within(dayCard()).getByRole("heading", { level: 2, name: "Monday 28 September" })).toBeInTheDocument()
    expect(within(dayCard()).getByText("Post office run")).toBeInTheDocument()
  })

  it("deletes an event", async () => {
    const { user } = renderUI(<CalendarPlanner />, opts)
    await user.click(within(dayCard()).getByRole("button", { name: /Post office run/ }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Delete" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(within(dayCard()).queryByText("Post office run")).not.toBeInTheDocument()
    expect(updates()).toHaveTextContent("Deleted “Post office run”.")
    expect(within(dayCard()).getByText("two things")).toBeInTheDocument()
  })

  it("closes with Escape and returns focus to the button that opened it", async () => {
    const { user } = renderUI(<CalendarPlanner />, opts)
    await user.click(screen.getByRole("button", { name: "New event" }))
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole("button", { name: "New event" })).toHaveFocus())
  })

  it("has no axe violations, with and without the dialog", async () => {
    const { user, container } = renderUI(<CalendarPlanner />, opts)
    await axeCheck(container)
    await user.click(screen.getByRole("button", { name: "New event" }))
    await screen.findByRole("dialog")
    await axeCheck()
  })

  it("mounts under StrictMode without a warning", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    renderUI(
      <React.StrictMode>
        <CalendarPlanner />
      </React.StrictMode>,
      opts,
    )
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })

  it("renders the same on the server twice and hydrates without a warning", () => {
    const tree = <CalendarPlanner />
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
