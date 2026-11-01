import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  StickerBoard,
  StickerBoardCanvas,
  StickerBoardToolbar,
  addSticker,
  boardPoint,
  reorderSticker,
  type StickerBoardExport,
  type StickerBoardItem,
} from "@/components/ui/sticker-board"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { composeBoardSvg, stickerBoardItemRecipe } from "@/lib/ink/recipes/sticker-board-ink"
import { stickerFace } from "@/lib/ink/recipes/sticker-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 200)
})
afterEach(() => restore())

const START: StickerBoardItem[] = [
  { id: "rocket-1", name: "rocket", x: 200, y: 150, rot: 0, scale: 1, z: 0 },
  { id: "done-1", name: "done", x: 400, y: 220, rot: 10, scale: 1.5, z: 1 },
]

const size = (el: Element, w: number, h: number) => {
  Object.defineProperty(el, "offsetWidth", { configurable: true, value: w })
  Object.defineProperty(el, "offsetHeight", { configurable: true, value: h })
}
function sized(container: HTMLElement) {
  size(container.querySelector('[data-slot="sticker-board-canvas"]') as Element, 600, 400)
}
const focus = (el: HTMLElement) => act(() => el.focus())
const item = (c: HTMLElement, id: string) => c.querySelector(`[data-slot="sticker-board-item"][data-id="${id}"]`) as HTMLElement
const at = (el: HTMLElement) => /calc\((-?[\d.]+)px - 50%\) calc\((-?[\d.]+)px - 50%\)/.exec(el.style.translate)?.slice(1).map(Number)

const Board = (p: Partial<React.ComponentProps<typeof StickerBoard>> = {}) => <StickerBoard className="h-96" defaultValue={START} {...p} />

function Controlled({ onChange }: { onChange?: (v: StickerBoardItem[]) => void }) {
  const [v, setV] = React.useState(START)
  return (
    <StickerBoard
      className="h-96"
      value={v}
      onValueChange={(next) => {
        setV(next)
        onChange?.(next)
      }}
    />
  )
}

function drag(el: Element, from: [number, number], to: [number, number], pointerId = 1) {
  fireEvent.pointerDown(el, { pointerId, button: 0, clientX: from[0], clientY: from[1] })
  fireEvent.pointerMove(el, { pointerId, clientX: (from[0] + to[0]) / 2, clientY: (from[1] + to[1]) / 2 })
  fireEvent.pointerMove(el, { pointerId, clientX: to[0], clientY: to[1] })
  fireEvent.pointerUp(el, { pointerId, clientX: to[0], clientY: to[1] })
}

describe("StickerBoard structure", () => {
  it("is a named canvas of focusable, named stickers, with a toolbar", () => {
    const { getByRole, getAllByRole, container } = renderUI(<Board />)
    expect(getByRole("group", { name: "Sticker board" })).toBeInTheDocument()
    const stickers = getAllByRole("group", { name: /^(Rocket|Done)$/ })
    expect(stickers).toHaveLength(2)
    expect(stickers[0]).toHaveAttribute("aria-roledescription", "sticker")
    expect(stickers[0]).toHaveAttribute("tabindex", "0")
    expect(getByRole("toolbar", { name: "Sticker tools" })).toBeInTheDocument()
    expect(item(container, "rocket-1").style.rotate).toBe("0deg")
    expect(item(container, "done-1").style.rotate).toBe("10deg")
  })

  it("lays a sticker out by its center, and stacks by z", () => {
    const { container } = renderUI(<Board />)
    expect(at(item(container, "rocket-1"))).toEqual([200, 150])
    expect(item(container, "rocket-1").style.zIndex).toBe("1")
    expect(item(container, "done-1").style.zIndex).toBe("2")
  })

  it("is sized by the visible sticker and scaled around its center", () => {
    const { container } = renderUI(<Board />)
    const face = stickerFace("done", 96, "done-1")!
    const el = item(container, "done-1")
    expect(el.style.width).toBe(`${face.box.w * 1.5}px`)
    expect(el.style.height).toBe(`${face.box.h * 1.5}px`)
    expect((el.querySelector('[data-slot="sticker-board-item-art"]') as HTMLElement).style.scale).toBe("1.5")
  })

  it("skips a name that has not been drawn (it stays in the value)", () => {
    const { container } = renderUI(<Board defaultValue={[...START, { id: "x", name: "no-such-sticker", x: 1, y: 1, rot: 0, scale: 1, z: 2 }]} />)
    expect(container.querySelectorAll('[data-slot="sticker-board-item"]')).toHaveLength(2)
  })

  it("shows a hint while empty", () => {
    const { container, rerender } = renderUI(<Board defaultValue={[]} />)
    expect(container.querySelector('[data-slot="sticker-board-empty"]')).toHaveTextContent("Nothing stuck down yet.")
    rerender(<Board defaultValue={[]} />)
  })

  it("is accessible, empty and full", async () => {
    const { container } = renderUI(<Board />)
    await axeCheck(container)
    const empty = renderUI(<Board defaultValue={[]} />)
    await axeCheck(empty.container)
  })

  it("draws stickers as intrinsic art and the picked one gets a frame host", () => {
    const { container } = renderUI(<Board />)
    expectInkLayers(container, { kinds: ["sticker", "frame", "button", "icon"] })
  })

  it("a part outside a board says so", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<StickerBoardCanvas />)).toThrow(/inside <StickerBoard>/)
    spy.mockRestore()
  })
})

describe("StickerBoard selection and the frame", () => {
  it("focus picks a sticker: frame, handles, current", () => {
    const { container } = renderUI(<Board />)
    const a = item(container, "rocket-1")
    expect(a).not.toHaveAttribute("data-selected")
    focus(a)
    expect(a).toHaveAttribute("data-selected")
    expect(a).toHaveAttribute("aria-current", "true")
    expect(a.querySelector('[data-handle="rotate"]')).not.toBeNull()
    expect(a.querySelector('[data-handle="scale"]')).not.toBeNull()
    const svg = a.querySelector('svg[data-ink="frame"]')!
    expect(svg).not.toBeNull()
    expect(svg.querySelector('[data-layer="rest"]')).not.toBeNull()
    expect(item(container, "done-1").querySelector("[data-handle]")).toBeNull()
  })

  it("picking another lets go of the first; Escape and the bare page let go", async () => {
    const { container, user } = renderUI(<Board />)
    focus(item(container, "rocket-1"))
    focus(item(container, "done-1"))
    expect(item(container, "rocket-1")).not.toHaveAttribute("data-selected")
    expect(item(container, "done-1")).toHaveAttribute("data-selected")
    await user.keyboard("{Escape}")
    expect(item(container, "done-1")).not.toHaveAttribute("data-selected")
    focus(item(container, "rocket-1"))
    fireEvent.pointerDown(container.querySelector('[data-slot="sticker-board-surface"]')!, { pointerId: 1, button: 0 })
    expect(item(container, "rocket-1")).not.toHaveAttribute("data-selected")
  })

  it("selection can be controlled", () => {
    const onSelectedIdChange = vi.fn()
    const { container, rerender } = renderUI(<Board selectedId="done-1" onSelectedIdChange={onSelectedIdChange} />)
    expect(item(container, "done-1")).toHaveAttribute("data-selected")
    focus(item(container, "rocket-1"))
    expect(onSelectedIdChange).toHaveBeenCalledWith("rocket-1")
    expect(item(container, "done-1")).toHaveAttribute("data-selected")
    rerender(<Board selectedId="rocket-1" onSelectedIdChange={onSelectedIdChange} />)
    expect(item(container, "rocket-1")).toHaveAttribute("data-selected")
  })

  it("a selected id that is not on the board picks nothing", () => {
    const { container } = renderUI(<Board selectedId="ghost" />)
    expect(container.querySelector("[data-selected]")).toBeNull()
  })
})

describe("StickerBoard keyboard", () => {
  it("arrows move (Shift 32, Alt 1) and report the new value", async () => {
    const onValueChange = vi.fn()
    const { container, user } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    const a = item(container, "rocket-1")
    focus(a)
    await user.keyboard("{ArrowRight}")
    expect(at(a)).toEqual([208, 150])
    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(at(a)).toEqual([208, 166])
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}")
    expect(at(a)).toEqual([176, 166])
    await user.keyboard("{Alt>}{ArrowUp}{/Alt}")
    expect(at(a)).toEqual([176, 165])
    expect(onValueChange).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining({ id: "rocket-1", x: 176, y: 165 })]))
  })

  it("[ and ] turn by 5 degrees (Shift 15) and fold into -180..180", async () => {
    const { container, user } = renderUI(<Board />)
    const a = item(container, "rocket-1")
    focus(a)
    await user.keyboard("]]")
    expect(a.style.rotate).toBe("10deg")
    await user.keyboard("[[")
    expect(a.style.rotate).toBe("5deg")
    await user.keyboard("{Shift>}[[{/Shift}")
    expect(a.style.rotate).toBe("-10deg")
    const b = item(container, "done-1")
    focus(b)
    await user.keyboard("{Shift>}]]]{/Shift}")
    expect(b.style.rotate).toBe("55deg")
    const r = renderUI(<Board defaultValue={[{ ...START[0], rot: 178 }]} />)
    const c = item(r.container, "rocket-1")
    focus(c)
    await r.user.keyboard("]")
    expect(c.style.rotate).toBe("-177deg")
  })

  it("R turns right and Shift+R left, like the corkboard; AltGr (Ctrl+Alt) still types brackets", async () => {
    const { container, user } = renderUI(<Board />)
    const a = item(container, "rocket-1")
    focus(a)
    await user.keyboard("rr")
    expect(a.style.rotate).toBe("10deg")
    await user.keyboard("{Shift>}R{/Shift}")
    expect(a.style.rotate).toBe("-5deg")
    fireEvent.keyDown(a, { key: "]", ctrlKey: true, altKey: true })
    expect(a.style.rotate).toBe("0deg")
    fireEvent.keyDown(a, { key: "]", ctrlKey: true })
    expect(a.style.rotate).toBe("0deg")
  })

  it("+ and - size by 10 percent inside the limits", async () => {
    const { container, user } = renderUI(<Board maxScale={1.2} minScale={0.9} />)
    const a = item(container, "rocket-1")
    focus(a)
    await user.keyboard("+")
    expect((a.querySelector('[data-slot="sticker-board-item-art"]') as HTMLElement).style.scale).toBe("1.1")
    await user.keyboard("++")
    expect((a.querySelector('[data-slot="sticker-board-item-art"]') as HTMLElement).style.scale).toBe("1.2")
    await user.keyboard("------")
    expect((a.querySelector('[data-slot="sticker-board-item-art"]') as HTMLElement).style.scale).toBe("0.9")
  })

  it("0 sets a sticker upright at full size", async () => {
    const { container, user } = renderUI(<Board />)
    const b = item(container, "done-1")
    focus(b)
    await user.keyboard("0")
    expect(b.style.rotate).toBe("0deg")
    expect((b.querySelector('[data-slot="sticker-board-item-art"]') as HTMLElement).style.scale).toBe("1")
  })

  it("Delete removes the sticker and hands focus on", async () => {
    const onValueChange = vi.fn()
    const { container, user } = renderUI(<Board onValueChange={onValueChange} />)
    focus(item(container, "rocket-1"))
    await user.keyboard("{Delete}")
    expect(item(container, "rocket-1")).toBeNull()
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ id: "done-1" })])
    expect(document.activeElement).toBe(item(container, "done-1"))
    await user.keyboard("{Backspace}")
    expect(container.querySelectorAll('[data-slot="sticker-board-item"]')).toHaveLength(0)
    expect(container.querySelector('[data-slot="sticker-board-empty"]')).not.toBeNull()
  })

  it("PageUp / PageDown move through the stack, Shift goes all the way", async () => {
    const onValueChange = vi.fn()
    const { container, user } = renderUI(<Board onValueChange={onValueChange} />)
    const a = item(container, "rocket-1")
    focus(a)
    await user.keyboard("{PageUp}")
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ id: "rocket-1", z: 1 }), expect.objectContaining({ id: "done-1", z: 0 })])
    expect(a.style.zIndex).toBe("2")
    await user.keyboard("{Shift>}{PageDown}{/Shift}")
    expect(a.style.zIndex).toBe("1")
  })

  it("Ctrl+D duplicates, picks the copy and offsets it", async () => {
    const onValueChange = vi.fn()
    const { container, user } = renderUI(<Board onValueChange={onValueChange} />)
    focus(item(container, "rocket-1"))
    await user.keyboard("{Control>}d{/Control}")
    const next = onValueChange.mock.calls.at(-1)![0] as StickerBoardItem[]
    expect(next).toHaveLength(3)
    expect(next[2]).toMatchObject({ id: "rocket-2", name: "rocket", x: 220, y: 170, z: 2 })
    expect(item(container, "rocket-2")).toHaveAttribute("data-selected")
  })

  it("keeps the center on the canvas, or the whole sticker with bounds=inside", async () => {
    const { container, user } = renderUI(<Board defaultValue={[{ ...START[0], x: 4, y: 4 }]} />)
    sized(container)
    const a = item(container, "rocket-1")
    focus(a)
    await user.keyboard("{Shift>}{ArrowLeft}{ArrowUp}{/Shift}")
    expect(at(a)).toEqual([0, 0])
    const inside = renderUI(<Board bounds="inside" defaultValue={[{ ...START[0], x: 4, y: 4 }]} />)
    sized(inside.container)
    const b = item(inside.container, "rocket-1")
    focus(b)
    await inside.user.keyboard("{Shift>}{ArrowLeft}{ArrowUp}{/Shift}")
    const box = stickerFace("rocket", 96, "rocket-1")!.box
    expect(at(b)).toEqual([box.w / 2, box.h / 2])
    const none = renderUI(<Board bounds="none" defaultValue={[{ ...START[0], x: 4, y: 4 }]} />)
    sized(none.container)
    const c = item(none.container, "rocket-1")
    focus(c)
    await none.user.keyboard("{Shift>}{ArrowLeft}{/Shift}")
    expect(at(c)).toEqual([-28, 4])
  })

  it("announces the change once, politely", async () => {
    vi.useFakeTimers()
    try {
      const { container, getByRole } = renderUI(<Board />, { user: { advanceTimers: vi.advanceTimersByTime } })
      sized(container)
      focus(item(container, "rocket-1"))
      fireEvent.keyDown(item(container, "rocket-1"), { key: "ArrowRight" })
      fireEvent.keyDown(item(container, "rocket-1"), { key: "ArrowRight" })
      expect(getByRole("status")).toHaveTextContent("")
      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(getByRole("status")).toHaveTextContent("Rocket at 216, 150.")
    } finally {
      vi.useRealTimers()
    }
  })
})

describe("StickerBoard pointer", () => {
  it("dragging moves the sticker live and reports it once, on release", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    const a = item(container, "rocket-1")
    fireEvent.pointerDown(a, { pointerId: 1, button: 0, clientX: 100, clientY: 100 })
    expect(a).toHaveAttribute("data-dragging")
    expect(a).toHaveAttribute("data-selected")
    fireEvent.pointerMove(a, { pointerId: 1, clientX: 160, clientY: 150 })
    expect(at(a)).toEqual([260, 200])
    expect(onValueChange).not.toHaveBeenCalled()
    fireEvent.pointerUp(a, { pointerId: 1, clientX: 160, clientY: 150 })
    expect(a).not.toHaveAttribute("data-dragging")
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: "rocket-1", x: 260, y: 200 })]))
    expect(at(a)).toEqual([260, 200])
    expect(a.style.zIndex).toBe("1")
  })

  it("the sticker in the hand lies above the pile", () => {
    const { container } = renderUI(<Board />)
    sized(container)
    const a = item(container, "rocket-1")
    fireEvent.pointerDown(a, { pointerId: 1, button: 0, clientX: 1, clientY: 1 })
    expect(Number(a.style.zIndex)).toBeGreaterThan(100)
  })

  it("keeps the center on the canvas", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    drag(item(container, "rocket-1"), [100, 100], [5000, 5000])
    expect(onValueChange.mock.calls[0][0][0]).toMatchObject({ x: 600, y: 400 })
    drag(item(container, "rocket-1"), [100, 100], [-5000, -5000])
    expect(onValueChange.mock.calls[1][0][0]).toMatchObject({ x: 0, y: 0 })
  })

  it("a click that does not move changes nothing but the pick", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    drag(item(container, "rocket-1"), [100, 100], [101, 100])
    expect(onValueChange).not.toHaveBeenCalled()
    expect(item(container, "rocket-1")).toHaveAttribute("data-selected")
  })

  it("pointercancel puts it back", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    const a = item(container, "rocket-1")
    fireEvent.pointerDown(a, { pointerId: 1, button: 0, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(a, { pointerId: 1, clientX: 200, clientY: 200 })
    fireEvent.pointerCancel(a, { pointerId: 1 })
    expect(at(a)).toEqual([200, 150])
    expect(a.style.zIndex).toBe("1")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("the turn ring turns it about its center, Shift snaps to 15 degrees", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    const a = item(container, "rocket-1")
    focus(a)
    vi.spyOn(a, "getBoundingClientRect").mockReturnValue({ left: 50, top: 50, right: 150, bottom: 150, width: 100, height: 100, x: 50, y: 50, toJSON() {} })
    const handle = a.querySelector('[data-handle="rotate"]')!
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100, clientY: 20 })
    fireEvent.pointerMove(a, { pointerId: 1, clientX: 180, clientY: 100 })
    expect(a.style.rotate).toBe("90deg")
    fireEvent.pointerMove(a, { pointerId: 1, clientX: 180, clientY: 79, shiftKey: true })
    expect(a.style.rotate).toBe("75deg")
    fireEvent.pointerUp(a, { pointerId: 1, clientX: 180, clientY: 79 })
    expect(onValueChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: "rocket-1", rot: 75 })]))
  })

  it("the size square scales with the distance from the center, inside the limits", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    const a = item(container, "rocket-1")
    focus(a)
    vi.spyOn(a, "getBoundingClientRect").mockReturnValue({ left: 50, top: 50, right: 150, bottom: 150, width: 100, height: 100, x: 50, y: 50, toJSON() {} })
    const handle = a.querySelector('[data-handle="scale"]')!
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 150, clientY: 100 })
    fireEvent.pointerMove(a, { pointerId: 1, clientX: 250, clientY: 100 })
    const art = a.querySelector('[data-slot="sticker-board-item-art"]') as HTMLElement
    expect(art.style.scale).toBe("3")
    fireEvent.pointerMove(a, { pointerId: 1, clientX: 175, clientY: 100 })
    expect(art.style.scale).toBe("1.5")
    fireEvent.pointerMove(a, { pointerId: 1, clientX: 101, clientY: 100 })
    expect(art.style.scale).toBe("0.3")
    fireEvent.pointerUp(a, { pointerId: 1, clientX: 101, clientY: 100 })
    expect(onValueChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: "rocket-1", scale: 0.3 })]))
  })
})

describe("StickerBoard value", () => {
  it("uncontrolled: defaultValue seeds it and changes stick", async () => {
    const { container, user } = renderUI(<Board />)
    focus(item(container, "rocket-1"))
    await user.keyboard("{ArrowRight}")
    expect(at(item(container, "rocket-1"))).toEqual([208, 150])
  })

  it("controlled: the parent's value wins and follows the parent", async () => {
    const onChange = vi.fn()
    const { container, user, getByRole } = renderUI(<Controlled onChange={onChange} />)
    sized(container)
    focus(item(container, "done-1"))
    await user.keyboard("{ArrowRight}")
    expect(at(item(container, "done-1"))).toEqual([408, 220])
    expect(getByRole("group", { name: "Sticker board" })).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("a controlled board that ignores changes stays put", async () => {
    const { container } = renderUI(<StickerBoard className="h-96" value={START} onValueChange={() => {}} />)
    sized(container)
    drag(item(container, "rocket-1"), [10, 10], [90, 90])
    await waitFor(() => expect(at(item(container, "rocket-1"))).toEqual([200, 150]))
  })

  it("readOnly and disabled boards cannot be touched", async () => {
    for (const p of [{ readOnly: true }, { disabled: true }]) {
      const onValueChange = vi.fn()
      const { container, user, getByRole, unmount } = renderUI(<Board {...p} onValueChange={onValueChange} />)
      sized(container)
      const a = item(container, "rocket-1")
      expect(a).not.toHaveAttribute("tabindex")
      drag(a, [10, 10], [90, 90])
      await user.keyboard("{ArrowRight}{Delete}")
      expect(onValueChange).not.toHaveBeenCalled()
      expect(a.querySelector("[data-handle]")).toBeNull()
      expect(getByRole("button", { name: "Export" })).toBeEnabled()
      expect(getByRole("button", { name: "Duplicate" })).toBeDisabled()
      await axeCheck(container)
      unmount()
    }
  })
})

describe("StickerBoardToolbar", () => {
  it("is disabled until something is picked (export never is)", () => {
    const { getByRole, container } = renderUI(<Board />)
    for (const name of ["Turn left", "Turn right", "Smaller", "Larger", "Send to back", "Send backward", "Bring forward", "Bring to front", "Duplicate", "Delete"]) {
      expect(getByRole("button", { name })).toBeDisabled()
    }
    expect(getByRole("button", { name: "Export" })).toBeEnabled()
    focus(item(container, "rocket-1"))
    for (const name of ["Turn left", "Larger", "Bring forward", "Duplicate", "Delete"]) expect(getByRole("button", { name })).toBeEnabled()
  })

  it("acts on the picked sticker", async () => {
    const onValueChange = vi.fn()
    const { container, user, getByRole } = renderUI(<Board onValueChange={onValueChange} />)
    focus(item(container, "rocket-1"))
    await user.click(getByRole("button", { name: "Turn right" }))
    expect(item(container, "rocket-1").style.rotate).toBe("5deg")
    await user.click(getByRole("button", { name: "Larger" }))
    expect((item(container, "rocket-1").querySelector('[data-slot="sticker-board-item-art"]') as HTMLElement).style.scale).toBe("1.1")
    await user.click(getByRole("button", { name: "Bring to front" }))
    expect(item(container, "rocket-1").style.zIndex).toBe("2")
    await user.click(getByRole("button", { name: "Send to back" }))
    expect(item(container, "rocket-1").style.zIndex).toBe("1")
    await user.click(getByRole("button", { name: "Delete" }))
    expect(item(container, "rocket-1")).toBeNull()
    expect(getByRole("button", { name: "Delete" })).toBeDisabled()
  })

  it("has one tab stop per row of buttons? no: every enabled button is a stop, arrows move along the row", async () => {
    const { container, user, getByRole } = renderUI(<Board />)
    focus(item(container, "rocket-1"))
    focus(getByRole("button", { name: "Turn left" }))
    await user.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(getByRole("button", { name: "Turn right" }))
    await user.keyboard("{End}")
    expect(document.activeElement).toBe(getByRole("button", { name: "Export" }))
    await user.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(getByRole("button", { name: "Turn left" }))
  })

  it("actions picks which groups exist", () => {
    const { queryByRole } = renderUI(
      <StickerBoard defaultValue={START}>
        <StickerBoardCanvas />
        <StickerBoardToolbar actions={["turn", "export"]} />
      </StickerBoard>
    )
    expect(queryByRole("button", { name: "Turn left" })).not.toBeNull()
    expect(queryByRole("button", { name: "Delete" })).toBeNull()
    expect(queryByRole("button", { name: "Bring to front" })).toBeNull()
  })

  it("export hands over json, a standalone svg and the size", async () => {
    let got: StickerBoardExport | undefined
    const { container, user, getByRole } = renderUI(<Board onExport={(d) => (got = d)} />)
    sized(container)
    await user.click(getByRole("button", { name: "Export" }))
    expect(got).toBeDefined()
    expect(JSON.parse(got!.json)).toEqual(START)
    expect(got!.svg.startsWith("<svg")).toBe(true)
    expect(got!.svg).toContain('width="600"')
    expect(got!.svg).toContain("<mask")
    expect(got!.svg).not.toMatch(/NaN|undefined/)
    expect(typeof got!.png).toBe("function")
  })

  it("export without a handler downloads the svg", async () => {
    const create = vi.fn(() => "blob:x")
    const revoke = vi.fn()
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke })
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    const { user, getByRole } = renderUI(<Board />)
    await user.click(getByRole("button", { name: "Export" }))
    expect(create).toHaveBeenCalledTimes(1)
    expect(click).toHaveBeenCalledTimes(1)
    expect(revoke).not.toHaveBeenCalled()
    await waitFor(() => expect(revoke).toHaveBeenCalledWith("blob:x"), { timeout: 2000 })
    click.mockRestore()
  })
})

describe("helpers", () => {
  it("addSticker: fresh ids, on top, never dead straight, fanning out", () => {
    const a = addSticker([], "rocket")
    const b = addSticker(a, "rocket")
    const c = addSticker(b, "done", { x: 10, y: 20 })
    expect(c.map((s) => s.id)).toEqual(["rocket-1", "rocket-2", "done-1"])
    expect(c.map((s) => s.z)).toEqual([0, 1, 2])
    expect(c[2]).toMatchObject({ x: 10, y: 20, scale: 1 })
    expect(c[0].rot).not.toBe(0)
    expect(addSticker([], "rocket")).toEqual(a)
    expect(a[0].x).not.toBe(b[1].x)
    expect(addSticker([], "rocket", { canvas: { width: 600, height: 400 } })[0]).toMatchObject({ x: 264, y: 179 })
    expect(addSticker(a, "rocket", { id: "rocket-1" })[1].id).toBe("rocket-2")
  })

  it("reorderSticker ranks z, and returns the same array when nothing moves", () => {
    const three = [0, 1, 2].map((z) => ({ id: `s${z}`, name: "rocket", x: 0, y: 0, rot: 0, scale: 1, z }))
    expect(reorderSticker(three, "s0", "front").map((s) => s.z)).toEqual([2, 0, 1])
    expect(reorderSticker(three, "s2", "back").map((s) => s.z)).toEqual([1, 2, 0])
    expect(reorderSticker(three, "s1", "forward").map((s) => s.z)).toEqual([0, 2, 1])
    expect(reorderSticker(three, "s2", "forward")).toBe(three)
    expect(reorderSticker(three, "s0", "backward")).toBe(three)
    expect(reorderSticker(three, "nope", "front")).toBe(three)
    const gappy = [{ ...three[0], z: 5 }, { ...three[1], z: 50 }]
    expect(reorderSticker(gappy, "s0", "front").map((s) => s.z)).toEqual([1, 0])
  })

  it("boardPoint finds where a pointer is on the canvas", () => {
    const { container } = renderUI(<Board />)
    const canvas = container.querySelector('[data-slot="sticker-board-canvas"]')!
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({ left: 100, top: 40, right: 700, bottom: 440, width: 600, height: 400, x: 100, y: 40, toJSON() {} })
    expect(boardPoint(container, 250, 100)).toEqual({ x: 150, y: 60, inside: true })
    expect(boardPoint(canvas, 250, 100)).toEqual({ x: 150, y: 60, inside: true })
    expect(boardPoint(canvas, 60, 100)).toEqual({ x: -40, y: 60, inside: false })
    expect(boardPoint(canvas, 250, 460)?.inside).toBe(false)
    expect(boardPoint(null, 1, 1)).toBeNull()
  })

  it("composeBoardSvg draws in z order, at the place, turn and size, with unique ids", () => {
    const svg = composeBoardSvg(START, { width: 600, height: 400, size: 96 })
    expect(svg).toContain("translate(200 150) rotate(0) scale(1)")
    expect(svg).toContain("translate(400 220) rotate(10) scale(1.5)")
    expect(svg.indexOf("ll-x0f")).toBeGreaterThan(-1)
    expect(svg.indexOf("ll-x1f")).toBeGreaterThan(svg.indexOf("ll-x0f"))
    const flat = composeBoardSvg([{ ...START[0], z: 5 }, { ...START[1], z: 1 }], { width: 600, height: 400, size: 96, background: null })
    expect(flat).not.toMatch(/<rect width="600"/)
    expect(svg).toMatch(/<rect width="600" height="400" fill="var\(--ll-paper\)"\/>/)
    expect(flat.indexOf("translate(400 220)")).toBeLessThan(flat.indexOf("translate(200 150)"))
    expect(composeBoardSvg(START, { width: 10, height: 10, size: 96, resolve: (s) => s.replaceAll("var(--ll-paper)", "papayawhip") })).toContain("papayawhip")
  })
})

describe("StickerBoard rendering", () => {
  it("renders identically on the server and hydrates cleanly, bare and in a provider", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(<Board />) as React.ReactElement)
      expect(renderToString(wrap(<Board />) as React.ReactElement)).toBe(a)
      expect(a).not.toMatch(/NaN|undefined/)
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(<Board />))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })

  it("survives StrictMode", () => {
    const { container } = renderUI(
      <React.StrictMode>
        <Board />
      </React.StrictMode>
    )
    expect(container.querySelectorAll('[data-slot="sticker-board-item"]')).toHaveLength(2)
  })

  it("two stickers of one kind do not share ids", () => {
    const { container } = renderUI(<Board defaultValue={[START[0], { ...START[0], id: "rocket-2", x: 50 }]} />)
    const ids = [...container.querySelectorAll("[id]")].map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("sticker board frame recipe", () => {
  const run = (params: { selected: boolean; handles: boolean }, box = { w: 120, h: 110 }, density: "comfortable" | "calm" = "comfortable", lazy?: ("hover" | "focus")[]) =>
    runRecipe(stickerBoardItemRecipe, { box, params, seed: "f", tier: "lo", density, dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 }, lazy })

  it("draws nothing until picked; the frame fits the lo budget", () => {
    expect(run({ selected: false, handles: true }).parts.rest ?? "").toBe("")
    const rest = run({ selected: true, handles: true }).parts.rest ?? ""
    expect(rest.length).toBeGreaterThan(500)
    expect(rest.length).toBeLessThan(8000)
    expect((rest.match(/<(path|g)\b/g) ?? []).length).toBeLessThanOrEqual(12)
    expect(rest).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
  })

  it("handles are drawn only for an editable board", () => {
    const withHandles = run({ selected: true, handles: true }).parts.rest ?? ""
    const without = run({ selected: true, handles: false }).parts.rest ?? ""
    expect(withHandles.length).toBeGreaterThan(without.length)
    expect(withHandles).toContain("var(--ll-ink-you)")
  })

  it("hover and focus are lazy layers", () => {
    const f = run({ selected: false, handles: false }, undefined, "comfortable", ["hover", "focus"])
    expect(f.parts.hover).toBeTruthy()
    expect(f.parts.focus).toBeTruthy()
    expect(run({ selected: true, handles: true }).parts.focus).toBeUndefined()
  })

  it("survives absurd boxes", () => {
    for (const box of [{ w: 4, h: 4 }, { w: 900, h: 20 }, { w: 30, h: 900 }]) {
      const rest = run({ selected: true, handles: true }, box).parts.rest ?? ""
      expect(rest).not.toMatch(/NaN|Infinity/)
    }
  })
})
