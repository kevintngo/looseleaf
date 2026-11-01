import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { StickerPicker, StickerPickerContent, StickerPickerTrigger, type StickerPickerProps } from "@/components/ui/sticker-picker"
import { InkProvider } from "@/lib/ink/react"
import { stickerCatalog } from "@/lib/ink/recipes/sticker-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 200)
})
afterEach(() => restore())

const OPTS = { user: { pointerEventsCheck: 0 } }

const Picker = (p: Partial<StickerPickerProps> & { columns?: number } = {}) => {
  const { columns, ...rest } = p
  return (
    <StickerPicker {...rest}>
      <StickerPickerTrigger asChild>
        <Button>Add sticker</Button>
      </StickerPickerTrigger>
      <StickerPickerContent columns={columns} />
    </StickerPicker>
  )
}

const options = () => screen.getAllByRole("option")
const settled = (n: number) => waitFor(() => expect(options()).toHaveLength(n))
const active = () => document.querySelector('[role="option"][data-active]') as HTMLElement
const input = () => screen.getByRole("combobox", { name: "Search stickers" })
const open = async (user: ReturnType<typeof renderUI>["user"]) => {
  await user.click(screen.getByRole("button", { name: "Add sticker" }))
  return screen.findByRole("dialog", { name: "Stickers" })
}

describe("StickerPicker", () => {
  it("opens from its trigger onto a search field focused and ready", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    expect(screen.queryByRole("dialog")).toBeNull()
    await open(user)
    expect(input()).toHaveFocus()
    expect(input()).toHaveAttribute("aria-expanded", "true")
    expect(input()).toHaveAttribute("aria-controls", screen.getByRole("listbox", { name: "Stickers" }).id)
  })

  it("lists every drawn sticker, grouped by category, the first one highlighted", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    expect(options().length).toBeLessThan(stickerCatalog().length)
    await settled(stickerCatalog().length)
    const groups = screen.getAllByRole("group").filter((g) => g.getAttribute("aria-labelledby"))
    expect(groups.length).toBeGreaterThan(1)
    expect(active()).toBe(options()[0])
    expect(input()).toHaveAttribute("aria-activedescendant", options()[0].id)
  })

  it("options are named by the sticker and every id is unique", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    expect(screen.getByRole("option", { name: "Rocket" })).toBeInTheDocument()
    const ids = options().map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("is accessible open", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    await axeCheck()
  })

  it("search narrows by label, id, category and search words, and says how many", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    await user.type(input(), "rocket")
    expect(options().map((o) => o.getAttribute("aria-label"))).toContain("Rocket")
    expect(options().length).toBeLessThan(stickerCatalog().length)
    expect(screen.getByRole("status")).toHaveTextContent(/^\d+ stickers?\.$/)
    await user.clear(input())
    await user.type(input(), "weather")
    expect(options().length).toBeGreaterThan(0)
    expect(options().every((o) => /./.test(o.getAttribute("aria-label") ?? ""))).toBe(true)
    await user.type(input(), " zzzzqq")
    expect(screen.queryAllByRole("option")).toHaveLength(0)
  })

  it("an empty search says so, with Stubby, and the highlight goes away", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    await user.type(input(), "qqqqzz")
    expect(screen.getByText(/Nothing looks like/)).toHaveTextContent("qqqqzz")
    expect(document.querySelector('[data-slot="sticker-picker-empty"] [data-slot="mascot"]')).not.toBeNull()
    expect(screen.getByRole("status")).toHaveTextContent("No stickers found.")
    expect(input()).not.toHaveAttribute("aria-activedescendant")
    await user.keyboard("{Enter}")
    await axeCheck()
  })

  it("category chips filter the grid and are toggle buttons", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    const cats = screen.getByRole("group", { name: "Categories" })
    const all = within(cats).getByRole("button", { name: "All" })
    expect(all).toHaveAttribute("aria-pressed", "true")
    const one = stickerCatalog()[0]
    const chip = within(cats).getByRole("button", { name: one.categoryLabel })
    await user.click(chip)
    expect(chip).toHaveAttribute("aria-pressed", "true")
    expect(all).toHaveAttribute("aria-pressed", "false")
    const expected = stickerCatalog().filter((e) => e.category === one.category).length
    expect(options()).toHaveLength(expected)
    expect(input()).toHaveFocus()
    await user.click(all)
    await settled(stickerCatalog().length)
  })

  it("arrows walk the grid without leaving the search field; Home and End go to the ends", async () => {
    const { user } = renderUI(<Picker stickers={["rocket", "done", "wip", "new", "sale", "beta", "pro", "ok"]} columns={3} />, OPTS)
    await open(user)
    expect(options()).toHaveLength(8)
    const at = () => options().indexOf(active())
    expect(at()).toBe(0)
    await user.keyboard("{ArrowRight}")
    expect(at()).toBe(1)
    await user.keyboard("{ArrowDown}")
    expect(at()).toBe(4)
    await user.keyboard("{ArrowDown}")
    expect(at()).toBe(7)
    await user.keyboard("{ArrowDown}")
    expect(at()).toBe(7)
    await user.keyboard("{ArrowUp}{ArrowLeft}")
    expect(at()).toBe(3)
    await user.keyboard("{End}")
    expect(at()).toBe(7)
    await user.keyboard("{Home}")
    expect(at()).toBe(0)
    await user.keyboard("{ArrowLeft}{ArrowUp}")
    expect(at()).toBe(0)
    expect(input()).toHaveFocus()
    expect(input()).toHaveAttribute("aria-activedescendant", options()[0].id)
  })

  it("Up and Down keep their column across categories", async () => {
    const list = [
      { name: "rocket", category: "one" },
      { name: "done", category: "one" },
      { name: "wip", category: "one" },
      { name: "new", category: "one" },
      { name: "sale", category: "two" },
      { name: "beta", category: "two" },
    ]
    const { user } = renderUI(<Picker stickers={list} columns={3} />, OPTS)
    await open(user)
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(options().indexOf(active())).toBe(2)
    await user.keyboard("{ArrowDown}")
    expect(options().indexOf(active())).toBe(5)
    await user.keyboard("{ArrowDown}")
    expect(options().indexOf(active())).toBe(5)
    await user.keyboard("{ArrowUp}")
    expect(options().indexOf(active())).toBe(3)
  })

  it("with text in the field the caret keeps left and right until it reaches the end", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    await user.type(input(), "s")
    const first = active()
    await user.keyboard("{ArrowRight}")
    if (options().length > 1) expect(active()).not.toBe(first)
    const before = active()
    await user.keyboard("{ArrowLeft}")
    expect(active()).toBe(before)
  })

  it("Enter chooses the highlighted sticker, reports it and closes", async () => {
    const onSelect = vi.fn()
    const { user } = renderUI(<Picker onSelect={onSelect} />, OPTS)
    await open(user)
    await user.keyboard("{ArrowRight}{Enter}")
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: stickerCatalog()[1].name, label: expect.any(String), category: expect.any(String) }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByRole("button", { name: "Add sticker" })).toHaveFocus()
  })

  it("a tap chooses too, and closeOnSelect={false} keeps the picker for the next one", async () => {
    const onSelect = vi.fn()
    const { user } = renderUI(<Picker onSelect={onSelect} closeOnSelect={false} />, OPTS)
    await open(user)
    await user.click(screen.getByRole("option", { name: "Rocket" }))
    await user.click(screen.getByRole("option", { name: "Rocket" }))
    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ name: "rocket", label: "Rocket" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("Escape closes and gives focus back", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByRole("button", { name: "Add sticker" })).toHaveFocus()
  })

  it("the pointer moves the highlight; the highlighted sticker is drawn peeled", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    const flat = (o: HTMLElement) => o.querySelector("svg")!.innerHTML
    const first = options()[0]
    const second = options()[1]
    expect(flat(first)).toContain("clip-path")
    expect(flat(second)).not.toContain("clip-path")
    await user.hover(second)
    expect(active()).toBe(second)
    expect(flat(second)).toContain("clip-path")
    expect(flat(first)).not.toContain("clip-path")
  })

  it("value marks the current sticker", async () => {
    const { user } = renderUI(<Picker value="rocket" />, OPTS)
    await open(user)
    const rocket = screen.getByRole("option", { name: "Rocket" })
    expect(rocket).toHaveAttribute("aria-selected", "true")
    expect(rocket.querySelector('[data-slot="icon"]')).not.toBeNull()
    expect(options().filter((o) => o.getAttribute("aria-selected") === "true")).toHaveLength(1)
  })

  it("recent stickers come first, under their own heading", async () => {
    const { user } = renderUI(<Picker recent={["done", "rocket", "no-such"]} />, OPTS)
    await open(user)
    const first = screen.getByRole("group", { name: "Recent" })
    expect(screen.getAllByRole("group").filter((g) => g.hasAttribute("aria-labelledby"))[0]).toBe(first)
    expect(within(first).getAllByRole("option").map((o) => o.getAttribute("aria-label"))).toEqual(["Done", "Rocket"])
    const ids = options().map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    await user.type(input(), "rocket")
    expect(screen.queryByRole("group", { name: "Recent" })).toBeNull()
  })

  it("stickers offers only what you ask for, with your own labels and categories", async () => {
    const list = [
      { name: "rocket", label: "Launch", category: "Reactions", tags: ["go"] },
      "done",
      "not-drawn",
      { name: "wip", category: "Reactions" },
    ]
    const { user } = renderUI(<Picker stickers={list} />, OPTS)
    await open(user)
    expect(options().map((o) => o.getAttribute("aria-label"))).toEqual(["Launch", "Wip", "Done"])
    await user.type(input(), "go")
    expect(options().map((o) => o.getAttribute("aria-label"))).toEqual(["Launch"])
    expect(screen.getByRole("group", { name: "1 found" })).toBeInTheDocument()
  })

  it("open state can be controlled", async () => {
    const onOpenChange = vi.fn()
    const { user, rerender } = renderUI(<Picker open={false} onOpenChange={onOpenChange} />, OPTS)
    await user.click(screen.getByRole("button", { name: "Add sticker" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("dialog")).toBeNull()
    rerender(<Picker open onOpenChange={onOpenChange} />)
    expect(await screen.findByRole("dialog", { name: "Stickers" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("the search starts fresh each time it opens", async () => {
    const { user } = renderUI(<Picker />, OPTS)
    await open(user)
    await user.type(input(), "cloud")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await open(user)
    expect(input()).toHaveValue("")
  })

  it("a part outside a picker says so", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<StickerPickerContent />)).toThrow(/inside <StickerPicker>/)
    spy.mockRestore()
  })

  it("the closed picker renders identically on the server and hydrates cleanly", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(<Picker />) as React.ReactElement)
      expect(renderToString(wrap(<Picker />) as React.ReactElement)).toBe(a)
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(<Picker />))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })

  it("open, it draws no NaN and no duplicate ids", async () => {
    const { user } = renderUI(<Picker recent={["done"]} />, OPTS)
    await open(user)
    const html = document.body.innerHTML
    expect(html).not.toMatch(/NaN|undefined/)
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
