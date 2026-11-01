import { describe, expect, it } from "vitest"

import Sidebar12 from "@/blocks/sidebar-12/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { axeCheck, renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-12", Page: Sidebar12, title: "Friday, 25 September", landmarks: ["Calendars"] })

describe("sidebar-12 block", () => {
  useBlockHarness()

  it("shows a month with the chosen day marked and today's page for it", () => {
    renderUI(<Sidebar12 />, opts)
    const nav = screen.getByRole("navigation", { name: "Calendars" })
    expect(within(nav).getByRole("grid")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toHaveTextContent("September 2026")
  })

  it("follows the day you pick in the month", async () => {
    const { user } = renderUI(<Sidebar12 />, opts)
    const nav = screen.getByRole("navigation", { name: "Calendars" })
    await user.click(within(nav).getByRole("button", { name: /28th/ }))
    expect(screen.getByRole("heading", { level: 1, name: "Monday, 28 September" })).toBeInTheDocument()
  })

  it("ticks calendars as checkboxes and counts them on the page", async () => {
    const { user } = renderUI(<Sidebar12 />, opts)
    const family = screen.getByRole("checkbox", { name: "Family" })
    expect(family).toHaveAttribute("aria-checked", "false")
    expect(screen.getByRole("checkbox", { name: "Work" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("main")).toHaveTextContent(/Showing 3 of 8 calendars/)
    await user.click(family)
    expect(family).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("main")).toHaveTextContent(/Showing 4 of 8 calendars/)
    family.focus()
    await user.keyboard(" ")
    expect(family).toHaveAttribute("aria-checked", "false")
  })

  it("folds calendar groups; only the first is open to begin with", async () => {
    const { user } = renderUI(<Sidebar12 />, opts)
    const nav = screen.getByRole("navigation", { name: "Calendars" })
    expect(within(nav).getByRole("button", { name: "My calendars" })).toHaveAttribute("aria-expanded", "true")
    expect(within(nav).getByRole("button", { name: "Favorites" })).toHaveAttribute("aria-expanded", "false")
    expect(within(nav).queryByRole("checkbox", { name: "Holidays" })).not.toBeInTheDocument()
    await user.click(within(nav).getByRole("button", { name: "Favorites" }))
    expect(within(nav).getByRole("checkbox", { name: "Holidays" })).toHaveAttribute("aria-checked", "true")
  })

  it("opens the account menu at the top of the pad", async () => {
    const { user } = renderUI(<Sidebar12 />, opts)
    await user.click(screen.getByRole("button", { name: /Jo Delacroix/ }))
    expect(await screen.findByRole("menuitem", { name: "Billing" })).toBeInTheDocument()
    await axeCheck()
  })
})
