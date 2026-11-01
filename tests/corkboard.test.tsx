import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Corkboard, CorkboardNote, type CorkboardValue } from "@/components/ui/corkboard"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { CORK_FRAME, corkBoardRecipe, corkPinRecipe } from "@/lib/ink/recipes/corkboard-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 200)
  const proto = HTMLElement.prototype
  const box = (el: HTMLElement): [number, number] => {
    const slot = el.getAttribute("data-slot")
    return slot === "corkboard-surface" ? [900, 600] : slot === "corkboard-note" ? [176, 120] : [320, 200]
  }
  Object.defineProperty(proto, "offsetWidth", { configurable: true, get(this: HTMLElement) { return box(this)[0] } })
  Object.defineProperty(proto, "offsetHeight", { configurable: true, get(this: HTMLElement) { return box(this)[1] } })
})
afterEach(() => restore())

const size = (el: Element, w: number, h: number) => {
  Object.defineProperty(el, "offsetWidth", { configurable: true, value: w })
  Object.defineProperty(el, "offsetHeight", { configurable: true, value: h })
}
function sized(container: HTMLElement) {
  size(container.querySelector('[data-slot="corkboard-surface"]') as Element, 600, 400)
  container.querySelectorAll('[data-slot="corkboard-note"]').forEach((n) => size(n, 100, 80))
}
const note = (c: HTMLElement, id: string) => c.querySelector(`[data-slot="corkboard-note"][data-id="${id}"]`) as HTMLElement

const Board = (p: Partial<React.ComponentProps<typeof Corkboard>> = {}) => (
  <Corkboard className="h-96" {...p}>
    <CorkboardNote id="a" x={40} y={30} rotate={-2}>
      Call mum
    </CorkboardNote>
    <CorkboardNote id="b" x={200} y={120} label="Ink list" pinned={false}>
      Buy ink <button>done</button>
    </CorkboardNote>
  </Corkboard>
)

function drag(el: Element, from: [number, number], to: [number, number], pointerId = 1) {
  fireEvent.pointerDown(el, { pointerId, button: 0, clientX: from[0], clientY: from[1] })
  fireEvent.pointerMove(el, { pointerId, clientX: (from[0] + to[0]) / 2, clientY: (from[1] + to[1]) / 2 })
  fireEvent.pointerMove(el, { pointerId, clientX: to[0], clientY: to[1] })
  fireEvent.pointerUp(el, { pointerId, clientX: to[0], clientY: to[1] })
}

describe("Corkboard", () => {
  it("is a named group of focusable notes, laid out where their props say", () => {
    const { getByRole, getAllByRole, container } = renderUI(<Board />)
    expect(getByRole("group", { name: "Corkboard" })).toBeInTheDocument()
    const notes = getAllByRole("group", { name: /^(a|Ink list)$/ })
    expect(notes).toHaveLength(2)
    expect(notes[0]).toHaveAttribute("aria-roledescription", "note")
    expect(notes[0]).toHaveAttribute("tabindex", "0")
    expect(note(container, "a").style.translate).toBe("40px 30px")
    expect(note(container, "a").style.rotate).toBe("-2deg")
    expect(note(container, "b")).not.toHaveAttribute("data-pinned")
  })

  it("is accessible", async () => {
    const { container } = renderUI(<Board />)
    await axeCheck(container)
  })

  it("draws the board and the pins as ink hosts; unpinned notes get tape instead of a pin", () => {
    const { container } = renderUI(<Board />)
    expectInkLayers(container, { min: 3, absolute: true, kinds: ["corkboard", "corkboard-pin", "tape", "corkboard-note"] })
    expect(container.querySelectorAll('[data-slot="corkboard-pin"]')).toHaveLength(1)
    expect(note(container, "b").querySelector('[data-slot="tape"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="corkboard"] > svg[data-ink="corkboard"] [data-layer], [data-slot="corkboard"] > svg[data-ink="corkboard"] path')).not.toBeNull()
  })

  it("dragging moves the note, raises it, and reports the position", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    const a = note(container, "a")
    fireEvent.pointerDown(a, { pointerId: 1, button: 0, clientX: 100, clientY: 100 })
    expect(a).toHaveAttribute("data-dragging")
    fireEvent.pointerMove(a, { pointerId: 1, clientX: 160, clientY: 150 })
    expect(a.style.translate).toBe("100px 80px")
    fireEvent.pointerUp(a, { pointerId: 1, clientX: 160, clientY: 150 })
    expect(a).not.toHaveAttribute("data-dragging")
    expect(a).toHaveAttribute("data-dropped")
    expect(onValueChange).toHaveBeenCalledWith({ a: { x: 100, y: 80, z: 1 } })
    expect(a.style.translate).toBe("100px 80px")
    expect(a.style.zIndex).toBe("2")
  })

  it("bare hands the paper to the children", () => {
    const { container, getByRole } = renderUI(
      <Corkboard>
        <CorkboardNote id="p" bare label="Photo">
          <figure data-testid="mine">A photo</figure>
        </CorkboardNote>
      </Corkboard>,
    )
    expect(note(container, "p").querySelector('[data-slot="paper"]')).toBeNull()
    expect(note(container, "p").querySelector('[data-slot="corkboard-sheet"] > figure')).not.toBeNull()
    expect(getByRole("group", { name: "Photo" })).toHaveAttribute("aria-roledescription", "note")
  })

  it("keeps the note inside the cork", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    drag(note(container, "a"), [100, 100], [5000, 5000])
    expect(onValueChange.mock.calls[0][0].a).toMatchObject({ x: 500, y: 320 })
    drag(note(container, "a"), [100, 100], [-5000, -5000])
    expect(onValueChange.mock.calls[1][0].a).toMatchObject({ x: 0, y: 0 })
  })

  it("a click that does not move leaves the board alone; controls inside a note are not drags", () => {
    const onValueChange = vi.fn()
    const { container, getByRole } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    drag(note(container, "a"), [100, 100], [101, 101])
    fireEvent.pointerDown(getByRole("button", { name: "done" }), { pointerId: 2, button: 0, clientX: 5, clientY: 5 })
    fireEvent.pointerMove(getByRole("button", { name: "done" }), { pointerId: 2, clientX: 90, clientY: 90 })
    fireEvent.pointerUp(getByRole("button", { name: "done" }), { pointerId: 2, clientX: 90, clientY: 90 })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(note(container, "b")).not.toHaveAttribute("data-dragging")
  })

  it("pointercancel puts the note back", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    const a = note(container, "a")
    fireEvent.pointerDown(a, { pointerId: 1, button: 0, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(a, { pointerId: 1, clientX: 200, clientY: 200 })
    fireEvent.pointerCancel(a, { pointerId: 1 })
    expect(a.style.translate).toBe("40px 30px")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("keys: arrows move (Shift for big steps), R turns, Enter raises", async () => {
    const onValueChange = vi.fn()
    const { container, user } = renderUI(<Board onValueChange={onValueChange} />)
    sized(container)
    const a = note(container, "a")
    a.focus()
    await user.keyboard("{ArrowRight}{ArrowDown}")
    expect(a.style.translate).toBe("48px 38px")
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}")
    expect(a.style.translate).toBe("16px 38px")
    await user.keyboard("r")
    expect(a.style.rotate).toBe("2deg")
    await user.keyboard("{Shift>}r{/Shift}{Shift>}r{/Shift}")
    expect(a.style.rotate).toBe("-6deg")
    await user.keyboard("{Enter}")
    expect(a.style.zIndex).toBe("2")
    expect(onValueChange).toHaveBeenLastCalledWith({ a: expect.objectContaining({ x: 16, y: 38, r: -6, z: 1 }) })
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}")
    expect(a.style.translate).toBe("0px 38px")
  })

  it("turning stops at 24 degrees", async () => {
    const { container, user } = renderUI(<Board defaultValue={{ a: { r: 22 } }} />)
    note(container, "a").focus()
    await user.keyboard("rrr")
    expect(note(container, "a").style.rotate).toBe("24deg")
  })

  it("announces where a note ended up, once, politely", async () => {
    vi.useFakeTimers()
    try {
      const { container, getByRole } = renderUI(<Board />, { user: { advanceTimers: vi.advanceTimersByTime } })
      sized(container)
      note(container, "a").focus()
      fireEvent.keyDown(note(container, "a"), { key: "ArrowRight" })
      fireEvent.keyDown(note(container, "a"), { key: "ArrowRight" })
      expect(getByRole("status")).toHaveTextContent("")
      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(getByRole("status")).toHaveTextContent("a at 56, 30.")
    } finally {
      vi.useRealTimers()
    }
  })

  it("controlled positions win over the notes' own props, and follow the parent", () => {
    function Parent() {
      const [v, setV] = React.useState<CorkboardValue>({ a: { x: 300, y: 10 } })
      return (
        <>
          <Board value={v} onValueChange={setV} />
          <button onClick={() => setV({})}>reset</button>
        </>
      )
    }
    const { container, getByText } = renderUI(<Parent />)
    sized(container)
    expect(note(container, "a").style.translate).toBe("300px 10px")
    drag(note(container, "a"), [10, 10], [60, 60])
    expect(note(container, "a").style.translate).toBe("350px 60px")
    fireEvent.click(getByText("reset"))
    expect(note(container, "a").style.translate).toBe("40px 30px")
  })

  it("a controlled board that ignores changes stays put", async () => {
    const { container } = renderUI(<Board value={{}} onValueChange={() => {}} />)
    sized(container)
    drag(note(container, "a"), [10, 10], [90, 90])
    await waitFor(() => expect(note(container, "a").style.translate).toBe("40px 30px"))
  })

  it("defaultValue seeds an uncontrolled board", () => {
    const { container } = renderUI(<Board defaultValue={{ b: { x: 7, y: 9, r: 5, z: 3 } }} />)
    expect(note(container, "b").style.translate).toBe("7px 9px")
    expect(note(container, "b").style.rotate).toBe("5deg")
    expect(note(container, "b").style.zIndex).toBe("4")
  })

  it("disabled boards cannot be touched", async () => {
    const onValueChange = vi.fn()
    const { container, user } = renderUI(<Board disabled onValueChange={onValueChange} />)
    sized(container)
    drag(note(container, "a"), [10, 10], [90, 90])
    expect(note(container, "a")).not.toHaveAttribute("tabindex")
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard("{ArrowRight}")
    expect(onValueChange).not.toHaveBeenCalled()
    await axeCheck(container)
  })

  it("a note outside a board says so", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<CorkboardNote id="x">hi</CorkboardNote>)).toThrow(/inside <Corkboard>/)
    spy.mockRestore()
  })

  it("renders identically on the server and hydrates cleanly, bare and in a provider", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(<Board />) as React.ReactElement)
      expect(renderToString(wrap(<Board />) as React.ReactElement)).toBe(a)
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

  it("calm density lays notes flat", () => {
    const { container } = renderUI(
      <InkProvider density="calm">
        <Corkboard>
          <CorkboardNote id="q">x</CorkboardNote>
        </Corkboard>
      </InkProvider>,
    )
    expect(note(container, "q").style.rotate).toBe("0deg")
  })
})

describe("corkboard drawing", () => {
  const run = (recipe: unknown, params: object, box: { w: number; h: number }, density: "comfortable" | "calm" = "comfortable") =>
    runRecipe(recipe as Parameters<typeof runRecipe>[0], { box, params, seed: "c", tier: "lo", density, dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } })

  it("the board has a seamless tile: one pattern, drawn once, however big the board is", () => {
    const small = run(corkBoardRecipe, { frame: CORK_FRAME }, { w: 300, h: 200 }).parts.rest ?? ""
    const big = run(corkBoardRecipe, { frame: CORK_FRAME }, { w: 1200, h: 800 }).parts.rest ?? ""
    expect(small.match(/<pattern/g)).toHaveLength(1)
    expect(big.match(/<pattern/g)).toHaveLength(1)
    expect(small).toContain('fill="url(#ll-cork-')
    const tile = (svg: string) => /<pattern[\s\S]*?<\/pattern>/.exec(svg)?.[0] ?? ""
    expect(tile(big)).toBe(tile(small))
    expect(tile(small).length).toBeLessThan(9000)
    expect(small).not.toMatch(/NaN|undefined/)
    expect(small.length).toBeLessThan(24000)
  })

  it("calm density is a flat cork color", () => {
    const calm = run(corkBoardRecipe, { frame: CORK_FRAME }, { w: 300, h: 200 }, "calm").parts.rest ?? ""
    expect(calm).not.toContain("<pattern")
    expect(calm).toContain("var(--ll-kraft)")
  })

  it("the pin is a small drawing in the color asked for", () => {
    const pin = run(corkPinRecipe, { color: "tomato" }, { w: 24, h: 24 }).parts.rest ?? ""
    expect(pin).toContain("var(--ll-tomato)")
    expect(pin.length).toBeLessThan(4000)
  })
})
