import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, waitFor, within } from "@testing-library/react"
import type { UserEvent } from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { parseShortcut } from "@/lib/menu-styles"
import { axeCheck, mockBox, renderUI } from "./helpers"

export interface MenuDemoProps {
  content?: Record<string, unknown>
  checked?: boolean
  onCheckedChange?: (v: boolean) => void
  radio?: string
  onRadioChange?: (v: string) => void
  onPick?: (what: string) => void
  root?: Record<string, unknown>
}

export interface MenuKit {
  name: "dropdown-menu" | "context-menu" | "menubar"
  render: (p: MenuDemoProps) => React.ReactElement
  open: (user: UserEvent) => Promise<void>
  trigger: () => HTMLElement
  restoresFocus?: boolean
}

const opts = { user: { pointerEventsCheck: 0 } }

export function defineMenuSuite(kit: MenuKit) {
  const { name } = kit
  const slot = (s: string) => `${name}-${s}`
  let restore = () => {}
  beforeEach(() => {
    restore = mockBox(120, 32)
  })
  afterEach(() => {
    restore()
    document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
  })

  const openMenu = async (p: MenuDemoProps = {}) => {
    const r = renderUI(kit.render(p), opts)
    await kit.open(r.user)
    const menu = await screen.findByRole("menu")
    return { ...r, menu }
  }

  describe(`${name} slip`, () => {
    it("opens as a role=menu that is a slip of paper (a CSS sheet, no svg) above dialogs, scrolling in its own viewport", async () => {
      const { menu } = await openMenu()
      expect(menu).toHaveAttribute("data-slot", slot("content"))
      expect(menu).toHaveClass("ll-paper", "ll-stock-slip", "z-(--ll-z-popover)")
      expect(menu).toHaveAttribute("data-edge", "cut")
      expect(menu.querySelector(':scope > svg[data-ink="sheet"]')).toBeNull()
      expect(menu.className).not.toMatch(/overflow-(auto|hidden|y-auto|x-hidden)/)
      const viewport = menu.querySelector(`:scope > [data-slot="${slot("viewport")}"]`)
      expect(viewport).not.toBeNull()
      expect(viewport!.className).toContain("overflow-y-auto")
      expect(viewport!.className).toContain("overflow-x-hidden")
    })

    it("lays its parts out with upstream's data-slots and roles", async () => {
      const { menu } = await openMenu()
      for (const part of ["label", "item", "separator", "checkbox-item", "radio-group", "radio-item", "sub-trigger", "shortcut", "group"]) {
        expect(menu.querySelector(`[data-slot="${slot(part)}"]`), part).not.toBeNull()
      }
      expect(within(menu).getByRole("menuitem", { name: /Profile/ })).toHaveAttribute("data-slot", slot("item"))
      expect(within(menu).getByRole("menuitemcheckbox", { name: "Show bookmarks" })).toHaveAttribute("data-slot", slot("checkbox-item"))
      expect(within(menu).getAllByRole("menuitemradio").map((r) => r.textContent)).toEqual(["Top", "Bottom"])
      expect(within(menu).getAllByRole("separator").length).toBeGreaterThanOrEqual(3)
      const del = within(menu).getByRole("menuitem", { name: "Delete" })
      expect(del).toHaveAttribute("data-variant", "destructive")
      expect(within(menu).getByRole("menuitem", { name: /Billing/ })).toHaveAttribute("data-variant", "default")
      expect(within(menu).getByRole("menuitem", { name: /Invite/ })).toHaveAttribute("aria-disabled", "true")
    })

    it("draws no ink per row: the highlighter is a CSS background, the tick and dot are icons, only keycaps and rules are hosts", async () => {
      const { menu } = await openMenu()
      for (const row of menu.querySelectorAll('[role^="menuitem"]')) {
        expect(row.hasAttribute("data-ink-host"), row.textContent ?? "").toBe(false)
        expect(row.querySelector(':scope > svg[data-ink]:not([data-ink="icon"])'), row.textContent ?? "").toBeNull()
      }
      const item = within(menu).getByRole("menuitem", { name: /Billing/ })
      expect(item.className).toContain("data-[highlighted]:ll-swipe")
      expect(item.className).toContain("data-[disabled]:pointer-events-none")
      const kinds = new Set(Array.from(menu.querySelectorAll("[data-ink]")).map((n) => n.getAttribute("data-ink")))
      expect([...kinds].every((k) => ["icon", "keycap", "rule"].includes(k!)), [...kinds].join()).toBe(true)
    })

    it("a destructive row hatches instead of highlighting, an inset row lines up with the ticked rows", async () => {
      const { menu } = await openMenu()
      const del = within(menu).getByRole("menuitem", { name: "Delete" })
      expect(del.className).toContain("data-[variant=destructive]:text-red")
      expect(del.className).toContain("repeating-linear-gradient")
      const inset = within(menu).getByRole("menuitem", { name: /Settings/ })
      expect(inset).toHaveAttribute("data-inset", "true")
      expect(inset.className).toContain("data-[inset]:ps-9")
      expect(within(menu).getByRole("menuitemcheckbox").className).toContain("ps-9")
    })

    it("draws a shortcut as keycaps: ⇧⌘P is Shift, a drawn command glyph and P; a shortcut that is not a string is put in as it is", async () => {
      const { menu } = await openMenu()
      const profile = within(menu).getByRole("menuitem", { name: /Profile/ })
      const caps = profile.querySelectorAll("kbd")
      expect(Array.from(caps).map((k) => k.textContent)).toEqual(["Shift", "", "P"])
      expect(caps[1].querySelector('svg[data-icon="command"]')).toHaveAttribute("aria-label", "Command")
      expect(caps[0]).toHaveAttribute("data-slot", "kbd")
      expect(within(menu).getByRole("menuitem", { name: /Billing/ }).querySelectorAll("kbd")).toHaveLength(2)
      const raw = menu.querySelector('[data-testid="raw-shortcut"]')!
      expect(raw).toHaveTextContent("F2")
      expect(raw.querySelector("kbd")).toBeNull()
    })

    it("parses shortcuts", () => {
      const text = (s: string) => parseShortcut(s).map((k) => ("icon" in k ? k.icon : k.text))
      expect(text("⌘S")).toEqual(["command", "S"])
      expect(text("⇧⌘P")).toEqual(["Shift", "command", "P"])
      expect(text("Ctrl+K")).toEqual(["Ctrl", "K"])
      expect(text("Shift Alt 4")).toEqual(["Shift", "Alt", "4"])
      expect(text("F2")).toEqual(["F2"])
      expect(text("Delete")).toEqual(["Delete"])
      expect(text("⌘,")).toEqual(["command", ","])
      expect(text("+")).toEqual(["+"])
      expect(text("  ")).toEqual([])
    })

    it("passes stock, edge and tilt to the paper; a torn edge is drawn when it opens", async () => {
      const { menu } = await openMenu({ content: { stock: "sticky-yellow", edge: "torn", tilt: 1, seed: "x" } })
      expect(menu).toHaveAttribute("data-stock", "sticky-yellow")
      expect(menu).toHaveAttribute("data-edge", "torn")
      expect(menu.querySelector(':scope > svg[data-ink="sheet"]')).toBeTruthy()
    })

    it("repeats the provider's density and motion on the portalled slip", async () => {
      const r = renderUI(
        <InkProvider density="calm" motion="reduced">
          {kit.render({})}
        </InkProvider>,
        opts
      )
      await kit.open(r.user)
      const menu = await screen.findByRole("menu")
      expect(menu).toHaveAttribute("data-density", "calm")
      expect(menu).toHaveAttribute("data-motion", "reduced")
    })
  })

  describe(`${name} choices`, () => {
    it("a checkbox row is a pencil box, ticked in felt when checked, and reports its change", async () => {
      const onCheckedChange = vi.fn()
      const { user, menu } = await openMenu({ checked: false, onCheckedChange })
      const box = within(menu).getByRole("menuitemcheckbox", { name: "Show bookmarks" })
      expect(box).toHaveAttribute("aria-checked", "false")
      expect(box.querySelector('[data-slot$="item-indicator"] svg[data-icon="square"]')).toBeTruthy()
      expect(box.querySelector('svg[data-icon="check"]')).toBeNull()
      await user.click(box)
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })

    it("a checked checkbox row shows the tick over the box", async () => {
      const { menu } = await openMenu({ checked: true })
      const box = within(menu).getByRole("menuitemcheckbox", { name: "Show bookmarks" })
      expect(box).toHaveAttribute("aria-checked", "true")
      expect(box).toHaveAttribute("data-state", "checked")
      expect(box.querySelector('svg[data-icon="check"]')).toBeTruthy()
      expect(box.querySelector('svg[data-icon="square"]')).toBeTruthy()
    })

    it("a radio row is a ring, with a dot in the chosen one; choosing reports the value", async () => {
      const onRadioChange = vi.fn()
      const { user, menu } = await openMenu({ radio: "top", onRadioChange })
      const top = within(menu).getByRole("menuitemradio", { name: "Top" })
      const bottom = within(menu).getByRole("menuitemradio", { name: "Bottom" })
      expect(top).toHaveAttribute("aria-checked", "true")
      expect(bottom).toHaveAttribute("aria-checked", "false")
      expect(top.querySelector('svg[data-icon="dot"]')).toBeTruthy()
      expect(bottom.querySelector('svg[data-icon="dot"]')).toBeNull()
      expect(bottom.querySelector('svg[data-icon="circle"]')).toBeTruthy()
      await user.click(bottom)
      expect(onRadioChange).toHaveBeenCalledWith("bottom")
    })

    it("choosing a row runs its handler and closes the menu", async () => {
      const onPick = vi.fn()
      const { user, menu } = await openMenu({ onPick })
      await user.click(within(menu).getByRole("menuitem", { name: /Billing/ }))
      expect(onPick).toHaveBeenCalledWith("billing")
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    })

    it("a disabled row cannot be chosen", async () => {
      const onPick = vi.fn()
      const { user, menu } = await openMenu({ onPick })
      await user.click(within(menu).getByRole("menuitem", { name: /Invite/ }))
      expect(onPick).not.toHaveBeenCalledWith("invite")
      expect(screen.getByRole("menu")).toBeInTheDocument()
    })
  })

  describe(`${name} keyboard`, () => {
    it("arrows move the highlight (skipping the disabled row), Home and End jump, Enter chooses and closes", async () => {
      const onPick = vi.fn()
      const { user } = await openMenu({ onPick })
      await user.keyboard("{ArrowDown}")
      const profile = screen.getByRole("menuitem", { name: /Profile/ })
      await waitFor(() => expect(profile).toHaveFocus())
      expect(profile).toHaveAttribute("data-highlighted")
      await user.keyboard("{ArrowDown}")
      await waitFor(() => expect(screen.getByRole("menuitem", { name: /Billing/ })).toHaveFocus())
      await user.keyboard("{ArrowDown}")
      await waitFor(() => expect(screen.getByRole("menuitem", { name: /Settings/ })).toHaveFocus())
      await user.keyboard("{End}")
      await waitFor(() => expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus())
      await user.keyboard("{Home}")
      await waitFor(() => expect(profile).toHaveFocus())
      await user.keyboard("{ArrowDown}{Enter}")
      expect(onPick).toHaveBeenCalledWith("billing")
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    })

    it("typeahead jumps to the row that starts with the typed letter", async () => {
      const { user } = await openMenu()
      await user.keyboard("d")
      await waitFor(() => expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus())
    })

    it("Escape closes the menu", async () => {
      const { user } = await openMenu()
      await user.keyboard("{Escape}")
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
      if (kit.restoresFocus !== false) await waitFor(() => expect(kit.trigger()).toHaveFocus())
    })

    it("ArrowRight opens a sub-menu on its own slip, ArrowLeft puts it away", async () => {
      const { user } = await openMenu()
      await user.keyboard("m")
      const more = await screen.findByRole("menuitem", { name: "More" })
      await waitFor(() => expect(more).toHaveFocus())
      expect(more).toHaveAttribute("aria-haspopup", "menu")
      expect(more).toHaveAttribute("data-slot", slot("sub-trigger"))
      expect(more.querySelector('svg[data-icon="chevron-right"]')).toBeTruthy()
      await user.keyboard("{ArrowRight}")
      const menus = await screen.findAllByRole("menu")
      expect(menus).toHaveLength(2)
      const sub = menus.find((m) => m.getAttribute("data-slot") === slot("sub-content"))!
      expect(sub).toBeTruthy()
      expect(sub).toHaveClass("ll-paper", "z-(--ll-z-popover)")
      expect(sub.querySelector(`:scope > [data-slot="${slot("viewport")}"]`)).toBeTruthy()
      expect(more).toHaveAttribute("data-state", "open")
      expect(more.className).toContain("data-[state=open]:ll-swipe")
      expect(within(sub).getByRole("menuitem", { name: "Save as…" })).toBeInTheDocument()
      await user.keyboard("{ArrowLeft}")
      await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(1))
    })
  })

  describe(`${name} rendering`, () => {
    it("has no axe violations open", async () => {
      await openMenu()
      await axeCheck()
    })

    it("renders the closed tree deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
      const tree = kit.render({})
      const html = renderToString(tree)
      expect(html).toContain(`data-slot="${name}-trigger"`)
      expect(renderToString(tree)).toBe(html)
      expect(html.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/\bNaN\b|\bundefined\b/)
      for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
        const ui = wrap(tree) as React.ReactElement
        const container = document.createElement("div")
        document.body.appendChild(container)
        container.innerHTML = renderToString(ui)
        const errors = vi.spyOn(console, "error").mockImplementation(() => {})
        let root: ReturnType<typeof hydrateRoot> | undefined
        act(() => {
          root = hydrateRoot(container, ui)
        })
        expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
        errors.mockRestore()
        act(() => root?.unmount())
        container.remove()
      }
    })

    it("mounts under StrictMode and opens", async () => {
      const r = renderUI(<React.StrictMode>{kit.render({})}</React.StrictMode>, opts)
      await kit.open(r.user)
      expect(await screen.findByRole("menu")).toBeInTheDocument()
    })
  })
}
