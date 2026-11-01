import { describe, expect, it } from "vitest"

import Sidebar01 from "@/blocks/sidebar-01/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-01", Page: Sidebar01, title: "Margins", landmarks: ["Field guide"], current: "Margins" })

describe("sidebar-01 block", () => {
  useBlockHarness()

  it("groups the pages under a label each, and marks the current one", () => {
    renderUI(<Sidebar01 />, opts)
    const nav = screen.getByRole("navigation", { name: "Field guide" })
    for (const label of ["Getting started", "Writing on paper", "Pen reference", "Behind the scenes", "Pen pals"]) {
      expect(within(nav).getByText(label)).toBeInTheDocument()
    }
    expect(within(nav).getByRole("link", { name: "Margins" })).toHaveAttribute("aria-current", "page")
    expect(within(nav).getAllByRole("list").length).toBeGreaterThanOrEqual(5)
  })

  it("lets the margin bracket out: the mark is the last span of the current link, and the button must not clip its last span", () => {
    const { container } = renderUI(<Sidebar01 />, opts)
    const link = within(screen.getByRole("navigation", { name: "Field guide" })).getByRole("link", { name: "Margins" })
    expect(link.querySelector('[data-slot="sidebar-menu-button-mark"]')).toBe(link.lastElementChild)
    expect(container.querySelector('[data-slot="sidebar-content"]')!.className).toContain("[&_[data-slot=sidebar-menu-button-mark]]:overflow-visible!")
  })

  it("switches the edition from the header and ticks the chosen one", async () => {
    const { user } = renderUI(<Sidebar01 />, opts)
    await user.click(screen.getByRole("button", { name: /Field guide v1\.0\.1/ }))
    await user.click(await screen.findByRole("menuitem", { name: /v2\.0\.0-beta1/ }))
    expect(screen.getByRole("button", { name: /Field guide v2\.0\.0-beta1/ })).toBeInTheDocument()
  })

  it("has a search box that does not reload the page", async () => {
    const { user } = renderUI(<Sidebar01 />, opts)
    const box = screen.getByRole("searchbox", { name: "Search" })
    await user.type(box, "tape{Enter}")
    expect(box).toHaveValue("tape")
  })
})
