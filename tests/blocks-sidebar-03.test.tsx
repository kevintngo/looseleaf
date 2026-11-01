import { describe, expect, it } from "vitest"

import Sidebar03 from "@/blocks/sidebar-03/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-03", Page: Sidebar03, title: "Margins", landmarks: ["Field guide"], current: "Margins" })

describe("sidebar-03 block", () => {
  useBlockHarness()

  it("lists every section with its pages indented underneath, as nested lists", () => {
    const { container } = renderUI(<Sidebar03 />, opts)
    const nav = screen.getByRole("navigation", { name: "Field guide" })
    const subs = container.querySelectorAll('[data-slot="sidebar-menu-sub"]')
    expect(subs).toHaveLength(5)
    for (const sub of subs) expect(sub.closest("li")).toBeTruthy()
    expect(within(nav).getByRole("link", { name: "Writing on paper" })).toBeInTheDocument()
    expect(within(nav).getByRole("link", { name: "Margins" })).toHaveAttribute("aria-current", "page")
    expect(within(nav).getAllByRole("link", { name: "Margins" })).toHaveLength(1)
  })

  it("names the product in the header", () => {
    renderUI(<Sidebar03 />, opts)
    expect(screen.getByRole("link", { name: /Field guide v1\.0\.0/ })).toHaveAttribute("href", "#home")
  })

  it("marks only the current page with a drawing", () => {
    const { container } = renderUI(<Sidebar03 />, opts)
    expect(container.querySelectorAll('[data-slot="sidebar-menu-sub-button"][data-active="true"]')).toHaveLength(1)
  })
})
