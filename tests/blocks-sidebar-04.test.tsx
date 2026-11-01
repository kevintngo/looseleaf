import { describe, expect, it } from "vitest"

import Sidebar04 from "@/blocks/sidebar-04/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-04", Page: Sidebar04, title: "Margins", landmarks: ["Field guide"], current: "Margins" })

describe("sidebar-04 block", () => {
  useBlockHarness()

  it("floats: a set-down pad, 19rem wide", () => {
    const { container } = renderUI(<Sidebar04 />, opts)
    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute("data-variant", "floating")
    expect(container.querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]')!.style.getPropertyValue("--sidebar-width")).toBe("19rem")
  })

  it("makes the page beside it a sheet with its own margin", () => {
    const { container } = renderUI(<Sidebar04 />, opts)
    const page = container.querySelector('[data-slot="sidebar-inset"]')!
    expect(page).toHaveClass("ll-paper")
    expect(page.className).toContain("peer-data-[variant=floating]:m-2")
  })

  it("lists the sections and their pages", () => {
    renderUI(<Sidebar04 />, opts)
    const nav = screen.getByRole("navigation", { name: "Field guide" })
    expect(within(nav).getAllByRole("list").length).toBeGreaterThan(5)
    expect(within(nav).getByRole("link", { name: "Chalk" })).toBeInTheDocument()
  })
})
