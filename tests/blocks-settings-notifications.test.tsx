import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import SettingsNotifications from "@/blocks/settings-notifications/page"
import { DEFAULT_PREFS, TIMES, rowEnabled, validate, type Prefs } from "@/blocks/settings-notifications/components/settings-notifications-data"
import Preview from "@/docs/content/blocks/settings-notifications"
import meta from "@/docs/content/blocks/settings-notifications.meta"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDrawnClean, expectHydrates, expectSsrStable } from "./_blocks-apps"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const app = (props: React.ComponentProps<typeof SettingsNotifications> = {}) => (
  <InkProvider>
    <SettingsNotifications {...props} />
  </InkProvider>
)

describe("settings-notifications rules", () => {
  it("knows which rows still send under each mode", () => {
    expect(rowEnabled("all", false)).toBe(true)
    expect(rowEnabled("mentions", false)).toBe(false)
    expect(rowEnabled("mentions", true)).toBe(true)
    expect(rowEnabled("nothing", true)).toBe(false)
  })

  it("names what cannot work", () => {
    expect(validate(DEFAULT_PREFS)).toEqual({})
    const empty: Prefs = { ...DEFAULT_PREFS, on: {} }
    expect(validate(empty).channels).toMatch(/every box is empty/)
    expect(validate({ ...empty, mode: "nothing" })).toEqual({})
    expect(validate({ ...DEFAULT_PREFS, quiet: { ...DEFAULT_PREFS.quiet, to: "22:00" } }).quiet).toMatch(/two different times/)
    expect(validate({ ...DEFAULT_PREFS, quiet: { ...DEFAULT_PREFS.quiet, days: [] } }).quiet).toMatch(/at least one day/)
    expect(TIMES).toHaveLength(48)
    expect(TIMES[0]).toEqual({ value: "00:00", label: "12:00 am" })
    expect(TIMES[25]).toEqual({ value: "12:30", label: "12:30 pm" })
  })
})

describe("settings-notifications block", () => {
  it("shows the dial, the table and the quiet hours", () => {
    renderUI(app())
    expect(screen.getByRole("heading", { level: 2, name: "Notifications" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Everything/ })).toBeChecked()
    const table = screen.getByRole("table", { name: "What goes where" })
    expect(within(table).getAllByRole("row")).toHaveLength(1 + 5)
    expect(within(table).getByRole("checkbox", { name: "Comments on my notes by email" })).toBeChecked()
    expect(within(table).getByRole("checkbox", { name: "News from Looseleaf by email" })).not.toBeChecked()
    expect(screen.getByRole("switch", { name: "Hush the desk at night" })).toBeChecked()
    expect(screen.getByRole("combobox", { name: "From" })).toHaveValue("22:00")
    expect(screen.getByRole("button", { name: "Monday" })).toHaveAttribute("aria-pressed", "true")
  })

  it("has no axe violations, also with problems showing", async () => {
    const { container, user } = renderUI(app({ defaultValue: { ...DEFAULT_PREFS, on: {} } }))
    await axeCheck(container)
    await user.click(screen.getByRole("button", { name: "Save preferences" }))
    expect(await screen.findByText(/every box is empty/)).toBeInTheDocument()
    await axeCheck(container)
  })

  it("narrows the table to what a mode can send", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("radio", { name: /Just me/ }))
    expect(screen.getByRole("checkbox", { name: "Comments on my notes by email" })).toBeEnabled()
    expect(screen.getByRole("checkbox", { name: "New followers by push" })).toBeDisabled()
    await user.click(screen.getByRole("radio", { name: /Nothing/ }))
    expect(screen.getByRole("checkbox", { name: "Comments on my notes by email" })).toBeDisabled()
    expect(screen.getByRole("switch", { name: "Hush the desk at night" })).toBeDisabled()
    expect(screen.getAllByText("Muted above.").length).toBeGreaterThan(0)
  })

  it("ticks and unticks a box and saves exactly that", async () => {
    const onSave = vi.fn(async (_p: Prefs) => {})
    const { user } = renderUI(app({ onSave }))
    await user.click(screen.getByRole("checkbox", { name: "News from Looseleaf by email" }))
    await user.click(screen.getByRole("checkbox", { name: "Comments on my notes by push" }))
    await user.click(screen.getByRole("button", { name: "Save preferences" }))
    await waitFor(() => expect(screen.getByText("Saved. We will follow these from now on.")).toBeInTheDocument())
    const saved = onSave.mock.calls[0]![0]
    expect(saved.on.news).toEqual(["email"])
    expect(saved.on.comments).toEqual(["email", "app"])
    await user.click(screen.getByRole("checkbox", { name: "News from Looseleaf by email" }))
    expect(screen.queryByText(/Saved\./)).not.toBeInTheDocument()
  })

  it("refuses quiet hours that start and end together, and tells you where", async () => {
    const onSave = vi.fn()
    const { user } = renderUI(app({ onSave }))
    await user.selectOptions(screen.getByRole("combobox", { name: "Until" }), "22:00")
    await user.click(screen.getByRole("button", { name: "Save preferences" }))
    const alerts = await screen.findAllByRole("alert")
    expect(alerts.some((a) => /two different times/.test(a.textContent ?? ""))).toBe(true)
    expect(screen.getByRole("combobox", { name: "Until" })).toHaveAttribute("aria-invalid", "true")
    expect(onSave).not.toHaveBeenCalled()
    await user.selectOptions(screen.getByRole("combobox", { name: "Until" }), "07:00")
    expect(screen.queryByText(/two different times/)).not.toBeInTheDocument()
  })

  it("wants at least one day for quiet hours", async () => {
    const { user } = renderUI(app())
    for (const d of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) await user.click(screen.getByRole("button", { name: d }))
    await user.click(screen.getByRole("button", { name: "Save preferences" }))
    expect(await screen.findByText("Pick at least one day for quiet hours.")).toBeInTheDocument()
  })

  it("sends a test with the current choices", async () => {
    const onTest = vi.fn()
    const { user } = renderUI(app({ onTest }))
    await user.click(screen.getByRole("button", { name: "Send a test" }))
    expect(await screen.findByText("A test note is on its way")).toBeInTheDocument()
    expect(onTest).toHaveBeenCalledWith(expect.objectContaining({ mode: "all" }))
  })

  it("is stable on the server and hydrates cleanly", () => {
    expectDrawnClean(app())
    expectSsrStable(app())
    expectHydrates(<SettingsNotifications />)
  })
})

describe("settings-notifications docs preview", () => {
  it("lays the block on the desk, has a title and description for the gallery, and is accessible", async () => {
    const { container } = renderUI(<InkProvider><Preview /></InkProvider>)
    expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Notifications" })).toBeInTheDocument()
    expect(meta.title.length).toBeGreaterThan(2)
    expect(meta.description).toMatch(/paper|desk/)
    expect(meta.tags?.length).toBeGreaterThan(1)
    await axeCheck(container)
  })
})
