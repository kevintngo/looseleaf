import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { StickerSheet, StickerSheetItem, type StickerSheetPeel } from "@/components/ui/sticker-sheet"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { kissCut, stickerFace } from "@/lib/ink/recipes/sticker-ink"
import { stickerSheetRecipe, stickerSlotRecipe } from "@/lib/ink/recipes/sticker-sheet-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 200)
})
afterEach(() => restore())

const Sheet = (p: Partial<React.ComponentProps<typeof StickerSheet>> = {}) => (
  <StickerSheet title="Sticker sheet no. 4" {...p}>
    <StickerSheetItem name="rocket" />
    <StickerSheetItem name="cloud-smile" />
    <StickerSheetItem name="done" />
  </StickerSheet>
)

const slot = (c: HTMLElement, name: string) => c.querySelector(`[data-slot="sticker-sheet-item"][data-sticker="${name}"]`)!.closest('[data-slot="sticker-sheet-slot"]') as HTMLElement
const btn = (c: HTMLElement, name: string) => c.querySelector(`[data-slot="sticker-sheet-item"][data-sticker="${name}"]`) as HTMLButtonElement

describe("StickerSheet", () => {
  it("is a named group of stickers you can peel", () => {
    const { getByRole, container } = renderUI(<Sheet />)
    expect(getByRole("group", { name: "Sticker sheet no. 4" })).toBeInTheDocument()
    expect(getByRole("button", { name: "Peel Rocket sticker" })).toBeInTheDocument()
    expect(getByRole("button", { name: "Peel Cloud smile sticker" })).toBeInTheDocument()
    expect(slot(container, "rocket")).toHaveAttribute("data-state", "stuck")
    expect(container.querySelector('[data-slot="sticker-sheet"]')).toHaveTextContent("3 left")
  })

  it("has a default name when there is no title, and can be labelled", () => {
    const a = renderUI(<Sheet title={undefined} />)
    expect(a.getByRole("group", { name: "Sticker sheet" })).toBeInTheDocument()
    const b = renderUI(<Sheet title={undefined} label="Reward stickers" />)
    expect(b.getByRole("group", { name: "Reward stickers" })).toBeInTheDocument()
  })

  it("is accessible, fresh and part peeled", async () => {
    const { container } = renderUI(<Sheet defaultPeeled={["done"]} />)
    await axeCheck(container)
  })

  it("clicking peels it: the outline stays, the name says what pressing does now, and onPeel hears about it", async () => {
    const onPeel = vi.fn()
    const { user, getByRole, container } = renderUI(<Sheet onPeel={onPeel} />)
    await user.click(getByRole("button", { name: "Peel Rocket sticker" }))
    expect(onPeel).toHaveBeenCalledTimes(1)
    expect(onPeel).toHaveBeenCalledWith({ id: "rocket", name: "rocket", label: "Rocket", dragged: false, x: undefined, y: undefined })
    expect(slot(container, "rocket")).toHaveAttribute("data-state", "peeled")
    expect(getByRole("button", { name: "Put Rocket sticker back" })).toBeInTheDocument()
    expect(slot(container, "rocket").querySelector('svg[data-ink="prop"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="sticker-sheet"]')).toHaveTextContent("2 left")
  })

  it("pressing the empty outline puts it back", async () => {
    const onStick = vi.fn()
    const { user, getByRole, container } = renderUI(<Sheet defaultPeeled={["done"]} onStick={onStick} />)
    expect(slot(container, "done")).toHaveAttribute("data-state", "peeled")
    await user.click(getByRole("button", { name: "Put Done sticker back" }))
    expect(onStick).toHaveBeenCalledWith(expect.objectContaining({ id: "done", name: "done", dragged: false }))
    expect(slot(container, "done")).toHaveAttribute("data-state", "stuck")
    expect(getByRole("button", { name: "Peel Done sticker" })).toBeInTheDocument()
  })

  it("Enter and Space peel", async () => {
    const onPeel = vi.fn()
    const { user, getByRole } = renderUI(<Sheet onPeel={onPeel} />)
    getByRole("button", { name: "Peel Rocket sticker" }).focus()
    await user.keyboard("{Enter}")
    getByRole("button", { name: "Peel Cloud smile sticker" }).focus()
    await user.keyboard(" ")
    expect(onPeel.mock.calls.map((c) => (c[0] as StickerSheetPeel).name)).toEqual(["rocket", "cloud-smile"])
  })

  it("announces what came off, politely", async () => {
    const { user, getByRole } = renderUI(<Sheet />)
    await user.click(getByRole("button", { name: "Peel Rocket sticker" }))
    expect(getByRole("status")).toHaveTextContent("Rocket peeled off.")
    await user.click(getByRole("button", { name: "Put Rocket sticker back" }))
    expect(getByRole("status")).toHaveTextContent("Rocket stuck back on.")
  })

  it("controlled: the parent's list wins", async () => {
    const onPeeledChange = vi.fn()
    const { user, getByRole, container, rerender } = renderUI(<Sheet peeled={[]} onPeeledChange={onPeeledChange} />)
    await user.click(getByRole("button", { name: "Peel Rocket sticker" }))
    expect(onPeeledChange).toHaveBeenCalledWith(["rocket"])
    expect(slot(container, "rocket")).toHaveAttribute("data-state", "stuck")
    rerender(<Sheet peeled={["rocket", "done"]} onPeeledChange={onPeeledChange} />)
    expect(slot(container, "rocket")).toHaveAttribute("data-state", "peeled")
    expect(slot(container, "done")).toHaveAttribute("data-state", "peeled")
    expect(container.querySelector('[data-slot="sticker-sheet"]')).toHaveTextContent("1 left")
  })

  it("uncontrolled: defaultPeeled seeds it and reports the whole list", async () => {
    const onPeeledChange = vi.fn()
    const { user, getByRole } = renderUI(<Sheet defaultPeeled={["done"]} onPeeledChange={onPeeledChange} />)
    await user.click(getByRole("button", { name: "Peel Rocket sticker" }))
    expect(onPeeledChange).toHaveBeenLastCalledWith(["done", "rocket"])
  })

  it("restorable={false} leaves a peeled outline alone; disabled freezes the sheet", async () => {
    const a = renderUI(<Sheet defaultPeeled={["done"]} restorable={false} />)
    expect(a.getByRole("button", { name: "Done sticker, peeled" })).toHaveAttribute("aria-disabled", "true")
    expect(a.getByRole("button", { name: "Peel Rocket sticker" })).toBeEnabled()
    a.unmount()
    const onPeel = vi.fn()
    const b = renderUI(<Sheet disabled onPeel={onPeel} />)
    b.getAllByRole("button").forEach((x) => expect(x).toBeDisabled())
    await b.user.click(b.getByRole("button", { name: "Peel Rocket sticker" }))
    expect(onPeel).not.toHaveBeenCalled()
  })

  it("a sticker that appears twice needs its own id", async () => {
    const { user, getAllByRole, container } = renderUI(
      <StickerSheet>
        <StickerSheetItem name="rocket" id="a" />
        <StickerSheetItem name="rocket" id="b" />
      </StickerSheet>
    )
    await user.click(getAllByRole("button", { name: "Peel Rocket sticker" })[0])
    expect(container.querySelectorAll('[data-state="peeled"]')).toHaveLength(1)
    expect(getAllByRole("button", { name: "Peel Rocket sticker" })).toHaveLength(1)
  })

  it("stickers={[...]} lays one item out per id; names that are not drawn are skipped", () => {
    const { container } = renderUI(<StickerSheet stickers={["rocket", "done", "not-drawn-yet"]} columns={2} />)
    expect(container.querySelectorAll('[data-slot="sticker-sheet-item"]')).toHaveLength(2)
    expect((container.querySelector('[data-slot="sticker-sheet-grid"]') as HTMLElement).style.gridTemplateColumns).toContain("repeat(2,")
  })

  it("a custom label names the item for readers", () => {
    const { getByRole } = renderUI(
      <StickerSheet>
        <StickerSheetItem name="rocket" label="Launch day" />
      </StickerSheet>
    )
    expect(getByRole("button", { name: "Peel Launch day sticker" })).toBeInTheDocument()
  })

  it("every slot prints its own kiss-cut outline, with ids that never collide", () => {
    const { container } = renderUI(<Sheet />)
    const ids = [...container.querySelectorAll("[id]")].map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(container.querySelectorAll('svg[data-ink="prop"]')).toHaveLength(3)
    expect(container.querySelector('svg[data-ink="prop"] mask')).not.toBeNull()
    expectInkLayers(container, { kinds: ["prop", "sticker", "print", "frame"] })
  })

  it("hovering wakes the peeled-corner drawing (made once, on demand)", () => {
    const { container } = renderUI(<Sheet />)
    const art = (n: string) => slot(container, n).querySelectorAll('svg[data-ink="sticker"]')
    expect(art("rocket")).toHaveLength(1)
    fireEvent.pointerEnter(btn(container, "rocket"))
    expect(art("rocket")).toHaveLength(2)
    expect(art("rocket")[1].innerHTML).toContain("clip-path")
    expect(art("done")).toHaveLength(1)
  })

  it("dragging a sticker off with a mouse peels it where the pointer let go", () => {
    const onPeel = vi.fn()
    const { container } = renderUI(<Sheet onPeel={onPeel} />)
    const b = btn(container, "rocket")
    fireEvent.pointerDown(b, { pointerId: 1, button: 0, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(b, { pointerId: 1, clientX: 90, clientY: 70 })
    expect(slot(container, "rocket")).toHaveAttribute("data-dragging")
    const held = slot(container, "rocket").querySelector("[data-slot='sticker-sheet-art'] > span") as HTMLElement
    expect(held.style.translate).toBe("40px 20px")
    fireEvent.pointerUp(b, { pointerId: 1, clientX: 90, clientY: 70 })
    expect(onPeel).toHaveBeenCalledTimes(1)
    expect(onPeel).toHaveBeenCalledWith(expect.objectContaining({ id: "rocket", dragged: true, x: 90, y: 70 }))
    expect(slot(container, "rocket")).toHaveAttribute("data-state", "peeled")
    expect(slot(container, "rocket")).toHaveAttribute("data-drop")
    expect(slot(container, "rocket")).not.toHaveAttribute("data-dragging")
    fireEvent.click(b)
    expect(slot(container, "rocket")).toHaveAttribute("data-state", "peeled")
    expect(onPeel).toHaveBeenCalledTimes(1)
  })

  it("a short drag springs back and peels nothing; cancel too", () => {
    const onPeel = vi.fn()
    const { container } = renderUI(<Sheet onPeel={onPeel} />)
    const b = btn(container, "rocket")
    const held = () => slot(container, "rocket").querySelector("[data-slot='sticker-sheet-art'] > span") as HTMLElement
    fireEvent.pointerDown(b, { pointerId: 1, button: 0, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(b, { pointerId: 1, clientX: 60, clientY: 50 })
    expect(held().style.translate).toBe("10px 0px")
    fireEvent.pointerUp(b, { pointerId: 1, clientX: 60, clientY: 50 })
    expect(held().style.translate).toBe("")
    expect(onPeel).not.toHaveBeenCalled()
    fireEvent.pointerDown(b, { pointerId: 2, button: 0, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(b, { pointerId: 2, clientX: 150, clientY: 150 })
    fireEvent.pointerCancel(b, { pointerId: 2 })
    expect(held().style.translate).toBe("")
    expect(onPeel).not.toHaveBeenCalled()
    fireEvent.click(b)
    expect(onPeel).toHaveBeenCalledTimes(1)
  })

  it("touch does not drag (the page keeps scrolling); a tap peels", () => {
    const onPeel = vi.fn()
    const { container } = renderUI(<Sheet onPeel={onPeel} />)
    const b = btn(container, "rocket")
    fireEvent.pointerDown(b, { pointerId: 1, pointerType: "touch", button: 0, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(b, { pointerId: 1, pointerType: "touch", clientX: 150, clientY: 150 })
    expect(slot(container, "rocket")).not.toHaveAttribute("data-dragging")
    fireEvent.pointerUp(b, { pointerId: 1, pointerType: "touch", clientX: 150, clientY: 150 })
    expect(onPeel).not.toHaveBeenCalled()
    fireEvent.click(b)
    expect(onPeel).toHaveBeenCalledWith(expect.objectContaining({ dragged: false }))
  })

  it("putting a dragged sticker back forgets where it was dropped", async () => {
    const { container, user, getByRole } = renderUI(<Sheet />)
    const b = btn(container, "rocket")
    fireEvent.pointerDown(b, { pointerId: 1, button: 0, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(b, { pointerId: 1, clientX: 150, clientY: 150 })
    fireEvent.pointerUp(b, { pointerId: 1, clientX: 150, clientY: 150 })
    await user.click(getByRole("button", { name: "Put Rocket sticker back" }))
    expect(slot(container, "rocket")).not.toHaveAttribute("data-drop")
    expect((slot(container, "rocket").querySelector("[data-slot='sticker-sheet-art'] > span") as HTMLElement).style.translate).toBe("")
  })

  it("a part outside a sheet says so", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<StickerSheetItem name="rocket" />)).toThrow(/inside <StickerSheet>/)
    spy.mockRestore()
  })

  it("renders identically on the server and hydrates cleanly, bare and in a provider", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(<Sheet defaultPeeled={["done"]} />) as React.ReactElement)
      expect(renderToString(wrap(<Sheet defaultPeeled={["done"]} />) as React.ReactElement)).toBe(a)
      expect(a).not.toMatch(/NaN|undefined/)
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(<Sheet defaultPeeled={["done"]} />))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })

  it("backing picks the paper: glassine gets a sheen, kraft and paper do not", () => {
    const g = renderUI(<Sheet />)
    expect(g.container.querySelector('[data-slot="sticker-sheet-sheen"]')).not.toBeNull()
    expect(g.container.querySelector('[data-slot="sticker-sheet"]')).toHaveAttribute("data-stock", "slip")
    const k = renderUI(<Sheet backing="kraft" />)
    expect(k.container.querySelector('[data-slot="sticker-sheet-sheen"]')).toBeNull()
    expect(k.container.querySelector('[data-slot="sticker-sheet"]')).toHaveAttribute("data-stock", "kraft")
  })

  it("scopes its own within-sheet queries", () => {
    const { container } = renderUI(<Sheet />)
    expect(within(container).getAllByRole("button")).toHaveLength(3)
  })
})

describe("sticker sheet drawing", () => {
  const run = (recipe: unknown, params: object, box: { w: number; h: number }, density: "comfortable" | "calm" = "comfortable", lazy?: "focus"[]) =>
    runRecipe(recipe as Parameters<typeof runRecipe>[0], { box, params, seed: "s", tier: "lo", density, dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 }, lazy })

  it("the printing fits the budget and grows slowly with the sheet", () => {
    const small = run(stickerSheetRecipe, { top: 34 }, { w: 300, h: 260 }).parts.rest ?? ""
    const big = run(stickerSheetRecipe, { top: 34 }, { w: 900, h: 700 }).parts.rest ?? ""
    expect(small.length).toBeGreaterThan(500)
    expect(small.length).toBeLessThan(8000)
    expect(big.length).toBeLessThan(12000)
    expect((small.match(/<(path|g)\b/g) ?? []).length).toBeLessThanOrEqual(12)
    expect(small + big).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
  })

  it("calm density leaves out the crop marks", () => {
    const comfortable = run(stickerSheetRecipe, { top: 0 }, { w: 300, h: 260 }).parts.rest ?? ""
    const calm = run(stickerSheetRecipe, { top: 0 }, { w: 300, h: 260 }, "calm").parts.rest ?? ""
    expect(calm.length).toBeLessThan(comfortable.length)
  })

  it("a tiny sheet draws nothing rather than something broken", () => {
    expect(run(stickerSheetRecipe, { top: 34 }, { w: 20, h: 20 }).parts.rest ?? "").toBe("")
  })

  it("the slot's ring is a lazy layer", () => {
    expect(run(stickerSlotRecipe, {}, { w: 94, h: 94 }).parts.focus).toBeUndefined()
    expect(run(stickerSlotRecipe, {}, { w: 94, h: 94 }, "comfortable", ["focus"]).parts.focus).toBeTruthy()
  })

  it("kissCut draws a mask-built ring for a die-cut sticker and a rectangle for a stamp", () => {
    const rocket = stickerFace("rocket", 72, "r", { idPrefix: "t1" })!
    const cut = kissCut(rocket, "cut1")
    expect(cut).toContain('<mask id="cut1m"')
    expect(cut).toContain("url(#cut1m)")
    expect(cut).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
    const stamp = stickerFace("stamp-approved", 96, "s", { idPrefix: "t2" })!
    expect(stamp.cut.kind).toBe("rect")
    expect(kissCut(stamp, "cut2")).toContain("<rect")
  })

  it("a face is complete before anything is mounted, with a tight box inside it", () => {
    const f = stickerFace("first-place", 96, "x")!
    expect(f.w).toBeGreaterThan(90)
    expect(f.box.w).toBeLessThan(f.w)
    expect(f.box.x).toBeGreaterThanOrEqual(0)
    expect(f.box.x + f.box.w).toBeLessThanOrEqual(f.w)
    expect(stickerFace("no-such", 96, "x")).toBeNull()
    expect(stickerFace("rocket", 96, "x")).toBe(stickerFace("rocket", 96, "x"))
  })
})
