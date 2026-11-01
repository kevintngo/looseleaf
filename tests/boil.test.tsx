import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Boil, useBoilFrame, useBoilSeed } from "@/components/ui/boil"
import { Button } from "@/components/ui/button"
import { Doodle } from "@/components/ui/doodle"
import { InkProvider } from "@/lib/ink/react"
import { BOIL_MAX_FRAMES, boilKnobs, boilSeed } from "@/lib/ink/recipes/boil-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  restore()
  document.documentElement.removeAttribute("data-motion")
})

const tick = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })
const boil = (c: HTMLElement) => c.querySelector('[data-slot="boil"]') as HTMLElement
const doodle = (c: HTMLElement) => c.querySelector('svg[data-slot="doodle"]') as SVGElement

describe("Boil", () => {
  it("moves to the next frame six times a second and comes round again", () => {
    const { container } = render(
      <Boil>
        <Doodle name="star" size={64} />
      </Boil>,
    )
    expect(boil(container)).toHaveAttribute("data-frame", "0")
    const seen: string[] = []
    for (let i = 0; i < 6; i++) {
      tick(167)
      seen.push(boil(container).getAttribute("data-frame") as string)
    }
    expect(seen).toEqual(["1", "2", "0", "1", "2", "0"])
    expect(boil(container)).toHaveAttribute("data-state", "boiling")
  })

  it("redraws the direct children that take a seed, by a new hand each frame, and the same hand when a frame comes round", () => {
    const { container } = render(
      <Boil>
        <Doodle name="star" size={64} />
      </Boil>,
    )
    const drawn: string[] = [doodle(container).innerHTML]
    tick(167)
    drawn.push(doodle(container).innerHTML)
    tick(167)
    drawn.push(doodle(container).innerHTML)
    tick(167)
    drawn.push(doodle(container).innerHTML)
    expect(new Set(drawn.slice(0, 3)).size).toBe(3)
    expect(drawn[3]).toBe(drawn[0])
  })

  it("a child's own seed is kept and only gains the frame", () => {
    const { container, rerender } = render(
      <Boil>
        <Doodle name="star" size={64} seed="mine" />
      </Boil>,
    )
    const first = doodle(container).innerHTML
    tick(167)
    const second = doodle(container).innerHTML
    expect(second).not.toBe(first)
    rerender(
      <Boil reseed={false}>
        <Doodle name="star" size={64} seed="mine" />
      </Boil>,
    )
    tick(167)
    expect(doodle(container).innerHTML).toBe(first)
  })

  it("drawn things deeper in the tree feel it through the knobs", () => {
    const { container } = render(
      <Boil>
        <div>
          <Button seed="b">Boil me</Button>
        </div>
      </Boil>,
    )
    const rest = () => (container.querySelector('button svg[data-ink="button"] [data-layer="rest"]') as SVGElement).innerHTML
    const a = rest()
    tick(167)
    const b = rest()
    expect(b).not.toBe(a)
    tick(334)
    expect(rest()).toBe(a)
  })

  it("a render prop gets the frame and a seed maker; hooks read them", () => {
    function Probe() {
      return (
        <output>
          {useBoilFrame()}:{useBoilSeed("sun")}
        </output>
      )
    }
    const seeds: string[] = []
    const { container } = render(
      <Boil>
        {({ frame, seed }) => {
          seeds.push(`${frame}=${seed("x")}`)
          return <Probe />
        }}
      </Boil>,
    )
    expect(container.querySelector("output")).toHaveTextContent("0:sun")
    tick(167)
    expect(container.querySelector("output")).toHaveTextContent("1:sun~1")
    expect(seeds).toContain("1=x~1")
  })

  it("outside a Boil the hooks are inert", () => {
    function Probe() {
      return (
        <output>
          {useBoilFrame()}:{useBoilSeed(7)}
        </output>
      )
    }
    const { container } = render(<Probe />)
    expect(container.querySelector("output")).toHaveTextContent("0:7")
  })

  it("stands still with reduced motion, an InkProvider that says so, inactive, off screen and in a hidden tab", () => {
    document.documentElement.setAttribute("data-motion", "reduced")
    const a = render(<Boil>x</Boil>)
    tick(1000)
    expect(boil(a.container)).toHaveAttribute("data-frame", "0")
    expect(boil(a.container)).toHaveAttribute("data-state", "still")
    a.unmount()
    document.documentElement.removeAttribute("data-motion")

    const b = render(
      <InkProvider motion="reduced">
        <Boil>x</Boil>
      </InkProvider>,
    )
    tick(1000)
    expect(boil(b.container)).toHaveAttribute("data-frame", "0")
    b.unmount()

    const c = render(<Boil active={false}>x</Boil>)
    tick(1000)
    expect(boil(c.container)).toHaveAttribute("data-frame", "0")
    c.unmount()

    let cb: ((e: Array<{ isIntersecting: boolean }>) => void) | undefined
    const original = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = class {
      constructor(f: typeof cb) {
        cb = f
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    } as unknown as typeof IntersectionObserver
    try {
      const d = render(<Boil>x</Boil>)
      tick(400)
      expect(boil(d.container).getAttribute("data-frame")).not.toBe("0")
      act(() => cb?.([{ isIntersecting: false }]))
      expect(boil(d.container)).toHaveAttribute("data-frame", "0")
      tick(1000)
      expect(boil(d.container)).toHaveAttribute("data-frame", "0")
      act(() => cb?.([{ isIntersecting: true }]))
      tick(200)
      expect(boil(d.container).getAttribute("data-frame")).not.toBe("0")
      d.unmount()
    } finally {
      globalThis.IntersectionObserver = original
    }

    Object.defineProperty(document, "hidden", { configurable: true, get: () => true })
    try {
      const e = render(<Boil>x</Boil>)
      tick(1000)
      expect(boil(e.container)).toHaveAttribute("data-frame", "0")
    } finally {
      delete (document as unknown as { hidden?: boolean }).hidden
    }
  })

  it("calm density is the quiet setting: it does not boil", () => {
    const { container } = render(
      <InkProvider density="calm">
        <Boil>x</Boil>
      </InkProvider>,
    )
    tick(1000)
    expect(boil(container)).toHaveAttribute("data-frame", "0")
    expect(boil(container)).toHaveAttribute("data-state", "still")
  })

  it("fps and frames are clamped", () => {
    const { container } = render(<Boil fps={1000} frames={99}>x</Boil>)
    const seen = new Set<string>()
    for (let i = 0; i < 40; i++) {
      tick(84)
      seen.add(boil(container).getAttribute("data-frame") as string)
    }
    expect(seen.size).toBe(BOIL_MAX_FRAMES)
  })

  it("cleans its timer up", () => {
    const { unmount } = render(<Boil>x</Boil>)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it("is accessible, transparent to layout and quiet on the server", async () => {
    vi.useRealTimers()
    const { container } = renderUI(
      <Boil>
        <Doodle name="sun" size={48} label="A sun" />
      </Boil>,
    )
    await axeCheck(container)
    const a = renderToString(
      <Boil>
        <Doodle name="sun" size={48} />
      </Boil>,
    )
    expect(a).toContain('data-frame="0"')
    const host = document.createElement("div")
    host.innerHTML = a
    document.body.appendChild(host)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(
        host,
        <Boil>
          <Doodle name="sun" size={48} />
        </Boil>,
      )
    })
    expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
    errors.mockRestore()
    host.remove()
  })
})

describe("boil frames", () => {
  it("frame 0 is the resting drawing and the frames are all different", () => {
    expect(boilKnobs(0)).toEqual({ wobble: 1, misreg: 1, bleed: 1, width: 1 })
    expect(boilSeed("x", 0)).toBe("x")
    expect(new Set(Array.from({ length: BOIL_MAX_FRAMES }, (_, i) => JSON.stringify(boilKnobs(i)))).size).toBe(BOIL_MAX_FRAMES)
    expect(boilSeed("x", 2)).toBe("x~2")
  })

  it("strength scales the distance from rest, and no knob goes to zero", () => {
    const soft = boilKnobs(1, 0.5), norm = boilKnobs(1, 1), wild = boilKnobs(1, 3)
    expect(Math.abs(soft.misreg - 1)).toBeLessThan(Math.abs(norm.misreg - 1))
    expect(Math.abs(wild.misreg - 1)).toBeGreaterThan(Math.abs(norm.misreg - 1))
    expect(boilKnobs(1, 0)).toEqual({ wobble: 1, misreg: 1, bleed: 1, width: 1 })
    for (let f = 0; f < BOIL_MAX_FRAMES; f++) for (const v of Object.values(boilKnobs(f, 50))) expect(v).toBeGreaterThanOrEqual(0.05)
    expect(boilKnobs(BOIL_MAX_FRAMES + 1)).toEqual(boilKnobs(1))
  })
})
