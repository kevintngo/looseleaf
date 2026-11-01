import { describe, expect, it } from "vitest"

import Sidebar07 from "@/blocks/sidebar-07/page"
import { act, describeSidebarBlock, fireEvent, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { axeCheck, renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-07", Page: Sidebar07, title: "Recent sketches", landmarks: ["Studio"], current: "Recent", collapsible: "icon" })

describe("sidebar-07 block", () => {
  useBlockHarness()

  it("folds the pages of a row open and closed from the row itself", async () => {
    const { user } = renderUI(<Sidebar07 />, opts)
    const nav = screen.getByRole("navigation", { name: "Studio" })
    const sketchbook = within(nav).getByRole("button", { name: "Sketchbook" })
    expect(sketchbook).toHaveAttribute("aria-expanded", "true")
    expect(within(nav).getByRole("link", { name: "Starred" })).toBeInTheDocument()
    const stocks = within(nav).getByRole("button", { name: "Paper stocks" })
    expect(stocks).toHaveAttribute("aria-expanded", "false")
    await user.click(stocks)
    expect(within(nav).getByRole("link", { name: "Kraft" })).toBeInTheDocument()
    await user.click(sketchbook)
    expect(within(nav).queryByRole("link", { name: "Starred" })).not.toBeInTheDocument()
  })

  it("shrinks to icons, not away: the data attribute says so and the labels have a tooltip", async () => {
    const { user, container } = renderUI(<Sidebar07 />, opts)
    await user.click(container.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]')!)
    const pad = container.querySelector('[data-slot="sidebar"][data-state]')!
    expect(pad).toHaveAttribute("data-collapsible", "icon")
    await user.hover(screen.getByRole("button", { name: "Paper stocks" }))
    expect((await screen.findAllByText("Paper stocks")).length).toBeGreaterThan(1)
  })

  it("keeps the labels and chevrons from spilling out of the collapsed strip", () => {
    const { container } = renderUI(<Sidebar07 />, opts)
    const indicators = container.querySelectorAll('[data-slot="collapsible-indicator"]')
    expect(indicators.length).toBe(4)
    indicators.forEach((el) => expect(el.getAttribute("class")).toContain("group-data-[collapsible=icon]:hidden"))
    const bare = [...container.querySelectorAll('[data-sidebar="menu-button"] > span:not([aria-hidden]):not([class*="grid"])')].filter((el) => !el.classList.contains("truncate"))
    expect(bare.map((el) => el.outerHTML)).toEqual([])
  })

  it("switches team from the header menu", async () => {
    const { user } = renderUI(<Sidebar07 />, opts)
    await user.click(screen.getByRole("button", { name: /Looseleaf Studio Notebook/ }))
    await user.click(await screen.findByRole("menuitem", { name: /Pen Pals Co\./ }))
    expect(screen.getByRole("button", { name: /Pen Pals Co\. Team/ })).toBeInTheDocument()
  })

  it("opens the account menu with the keyboard and closes it with Escape", async () => {
    const { user } = renderUI(<Sidebar07 />, opts)
    const account = screen.getByRole("button", { name: /Jo Delacroix/ })
    account.focus()
    await user.keyboard("{Enter}")
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: "Log out" })).toBeInTheDocument()
    await axeCheck()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    expect(account).toHaveFocus()
  })

  it("has a menu of actions on each project that opens beside the pad", async () => {
    const { user } = renderUI(<Sidebar07 />, opts)
    await user.click(screen.getByRole("button", { name: "Actions for Postcard club" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: "Delete project" })).toBeInTheDocument()
    act(() => {
      fireEvent.keyDown(menu, { key: "Escape" })
    })
  })
})
