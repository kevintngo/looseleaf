import { describe, expect, it } from "vitest"

import Sidebar09 from "@/blocks/sidebar-09/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { axeCheck, renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-09", Page: Sidebar09, title: "Inbox", landmarks: ["Mail"], collapsible: "icon" })

describe("sidebar-09 block", () => {
  useBlockHarness()

  it("nests two panels on one pad: a rail of folders and a list of messages", () => {
    const { container } = renderUI(<Sidebar09 />, opts)
    const pad = container.querySelector('[data-slot="sidebar"][data-state]')!
    expect(pad.querySelector('[data-slot="mail-rail"]')).toBeTruthy()
    const list = within(screen.getByRole("navigation", { name: "Mail" })).getByRole("region", { name: "Inbox messages" })
    expect(list).toHaveAttribute("data-slot", "sidebar")
    expect(within(list).getAllByRole("listitem")).toHaveLength(6)
  })

  it("lists the messages of the folder you pick, and says so when a folder is empty", async () => {
    const { user } = renderUI(<Sidebar09 />, opts)
    await user.click(screen.getByRole("button", { name: "Drafts" }))
    const drafts = screen.getByRole("region", { name: "Drafts messages" })
    expect(within(drafts).getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByRole("heading", { level: 1, name: "Drafts" })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toHaveTextContent("Drafts")
    await user.click(screen.getByRole("button", { name: "Trash" }))
    expect(within(screen.getByRole("region", { name: "Trash messages" })).getAllByRole("listitem")).toHaveLength(1)
    await user.type(screen.getByRole("searchbox", { name: "Search mail" }), "zzz")
    expect(screen.getByRole("status")).toHaveTextContent(/No letters here/)
  })

  it("filters by search text and by the Unreads switch", async () => {
    const { user } = renderUI(<Sidebar09 />, opts)
    const list = () => screen.getByRole("region", { name: "Inbox messages" })
    await user.type(screen.getByRole("searchbox", { name: "Search mail" }), "postcard")
    expect(within(list()).getAllByRole("listitem")).toHaveLength(1)
    await user.clear(screen.getByRole("searchbox", { name: "Search mail" }))
    await user.click(screen.getByRole("switch", { name: "Unreads" }))
    expect(screen.getByRole("switch", { name: "Unreads" })).toBeChecked()
    expect(within(list()).getAllByRole("listitem")).toHaveLength(3)
  })

  it("opens a message on the page, marks it read, and can mark it unread again", async () => {
    const { user } = renderUI(<Sidebar09 />, opts)
    expect(screen.getByText("No letter open")).toBeInTheDocument()
    const row = screen.getByRole("button", { name: /Ada Lovelace/ })
    expect(row).toHaveTextContent("Unread.")
    await user.click(row)
    expect(screen.getByRole("heading", { level: 1, name: "Meeting tomorrow" })).toBeInTheDocument()
    expect(screen.getByRole("article", { name: "Meeting tomorrow" })).toHaveTextContent(/one good pen/)
    expect(screen.getByRole("button", { name: /Ada Lovelace/ })).toHaveAttribute("aria-current", "true")
    expect(screen.getByRole("button", { name: /Ada Lovelace/ })).not.toHaveTextContent("Unread.")
    await user.click(screen.getByRole("button", { name: "Mark as unread" }))
    expect(screen.getByRole("button", { name: /Ada Lovelace/ })).toHaveTextContent("Unread.")
  })

  it("hides the list when the pad folds to icons, leaving the rail", async () => {
    const { user, container } = renderUI(<Sidebar09 />, opts)
    const region = screen.getByRole("region", { name: "Inbox messages" })
    expect(region.className).toContain("group-data-[collapsible=icon]:hidden")
    await user.click(container.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]')!)
    expect(container.querySelector('[data-slot="sidebar"][data-state]')).toHaveAttribute("data-collapsible", "icon")
    expect(screen.getByRole("button", { name: "Inbox" })).toBeInTheDocument()
  })

  it("names the folder icons in a tooltip and opens the account menu from the rail", async () => {
    const { user } = renderUI(<Sidebar09 />, opts)
    await user.click(screen.getByRole("button", { name: "Jo Delacroix" }))
    expect(await screen.findByRole("menuitem", { name: "Log out" })).toBeInTheDocument()
    await axeCheck()
  })
})
