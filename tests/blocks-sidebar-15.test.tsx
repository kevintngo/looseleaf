import { describe, expect, it } from "vitest"

import Sidebar15 from "@/blocks/sidebar-15/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-15", Page: Sidebar15, title: "Project plan & to-dos", landmarks: ["Notes", "Calendars"], current: "Home" })

describe("sidebar-15 block", () => {
  useBlockHarness()

  it("has two pads: a folding one on the left and a fixed one, taped in, on the right", () => {
    const { container } = renderUI(<Sidebar15 />, opts)
    const left = container.querySelector('[data-slot="sidebar"][data-state]')!
    expect(left).toHaveAttribute("data-side", "left")
    const right = screen.getByRole("navigation", { name: "Calendars" })
    expect(right).toHaveAttribute("data-slot", "sidebar")
    expect(right.className).toContain("sticky")
    expect(right.className).toContain("lg:flex")
    expect(right.querySelector('[data-slot="tape"]')).toHaveAttribute("data-kind", "washi-stripes")
    expect(right.querySelector("[data-slot=sidebar-rail]")).toBeNull()
  })

  it("follows the day picked in the month", async () => {
    const { user } = renderUI(<Sidebar15 />, opts)
    const right = screen.getByRole("navigation", { name: "Calendars" })
    await user.click(within(right).getByRole("button", { name: /29th/ }))
    expect(screen.getByText("Tuesday, 29 September")).toBeInTheDocument()
  })

  it("keeps the right pad when the left one is folded", async () => {
    const { user, container } = renderUI(<Sidebar15 />, opts)
    await user.click(container.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]')!)
    expect(container.querySelector('[data-slot="sidebar"][data-state]')).toHaveAttribute("data-state", "collapsed")
    expect(screen.getByRole("navigation", { name: "Calendars" })).toBeInTheDocument()
  })

  it("sizes the right pad to the frame when contained, and to the window otherwise", () => {
    const a = renderUI(<Sidebar15 />, opts)
    expect(screen.getByRole("navigation", { name: "Calendars" }).className).toContain("h-svh")
    a.unmount()
    renderUI(<Sidebar15 contained />, opts)
    expect(screen.getByRole("navigation", { name: "Calendars" })).toHaveClass("h-full")
  })
})
