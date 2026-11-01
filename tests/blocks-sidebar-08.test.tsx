import { describe, expect, it } from "vitest"

import Sidebar08 from "@/blocks/sidebar-08/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-08", Page: Sidebar08, title: "Recent sketches", landmarks: ["Studio"], current: "Sketchbook" })

describe("sidebar-08 block", () => {
  useBlockHarness()

  it("is the inset variant: a margin round the pad and a sheet for the page", () => {
    const { container } = renderUI(<Sidebar08 />, opts)
    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute("data-variant", "inset")
    const page = container.querySelector('[data-slot="sidebar-inset"]')!
    expect(page).toHaveClass("ll-paper")
    expect(page.className).toContain("peer-data-[variant=inset]:m-2")
  })

  it("lets the margin bracket out: the mark is the last span of the current link, and the button must not clip its last span", () => {
    const { container } = renderUI(<Sidebar08 />, opts)
    const link = within(screen.getByRole("navigation", { name: "Studio" })).getByRole("link", { name: "Sketchbook" })
    expect(link.querySelector('[data-slot="sidebar-menu-button-mark"]')).toBe(link.lastElementChild)
    expect(container.querySelector('[data-slot="sidebar-content"]')!.className).toContain("[&_[data-slot=sidebar-menu-button-mark]]:overflow-visible!")
  })

  it("splits a row into a link and a fold button, and only the fold button folds", async () => {
    const { user } = renderUI(<Sidebar08 />, opts)
    const nav = screen.getByRole("navigation", { name: "Studio" })
    expect(within(nav).getByRole("link", { name: "Paper stocks" })).toHaveAttribute("href", "#paper-stocks")
    const fold = within(nav).getByRole("button", { name: "Show pages in Paper stocks" })
    expect(fold).toHaveAttribute("aria-expanded", "false")
    await user.click(fold)
    expect(fold).toHaveAttribute("aria-expanded", "true")
    expect(within(nav).getByRole("link", { name: "Ledger" })).toBeInTheDocument()
    await user.click(within(nav).getByRole("link", { name: "Paper stocks" }))
    expect(fold).toHaveAttribute("aria-expanded", "true")
  })

  it("puts support and feedback at the foot as small links", () => {
    renderUI(<Sidebar08 />, opts)
    const support = screen.getByRole("link", { name: "Support" })
    expect(support).toHaveAttribute("data-size", "sm")
    expect(screen.getByRole("link", { name: "Feedback" })).toBeInTheDocument()
  })

  it("opens the project menu with its destructive item marked", async () => {
    const { user } = renderUI(<Sidebar08 />, opts)
    await user.click(screen.getByRole("button", { name: "Actions for Field trip" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: "Delete project" })).toHaveAttribute("data-variant", "destructive")
  })
})
