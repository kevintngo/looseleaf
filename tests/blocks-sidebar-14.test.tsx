import { describe, expect, it } from "vitest"

import Sidebar14 from "@/blocks/sidebar-14/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-14", Page: Sidebar14, title: "Margins", landmarks: ["On this page"], current: "The pencil rule" })

describe("sidebar-14 block", () => {
  useBlockHarness()

  it("hangs the pad on the right, after the page", () => {
    const { container } = renderUI(<Sidebar14 />, opts)
    const pad = container.querySelector('[data-slot="sidebar"][data-state]')!
    expect(pad).toHaveAttribute("data-side", "right")
    const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]')!
    const kids = Array.from(wrapper.children)
    expect(kids.indexOf(container.querySelector('[data-slot="sidebar-inset"]')!)).toBeLessThan(kids.indexOf(pad))
    expect(pad.querySelector('[data-slot="sidebar-container"]')!.className).toContain("right-0")
  })

  it("puts the fold button at the far end of the header", () => {
    const { container } = renderUI(<Sidebar14 />, opts)
    const header = container.querySelector('[data-slot="page-header"]')!
    const trigger = header.querySelector('[data-slot="sidebar-trigger"]')!
    expect(trigger.className).toContain("ms-auto")
    expect(header.lastElementChild === trigger || header.querySelector("[data-slot=separator]") === header.lastElementChild).toBe(true)
  })

  it("lists the headings of the page with their sub-headings", () => {
    renderUI(<Sidebar14 />, opts)
    const nav = screen.getByRole("navigation", { name: "On this page" })
    expect(within(nav).getByText("Table of contents")).toBeInTheDocument()
    expect(within(nav).getByRole("link", { name: "Drawing a margin" })).toBeInTheDocument()
    expect(within(nav).getByRole("link", { name: "The pencil rule" })).toHaveAttribute("aria-current", "page")
  })
})
