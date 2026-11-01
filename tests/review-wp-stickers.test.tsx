import * as React from "react"
import { renderToString } from "react-dom/server"
import { act, fireEvent } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Ribbon } from "@/components/ui/ribbon"
import { Seal } from "@/components/ui/seal"
import { StampButton, StampSurface, type StampImpression } from "@/components/ui/stamp-button"
import { StickerBoard, StickerBoardCanvas, StickerBoardToolbar, addSticker, reorderSticker, type StickerBoardItem } from "@/components/ui/sticker-board"
import { StickerPicker, StickerPickerContent, StickerPickerTrigger } from "@/components/ui/sticker-picker"
import { StickerSheet, StickerSheetItem } from "@/components/ui/sticker-sheet"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { ribbonRecipe } from "@/lib/ink/recipes/ribbon-ink"
import { sealArt } from "@/lib/ink/recipes/seal-ink"
import { composeBoardSvg, wholeItems } from "@/lib/ink/recipes/sticker-board-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(160, 120)
})
afterEach(() => restore())

const wait = (ms = 5) => act(() => new Promise<void>((r) => setTimeout(r, ms)))
const slotOf = (c: HTMLElement) => c.querySelector('[data-slot="sticker-sheet-slot"]') as HTMLElement
const heldOf = (slot: HTMLElement) => slot.querySelector("[data-slot='sticker-sheet-art'] > span") as HTMLElement

describe("sticker sheet", () => {
  const drag = (b: HTMLElement) => {
    fireEvent.pointerDown(b, { pointerId: 1, button: 0, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(b, { pointerId: 1, clientX: 150, clientY: 150 })
    fireEvent.pointerUp(b, { pointerId: 1, clientX: 150, clientY: 150 })
  }

  it("a controlled sheet that declines a drag-off gets the sticker back where it was", async () => {
    const onPeel = vi.fn()
    const { container } = renderUI(
      <StickerSheet peeled={[]} onPeel={onPeel} title="t">
        <StickerSheetItem name="rocket" />
      </StickerSheet>
    )
    drag(container.querySelector("button") as HTMLElement)
    expect(onPeel).toHaveBeenCalledTimes(1)
    await wait()
    expect(slotOf(container)).toHaveAttribute("data-state", "stuck")
    expect(slotOf(container)).not.toHaveAttribute("data-drop")
    expect(heldOf(slotOf(container)).style.translate).toBe("")
  })

  it("while a sticker is in the hand the sheet rises above what follows it (a board), and only then", () => {
    const { container } = renderUI(
      <StickerSheet title="t">
        <StickerSheetItem name="rocket" />
      </StickerSheet>
    )
    const sheet = container.querySelector('[data-slot="sticker-sheet"]') as HTMLElement
    expect(sheet.className).toContain("has-[[data-dragging]]:z-(--ll-z-raised)")
    expect(slotOf(container)).not.toHaveAttribute("data-dragging")
  })

  it("'n left' counts stickers on this sheet: an undrawn id is not printed, a foreign peeled id takes nothing away", () => {
    const { container } = renderUI(<StickerSheet title="t" stickers={["rocket", "done", "not-a-sticker-xyz"]} peeled={["done", "somewhere-else"]} />)
    expect(container.querySelectorAll('[data-slot="sticker-sheet-item"]')).toHaveLength(2)
    expect(container.querySelector('[data-slot="sticker-sheet"]')).toHaveTextContent("1 left")
    const b = renderUI(<StickerSheet title="t" stickers={["rocket", "not-a-sticker-xyz"]} />)
    expect(b.container.querySelector('[data-slot="sticker-sheet"]')).toHaveTextContent("1 left")
  })

  it("restorable={false}: Enter peels and the key keeps its focus; the spent outline does nothing more", async () => {
    const onStick = vi.fn()
    const { container, user } = renderUI(
      <StickerSheet title="t" restorable={false} onStick={onStick}>
        <StickerSheetItem name="rocket" />
      </StickerSheet>
    )
    const b = container.querySelector("button") as HTMLButtonElement
    act(() => b.focus())
    await user.keyboard("{Enter}")
    expect(slotOf(container)).toHaveAttribute("data-state", "peeled")
    expect(b).not.toBeDisabled()
    expect(b).toHaveAttribute("aria-disabled", "true")
    expect(document.activeElement).toBe(b)
    await user.keyboard("{Enter}")
    expect(onStick).not.toHaveBeenCalled()
    expect(slotOf(container)).toHaveAttribute("data-state", "peeled")
  })
})

describe("sticker board", () => {
  const START: StickerBoardItem[] = [
    { id: "a", name: "rocket", x: 50, y: 50, rot: 0, scale: 1, z: 0 },
    { id: "b", name: "done", x: 100, y: 100, rot: 0, scale: 1, z: 1 },
  ]

  it("deleting from the toolbar hands focus to the page instead of leaving it on a disabled button", async () => {
    const { container, user, getByRole } = renderUI(<StickerBoard className="h-96" defaultValue={START} />)
    act(() => (container.querySelector('[data-id="a"]') as HTMLElement).focus())
    await user.click(getByRole("button", { name: "Delete" }))
    expect([...container.querySelectorAll("[data-id]")].map((e) => e.getAttribute("data-id"))).toEqual(["b"])
    expect(document.activeElement).toBe(container.querySelector('[data-slot="sticker-board-surface"]'))
    expect(getByRole("button", { name: "Delete" })).toBeDisabled()
  })

  it("the turn buttons are turn arrows, not undo and redo", () => {
    const { getByRole } = renderUI(<StickerBoard className="h-96" defaultValue={START} />)
    const icon = (name: string) => getByRole("button", { name }).querySelector("[data-icon]")
    expect(icon("Turn left")?.getAttribute("data-icon")).toBe("rotate-cw")
    expect(icon("Turn left")?.getAttribute("class")).toContain("-scale-x-100")
    expect(icon("Turn right")?.getAttribute("class") ?? "").not.toContain("-scale-x-100")
  })

  it("JSON that lacks a turn, a size or a stacking order still lays out (no NaN), and round-trips", async () => {
    const partial = [{ id: "a", name: "rocket", x: 50, y: 50 }, { id: "b", name: "done", x: "oops", y: 100, scale: 0 }] as unknown as StickerBoardItem[]
    const onValueChange = vi.fn()
    const { container, user } = renderUI(<StickerBoard className="h-96" defaultValue={partial} onValueChange={onValueChange} />)
    for (const el of container.querySelectorAll<HTMLElement>('[data-slot="sticker-board-item"]')) {
      expect(el.getAttribute("style")).not.toMatch(/NaN|undefined/)
      expect(el.style.width).toMatch(/^\d/)
    }
    const a = container.querySelector('[data-id="a"]') as HTMLElement
    act(() => a.focus())
    await user.keyboard("{PageUp}")
    await user.keyboard("]")
    const last = onValueChange.mock.calls.at(-1)?.[0] as StickerBoardItem[]
    expect(last.every((s) => [s.x, s.y, s.rot, s.scale, s.z].every(Number.isFinite))).toBe(true)
    expect(wholeItems(JSON.parse(JSON.stringify(last)))).toEqual(last)
    const again = renderUI(<StickerBoard className="h-96" defaultValue={JSON.parse(JSON.stringify(last))} />)
    expect(again.container.querySelectorAll('[data-slot="sticker-board-item"]')).toHaveLength(2)
  })

  it("wholeItems returns the same array when nothing is missing", () => {
    expect(wholeItems(START)).toBe(START)
  })

  it("the helpers and the export do not choke on a missing z", () => {
    const gappy = [{ id: "a", name: "rocket", x: 1, y: 1, rot: 0, scale: 1 }, { id: "b", name: "done", x: 2, y: 2, rot: 0, scale: 1, z: 3 }] as unknown as StickerBoardItem[]
    expect(() => reorderSticker(gappy, "a", "front")).not.toThrow()
    expect(reorderSticker(gappy, "a", "front").map((s) => s.z)).toEqual([1, 0])
    expect(addSticker(gappy, "done")[2].z).toBe(4)
    expect(composeBoardSvg(gappy, { width: 100, height: 100, size: 96 })).not.toMatch(/NaN|undefined/)
  })

  it("the export is one standalone file: every reference resolves, ids are unique, nothing is a NaN", () => {
    const items = ["rocket", "done", "stamp-approved", "first-place"].map((name, i) => ({ id: `${name}-1`, name, x: 90 + i * 80, y: 100, rot: i * 7 - 9, scale: 1 + i * 0.1, z: i }))
    const svg = composeBoardSvg(items, { width: 480, height: 300, size: 96 })
    const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1])
    expect(new Set(ids).size).toBe(ids.length)
    for (const ref of new Set([...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]))) expect(ids).toContain(ref)
    expect(svg).not.toMatch(/NaN|undefined|currentColor/)
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
  })

  it("a board you can only look at explains no keys: no instructions, nothing described by them", () => {
    const { container } = renderUI(<StickerBoard readOnly className="h-96" defaultValue={START} />)
    expect(container.querySelector("[aria-describedby]")).toBeNull()
    expect(container.textContent).not.toContain("arrow keys")
    const live = renderUI(<StickerBoard className="h-96" defaultValue={START} />)
    expect(live.container.querySelector('[data-slot="sticker-board-canvas"]')).toHaveAttribute("aria-describedby")
  })

  it("stickers and slots that draw nothing at rest do not wear the not-yet-measured pencil box", () => {
    const { container } = renderUI(<StickerBoard className="h-96" defaultValue={START} />)
    expect(container.querySelector('[data-slot="sticker-board-item"]')?.className).toContain("not-focus-visible:outline-none")
    const sheet = renderUI(<StickerSheet title="t" stickers={["rocket"]} />)
    expect(sheet.container.querySelector('[data-slot="sticker-sheet-item"]')?.className).toContain("not-focus-visible:outline-none")
  })

  it("StrictMode, calm density and a right-to-left page render without a single React error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const { container } = renderUI(
      <React.StrictMode>
        <InkProvider density="calm">
          <div dir="rtl">
            <StickerBoard className="h-96" defaultValue={START} />
          </div>
        </InkProvider>
      </React.StrictMode>
    )
    await axeCheck(container)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe("sticker picker", () => {
  it("a press on a sticker does not pull the focus out of the search field", async () => {
    const { user, getByRole, findByRole } = renderUI(
      <StickerPicker closeOnSelect={false}>
        <StickerPickerTrigger asChild>
          <button>open</button>
        </StickerPickerTrigger>
        <StickerPickerContent />
      </StickerPicker>,
      { user: { pointerEventsCheck: 0 } }
    )
    await user.click(getByRole("button", { name: "open" }))
    await findByRole("combobox")
    const opt = document.querySelector('[role="option"]') as HTMLElement
    const down = new MouseEvent("mousedown", { bubbles: true, cancelable: true })
    opt.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
  })
})

describe("sticker picker edges", () => {
  const open = async (ui: React.ReactElement) => {
    const r = renderUI(ui, { user: { pointerEventsCheck: 0 } })
    await r.user.click(r.getByRole("button", { name: "open" }))
    await r.findByRole("combobox")
    return r
  }

  it("an empty catalog says so instead of 'Nothing looks like \"\"'", async () => {
    await open(
      <StickerPicker stickers={["not-a-sticker-xyz"]}>
        <StickerPickerTrigger asChild>
          <button>open</button>
        </StickerPickerTrigger>
        <StickerPickerContent />
      </StickerPicker>
    )
    expect(document.body).toHaveTextContent("No stickers to choose from.")
    expect(document.body).not.toHaveTextContent("Nothing looks like")
  })

  it("columns below one are one column (the arrow keys never divide by zero)", async () => {
    const { user } = await open(
      <StickerPicker stickers={["rocket", "done", "wow"]}>
        <StickerPickerTrigger asChild>
          <button>open</button>
        </StickerPickerTrigger>
        <StickerPickerContent columns={0} />
      </StickerPicker>
    )
    const grid = document.querySelector('[data-slot="sticker-picker-list"] .grid') as HTMLElement
    expect(grid.style.gridTemplateColumns).toContain("repeat(1,")
    await user.keyboard("{ArrowDown}")
    expect(document.querySelector('[data-active]')).toHaveAttribute("aria-label", "Done")
  })
})

describe("stamp button", () => {
  const saved: StampImpression[] = [{ id: "stamp-paid", press: 1, x: 0.5, y: 0.5, name: "stamp-paid", turn: 1, seed: "stamp-paid#1" }]

  it("impressions that were restored do not thump in again; the ones struck now do", async () => {
    const { container, user, getByRole } = renderUI(
      <StampSurface defaultValue={saved} className="h-64 w-96">
        <StampButton stamp="stamp-approved">Approve</StampButton>
      </StampSurface>
    )
    const cls = () => [...container.querySelectorAll('[data-slot="stamp-impression"]')].map((e) => e.getAttribute("class") ?? "")
    expect(cls()).toHaveLength(1)
    expect(cls()[0]).not.toContain("animate-in")
    await user.click(getByRole("button", { name: "Approve" }))
    expect(cls()).toHaveLength(2)
    expect(cls().filter((c) => c.includes("animate-in"))).toHaveLength(1)
    await user.click(getByRole("button", { name: "Approve" }))
    expect(cls().filter((c) => c.includes("animate-in"))).toHaveLength(1)
  })

  it("the server's markup for a stamped page has no landing animation to replay", () => {
    const html = renderToString(
      <StampSurface defaultValue={saved}>
        <p>Invoice</p>
      </StampSurface>
    )
    expect(html).toContain('data-slot="stamp-impression"')
    expect(html).not.toContain("animate-in")
  })

  it("two tools that share an impressionId leave one decision on the page", async () => {
    const { container, user, getByRole } = renderUI(
      <StampSurface className="h-64 w-96">
        <StampButton stamp="stamp-approved" impressionId="decision">Approve</StampButton>
        <StampButton stamp="stamp-void" text="Rejected" impressionId="decision">Reject</StampButton>
      </StampSurface>
    )
    await user.click(getByRole("button", { name: "Approve" }))
    await user.click(getByRole("button", { name: "Reject" }))
    const marks = [...container.querySelectorAll('[data-slot="stamp-impression"]')]
    expect(marks).toHaveLength(1)
    expect(marks[0]).toHaveAttribute("aria-label", "Rejected")
  })

  it("asChild with disabled is an aria-disabled element that stamps nothing", async () => {
    const onStamp = vi.fn()
    const { container, user, getByRole } = renderUI(
      <StampSurface className="h-64 w-96">
        <StampButton asChild stamp="stamp-paid" disabled onStamp={onStamp}>
          <a href="#x">Paid</a>
        </StampButton>
      </StampSurface>
    )
    expect(getByRole("link", { name: "Paid" })).toHaveAttribute("aria-disabled", "true")
    await user.click(getByRole("link", { name: "Paid" }))
    expect(onStamp).not.toHaveBeenCalled()
    expect(container.querySelectorAll('[data-slot="stamp-impression"]')).toHaveLength(0)
  })

  it("StrictMode, calm density and a right-to-left page: no React errors, no axe violations", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const { container, user, getByRole } = renderUI(
      <React.StrictMode>
        <InkProvider density="calm">
          <div dir="rtl">
            <StampSurface className="h-64 w-96">
              <StampButton stamp="stamp-approved">Approve</StampButton>
            </StampSurface>
          </div>
        </InkProvider>
      </React.StrictMode>
    )
    await user.click(getByRole("button", { name: "Approve" }))
    await axeCheck(container)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe("ribbon", () => {
  it("a link ribbon underlines its words on hover (visible without hue)", () => {
    const run = (hoverable: boolean) =>
      runRecipe(ribbonRecipe, { box: { w: 140, h: 43 }, params: { variant: "banner", tone: "marker", size: "default", hoverable }, seed: "r", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } })
    expect(run(false).parts.hover).toBeUndefined()
    expect((run(true).parts.hover ?? "").match(/<path/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
    expect((run(true).parts.hover ?? "").length).toBeLessThan(3500)
  })

  it("survives StrictMode, calm density and a right-to-left page", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const { container } = renderUI(
      <React.StrictMode>
        <InkProvider density="calm">
          <div dir="rtl">
            <Ribbon variant="flag">New</Ribbon>
            <Ribbon asChild>
              <a href="#x">Read</a>
            </Ribbon>
          </div>
        </InkProvider>
      </React.StrictMode>
    )
    await axeCheck(container)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe("seal", () => {
  it("a ticket is one line: its second line would be drawn across the inner rule and clipped", () => {
    const a = sealArt({ variant: "ticket", text: "Admit", sub: "one" }, 112, "s", "lo")
    const b = sealArt({ variant: "ticket", text: "Admit" }, 112, "s", "lo")
    expect(a.svg).toBe(b.svg)
  })

  it("identical seals side by side share no id (a hidden one cannot take the other's masks away)", () => {
    const { container } = renderUI(
      <div>
        <Seal mark="check" />
        <Seal mark="check" />
        <Seal variant="wax" text="L" />
        <Seal variant="wax" text="L" />
      </div>
    )
    const ids = [...container.querySelectorAll("[id]")].map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("hostile input draws something whole: bogus variant, huge text, emoji, tiny and huge sizes", () => {
    for (const variant of ["bogus", "scallop", "ring", "wax", "ticket"] as const) {
      for (const text of ["", "x".repeat(300), "\u{1F600}", "<b>&\""]) {
        for (const size of [1, 16, 2000]) {
          const r = sealArt({ variant: variant as never, text, ring: "HELLO" }, size, "s", "lo")
          expect(r.svg).not.toMatch(/NaN|undefined|Infinity/)
        }
      }
    }
  })
})
