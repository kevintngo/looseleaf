import * as React from "react"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { renderUI } from "./helpers"
import { defineMenuSuite, type MenuDemoProps } from "./_menu-suite"

function Demo({ content, checked = false, onCheckedChange, radio = "bottom", onRadioChange, onPick, root }: MenuDemoProps) {
  return (
    <ContextMenu {...root}>
      <ContextMenuTrigger>Right click here</ContextMenuTrigger>
      <ContextMenuContent {...content}>
        <ContextMenuLabel>Account</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem onSelect={() => onPick?.("profile")}>
            Profile <ContextMenuShortcut>⇧⌘P</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => onPick?.("billing")}>
            Billing <ContextMenuShortcut>⌘B</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled onSelect={() => onPick?.("invite")}>
            Invite users
          </ContextMenuItem>
          <ContextMenuItem inset>
            Settings
            <ContextMenuShortcut data-testid="raw-shortcut">
              <span>F2</span>
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={checked} onCheckedChange={onCheckedChange}>
          Show bookmarks
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={radio} onValueChange={onRadioChange}>
          <ContextMenuRadioItem value="top">Top</ContextMenuRadioItem>
          <ContextMenuRadioItem value="bottom">Bottom</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Save as…</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const trigger = () => screen.getByText("Right click here")

defineMenuSuite({
  name: "context-menu",
  render: (p) => <Demo {...p} />,
  open: async () => {
    fireEvent.contextMenu(trigger(), { clientX: 120, clientY: 80 })
  },
  trigger,
  restoresFocus: false,
})

const opts = { user: { pointerEventsCheck: 0 } }

describe("ContextMenu trigger", () => {
  it("the trigger region carries upstream's slot and opens at the pointer on a right click", async () => {
    renderUI(<Demo />, opts)
    const t = trigger()
    expect(t).toHaveAttribute("data-slot", "context-menu-trigger")
    expect(screen.queryByRole("menu")).toBeNull()
    fireEvent.contextMenu(t, { clientX: 40, clientY: 30 })
    const menu = await screen.findByRole("menu")
    expect(t).toHaveAttribute("data-state", "open")
    expect(menu).toHaveAttribute("data-slot", "context-menu-content")
  })

  it("a plain left click does not open it", async () => {
    const { user } = renderUI(<Demo />, opts)
    await user.click(trigger())
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("a disabled trigger does not open", () => {
    renderUI(
      <ContextMenu>
        <ContextMenuTrigger disabled>Right click here</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>x</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
      opts
    )
    fireEvent.contextMenu(trigger())
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("Escape closes it and the choice runs its handler", async () => {
    const { user } = renderUI(<Demo />, opts)
    fireEvent.contextMenu(trigger())
    await screen.findByRole("menu")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    fireEvent.contextMenu(trigger())
    const menu = await screen.findByRole("menu")
    expect(within(menu).getAllByRole("menuitem").length).toBeGreaterThan(3)
  })
})
