import { describe, expect, it } from "vitest"

import Sidebar16 from "@/blocks/sidebar-16/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-16", Page: Sidebar16, title: "Margins", landmarks: ["Studio"], containedPad: "h-[calc(100%-var(--header-height))]!" })

describe("sidebar-16 block", () => {
  useBlockHarness()

  it("puts a sticky strip of paper across the window, above the pad", () => {
    const { container } = renderUI(<Sidebar16 />, opts)
    const header = container.querySelector('[data-slot="site-header"]')!
    expect(header).toHaveClass("sticky", "top-0", "z-50", "ll-paper")
    const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]')!
    expect(wrapper).toHaveClass("flex-col")
    expect(wrapper.firstElementChild).toBe(header)
    expect(container.firstElementChild!.className).toContain("--header-height")
  })

  it("starts the pad below the header and sizes it to what is left", () => {
    const a = renderUI(<Sidebar16 />, opts)
    const pad = () => a.container.querySelector('[data-slot="sidebar-container"]')!
    expect(pad().className).toContain("top-(--header-height)")
    expect(pad().className).toContain("h-[calc(100svh-var(--header-height))]!")
    a.unmount()
    const b = renderUI(<Sidebar16 contained />, opts)
    expect(b.container.querySelector('[data-slot="sidebar-container"]')!.className).toContain("h-[calc(100%-var(--header-height))]!")
  })

  it("folds the pad from a labeled button in the header", async () => {
    const { user, container } = renderUI(<Sidebar16 />, opts)
    const pad = container.querySelector('[data-slot="sidebar"][data-state]')!
    await user.click(within(container.querySelector('[data-slot="site-header"]') as HTMLElement).getByRole("button", { name: "Toggle Sidebar" }))
    expect(pad).toHaveAttribute("data-state", "collapsed")
  })

  it("has a search box in the header", async () => {
    const { user } = renderUI(<Sidebar16 />, opts)
    const box = screen.getByRole("searchbox", { name: "Search" })
    expect(within(screen.getByRole("search")).getByRole("searchbox")).toBe(box)
    await user.type(box, "margins")
    expect(box).toHaveValue("margins")
  })
})
