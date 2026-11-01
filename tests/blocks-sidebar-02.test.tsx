import { describe, expect, it } from "vitest"

import Sidebar02 from "@/blocks/sidebar-02/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-02", Page: Sidebar02, title: "Margins", landmarks: ["Field guide"], current: "Margins" })

describe("sidebar-02 block", () => {
  useBlockHarness()

  it("folds a section away from its label and opens it again", async () => {
    const { user } = renderUI(<Sidebar02 />, opts)
    const nav = screen.getByRole("navigation", { name: "Field guide" })
    const label = within(nav).getByRole("button", { name: "Writing on paper" })
    expect(label).toHaveAttribute("aria-expanded", "true")
    expect(within(nav).getByRole("link", { name: "Margins" })).toBeInTheDocument()
    await user.click(label)
    expect(label).toHaveAttribute("aria-expanded", "false")
    expect(within(nav).queryByRole("link", { name: "Margins" })).not.toBeInTheDocument()
    expect(within(nav).getByRole("link", { name: "Welcome" })).toBeInTheDocument()
    await user.click(label)
    expect(within(nav).getByRole("link", { name: "Margins" })).toHaveAttribute("aria-current", "page")
  })

  it("lets the margin bracket out: the mark is the last span of the current link, and the button must not clip its last span", () => {
    const { container } = renderUI(<Sidebar02 />, opts)
    const link = within(screen.getByRole("navigation", { name: "Field guide" })).getByRole("link", { name: "Margins" })
    expect(link.querySelector('[data-slot="sidebar-menu-button-mark"]')).toBe(link.lastElementChild)
    expect(container.querySelector('[data-slot="sidebar-content"]')!.className).toContain("[&_[data-slot=sidebar-menu-button-mark]]:overflow-visible!")
  })

  it("folds with the keyboard", async () => {
    const { user } = renderUI(<Sidebar02 />, opts)
    const label = screen.getByRole("button", { name: "Pen reference" })
    label.focus()
    await user.keyboard("{Enter}")
    expect(label).toHaveAttribute("aria-expanded", "false")
    await user.keyboard(" ")
    expect(label).toHaveAttribute("aria-expanded", "true")
  })

  it("keeps the header as a strip of paper that sticks to the top", () => {
    const { container } = renderUI(<Sidebar02 />, opts)
    expect(container.querySelector("[data-slot=page-header]")).toHaveClass("sticky", "top-0", "ll-paper")
  })
})
