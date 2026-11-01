import { describe, expect, it } from "vitest"

import Sidebar13 from "@/blocks/sidebar-13/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, waitFor, within } from "./_blocks-sidebar"
import { axeCheck, renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-13", Page: Sidebar13, title: "Untitled", landmarks: ["Main"], current: "Notes" })

const padRow = () => within(screen.getByRole("navigation", { name: "Main" })).getByRole("button", { name: "Settings" })
const headerButton = () => within(document.querySelector<HTMLElement>('[data-slot="page-header"]')!).getByRole("button", { name: "Settings" })

describe("sidebar-13 block", () => {
  useBlockHarness()

  it("opens the settings dialog from the header button and from the Settings row", async () => {
    const { user } = renderUI(<Sidebar13 />, opts)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await user.click(headerButton())
    const dialog = await screen.findByRole("dialog", { name: "Settings" })
    expect(dialog).toHaveAccessibleDescription("Customize your settings here.")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await user.click(padRow())
    expect(await screen.findByRole("dialog", { name: "Settings" })).toBeInTheDocument()
  })

  it("is a little app: a pad of sections, breadcrumbs, one heading per section", async () => {
    const { user } = renderUI(<Sidebar13 />, opts)
    await user.click(headerButton())
    const dialog = await screen.findByRole("dialog", { name: "Settings" })
    expect(within(dialog).queryAllByRole("main")).toHaveLength(0)
    const sections = within(dialog).getByRole("navigation", { name: "Settings sections" })
    expect(within(sections).getAllByRole("button")).toHaveLength(6)
    expect(within(dialog).getByRole("heading", { name: "Messages & media" })).toBeInTheDocument()
    expect(within(dialog).getByRole("navigation", { name: "breadcrumb" })).toHaveTextContent("SettingsMessages & media")
    await user.click(within(sections).getByRole("button", { name: "Notifications" }))
    expect(within(dialog).getByRole("heading", { name: "Notifications" })).toBeInTheDocument()
    expect(within(dialog).getByRole("navigation", { name: "breadcrumb" })).toHaveTextContent("SettingsNotifications")
  })

  it("keeps the switches you flip while you move between sections", async () => {
    const { user } = renderUI(<Sidebar13 />, opts)
    await user.click(headerButton())
    const dialog = await screen.findByRole("dialog", { name: "Settings" })
    const sections = within(dialog).getByRole("navigation", { name: "Settings sections" })
    const autoplay = within(dialog).getByRole("switch", { name: "Play stickers" })
    expect(autoplay).not.toBeChecked()
    expect(autoplay).toHaveAccessibleDescription("Let animated stickers move.")
    await user.click(autoplay)
    expect(autoplay).toBeChecked()
    await user.click(within(sections).getByRole("button", { name: "Appearance" }))
    expect(within(dialog).getByRole("switch", { name: "Tilt the paper" })).toBeChecked()
    await user.click(within(sections).getByRole("button", { name: "Messages & media" }))
    expect(within(dialog).getByRole("switch", { name: "Play stickers" })).toBeChecked()
  })

  it("has a plain menu of sections for phones", async () => {
    const { user } = renderUI(<Sidebar13 />, opts)
    await user.click(headerButton())
    const dialog = await screen.findByRole("dialog", { name: "Settings" })
    const select = within(dialog).getByRole("combobox", { name: "Section" })
    await user.selectOptions(select, "Privacy & visibility")
    expect(within(dialog).getByRole("heading", { name: "Privacy & visibility" })).toBeInTheDocument()
  })

  it("has no axe violations with the dialog open, and gives focus back when it closes", async () => {
    const { user } = renderUI(<Sidebar13 />, opts)
    const opener = padRow()
    await user.click(opener)
    await screen.findByRole("dialog", { name: "Settings" })
    await axeCheck()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(document.activeElement).toBe(opener)
  })

  it("gives focus back to whichever button opened it", async () => {
    const { user } = renderUI(<Sidebar13 />, opts)
    for (const opener of [headerButton(), padRow()]) {
      await user.click(opener)
      await screen.findByRole("dialog", { name: "Settings" })
      await user.keyboard("{Escape}")
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
      expect(document.activeElement).toBe(opener)
    }
  })
})
