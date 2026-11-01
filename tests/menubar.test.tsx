import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { expectInkLayers, mockBox, renderUI } from "./helpers"
import { defineMenuSuite, type MenuDemoProps } from "./_menu-suite"

function Demo({ content, checked = false, onCheckedChange, radio = "bottom", onRadioChange, onPick, root }: MenuDemoProps) {
  return (
    <Menubar {...root}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent {...content}>
          <MenubarLabel>Account</MenubarLabel>
          <MenubarGroup>
            <MenubarItem onSelect={() => onPick?.("profile")}>
              Profile <MenubarShortcut>⇧⌘P</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onSelect={() => onPick?.("billing")}>
              Billing <MenubarShortcut>⌘B</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled onSelect={() => onPick?.("invite")}>
              Invite users
            </MenubarItem>
            <MenubarItem inset>
              Settings
              <MenubarShortcut data-testid="raw-shortcut">
                <span>F2</span>
              </MenubarShortcut>
            </MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarCheckboxItem checked={checked} onCheckedChange={onCheckedChange}>
            Show bookmarks
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value={radio} onValueChange={onRadioChange}>
            <MenubarRadioItem value="top">Top</MenubarRadioItem>
            <MenubarRadioItem value="bottom">Bottom</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>More</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Save as…</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Delete</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

const fileTrigger = () => screen.getByRole("menuitem", { name: "File" })

defineMenuSuite({
  name: "menubar",
  render: (p) => <Demo {...p} />,
  open: async (user) => {
    await user.click(fileTrigger())
  },
  trigger: fileTrigger,
})

const opts = { user: { pointerEventsCheck: 0 } }

describe("Menubar strip", () => {
  it("is a role=menubar with upstream's slot, drawn as a strip (the bar is the host, the titles are not)", () => {
    const restore = mockBox(380, 40)
    try {
      const { getByRole, container } = renderUI(<Demo />)
      const bar = getByRole("menubar")
      expect(bar).toHaveAttribute("data-slot", "menubar")
      expect(bar).toHaveAttribute("data-ink-host")
      expect(bar).toHaveAttribute("data-ink-ready")
      expectInkLayers(bar, { min: 1, kinds: ["bar"], absolute: true, layers: ["rest"] })
      const svg = bar.querySelector(":scope > svg[data-ink=bar]")
      expect(svg).toBeTruthy()
      expect(svg!.parentElement).toBe(bar)
      for (const t of within(bar).getAllByRole("menuitem")) {
        expect(t).toHaveAttribute("data-slot", "menubar-trigger")
        expect(t.hasAttribute("data-ink-host")).toBe(false)
        expect(t.className).toContain("hover:ll-swipe")
        expect(t.className).toContain("data-[state=open]:ll-swipe")
      }
      expect(container.querySelectorAll("[data-slot=menubar-trigger]")).toHaveLength(2)
    } finally {
      restore()
    }
  })

  it("the ref reaches the bar and a seed pins the drawing", () => {
    const restore = mockBox(380, 40)
    try {
      const ref = React.createRef<HTMLDivElement>()
      const a = renderUI(<Menubar ref={ref} seed="s" aria-label="A" />)
      expect(ref.current).toBe(a.getByRole("menubar"))
      const html = a.getByRole("menubar").innerHTML
      a.unmount()
      const b = renderUI(<Menubar seed="s" aria-label="A" />)
      expect(b.getByRole("menubar").innerHTML).toBe(html)
    } finally {
      restore()
    }
  })
})

describe("Menubar behavior", () => {
  it("the open title is marked open; moving to the next title while one is open switches menus", async () => {
    const { user } = renderUI(<Demo />, opts)
    await user.click(fileTrigger())
    await screen.findByRole("menu")
    expect(fileTrigger()).toHaveAttribute("aria-expanded", "true")
    expect(fileTrigger()).toHaveAttribute("data-state", "open")
    await user.hover(screen.getByRole("menuitem", { name: "Edit" }))
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Undo" })).toBeInTheDocument())
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute("data-state", "open")
  })

  it("ArrowRight from a plain row of the open menu moves on to the next menu, ArrowLeft comes back", async () => {
    const { user } = renderUI(<Demo />, opts)
    await user.click(fileTrigger())
    await screen.findByRole("menu")
    await user.keyboard("{ArrowDown}{ArrowRight}")
    expect(await screen.findByRole("menuitem", { name: "Undo" })).toBeInTheDocument()
    expect(screen.queryByRole("menuitem", { name: /Profile/ })).toBeNull()
    await user.keyboard("{ArrowLeft}")
    expect(await screen.findByRole("menuitem", { name: /Profile/ })).toBeInTheDocument()
  })

  it("Left and Right on the bar move between titles; Enter opens", async () => {
    const { user } = renderUI(<Demo />, opts)
    fileTrigger().focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(fileTrigger()).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(await screen.findByRole("menu")).toBeInTheDocument()
  })

  it("is controlled with value + onValueChange", async () => {
    const onValueChange = vi.fn()
    const { user } = renderUI(
      <Menubar value="" onValueChange={onValueChange}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
      opts
    )
    await user.click(screen.getByRole("menuitem", { name: "File" }))
    expect(onValueChange).toHaveBeenCalledWith("file")
  })

  it("the menu opens with alignOffset -4 and a slip's gap (8) unless told otherwise", async () => {
    const { user } = renderUI(<Demo content={{ className: "w-64" }} />, opts)
    await user.click(fileTrigger())
    const menu = await screen.findByRole("menu")
    expect(menu).toHaveClass("w-64", "min-w-48")
  })
})
