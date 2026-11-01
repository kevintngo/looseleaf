import { describe, expect, it } from "vitest"

import { MENU_CHOICE_ITEM, MENU_ITEM, MENU_KEYCAP, MENU_LABEL, MENU_MARK, MENU_SHORTCUT, MENU_SUB_TRIGGER, menuContentClass, menuViewportClass, parseShortcut, type MenuKind } from "@/lib/menu-styles"

const KINDS: MenuKind[] = ["dropdown-menu", "context-menu", "menubar"]

describe("menu-styles", () => {
  it("each menu gets its own Radix variables for the origin and the available height, and nobody else's", () => {
    for (const k of KINDS) {
      expect(menuContentClass(k)).toContain(`origin-(--radix-${k}-content-transform-origin)`)
      expect(menuViewportClass(k)).toContain(`max-h-(--radix-${k}-content-available-height)`)
      for (const other of KINDS.filter((o) => o !== k)) {
        expect(menuContentClass(k)).not.toContain(`--radix-${other}-`)
        expect(menuViewportClass(k)).not.toContain(`--radix-${other}-`)
      }
    }
  })

  it("the slip never scrolls itself (the shadow is its ::before), its viewport does", () => {
    for (const k of KINDS) {
      expect(menuContentClass(k)).not.toMatch(/overflow-/)
      expect(menuViewportClass(k)).toContain("overflow-y-auto")
      expect(menuViewportClass(k)).toContain("overflow-x-hidden")
    }
    expect(menuContentClass("menubar")).toContain("z-(--ll-z-popover)")
  })

  it("rows are 32 px tall (28 compact and calm), wear the highlighter, and destructive rows hatch", () => {
    for (const row of [MENU_ITEM, MENU_CHOICE_ITEM, MENU_SUB_TRIGGER]) {
      expect(row).toContain("min-h-8")
      expect(row).toContain("compact:min-h-7")
      expect(row).toContain("calm:min-h-7")
      expect(row).toContain("data-[highlighted]:ll-swipe")
    }
    expect(MENU_ITEM).toContain("repeating-linear-gradient")
    expect(MENU_ITEM).toContain("data-[variant=destructive]:text-red")
    expect(MENU_CHOICE_ITEM).toContain("ps-9")
    expect(MENU_SUB_TRIGGER).toContain("data-[state=open]:ll-swipe")
  })

  it("no class string carries a hard-coded colour", () => {
    for (const s of [MENU_ITEM, MENU_CHOICE_ITEM, MENU_SUB_TRIGGER, MENU_LABEL, MENU_MARK, MENU_SHORTCUT, MENU_KEYCAP, ...KINDS.map((k) => menuContentClass(k)), ...KINDS.map((k) => menuViewportClass(k))]) {
      expect(s).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i)
    }
  })

  describe("parseShortcut", () => {
    const text = (s: string) => parseShortcut(s).map((k) => ("icon" in k ? k.icon : k.text))
    it("splits on + and spaces, and reads modifier symbols one key at a time", () => {
      expect(text("Ctrl+K")).toEqual(["Ctrl", "K"])
      expect(text("Shift Alt 4")).toEqual(["Shift", "Alt", "4"])
      expect(text("⌘S")).toEqual(["command", "S"])
      expect(text("⇧⌘P")).toEqual(["Shift", "command", "P"])
      expect(text("⌥⌫")).toEqual(["Alt", "Del"])
      expect(text("⌘,")).toEqual(["command", ","])
    })
    it("leaves a run with no modifier as one key, and copes with the odd", () => {
      expect(text("F2")).toEqual(["F2"])
      expect(text("Delete")).toEqual(["Delete"])
      expect(text("+")).toEqual(["+"])
      expect(text("")).toEqual([])
      expect(text("   ")).toEqual([])
      expect(text("Ctrl++")).toEqual(["Ctrl"])
    })
    it("the command key is the drawn glyph, named for assistive technology", () => {
      expect(parseShortcut("⌘")).toEqual([{ icon: "command", label: "Command" }])
    })
  })
})
