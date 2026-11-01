import { describe, expect, it } from "vitest"

import Sidebar05 from "@/blocks/sidebar-05/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-05", Page: Sidebar05, title: "Margins", landmarks: ["Field guide"], current: "Margins" })

describe("sidebar-05 block", () => {
  useBlockHarness()

  it("opens one section to begin with and the rest are closed", () => {
    renderUI(<Sidebar05 />, opts)
    const nav = screen.getByRole("navigation", { name: "Field guide" })
    expect(within(nav).getByRole("button", { name: "Writing on paper" })).toHaveAttribute("aria-expanded", "true")
    for (const closed of ["Getting started", "Pen reference", "Behind the scenes", "Pen pals"]) {
      expect(within(nav).getByRole("button", { name: closed })).toHaveAttribute("aria-expanded", "false")
    }
    expect(within(nav).getByRole("link", { name: "Margins" })).toBeInTheDocument()
    expect(within(nav).queryByRole("link", { name: "Welcome" })).not.toBeInTheDocument()
  })

  it("opens and closes a section with the mouse and with the keyboard", async () => {
    const { user } = renderUI(<Sidebar05 />, opts)
    const nav = screen.getByRole("navigation", { name: "Field guide" })
    const trigger = within(nav).getByRole("button", { name: "Getting started" })
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(within(nav).getByRole("link", { name: "Welcome" })).toBeInTheDocument()
    trigger.focus()
    await user.keyboard("{Enter}")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(within(nav).queryByRole("link", { name: "Welcome" })).not.toBeInTheDocument()
  })

  it("marks the state with a plus and a minus (both are drawn, CSS shows one)", () => {
    const { container } = renderUI(<Sidebar05 />, opts)
    const trigger = container.querySelector('[data-sidebar="menu-button"][aria-expanded]')!
    expect(trigger.querySelectorAll('svg[data-ink="icon"]')).toHaveLength(2)
  })
})
