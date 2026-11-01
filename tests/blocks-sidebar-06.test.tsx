import { describe, expect, it } from "vitest"

import Sidebar06 from "@/blocks/sidebar-06/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { axeCheck, renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-06", Page: Sidebar06, title: "Margins", landmarks: ["Field guide"] })

describe("sidebar-06 block", () => {
  useBlockHarness()

  it("opens a section's pages in a menu beside the pad", async () => {
    const { user } = renderUI(<Sidebar06 />, opts)
    await user.click(screen.getByRole("button", { name: "Writing on paper" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: "Margins" })).toHaveAttribute("href", "#margins")
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(12)
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Writing on paper" })).toHaveFocus()
  })

  it("says where you are while the pages are folded away: the section is marked, and so is the page in its menu", async () => {
    const { user } = renderUI(<Sidebar06 />, opts)
    const section = screen.getByRole("button", { name: "Writing on paper" })
    expect(section).toHaveAttribute("data-active", "true")
    expect(section).toHaveAttribute("aria-current", "true")
    const other = screen.getByRole("button", { name: "Pen reference" })
    expect(other).toHaveAttribute("data-active", "false")
    expect(other).not.toHaveAttribute("aria-current")
    await user.click(section)
    const menu = await screen.findByRole("menu")
    const here = within(menu).getByRole("menuitem", { name: "Margins" })
    expect(here).toHaveAttribute("aria-current", "page")
    expect(here).toHaveClass("font-bold")
    expect(within(menu).getByRole("menuitem", { name: "Sticky notes" })).not.toHaveAttribute("aria-current")
  })

  it("has no axe violations with a menu open", async () => {
    const { user } = renderUI(<Sidebar06 />, opts)
    await user.click(screen.getByRole("button", { name: "Pen reference" }))
    await screen.findByRole("menu")
    await axeCheck()
  })

  it("signs up from the card in the foot of the pad", async () => {
    const { user } = renderUI(<Sidebar06 />, opts)
    const email = screen.getByRole("textbox", { name: "Email address" })
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent(/does not look like an email/)
    expect(email).toHaveAttribute("aria-invalid", "true")
    expect(email).toHaveAccessibleDescription(/does not look like an email/)
    await user.type(email, "jo@looseleaf.example")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(screen.getByRole("status")).toHaveTextContent(/Thank you/)
    expect(screen.queryByRole("textbox", { name: "Email address" })).not.toBeInTheDocument()
  })
})
