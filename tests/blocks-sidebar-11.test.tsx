import { describe, expect, it } from "vitest"

import Sidebar11 from "@/blocks/sidebar-11/page"
import { describeSidebarBlock, opts, screen, useBlockHarness, within } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

describeSidebarBlock({ name: "sidebar-11", Page: Sidebar11, title: "button.tsx", landmarks: ["Files"] })

describe("sidebar-11 block", () => {
  useBlockHarness()

  it("is valid list markup all the way down (only li inside ul)", () => {
    const { container } = renderUI(<Sidebar11 />, opts)
    for (const ul of container.querySelectorAll("ul")) {
      for (const child of Array.from(ul.children)) if (!child.matches("[data-ink]")) expect(child.tagName).toBe("LI")
    }
  })

  it("opens components/ui to begin with and marks button.tsx as the open file", () => {
    renderUI(<Sidebar11 />, opts)
    const nav = screen.getByRole("navigation", { name: "Files" })
    expect(within(nav).getByRole("button", { name: "components" })).toHaveAttribute("aria-expanded", "true")
    expect(within(nav).getByRole("button", { name: "ui" })).toHaveAttribute("aria-expanded", "true")
    expect(within(nav).getByRole("button", { name: "button.tsx" })).toHaveAttribute("data-active", "true")
    expect(within(nav).getByRole("button", { name: "app" })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toHaveTextContent("componentsuibutton.tsx")
  })

  it("folds a folder open to any depth", async () => {
    const { user } = renderUI(<Sidebar11 />, opts)
    const nav = screen.getByRole("navigation", { name: "Files" })
    await user.click(within(nav).getByRole("button", { name: "app" }))
    await user.click(within(nav).getByRole("button", { name: "api" }))
    await user.click(within(nav).getByRole("button", { name: "hello" }))
    expect(within(nav).getByRole("button", { name: "route.ts" })).toBeInTheDocument()
  })

  it("follows the file you pick, from the tree and from the changes", async () => {
    const { user } = renderUI(<Sidebar11 />, opts)
    const nav = screen.getByRole("navigation", { name: "Files" })
    await user.click(within(nav).getByRole("button", { name: "card.tsx" }))
    expect(screen.getByRole("heading", { level: 1, name: "card.tsx" })).toBeInTheDocument()
    expect(within(nav).getByRole("button", { name: "card.tsx" })).toHaveAttribute("data-active", "true")
    expect(within(nav).getByRole("button", { name: "button.tsx" })).toHaveAttribute("data-active", "false")
    await user.click(within(nav).getAllByRole("button", { name: "README.md" })[0]!)
    expect(screen.getByRole("heading", { level: 1, name: "README.md" })).toBeInTheDocument()
  })

  it("says what changed in words as well as letters", () => {
    renderUI(<Sidebar11 />, opts)
    const nav = screen.getByRole("navigation", { name: "Files" })
    expect(within(nav).getAllByText("modified", { selector: ".sr-only" })).toHaveLength(2)
    expect(within(nav).getAllByText("untracked", { selector: ".sr-only" })).toHaveLength(1)
  })

  it("moves through the tree with the keyboard", async () => {
    const { user } = renderUI(<Sidebar11 />, opts)
    const nav = screen.getByRole("navigation", { name: "Files" })
    const lib = within(nav).getByRole("button", { name: "lib" })
    lib.focus()
    await user.keyboard("{Enter}")
    expect(lib).toHaveAttribute("aria-expanded", "true")
    await user.keyboard(" ")
    expect(lib).toHaveAttribute("aria-expanded", "false")
  })
})
