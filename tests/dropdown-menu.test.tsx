import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { renderUI } from "./helpers"
import { defineMenuSuite, type MenuDemoProps } from "./_menu-suite"

function Demo({ content, checked = false, onCheckedChange, radio = "bottom", onRadioChange, onPick, root }: MenuDemoProps) {
  return (
    <DropdownMenu {...root}>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent {...content}>
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onPick?.("profile")}>
            Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onPick?.("billing")}>
            Billing <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled onSelect={() => onPick?.("invite")}>
            Invite users
          </DropdownMenuItem>
          <DropdownMenuItem inset>
            Settings
            <DropdownMenuShortcut data-testid="raw-shortcut">
              <span>F2</span>
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={checked} onCheckedChange={onCheckedChange}>
          Show bookmarks
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={radio} onValueChange={onRadioChange}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Save as…</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

defineMenuSuite({
  name: "dropdown-menu",
  render: (p) => <Demo {...p} />,
  open: async (user) => {
    await user.click(screen.getByRole("button", { name: "Open" }))
  },
  trigger: () => screen.getByRole("button", { name: "Open" }),
})

const opts = { user: { pointerEventsCheck: 0 } }

describe("DropdownMenu trigger and state", () => {
  it("the trigger is a Radix button with aria-haspopup, expanded state and upstream's slot", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    const t = getByRole("button", { name: "Open" })
    expect(t).toHaveAttribute("data-slot", "dropdown-menu-trigger")
    expect(t).toHaveAttribute("aria-haspopup", "menu")
    expect(t).toHaveAttribute("aria-expanded", "false")
    await user.click(t)
    await screen.findByRole("menu")
    expect(t).toHaveAttribute("aria-expanded", "true")
    expect(t).toHaveAttribute("data-state", "open")
  })

  it("Enter and ArrowDown on the trigger open it with the first row highlighted", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    getByRole("button", { name: "Open" }).focus()
    await user.keyboard("{ArrowDown}")
    await screen.findByRole("menu")
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /Profile/ })).toHaveFocus())
  })

  it("is controlled with open + onOpenChange and uncontrolled with defaultOpen", async () => {
    const onOpenChange = vi.fn()
    const a = renderUI(<Demo root={{ open: true, onOpenChange }} />, opts)
    expect(await screen.findByRole("menu")).toBeInTheDocument()
    await a.user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
    a.unmount()
    renderUI(<Demo root={{ defaultOpen: true }} />, opts)
    expect(await screen.findByRole("menu")).toBeInTheDocument()
  })

  it("modal={false} leaves the page reachable", async () => {
    const { user, getByRole } = renderUI(<Demo root={{ modal: false }} />, opts)
    await user.click(getByRole("button", { name: "Open" }))
    await screen.findByRole("menu")
    expect(document.body.style.pointerEvents).not.toBe("none")
  })

  it("sideOffset defaults to a slip's gap (6) and every Radix content prop passes through", async () => {
    const { user, getByRole } = renderUI(<Demo content={{ side: "top", "aria-label": "Account menu", className: "w-56" }} />, opts)
    await user.click(getByRole("button", { name: "Open" }))
    const menu = await screen.findByRole("menu")
    expect(menu).toHaveClass("w-56")
    expect(menu).toHaveAttribute("data-side", "top")
    expect(within(menu).getAllByRole("menuitem").length).toBeGreaterThan(3)
  })
})
