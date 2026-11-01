import * as React from "react"
import { act, createEvent, fireEvent, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Boil } from "@/components/ui/boil"
import { confetti } from "@/components/ui/confetti"
import { Corkboard, CorkboardNote } from "@/components/ui/corkboard"
import { Marquee, MarqueeItem } from "@/components/ui/marquee"
import { PeelCorner, PeelCornerPage, PeelCornerUnder } from "@/components/ui/peel-corner"
import { Reveal } from "@/components/ui/reveal"
import { SignaturePad } from "@/components/ui/signature-pad"
import { Sketchpad, SketchpadCanvas, type SketchStroke } from "@/components/ui/sketchpad"
import { FlipCard, FlipCardBack, FlipCardFront } from "@/components/ui/flip-card"
import { TearOff, TearOffBody, TearOffStub } from "@/components/ui/tear-off"
import { clearStrokeCache, strokeCacheStats, strokeMarkup } from "@/lib/ink/recipes/sketchpad-ink"
import { typingPlan } from "@/lib/ink/recipes/typewriter-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 200)
})
afterEach(() => {
  vi.useRealTimers()
  restore()
  document.documentElement.removeAttribute("data-motion")
})

const LINE: Array<[number, number]> = [[20, 20], [60, 30], [100, 60], [140, 70]]
const canvasOf = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-slot$="canvas"][tabindex], [data-slot="sketchpad-canvas"]') as HTMLElement
function drag(el: Element, path: Array<[number, number]>, init: Record<string, unknown> = {}) {
  const base = { pointerId: 1, pointerType: "mouse", button: 0, ...init }
  fireEvent.pointerDown(el, { ...base, clientX: path[0][0], clientY: path[0][1] })
  for (const [x, y] of path.slice(1)) fireEvent.pointerMove(el, { ...base, clientX: x, clientY: y })
  const last = path[path.length - 1]
  fireEvent.pointerUp(el, { ...base, clientX: last[0], clientY: last[1] })
}
const at = (el: Element, type: "pointerDown" | "pointerMove" | "pointerUp", init: Record<string, unknown>, timeStamp: number) => {
  const ev = createEvent[type](el, init)
  Object.defineProperty(ev, "timeStamp", { value: timeStamp })
  fireEvent(el, ev)
}

describe("Boil: the children are not remounted on every frame", () => {
  it("keeps one mount of a child across a whole turn of the frames", () => {
    vi.useFakeTimers()
    let mounts = 0
    function Probe(_: { seed?: string | number }) {
      React.useEffect(() => {
        mounts++
      }, [])
      return <span data-probe="" />
    }
    render(
      <Boil>
        <Probe />
      </Boil>,
    )
    for (let i = 0; i < 7; i++) act(() => void vi.advanceTimersByTime(167))
    expect(mounts).toBe(1)
    vi.useRealTimers()
  })

  it("does not drop focus inside while it redraws", () => {
    vi.useFakeTimers()
    render(
      <Boil>
        <button type="button">Save</button>
      </Boil>,
    )
    const b = document.querySelector("button") as HTMLButtonElement
    b.focus()
    for (let i = 0; i < 4; i++) act(() => void vi.advanceTimersByTime(167))
    expect(document.activeElement).toBe(document.querySelector("button"))
    expect(document.querySelector("button")).toBe(b)
    vi.useRealTimers()
  })
})

describe("Sketchpad: focus does not fall off the page when a button disables itself", () => {
  it("Clear hands focus to the canvas", async () => {
    const { user, container, getByRole } = renderUI(<Sketchpad defaultValue={[{ id: "a", tool: "felt", color: "ink", size: 1, pts: LINE }]} />)
    await user.click(getByRole("button", { name: "Clear" }))
    expect(getByRole("button", { name: "Clear" })).toBeDisabled()
    expect(document.activeElement).toBe(canvasOf(container))
  })

  it("Undo of the last step hands focus to the canvas; Redo of the last step too", async () => {
    const { user, container, getByRole } = renderUI(<Sketchpad />)
    drag(canvasOf(container), LINE)
    await user.click(getByRole("button", { name: "Undo" }))
    expect(getByRole("button", { name: "Undo" })).toBeDisabled()
    expect(document.activeElement).toBe(canvasOf(container))
    await user.click(getByRole("button", { name: "Redo" }))
    expect(getByRole("button", { name: "Redo" })).toBeDisabled()
    expect(document.activeElement).toBe(canvasOf(container))
  })

  it("a button that stays enabled keeps focus", async () => {
    const { user, container, getByRole } = renderUI(<Sketchpad />)
    drag(canvasOf(container), LINE)
    drag(canvasOf(container), LINE)
    await user.click(getByRole("button", { name: "Undo" }))
    expect(document.activeElement).toBe(getByRole("button", { name: "Undo" }))
  })
})

describe("Sketchpad: pointer robustness", () => {
  it("a finger works again once the pen has been away for a moment (palm rejection is not a latch)", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    const c = canvasOf(container)
    at(c, "pointerDown", { pointerId: 1, pointerType: "pen", pressure: 0.5, button: 0, clientX: 5, clientY: 5 }, 1000)
    at(c, "pointerUp", { pointerId: 1, pointerType: "pen", button: 0, clientX: 5, clientY: 5 }, 1010)
    at(c, "pointerDown", { pointerId: 2, pointerType: "touch", button: 0, clientX: 50, clientY: 50 }, 1200)
    at(c, "pointerUp", { pointerId: 2, pointerType: "touch", button: 0, clientX: 50, clientY: 50 }, 1210)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    at(c, "pointerDown", { pointerId: 3, pointerType: "touch", button: 0, clientX: 50, clientY: 50 }, 11000)
    at(c, "pointerMove", { pointerId: 3, pointerType: "touch", button: 0, clientX: 90, clientY: 90 }, 11020)
    at(c, "pointerUp", { pointerId: 3, pointerType: "touch", button: 0, clientX: 90, clientY: 90 }, 11040)
    expect(onValueChange).toHaveBeenCalledTimes(2)
  })

  it("a lost pointer capture finishes the stroke instead of wedging the canvas", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    const c = canvasOf(container)
    fireEvent.pointerDown(c, { pointerId: 1, button: 0, clientX: 5, clientY: 5 })
    fireEvent.pointerMove(c, { pointerId: 1, clientX: 40, clientY: 40 })
    fireEvent.lostPointerCapture(c, { pointerId: 1 })
    expect(onValueChange).toHaveBeenCalledTimes(1)
    drag(c, LINE)
    expect(onValueChange).toHaveBeenCalledTimes(2)
  })

  it("turning readOnly on mid-stroke drops the stroke", () => {
    const onValueChange = vi.fn()
    const { container, rerender } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    fireEvent.pointerDown(canvasOf(container), { pointerId: 1, button: 0, clientX: 5, clientY: 5 })
    fireEvent.pointerMove(canvasOf(container), { pointerId: 1, clientX: 40, clientY: 40 })
    rerender(<Sketchpad onValueChange={onValueChange} readOnly />)
    fireEvent.pointerUp(canvasOf(container), { pointerId: 1, clientX: 40, clientY: 40 })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(container.querySelector('[data-slot="sketchpad-live"]')).toBeNull()
  })

  it("keeps the stored stroke small however finely the pointer reports (1000 Hz pens)", () => {
    const onValueChange = vi.fn()
    const { container } = renderUI(<Sketchpad onValueChange={onValueChange} />)
    const c = canvasOf(container)
    fireEvent.pointerDown(c, { pointerId: 1, button: 0, clientX: 10, clientY: 10 })
    for (let i = 1; i <= 3000; i++) fireEvent.pointerMove(c, { pointerId: 1, clientX: 10 + i * 0.05, clientY: 10 + Math.sin(i / 200) * 6 })
    fireEvent.pointerUp(c, { pointerId: 1, clientX: 160, clientY: 10 })
    const pts = (onValueChange.mock.calls[0][0] as SketchStroke[])[0].pts
    expect(pts.length).toBeLessThan(400)
    expect(pts.length).toBeGreaterThan(5)
  })

  it("announces the pen going down for keyboard drawers", async () => {
    const { user, container, getByRole } = renderUI(<Sketchpad />)
    canvasOf(container).focus()
    await user.keyboard("{ArrowRight}{ }")
    expect(getByRole("status")).toHaveTextContent(/pen down/i)
  })
})

describe("Sketchpad: ids that are not css-safe", () => {
  it("replay masks get plain ids however the strokes are named", () => {
    const strokes: SketchStroke[] = [{ id: 'my stroke (1) "x"', tool: "felt", color: "ink", size: 1, pts: LINE }]
    const { container } = renderUI(<Sketchpad value={strokes} replay />)
    const g = container.querySelector("[data-stroke][mask]") as SVGElement
    expect(g.getAttribute("mask")).toMatch(/^url\(#[A-Za-z0-9_-]+\)$/)
    const id = g.getAttribute("mask")!.slice(5, -1)
    expect(container.querySelector(`mask[id="${id}"]`)).not.toBeNull()
  })
})

describe("Sketchpad: the stroke cache is bounded by size, not only by count", () => {
  it("evicts by weight so a few enormous strokes cannot hold megabytes", () => {
    clearStrokeCache()
    let made = 0
    let evicted = false
    while (made < 70 && !evicted) {
      const pts: Array<[number, number, number]> = []
      for (let i = 0; i < 4000; i++) pts.push([320 + Math.cos(i / 9) * (100 + i * 0.02), 200 + Math.sin(i / 7) * (80 + i * 0.01), 0.5])
      strokeMarkup({ id: `big${made++}`, tool: "marker", color: "ink", size: 1, pts })
      evicted = strokeCacheStats().entries < made
    }
    const s = strokeCacheStats()
    expect(evicted).toBe(true)
    expect(s.chars).toBeLessThanOrEqual(s.maxChars)
    expect(s.entries).toBeGreaterThan(5)
    clearStrokeCache()
    expect(strokeCacheStats()).toMatchObject({ entries: 0, chars: 0 })
  })
})

describe("SignaturePad: the value is the truth", () => {
  it("a controlled value reset to empty clears the drawing too", () => {
    function Harness() {
      const [v, setV] = React.useState("")
      return (
        <>
          <SignaturePad value={v} onValueChange={setV} name="sig" />
          <button type="button" onClick={() => setV("")}>
            reset
          </button>
        </>
      )
    }
    const { container, getByText } = render(<Harness />)
    drag(container.querySelector('[data-slot="signature-canvas"]') as Element, LINE)
    expect(container.querySelectorAll("[data-stroke]").length).toBe(1)
    expect((container.querySelector('input[name="sig"]') as HTMLInputElement).value).toMatch(/^data:image\/svg/)
    fireEvent.click(getByText("reset"))
    expect(container.querySelectorAll("[data-stroke]").length).toBe(0)
    expect((container.querySelector('input[name="sig"]') as HTMLInputElement).value).toBe("")
  })

  it("form reset clears an uncontrolled pad and tells the parent", () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <form>
        <SignaturePad name="sig" onValueChange={onValueChange} />
        <button type="reset">Reset</button>
      </form>,
    )
    drag(container.querySelector('[data-slot="signature-canvas"]') as Element, LINE)
    expect(container.querySelectorAll("[data-stroke]").length).toBe(1)
    fireEvent.reset(container.querySelector("form") as HTMLFormElement)
    expect(container.querySelectorAll("[data-stroke]").length).toBe(0)
    expect(onValueChange).toHaveBeenLastCalledWith("", expect.anything())
  })

  it("an empty required pad in type mode sends focus to the name field, not to a canvas that cannot take it", async () => {
    const { user, container, getByRole } = renderUI(
      <form>
        <SignaturePad required name="sig" />
      </form>,
    )
    await user.click(getByRole("button", { name: "Type instead" }))
    ;(container.querySelector("form") as HTMLFormElement).requestSubmit()
    await waitFor(() => expect(document.activeElement).toBe(getByRole("textbox", { name: "Type your full name" })))
  })

  it("Clear hands focus back to the canvas", async () => {
    const { user, container, getByRole } = renderUI(<SignaturePad />)
    drag(container.querySelector('[data-slot="signature-canvas"]') as Element, LINE)
    await user.click(getByRole("button", { name: "Clear" }))
    expect(document.activeElement).toBe(container.querySelector('[data-slot="signature-canvas"]'))
  })
})

describe("TearOff: focus goes somewhere sensible when the stub it was on leaves", () => {
  it("Enter on the stub leaves focus inside the ticket", async () => {
    const { user, container, getByRole } = renderUI(
      <TearOff>
        <TearOffBody>Body</TearOffBody>
        <TearOffStub label="Coupon">10% off</TearOffStub>
      </TearOff>,
    )
    getByRole("button", { name: "Coupon" }).focus()
    await user.keyboard("{Enter}")
    expect(container.querySelector('[data-slot="tear-off"]')).toHaveAttribute("data-state", "torn")
    expect(document.activeElement).toBe(container.querySelector('[data-slot="tear-off"]'))
  })

  it("keys typed inside something on the stub are not the stub's keys", async () => {
    const { user, container, getByRole } = renderUI(
      <TearOff>
        <TearOffBody>Body</TearOffBody>
        <TearOffStub label="Coupon">
          <input aria-label="Name" />
        </TearOffStub>
      </TearOff>,
    )
    act(() => getByRole("textbox", { name: "Name" }).focus())
    await user.keyboard("a b{Enter}")
    expect(container.querySelector('[data-slot="tear-off"]')).toHaveAttribute("data-state", "attached")
  })
})

describe("PeelCorner: a controlled parent that says no", () => {
  it("the corner settles back to what the prop says", async () => {
    document.documentElement.setAttribute("data-motion", "reduced")
    const onPeeledChange = vi.fn()
    const { container, getByRole } = renderUI(
      <PeelCorner peeled={false} onPeeledChange={onPeeledChange}>
        <PeelCornerPage>Page</PeelCornerPage>
        <PeelCornerUnder>Under</PeelCornerUnder>
      </PeelCorner>,
    )
    const root = container.querySelector('[data-slot="peel-corner"]') as HTMLElement
    const before = root.style.getPropertyValue("--peel-k")
    fireEvent.click(getByRole("button", { name: /peel back/i }))
    expect(onPeeledChange).toHaveBeenCalledWith(true)
    await waitFor(() => expect(root.style.getPropertyValue("--peel-k")).toBe("0.200"))
    expect(before).toBe("0.2")
  })
})

describe("Marquee: short phrases on a wide tape", () => {
  it("makes enough copies to fill the viewport however short the phrase", () => {
    const proto = HTMLElement.prototype
    const orig = Object.getOwnPropertyDescriptor(proto, "offsetWidth")!
    Object.defineProperty(proto, "offsetWidth", {
      configurable: true,
      get(this: HTMLElement) {
        const slot = this.getAttribute("data-slot")
        return slot === "marquee-viewport" ? 3000 : slot === "marquee-group" ? 80 : 320
      },
    })
    try {
      const { container } = render(
        <Marquee>
          <MarqueeItem separator={false}>Hi</MarqueeItem>
        </Marquee>,
      )
      const groups = container.querySelectorAll('[data-slot="marquee-group"]').length
      expect(groups).toBeGreaterThanOrEqual(Math.ceil(3000 / 80) + 1)
    } finally {
      Object.defineProperty(proto, "offsetWidth", orig)
    }
  })
})

describe("Corkboard: a saved layout on a smaller board", () => {
  it("draws a note that would fall off the board inside it, without losing the stored position", () => {
    const proto = HTMLElement.prototype
    const orig = Object.getOwnPropertyDescriptor(proto, "offsetWidth")!
    Object.defineProperty(proto, "offsetWidth", {
      configurable: true,
      get(this: HTMLElement) {
        const slot = this.getAttribute("data-slot")
        return slot === "corkboard-surface" ? 300 : slot === "corkboard-note" ? 176 : 320
      },
    })
    try {
      const onValueChange = vi.fn()
      const { container } = render(
        <Corkboard value={{ a: { x: 900, y: 10 } }} onValueChange={onValueChange}>
          <CorkboardNote id="a">hello</CorkboardNote>
        </Corkboard>,
      )
      const note = container.querySelector('[data-slot="corkboard-note"]') as HTMLElement
      const x = parseFloat(note.style.translate)
      expect(x).toBeLessThanOrEqual(300 - 176)
      expect(onValueChange).not.toHaveBeenCalled()
    } finally {
      Object.defineProperty(proto, "offsetWidth", orig)
    }
  })
})

describe("Reveal: nib on a paragraph", () => {
  it("does not put a block inside a <p>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <Reveal as="p" nib>
        Written in
      </Reveal>,
    )
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe("Confetti: nothing is kept after a burst", () => {
  it("tells the caller when the burst is over, and when it was cleared", () => {
    const onDone = vi.fn()
    const stop = confetti({ count: 5, onDone })
    expect(onDone).toHaveBeenCalledTimes(1)
    stop()
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})

describe("Typewriter: one key press is one character", () => {
  it("types a ZWJ emoji as a whole", () => {
    const { steps } = typingPlan(["a👩‍💻b"], { speed: 20, pause: 100, mode: "lines", seed: "x" })
    expect(steps.map((s) => s.text)).toEqual(["", "a", "a👩‍💻", "a👩‍💻b"])
  })
})

describe("StrictMode and unmounting", () => {
  it("a Sketchpad in StrictMode records one stroke per gesture", () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <React.StrictMode>
        <Sketchpad onValueChange={onValueChange} />
      </React.StrictMode>,
    )
    drag(canvasOf(container), LINE)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(1)
  })

  it("nothing keeps a timer alive once the components are gone", async () => {
    vi.useFakeTimers()
    const { Typewriter } = await import("@/components/ui/typewriter")
    const { unmount, container, getByRole } = render(
      <div>
        <Typewriter text="Hello there" startOnView={false} />
        <Boil>
          <span>b</span>
        </Boil>
        <Corkboard>
          <CorkboardNote id="a">n</CorkboardNote>
        </Corkboard>
        <TearOff>
          <TearOffBody>Body</TearOffBody>
          <TearOffStub label="Coupon">Stub</TearOffStub>
        </TearOff>
        <PeelCorner peeled={false}>
          <PeelCornerPage>Page</PeelCornerPage>
        </PeelCorner>
      </div>,
    )
    act(() => void vi.advanceTimersByTime(700))
    fireEvent.keyDown(getByRole("button", { name: "Coupon" }), { key: "Enter" })
    fireEvent.click(getByRole("button", { name: /peel back/i }))
    fireEvent.keyDown(container.querySelector('[data-slot="corkboard-note"]') as HTMLElement, { key: "ArrowRight" })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe("axe in the states the package tests do not reach", () => {
  it("a torn ticket whose root took focus, an open corner, a flipped card, a board with a note", async () => {
    const { user, container, getByRole } = renderUI(
      <div>
        <TearOff>
          <TearOffBody>Body</TearOffBody>
          <TearOffStub label="Coupon">Stub</TearOffStub>
        </TearOff>
        <PeelCorner defaultPeeled>
          <PeelCornerPage>Page</PeelCornerPage>
          <PeelCornerUnder>Under</PeelCornerUnder>
        </PeelCorner>
        <FlipCard defaultFlipped>
          <FlipCardFront>front</FlipCardFront>
          <FlipCardBack>back</FlipCardBack>
        </FlipCard>
        <Corkboard>
          <CorkboardNote id="a">note</CorkboardNote>
        </Corkboard>
      </div>,
    )
    getByRole("button", { name: "Coupon" }).focus()
    await user.keyboard("{Enter}")
    await axeCheck(container)
  })

  it("a sketchpad mid keyboard stroke, with the cursor showing", async () => {
    const { user, container } = renderUI(<Sketchpad />)
    canvasOf(container).focus()
    await user.keyboard("{ArrowRight}{ArrowRight}{ }{ArrowDown}{ArrowDown}")
    expect(container.querySelector('[data-slot="sketchpad-cursor"]')).not.toBeNull()
    await axeCheck(container)
  })
})

describe("empty and absurd input", () => {
  it("renders nothing-in-particular without throwing or warning", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const { Typewriter } = await import("@/components/ui/typewriter")
    const { container } = render(
      <div>
        <Marquee />
        <Typewriter text="" />
        <Typewriter text={[]} mode="cycle" loop />
        <Corkboard />
        <Reveal />
        <Reveal nib />
        <Boil />
        <FlipCard />
        <TearOff />
        <PeelCorner />
        <Sketchpad width={0} height={0} value={[{ id: "z", tool: "felt", color: "ink", size: 1, pts: [] }]} />
        <SignaturePad width={1} height={1} />
      </div>,
    )
    expect(container.firstElementChild).not.toBeNull()
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it("a stroke with no points or NaN points draws nothing and does not poison the pad", () => {
    const bad: SketchStroke = { id: "n", tool: "marker", color: "ink", size: 1, pts: [[Number.NaN, 4], [3, Number.POSITIVE_INFINITY]] }
    const { container } = renderUI(<Sketchpad value={[bad, { id: "e", tool: "pencil", color: "ink", size: 1, pts: [] }, { id: "ok", tool: "felt", color: "ink", size: 1, pts: LINE }]} />)
    expect(container.querySelectorAll("[data-stroke]")).toHaveLength(3)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity|undefined/)
  })
})
