import { describe, expect, it } from "vitest"

import Sidebar10 from "@/blocks/sidebar-10/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { axeCheck, renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-10", Page: Sidebar10, title: "Project plan & to-dos", landmarks: ["Notes"], current: "Home" })

describe("sidebar-10 block", () => {
  useBlockHarness()

  it("opens the page's actions in a popover built from the pad's own menu parts", async () => {
    const { user } = renderUI(<Sidebar10 />, opts)
    await user.click(screen.getByRole("button", { name: "More actions" }))
    const popover = await screen.findByRole("dialog", { name: "Page actions" })
    expect(popover.querySelectorAll('[data-slot="sidebar-menu-button"]').length).toBe(13)
    expect(popover.querySelector('[data-slot="sidebar"]')).toBeNull()
    expect(within(popover).getByRole("button", { name: "Copy link" })).toBeInTheDocument()
    await axeCheck()
    await user.click(within(popover).getByRole("button", { name: "Export" }))
    expect(screen.queryByRole("dialog", { name: "Page actions" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "More actions" })).toHaveFocus()
  })

  it("closes the popover with Escape", async () => {
    const { user } = renderUI(<Sidebar10 />, opts)
    await user.click(screen.getByRole("button", { name: "More actions" }))
    await screen.findByRole("dialog", { name: "Page actions" })
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog", { name: "Page actions" })).not.toBeInTheDocument()
  })

  it("stars and un-stars the page (a toggle button)", async () => {
    const { user } = renderUI(<Sidebar10 />, opts)
    const star = screen.getByRole("button", { name: "Add to favorites" })
    expect(star).toHaveAttribute("aria-pressed", "false")
    await user.click(star)
    expect(screen.getByRole("button", { name: "Remove from favorites" })).toHaveAttribute("aria-pressed", "true")
  })

  it("has favorites with an action menu each, and workspaces that fold open", async () => {
    const { user } = renderUI(<Sidebar10 />, opts)
    const nav = screen.getByRole("navigation", { name: "Notes" })
    expect(within(nav).getAllByRole("button", { name: /^Actions for / })).toHaveLength(5)
    const fold = within(nav).getByRole("button", { name: "Show pages in Home life" })
    expect(fold).toHaveAttribute("aria-expanded", "false")
    await user.click(fold)
    expect(within(nav).getByRole("link", { name: "Daily journal" })).toBeInTheDocument()
    await user.click(within(nav).getByRole("button", { name: "Actions for Reading list" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: "Delete" })).toHaveAttribute("data-variant", "destructive")
  })

  it("shows the unread count in the margin", () => {
    renderUI(<Sidebar10 />, opts)
    expect(screen.getByRole("link", { name: "Inbox" }).closest("li")).toHaveTextContent("10")
  })
})
