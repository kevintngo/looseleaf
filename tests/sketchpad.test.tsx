import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, render, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  Sketchpad,
  SketchpadCanvas,
  SketchpadSizes,
  SketchpadToolbar,
  SketchpadTools,
  SketchpadUndo,
  type SketchStroke,
  type SketchpadHandle,
} from "@/components/ui/sketchpad"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import {
  cleanPoints,
  clearStrokeCache,
  sketchSizeRecipe,
  sketchSwatchRecipe,
  sketchToolRecipe,
  strokeBounds,
  strokeHit,
  strokeMarkup,
  strokesToSvg,
  svgDataUrl,
} from "@/lib/ink/recipes/sketchpad-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 200)
})
afterEach(() => restore())

const stroke = (id: string, pts: Array<[number, number]>, over: Partial<SketchStroke> = {}): SketchStroke => ({ id, tool: "felt", color: "ink", size: 1, pts, ...over })

function drag(el: Element, path: Array<[number, number]>, init: Record<string, unknown> = {}) {
  const base = { pointerId: 1, pointerType: "mouse", button: 0, ...init }
  fireEvent.pointerDown(el, { ...base, clientX: path[0][0], clientY: path[0][1] })
  for (const [x, y] of path.slice(1)) fireEvent.pointerMove(el, { ...base, clientX: x, clientY: y })
  const last = path[path.length - 1]
  fireEvent.pointerUp(el, { ...base, clientX: last[0], clientY: last[1] })
}

const canvasOf = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-slot="sketchpad-canvas"]') as HTMLElement
const LINE: Array<[number, number]> = [[20, 20], [60, 30], [100, 60], [140, 70]]

describe("Sketchpad: structure", () => {
  it("composes a toolbar and a canvas by default, with named groups", () => {
    const { getByRole, getAllByRole } = renderUI(<Sketchpad />)
    expect(getByRole("application", { name: "Drawing" })).toHaveAttribute("aria-roledescription", "drawing canvas")
    expect(getByRole("radiogroup", { name: "Tool" })).toBeInTheDocument()
    expect(getByRole("radiogroup", { name: "Colour" })).toBeInTheDocument()
    expect(getByRole("radiogroup", { name: "Width" })).toBeInTheDocument()
    expect(getAllByRole("radio", { name: /Felt|Pencil|Marker|Highlighter|Eraser/ })).toHaveLength(5)
    expect(getByRole("radio", { name: "Felt" })).toBeChecked()
    expect(getByRole("radio", { name: "Ink" })).toBeChecked()
    expect(getByRole("radio", { name: "Medium line" })).toBeChecked()
    for (const name of ["Undo", "Redo", "Clear"]) expect(getByRole("button", { name })).toBeDisabled()
  })

  it("is accessible", async () => {
    const { container } = renderUI(<Sketchpad defaultValue={[stroke("a", LINE)]} />)
    await axeCheck(container)
  })

  it("draws its parts as ink hosts and the strokes as plain (unhosted) svg", () => {
    const { container } = renderUI(<Sketchpad defaultValue={[stroke("a", LINE)]} />)
    expectInkLayers(container, { min: 10, absolute: true, kinds: ["sketchpad-tool", "sketchpad-swatch", "sketchpad-size", "sketchpad-canvas", "button"], layers: ["rest", "checked", "hover"] })
    const surface = container.querySelector('svg[data-slot="sketchpad-surface"]') as SVGElement
    expect(surface).toHaveAttribute("aria-hidden", "true")
    expect(surface).not.toHaveAttribute("data-ink")
    expect(surface.querySelectorAll("[data-stroke]")).toHaveLength(1)
  })

  it("parts compose freely and a partial toolbar works", () => {
    const { getAllByRole, queryByRole } = renderUI(
      <Sketchpad tools={["felt", "eraser"]}>
        <SketchpadToolbar>
          <SketchpadTools />
          <SketchpadSizes />
          <SketchpadUndo>Oops</SketchpadUndo>
        </SketchpadToolbar>
        <SketchpadCanvas paper="dots" label="Napkin" />
      </Sketchpad>,
    )
    expect(getAllByRole("radio", { name: /Felt|Eraser/ })).toHaveLength(2)
    expect(queryByRole("radiogroup", { name: "Colour" })).toBeNull()
    expect(queryByRole("button", { name: "Oops" })).toBeDisabled()
    expect(queryByRole("application", { name: "Napkin" })).toBeInTheDocument()
  })

  it("throws a clear error when a part is used outside the root", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<SketchpadUndo />)).toThrow(/inside <Sketchpad>/)
    spy.mockRestore()
  })
})

describe("Sketchpad: pointer drawing", () => {
  it("a drag becomes one stroke in the current tool, colour and size", () => {
    const onValueChange = vi.fn()
    const { container, getByRole } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    drag(canvasOf(container), LINE)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    const [strokes] = onValueChange.mock.calls[0] as [SketchStroke[]]
    expect(strokes).toHaveLength(1)
    expect(strokes[0]).toMatchObject({ tool: "felt", color: "ink", size: 1 })
    expect(strokes[0].pts.length).toBeGreaterThanOrEqual(3)
    expect(strokes[0].pts[0]).toEqual([20, 20])
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(1)
    expect(getByRole("button", { name: "Undo" })).toBeEnabled()
    expect(getByRole("status")).toHaveTextContent("Stroke added. 1 stroke.")
  })

  it("stores pen pressure and ignores the mouse's constant pressure", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    drag(canvasOf(container), LINE, { pointerType: "pen", pressure: 0.7 })
    const pts = (onValueChange.mock.calls[0][0] as SketchStroke[])[0].pts
    expect(pts.every((p) => p[2] === 0.7)).toBe(true)
    drag(canvasOf(container), LINE, { pointerType: "mouse", pressure: 0.5 })
    const second = (onValueChange.mock.calls[1][0] as SketchStroke[])[1].pts
    expect(second.every((p) => p.length === 2)).toBe(true)
  })

  it("a tap leaves a dot", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    drag(canvasOf(container), [[50, 50]])
    expect((onValueChange.mock.calls[0][0] as SketchStroke[])[0].pts).toHaveLength(1)
  })

  it("scales pointer coordinates to the canvas's logical size", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Sketchpad width={640} height={400} onValueChange={onValueChange} />)
    const surface = container.querySelector('svg[data-slot="sketchpad-surface"]') as SVGElement
    surface.getBoundingClientRect = () => ({ left: 10, top: 20, width: 320, height: 200, right: 330, bottom: 220, x: 10, y: 20, toJSON() {} }) as DOMRect
    drag(canvasOf(container), [[10, 20], [170, 120]])
    const pts = (onValueChange.mock.calls[0][0] as SketchStroke[])[0].pts
    expect(pts[0]).toEqual([0, 0])
    expect(pts[pts.length - 1]).toEqual([320, 200])
  })

  it("ignores right-click, a second pointer, disabled and readOnly, and touch after a pen (palm rejection)", () => {
    const onValueChange = vi.fn()
    const { container, rerender } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    const c = canvasOf(container)
    drag(c, LINE, { button: 2 })
    expect(onValueChange).not.toHaveBeenCalled()
    drag(c, LINE, { pointerType: "pen", pressure: 0.5 })
    expect(onValueChange).toHaveBeenCalledTimes(1)
    drag(c, LINE, { pointerType: "touch", pointerId: 2 })
    expect(onValueChange).toHaveBeenCalledTimes(1)
    rerender(<Sketchpad onValueChange={onValueChange} disabled />)
    drag(canvasOf(container), LINE)
    rerender(<Sketchpad onValueChange={onValueChange} readOnly />)
    drag(canvasOf(container), LINE)
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it("pointercancel throws the stroke away", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    const c = canvasOf(container)
    fireEvent.pointerDown(c, { pointerId: 1, clientX: 5, clientY: 5 })
    fireEvent.pointerMove(c, { pointerId: 1, clientX: 40, clientY: 40 })
    expect(container.querySelector('[data-slot="sketchpad-live"]')).not.toBeNull()
    fireEvent.pointerCancel(c, { pointerId: 1 })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(container.querySelector('[data-slot="sketchpad-live"]')).toBeNull()
  })
})

describe("Sketchpad: tools, colours, sizes", () => {
  it("the toolbar chooses the pen, the colour and the width for the next stroke", async () => {
    const onValueChange = vi.fn()
    const { container, user, getByRole } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    await user.click(getByRole("radio", { name: "Marker" }))
    await user.click(getByRole("radio", { name: "Red" }))
    await user.click(getByRole("radio", { name: "Bold line" }))
    drag(canvasOf(container), LINE)
    expect((onValueChange.mock.calls[0][0] as SketchStroke[])[0]).toMatchObject({ tool: "marker", color: "red", size: 1.9 })
  })

  it("the arrow keys move between tools (roving focus) and select", async () => {
    const onToolChange = vi.fn()
    const { user, getByRole } = renderUI(<Sketchpad onToolChange={onToolChange} />)
    getByRole("radio", { name: "Felt" }).focus()
    await user.keyboard("{ArrowRight>}")
    await waitFor(() => expect(getByRole("radio", { name: "Pencil" })).toBeChecked())
    await user.keyboard("{/ArrowRight}")
    expect(onToolChange).toHaveBeenLastCalledWith("pencil")
  })

  it("keys on the canvas pick tools and widths", async () => {
    const { container, user, getByRole } = renderUI(<Sketchpad />)
    canvasOf(container).focus()
    await user.keyboard("p")
    expect(getByRole("radio", { name: "Pencil" })).toBeChecked()
    await user.keyboard("h")
    expect(getByRole("radio", { name: "Highlighter" })).toBeChecked()
    await user.keyboard("]")
    expect(getByRole("radio", { name: "Bold line" })).toBeChecked()
    await user.keyboard("[[[[")
    expect(getByRole("radio", { name: "Fine line" })).toBeChecked()
    await user.keyboard("b")
    expect(getByRole("radio", { name: "Highlighter" })).toBeChecked()
  })

  it("a highlighter is yellow when the ink was dark, and the ink comes back", async () => {
    const onColorChange = vi.fn()
    const { user, getByRole } = renderUI(<Sketchpad onColorChange={onColorChange} />)
    await user.click(getByRole("radio", { name: "Highlighter" }))
    expect(getByRole("radio", { name: "Yellow" })).toBeChecked()
    await user.click(getByRole("radio", { name: "Felt" }))
    expect(getByRole("radio", { name: "Ink" })).toBeChecked()
    expect(onColorChange).toHaveBeenCalledTimes(2)
  })

  it("controlled tool, colour and size", async () => {
    const onToolChange = vi.fn()
    const { getByRole, user } = renderUI(<Sketchpad tool="pencil" color="green" size={0.6} onToolChange={onToolChange} />)
    expect(getByRole("radio", { name: "Pencil" })).toBeChecked()
    expect(getByRole("radio", { name: "Green" })).toBeChecked()
    expect(getByRole("radio", { name: "Fine line" })).toBeChecked()
    await user.click(getByRole("radio", { name: "Marker" }))
    expect(onToolChange).toHaveBeenCalledWith("marker")
    expect(getByRole("radio", { name: "Pencil" })).toBeChecked()
  })

  it("the eraser removes the strokes it touches, as one undoable step", async () => {
    const onValueChange = vi.fn()
    const value = [stroke("a", [[20, 20], [120, 20]]), stroke("b", [[20, 100], [120, 100]])]
    const { container, user, getByRole } = renderUI(<Sketchpad defaultValue={value} onValueChange={onValueChange} />)
    await user.click(getByRole("radio", { name: "Eraser" }))
    const c = canvasOf(container)
    fireEvent.pointerDown(c, { pointerId: 1, clientX: 60, clientY: 20 })
    expect(container.querySelector('[data-stroke="a"]')).toHaveStyle({ opacity: "0.22" })
    fireEvent.pointerMove(c, { pointerId: 1, clientX: 60, clientY: 60 })
    fireEvent.pointerUp(c, { pointerId: 1, clientX: 60, clientY: 60 })
    expect((onValueChange.mock.calls[0][0] as SketchStroke[]).map((s) => s.id)).toEqual(["b"])
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(1)
    await user.click(getByRole("button", { name: "Undo" }))
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(2)
  })
})

describe("Sketchpad: history", () => {
  it("undo, redo and clear (clear is undoable); Ctrl+Z on the canvas", async () => {
    const onValueChange = vi.fn()
    const { container, user, getByRole } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    drag(canvasOf(container), LINE)
    drag(canvasOf(container), [[10, 100], [90, 110]])
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(2)
    await user.click(getByRole("button", { name: "Undo" }))
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(1)
    expect(getByRole("button", { name: "Redo" })).toBeEnabled()
    await user.click(getByRole("button", { name: "Redo" }))
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(2)
    await user.click(getByRole("button", { name: "Clear" }))
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(0)
    expect(getByRole("button", { name: "Clear" })).toBeDisabled()
    canvasOf(container).focus()
    await user.keyboard("{Control>}z{/Control}")
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(2)
    await user.keyboard("{Control>}{Shift>}z{/Shift}{/Control}")
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(0)
    await user.keyboard("{Control>}z{/Control}{Control>}y{/Control}")
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(0)
    expect(onValueChange).toHaveBeenCalled()
  })

  it("a new stroke after an undo drops the redo branch", async () => {
    const { container, user, getByRole } = renderUI(<Sketchpad />)
    drag(canvasOf(container), LINE)
    await user.click(getByRole("button", { name: "Undo" }))
    drag(canvasOf(container), LINE)
    expect(getByRole("button", { name: "Redo" })).toBeDisabled()
  })

  it("stroke ids stay unique across erase and redraw", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Sketchpad defaultValue={[stroke("s0", LINE)]} onValueChange={onValueChange} />)
    drag(canvasOf(container), LINE)
    const ids = (onValueChange.mock.calls[0][0] as SketchStroke[]).map((s) => s.id)
    expect(new Set(ids).size).toBe(2)
  })
})

describe("Sketchpad: controlled and uncontrolled value", () => {
  it("uncontrolled keeps its own strokes and reports each change", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Sketchpad defaultValue={[stroke("a", LINE)]} onValueChange={onValueChange} />)
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(1)
    drag(canvasOf(container), LINE)
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(2)
  })

  it("controlled shows exactly what it is given, until the parent takes the change", () => {
    function Parent() {
      const [v, setV] = React.useState<SketchStroke[]>([stroke("a", LINE)])
      return (
        <>
          <Sketchpad value={v} onValueChange={setV} />
          <button onClick={() => setV([])}>reset</button>
        </>
      )
    }
    const { container, getByText } = render(<Parent />)
    drag(canvasOf(container), LINE)
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(2)
    fireEvent.click(getByText("reset"))
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(0)
  })

  it("controlled value that ignores changes stays put", () => {
    const { container } = render(<Sketchpad value={[stroke("a", LINE)]} onValueChange={() => {}} />)
    drag(canvasOf(container), LINE)
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(1)
  })

  it("strokes without ids are given stable ones", () => {
    const { container } = render(<Sketchpad value={[{ tool: "felt", color: "ink", size: 1, pts: LINE }, { tool: "pencil", color: "ink", size: 1, pts: LINE }]} />)
    const ids = Array.from(container.querySelectorAll("[data-stroke]")).map((g) => g.getAttribute("data-stroke"))
    expect(ids).toEqual(["i0", "i1"])
  })
})

describe("Sketchpad: keyboard drawing", () => {
  it("arrows move a cursor, Space puts the pen down and lifts it", async () => {
    const onValueChange = vi.fn()
    const { container, user } = renderUI(<Sketchpad width={200} height={100} onValueChange={onValueChange} />)
    canvasOf(container).focus()
    await user.keyboard("{ArrowRight}")
    expect(container.querySelector('[data-slot="sketchpad-cursor"]')).toHaveAttribute("transform", "translate(108 50)")
    await user.keyboard(" ")
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowDown}{ArrowDown}")
    expect(container.querySelector('[data-slot="sketchpad-live"]')).not.toBeNull()
    await user.keyboard(" ")
    const s = (onValueChange.mock.calls[0][0] as SketchStroke[])[0]
    expect(s.pts).toEqual([[108, 50], [116, 50], [124, 50], [124, 58], [124, 66]])
  })

  it("Shift takes big steps, Escape cancels a stroke, then hides the cursor", async () => {
    const onValueChange = vi.fn()
    const { container, user } = renderUI(<Sketchpad width={200} height={100} onValueChange={onValueChange} />)
    canvasOf(container).focus()
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}")
    expect(container.querySelector('[data-slot="sketchpad-cursor"]')).toHaveAttribute("transform", "translate(68 50)")
    await user.keyboard(" {ArrowDown}{Escape}")
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard("{Escape}")
    expect(container.querySelector('[data-slot="sketchpad-cursor"]')).toBeNull()
  })

  it("leaving the canvas mid-stroke finishes it", async () => {
    const onValueChange = vi.fn()
    const { container, user } = renderUI(
      <div>
        <Sketchpad width={200} height={100} onValueChange={onValueChange} />
        <button>elsewhere</button>
      </div>,
    )
    canvasOf(container).focus()
    await user.keyboard(" {ArrowRight}")
    await user.tab()
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })
})

describe("Sketchpad: read only, disabled, replay", () => {
  it("readOnly is a labelled picture without a toolbar", async () => {
    const { container, getByRole, queryByRole } = renderUI(<Sketchpad readOnly defaultValue={[stroke("a", LINE), stroke("b", LINE)]} />)
    expect(getByRole("img", { name: "Drawing, 2 strokes" })).not.toHaveAttribute("tabindex")
    expect(queryByRole("radiogroup")).toBeNull()
    await axeCheck(container)
  })

  it("disabled dims the toolbar and takes the canvas out of the tab order", async () => {
    const { container, getByRole } = renderUI(<Sketchpad disabled />)
    expect(getByRole("radio", { name: "Felt" })).toBeDisabled()
    expect(canvasOf(container)).not.toHaveAttribute("tabindex")
    await axeCheck(container)
  })

  it("replay uncovers each stroke along its centre line, one after another", () => {
    const value = [stroke("a", LINE), stroke("b", LINE, { tool: "marker" })]
    const { container } = render(<Sketchpad readOnly replay defaultValue={value} />)
    const masks = container.querySelectorAll("mask[id^='ll-replay-']")
    expect(masks).toHaveLength(2)
    const paths = Array.from(masks).map((m) => m.querySelector("path.ll-draw") as SVGPathElement)
    expect(paths.every((p) => p.getAttribute("pathLength") === "1")).toBe(true)
    const delay = (p: SVGPathElement) => Number.parseFloat(p.style.getPropertyValue("--ll-draw-delay"))
    expect(delay(paths[1])).toBeGreaterThan(delay(paths[0]))
    expect(new Set(Array.from(masks).map((m) => m.id)).size).toBe(2)
  })

  it("no replay, no masks", () => {
    const { container } = render(<Sketchpad readOnly defaultValue={[stroke("a", LINE)]} />)
    expect(container.querySelector("mask[id^='ll-replay-']")).toBeNull()
  })

  it("the handle replays on demand", () => {
    const ref = React.createRef<SketchpadHandle>()
    const { container } = render(<Sketchpad readOnly apiRef={ref} defaultValue={[stroke("a", LINE)]} />)
    act(() => ref.current?.replay())
    expect(container.querySelectorAll("mask[id^='ll-replay-']")).toHaveLength(1)
  })
})

describe("Sketchpad: handle and export", () => {
  it("undo, redo, clear and strokes() through apiRef", () => {
    const ref = React.createRef<SketchpadHandle>()
    const { container } = render(<Sketchpad apiRef={ref} />)
    drag(canvasOf(container), LINE)
    expect(ref.current?.strokes()).toHaveLength(1)
    act(() => ref.current?.undo())
    expect(ref.current?.strokes()).toHaveLength(0)
    act(() => ref.current?.redo())
    expect(ref.current?.strokes()).toHaveLength(1)
    act(() => ref.current?.clear())
    expect(ref.current?.strokes()).toHaveLength(0)
  })

  it("toSVG is a standalone document with the pen's ribbons and the grain embedded; toDataURL needs no canvas", () => {
    const ref = React.createRef<SketchpadHandle>()
    render(<Sketchpad apiRef={ref} width={300} height={150} defaultValue={[stroke("a", LINE), stroke("b", LINE, { tool: "pencil" })]} />)
    const svg = ref.current?.toSVG({ title: "Doodle" }) as string
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" width="300" height="150"')).toBe(true)
    expect(svg).toContain("<title>Doodle</title>")
    expect(svg).toContain('data-stroke="a"')
    expect(svg).toContain('<mask id="ll-felt-0"')
    expect(svg).toContain('<mask id="ll-graphite-0"')
    expect(svg).not.toMatch(/NaN|undefined/)
    expect(ref.current?.toDataURL().startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true)
  })

  it("toPNG answers null where nothing can rasterise the svg", async () => {
    vi.useFakeTimers()
    try {
      const ref = React.createRef<SketchpadHandle>()
      render(<Sketchpad apiRef={ref} defaultValue={[stroke("a", LINE)]} />)
      const p = ref.current?.toPNG() as Promise<string | null>
      await vi.advanceTimersByTimeAsync(4100)
      await expect(p).resolves.toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe("Sketchpad: SSR and hydration", () => {
  const value = [stroke("a", LINE), stroke("b", LINE, { tool: "highlighter", color: "hi" })]
  it("renders the same markup twice, with the strokes in the server HTML", () => {
    const a = renderToString(<Sketchpad defaultValue={value} />)
    expect(renderToString(<Sketchpad defaultValue={value} />)).toBe(a)
    expect(a).toContain('data-stroke="a"')
    expect(a.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/NaN|undefined|Infinity/)
  })

  it("hydrates without warnings, bare and inside InkProvider", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const html = renderToString(wrap(<Sketchpad defaultValue={value} />) as React.ReactElement)
      const host = document.createElement("div")
      host.innerHTML = html
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(<Sketchpad defaultValue={value} />))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })
})

describe("stroke drawing (the pen)", () => {
  const s = stroke("p1", [[10, 10], [40, 22], [80, 20], [120, 50]])
  it("is deterministic in the stroke and cached", () => {
    clearStrokeCache()
    const a = strokeMarkup(s)
    expect(strokeMarkup(s)).toBe(a)
    expect(strokeMarkup({ ...s })).toBe(a)
    expect(a.svg).toContain("<path")
    expect(a.svg).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/i)
    expect(a.svg).toContain("var(--ll-ink)")
  })

  it("another id, colour, tool or pressure draws another line", () => {
    const base = strokeMarkup(s).svg
    expect(strokeMarkup({ ...s, id: "p2" }).svg).not.toBe(base)
    expect(strokeMarkup({ ...s, color: "red" }).svg).toContain("var(--ll-red)")
    expect(strokeMarkup({ ...s, tool: "pencil" }).svg).not.toBe(base)
    const pressed = strokeMarkup({ ...s, pts: s.pts.map((p, i) => [p[0], p[1], i % 2 ? 0.2 : 0.9]) as SketchStroke["pts"] })
    expect(pressed.svg).not.toBe(base)
  })

  it("every tool draws, with the grain and blend its material needs", () => {
    const grain = (tool: SketchStroke["tool"]) => strokeMarkup(stroke("t", LINE, { tool })).svg
    expect(grain("felt")).toContain("url(#ll-felt-")
    expect(grain("brush")).toContain("url(#ll-felt-")
    expect(grain("pencil")).toContain("url(#ll-graphite-")
    expect(grain("marker")).toContain("url(#ll-marker-")
    expect(grain("marker")).toContain("mix-blend-mode:var(--ll-blend)")
    expect(grain("highlighter")).toContain("mix-blend-mode:var(--ll-blend)")
  })

  it("the live version is lighter than the finished one", () => {
    const long = stroke("l", Array.from({ length: 40 }, (_, i) => [i * 6, 50 + Math.sin(i / 3) * 20] as [number, number]))
    expect(strokeMarkup(long, { live: true }).svg.length).toBeLessThan(strokeMarkup(long).svg.length)
  })

  it("survives absurd input", () => {
    for (const pts of [[], [[NaN, 4]], [[1, 1]], [[1, 1], [1, 1]], [[0, 0], [1e9, -1e9]]] as Array<Array<[number, number]>>) {
      const m = strokeMarkup(stroke("x" + JSON.stringify(pts), pts))
      expect(m.svg).not.toMatch(/NaN|Infinity/)
    }
  })

  it("cleanPoints drops jitter and keeps the ends", () => {
    const { pts } = cleanPoints([[0, 0], [0.5, 0.2], [1, 0.4], [10, 0], [10.4, 0.2], [30, 5]])
    expect(pts[0]).toEqual([0, 0])
    expect(pts[pts.length - 1]).toEqual([30, 5])
    expect(pts.length).toBeLessThan(6)
  })

  it("bounds and hit testing", () => {
    const line = stroke("h", [[10, 10], [110, 10]])
    const b = strokeBounds(line)
    expect(b[0]).toBeLessThan(10)
    expect(b[2]).toBeGreaterThan(110)
    expect(strokeHit(line, 60, 14, 6)).toBe(true)
    expect(strokeHit(line, 60, 40, 6)).toBe(false)
    expect(strokeHit(stroke("dot", [[5, 5]]), 8, 5, 4)).toBe(true)
  })

  it("resolves theme variables when asked, and leaves them when not", () => {
    const doc = strokesToSvg([s], { width: 100, height: 60, resolve: (n) => (n === "--ll-ink" ? "black" : undefined), background: "white" })
    expect(doc).toContain('fill="black"')
    expect(doc).toContain('<rect x="0" y="0" width="100" height="60" fill="white"/>')
    expect(strokesToSvg([s], { width: 100, height: 60 })).toContain("var(--ll-ink)")
    expect(svgDataUrl("<svg/>")).toBe("data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E")
  })
})

describe("toolbar recipes", () => {
  const box = { w: 68, h: 52 }
  const run = (recipe: unknown, params: object, b = box) =>
    runRecipe(recipe as Parameters<typeof runRecipe>[0], { box: b, params, seed: "t", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } })

  it("draw rest, hover and checked in budget, and the focus ring lazily", () => {
    for (const tool of ["felt", "brush", "pencil", "marker", "highlighter", "eraser"]) {
      const f = run(sketchToolRecipe, { tool, color: "ink" })
      expect(f.layers).toEqual(expect.arrayContaining(["rest", "hover", "checked"]))
      expect((f.parts.rest ?? "").length).toBeLessThan(8000)
      expect(f.parts.focus).toBeUndefined()
    }
    const s = run(sketchSwatchRecipe, { color: "hi" }, { w: 28, h: 28 })
    expect(s.parts.rest).toContain("var(--ll-hi)")
    const d = run(sketchSizeRecipe, { size: "bold" }, { w: 28, h: 28 })
    expect(d.parts.checked).toBeTruthy()
  })
})

describe("tool button samples", () => {
  const box = { w: 68, h: 52 }
  const rest = (tool: string, color: string) =>
    runRecipe(sketchToolRecipe as Parameters<typeof runRecipe>[0], { box, params: { tool, color }, seed: "t", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } }).parts.rest ?? ""

  it("shows the highlighter in yellow over a dark ink (the colour picking it would choose), and in its own colour otherwise", () => {
    for (const dark of ["ink", "ink-you", "red", "green"]) expect(rest("highlighter", dark)).toContain("var(--ll-hi)")
    expect(rest("highlighter", "tangerine")).toContain("var(--ll-tangerine)")
    expect(rest("highlighter", "tangerine")).not.toContain("var(--ll-hi)")
    expect(rest("marker", "ink")).not.toContain("var(--ll-hi)")
  })
})

describe("within a provider", () => {
  it("works in calm density and rtl", () => {
    const { container, getByRole } = render(
      <div dir="rtl">
        <InkProvider density="calm">
          <Sketchpad />
        </InkProvider>
      </div>,
    )
    expect(getByRole("application", { name: "Drawing" })).toBeInTheDocument()
    expect(within(container).getAllByRole("radio").length).toBeGreaterThan(10)
  })
})

