import * as React from "react"
import { renderToString } from "react-dom/server"
import { act, fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Confetti, ConfettiTrigger, confetti, useConfetti, type ConfettiHandle } from "@/components/ui/confetti"
import { CONFETTI_COLORS, CONFETTI_KINDS, STEP_MS, confettiPiece, simulate } from "@/lib/ink/recipes/confetti-ink"
import { axeCheck, renderUI } from "./helpers"

interface FakeAnim {
  keyframes: Array<{ transform: string; opacity: number }>
  options: { duration: number }
  onfinish: (() => void) | null
  cancel: () => void
  cancelled: boolean
}
let anims: FakeAnim[] = []
let original: unknown

beforeEach(() => {
  anims = []
  original = (Element.prototype as unknown as { animate?: unknown }).animate
  ;(Element.prototype as unknown as { animate: unknown }).animate = function (this: Element, keyframes: FakeAnim["keyframes"], options: FakeAnim["options"]) {
    const a: FakeAnim = { keyframes, options, onfinish: null, cancelled: false, cancel() { a.cancelled = true } }
    anims.push(a)
    return a
  }
})
afterEach(() => {
  ;(Element.prototype as unknown as { animate: unknown }).animate = original
  document.querySelectorAll('[data-slot="confetti-layer"]').forEach((n) => n.remove())
  document.documentElement.removeAttribute("data-motion")
})

const pieces = () => document.querySelectorAll('[data-slot="confetti-layer"] > svg')
const finishAll = () => act(() => anims.forEach((a) => a.onfinish?.()))

describe("confetti()", () => {
  it("throws pieces into a click-through layer and cleans up after itself", () => {
    confetti({ count: 30, seed: 1 })
    const layer = document.querySelector('[data-slot="confetti-layer"]') as HTMLElement
    expect(layer.parentElement).toBe(document.body)
    expect(layer).toHaveAttribute("aria-hidden", "true")
    expect(layer.style.pointerEvents).toBe("none")
    expect(layer.style.position).toBe("fixed")
    expect(pieces()).toHaveLength(30)
    expect(anims).toHaveLength(30)
    expect(anims[0].options.duration).toBe((anims[0].keyframes.length - 1) * STEP_MS)
    finishAll()
    expect(pieces()).toHaveLength(0)
    expect(document.querySelector('[data-slot="confetti-layer"]')).toBeNull()
  })

  it("leaves from an element's center, an event or a point", () => {
    const el = document.createElement("button")
    document.body.appendChild(el)
    el.getBoundingClientRect = () => ({ left: 100, top: 200, width: 40, height: 20, right: 140, bottom: 220, x: 100, y: 200, toJSON() {} }) as DOMRect
    confetti({ count: 1, origin: el, seed: 2 })
    expect(anims[0].keyframes[0].transform).toContain("translate(120.0px, 210.0px)")
    confetti({ count: 1, origin: { clientX: 7, clientY: 9 }, seed: 2 })
    expect(anims[1].keyframes[0].transform).toContain("translate(7.0px, 9.0px)")
    confetti({ count: 1, origin: { x: 33, y: 44 }, seed: 2 })
    expect(anims[2].keyframes[0].transform).toContain("translate(33.0px, 44.0px)")
    el.remove()
  })

  it("is deterministic in its seed and different from burst to burst without one", () => {
    confetti({ count: 5, seed: 9 })
    confetti({ count: 5, seed: 9 })
    expect(JSON.stringify(anims.slice(0, 5).map((a) => a.keyframes))).toBe(JSON.stringify(anims.slice(5).map((a) => a.keyframes)))
    confetti({ count: 5 })
    confetti({ count: 5 })
    expect(JSON.stringify(anims.slice(10, 15).map((a) => a.keyframes))).not.toBe(JSON.stringify(anims.slice(15).map((a) => a.keyframes)))
  })

  it("count is capped at 400 and 0 throws nothing; shapes and colors narrow the pieces", () => {
    confetti({ count: 9999, seed: 1 })
    expect(pieces()).toHaveLength(400)
    document.querySelector('[data-slot="confetti-layer"]')?.remove()
    confetti({ count: 0 })
    confetti({ count: 20, shapes: ["dot"], colors: ["tomato"], seed: 4 })
    const html = document.querySelector('[data-slot="confetti-layer"]')?.innerHTML ?? ""
    expect(html).toContain("var(--ll-tomato)")
    expect(html).not.toContain("var(--ll-sky)")
    expect(html).not.toMatch(/NaN|undefined/)
  })

  it("does nothing when motion is reduced", () => {
    document.documentElement.setAttribute("data-motion", "reduced")
    confetti({ count: 40 })
    expect(pieces()).toHaveLength(0)
    expect(anims).toHaveLength(0)
  })

  it("the returned function clears the burst", () => {
    const stop = confetti({ count: 12, seed: 3 })
    stop()
    expect(pieces()).toHaveLength(0)
    expect(anims.every((a) => a.cancelled)).toBe(true)
  })

  it("a browser without the Web Animations API leaves no pieces behind", () => {
    ;(Element.prototype as unknown as { animate: unknown }).animate = undefined
    confetti({ count: 10 })
    expect(pieces()).toHaveLength(0)
  })

  it("can be scoped to a positioned element", () => {
    const host = document.createElement("div")
    document.body.appendChild(host)
    confetti({ count: 4, container: host, seed: 1 })
    const layer = host.querySelector('[data-slot="confetti-layer"]') as HTMLElement
    expect(layer.style.position).toBe("absolute")
    host.remove()
  })
})

describe("Confetti", () => {
  it("is a decorative layer filling its parent, hidden from assistive technology", async () => {
    const { container } = renderUI(
      <div className="relative">
        <Confetti />
      </div>,
    )
    const layer = container.querySelector('[data-slot="confetti"]') as HTMLElement
    expect(layer).toHaveAttribute("aria-hidden", "true")
    expect(layer.className).toContain("pointer-events-none")
    await axeCheck(container)
  })

  it("bursts when active turns true, when the key changes and on demand, inside itself", () => {
    const handle = React.createRef<ConfettiHandle>()
    const { container, rerender } = render(<Confetti apiRef={handle} count={6} seed={1} burstKey={0} />)
    const layer = container.querySelector('[data-slot="confetti"]') as HTMLElement
    expect(anims).toHaveLength(0)
    rerender(<Confetti apiRef={handle} count={6} seed={1} burstKey={0} active />)
    expect(anims).toHaveLength(6)
    expect(layer.querySelectorAll(":scope > [data-slot='confetti-layer'] > svg")).toHaveLength(6)
    rerender(<Confetti apiRef={handle} count={6} seed={1} burstKey={1} active />)
    expect(anims).toHaveLength(12)
    rerender(<Confetti apiRef={handle} count={6} seed={1} burstKey={1} active />)
    expect(anims).toHaveLength(12)
    act(() => {
      handle.current?.burst({ count: 3 })
    })
    expect(anims).toHaveLength(15)
  })

  it("active on mount throws at once; unmounting clears what is in the air", () => {
    const { unmount } = render(<Confetti count={5} seed={1} active />)
    expect(anims).toHaveLength(5)
    unmount()
    expect(anims.every((a) => a.cancelled)).toBe(true)
  })

  it("renders one empty layer on the server", () => {
    const html = renderToString(<Confetti />)
    expect(html).toContain('data-slot="confetti"')
    expect(html).not.toContain("<svg")
  })
})

describe("ConfettiTrigger and useConfetti", () => {
  it("clicking throws confetti from the trigger, and the click still reaches onClick", () => {
    const onClick = vi.fn()
    const { getByRole } = renderUI(
      <ConfettiTrigger count={8} onClick={onClick}>
        Celebrate
      </ConfettiTrigger>,
    )
    const b = getByRole("button", { name: "Celebrate" })
    b.getBoundingClientRect = () => ({ left: 10, top: 10, width: 20, height: 20, right: 30, bottom: 30, x: 10, y: 10, toJSON() {} }) as DOMRect
    fireEvent.click(b)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(anims).toHaveLength(8)
    expect(anims[0].keyframes[0].transform).toContain("translate(20.0px, 20.0px)")
  })

  it("preventDefault in onClick stops the burst; asChild wraps any element", () => {
    const { getByRole } = renderUI(
      <>
        <ConfettiTrigger onClick={(e) => e.preventDefault()}>No</ConfettiTrigger>
        <ConfettiTrigger asChild count={4}>
          <a href="#x">Yes</a>
        </ConfettiTrigger>
      </>,
    )
    fireEvent.click(getByRole("button", { name: "No" }))
    expect(anims).toHaveLength(0)
    fireEvent.click(getByRole("link", { name: "Yes" }))
    expect(anims).toHaveLength(4)
  })

  it("useConfetti gives a stable function with defaults", () => {
    const fires: Array<(o?: { count?: number }) => () => void> = []
    function C({ n }: { n: number }) {
      const fire = useConfetti({ count: n })
      fires.push(fire)
      return <button onClick={() => fire({ seed: 1 })}>go</button>
    }
    const { getByText, rerender } = render(<C n={3} />)
    rerender(<C n={5} />)
    expect(fires[0]).toBe(fires[1])
    fireEvent.click(getByText("go"))
    expect(anims).toHaveLength(5)
  })
})

describe("confetti drawing and flight", () => {
  it("every kind and color is a small self-contained svg without defs", () => {
    for (const k of CONFETTI_KINDS) {
      for (const c of CONFETTI_COLORS) {
        const p = confettiPiece(k, c, 1)
        expect(p.svg).toContain(`var(--ll-${k === "curl" ? c : c})`)
        expect(p.svg).not.toMatch(/NaN|undefined|mask=|url\(#/)
        expect(p.svg.length).toBeLessThan(1800)
        expect(p.w).toBeGreaterThan(8)
      }
    }
    expect(confettiPiece("star", "sky", 2)).toBe(confettiPiece("star", "sky", 2))
    expect(confettiPiece("star", "sky", 2).svg).not.toBe(confettiPiece("star", "sky", 1).svg)
  })

  it("a flight leaves the origin, slows down, falls, and fades out", () => {
    const flights = simulate({ count: 30, spread: 60, angle: 90, velocity: 900, gravity: 520, drift: 0, duration: 2600, seed: 1 })
    expect(flights).toHaveLength(30)
    const tops: number[] = []
    for (const f of flights) {
      expect(f.frames[0]).toMatchObject({ x: 0, y: 0, opacity: 1 })
      expect(f.frames[f.frames.length - 1].opacity).toBe(0)
      const top = Math.min(...f.frames.map((fr) => fr.y))
      tops.push(top)
      expect(top).toBeLessThan(-5)
      expect(f.frames[f.frames.length - 1].y).toBeGreaterThan(top)
    }
    expect(tops.reduce((a, b) => a + b, 0) / tops.length).toBeLessThan(-50)
    expect(JSON.stringify(simulate({ count: 3, spread: 60, angle: 90, velocity: 900, gravity: 520, drift: 0, duration: 1000, seed: 5 }))).toBe(JSON.stringify(simulate({ count: 3, spread: 60, angle: 90, velocity: 900, gravity: 520, drift: 0, duration: 1000, seed: 5 })))
  })

  it("wind pushes sideways", () => {
    const calm = simulate({ count: 1, spread: 0, angle: 90, velocity: 0, gravity: 520, drift: 0, duration: 2000, seed: 1 })[0]
    const windy = simulate({ count: 1, spread: 0, angle: 90, velocity: 0, gravity: 520, drift: 400, duration: 2000, seed: 1 })[0]
    expect(windy.frames[windy.frames.length - 1].x).toBeGreaterThan(calm.frames[calm.frames.length - 1].x + 20)
  })
})
