import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Typewriter } from "@/components/ui/typewriter"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { typewriterCaretRecipe, typingPlan } from "@/lib/ink/recipes/typewriter-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(12, 20)
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  restore()
  document.documentElement.removeAttribute("data-motion")
})

const page = (c: HTMLElement) => (c.querySelector('[data-slot="typewriter"] > span[aria-hidden]') as HTMLElement).textContent
const OPTS = { speed: 22, pause: 1400, mode: "lines" as const, seed: "s" }
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

describe("Typewriter", () => {
  it("types the text out with a pause before it starts, and calls onDone once", () => {
    const onDone = vi.fn()
    const { container } = render(<Typewriter text="Hello, paper." startOnView={false} delay={500} onDone={onDone} seed="a" />)
    expect(page(container)).toBe("")
    advance(499)
    expect(page(container)).toBe("")
    advance(1)
    expect(page(container)).toBe("")
    advance(300)
    const early = page(container) as string
    expect(early.length).toBeGreaterThan(0)
    expect("Hello, paper.".startsWith(early)).toBe(true)
    expect(onDone).not.toHaveBeenCalled()
    advance(5000)
    expect(page(container)).toBe("Hello, paper.")
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it("keeps the words in the accessibility tree once, whole, in a polite region", () => {
    const { container } = render(<Typewriter text="Hello, paper." startOnView={false} seed="a" />)
    const sr = container.querySelector(".sr-only") as HTMLElement
    expect(sr).toHaveTextContent("Hello, paper.")
    expect(sr).toHaveAttribute("aria-live", "polite")
    expect(sr).toHaveAttribute("aria-atomic", "true")
    advance(200)
    expect(sr).toHaveTextContent("Hello, paper.")
    expect(container.querySelector('[data-slot="typewriter"] > span[aria-hidden="true"]')).not.toBeNull()
  })

  it("is accessible", async () => {
    vi.useRealTimers()
    const { container } = renderUI(<Typewriter text="Hello" startOnView={false} />)
    await axeCheck(container)
  })

  it("lines go one under the other", () => {
    const { container } = render(<Typewriter text={["one", "two"]} startOnView={false} delay={0} seed="l" />)
    advance(6000)
    expect(page(container)).toBe("one\ntwo")
  })

  it("cycle types a phrase, backspaces it and types the next", () => {
    const { container } = render(<Typewriter text={["ab", "cd"]} mode="cycle" startOnView={false} delay={0} pause={500} speed={50} seed="c" />)
    const plan = typingPlan(["ab", "cd"], { speed: 50, pause: 500, mode: "cycle", seed: "c" })
    const seen = new Set<string>()
    let t = 0
    for (const s of plan.steps) {
      advance(s.at - t)
      t = s.at
      seen.add(page(container) ?? "")
    }
    expect([...seen]).toEqual(expect.arrayContaining(["", "a", "ab", "cd"]))
    expect(page(container)).toBe("cd")
  })

  it("loop starts again from an empty page and never says it is done", () => {
    const onDone = vi.fn()
    const { container } = render(<Typewriter text="hi" loop startOnView={false} delay={0} pause={300} speed={50} onDone={onDone} seed="p" />)
    advance(200)
    expect(page(container)).toBe("hi")
    advance(200)
    expect(page(container)).toBe("")
    advance(300)
    expect(page(container)?.length).toBeGreaterThan(0)
    expect(onDone).not.toHaveBeenCalled()
    expect(container.querySelector(".sr-only")).toHaveAttribute("aria-live", "off")
  })

  it("waits until it is on screen", () => {
    const observed: Array<(e: Array<{ isIntersecting: boolean }>) => void> = []
    class FakeIO {
      constructor(cb: (e: Array<{ isIntersecting: boolean }>) => void) {
        observed.push(cb)
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    const original = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = FakeIO as unknown as typeof IntersectionObserver
    try {
      const { container } = render(<Typewriter text="wait for it" delay={0} seed="v" />)
      advance(3000)
      expect(page(container)).toBe("")
      act(() => observed[0]([{ isIntersecting: true }]))
      advance(4000)
      expect(page(container)).toBe("wait for it")
    } finally {
      globalThis.IntersectionObserver = original
    }
  })

  it("with reduced motion the finished text is simply there", () => {
    document.documentElement.setAttribute("data-motion", "reduced")
    const onDone = vi.fn()
    const { container } = render(<Typewriter text={["one", "two"]} startOnView={false} onDone={onDone} />)
    expect(page(container)).toBe("one\ntwo")
    advance(5000)
    expect(page(container)).toBe("one\ntwo")
    const c = render(<Typewriter text={["one", "two"]} mode="cycle" startOnView={false} />)
    expect(page(c.container)).toBe("two")
  })

  it("an InkProvider with motion=reduced does the same", () => {
    const { container } = render(
      <InkProvider motion="reduced">
        <Typewriter text="still" startOnView={false} />
      </InkProvider>,
    )
    expect(page(container)).toBe("still")
  })

  it("changing the text starts over", () => {
    const { container, rerender } = render(<Typewriter text="first" startOnView={false} delay={0} seed="r" />)
    advance(4000)
    expect(page(container)).toBe("first")
    rerender(<Typewriter text="second" startOnView={false} delay={0} seed="r" />)
    expect(container.querySelector(".sr-only")).toHaveTextContent("second")
    advance(4000)
    expect(page(container)).toBe("second")
  })

  it("the caret is inked in the shape asked for, solid while typing and blinking when it rests; false leaves it out", () => {
    const { container, rerender } = render(<Typewriter text="ab" cursor="block" startOnView={false} delay={0} seed="k" />)
    expectInkLayers(container, { min: 1, kinds: ["typewriter-caret"], absolute: true })
    expect(container.querySelector('[data-slot="typewriter-caret"]')?.className).toContain("w-[0.6em]")
    advance(50)
    expect(container.querySelector('[data-slot="typewriter"]')).toHaveAttribute("data-state", "typing")
    advance(3000)
    expect(container.querySelector('[data-slot="typewriter"]')).toHaveAttribute("data-state", "idle")
    rerender(<Typewriter text="ab" cursor={false} startOnView={false} />)
    expect(container.querySelector('[data-slot="typewriter-caret"]')).toBeNull()
  })

  it("words carry the jitter variables, and are plain inline text: no layer of their own for WebKit to clip a last glyph to its advance", () => {
    const { container } = render(<Typewriter text="two words" startOnView={false} delay={0} seed="j" />)
    advance(4000)
    const w = container.querySelectorAll(".ll-w")
    expect(w).toHaveLength(2)
    for (const word of Array.from(w) as HTMLElement[]) {
      expect(Math.abs(parseFloat(word.style.getPropertyValue("--jy")))).toBeLessThanOrEqual(0.8)
      expect(parseFloat(word.style.getPropertyValue("--jo"))).toBeGreaterThanOrEqual(0.9)
      expect(word.style.getPropertyValue("--jr")).toBe("")
    }
    expect(container.querySelector('[data-slot="typewriter"]')?.className).not.toContain("ll-hand-jitter")
    const sheet = document.head.querySelector('style[data-href="ll-typewriter"]')?.textContent ?? ""
    expect(sheet).toContain("[data-slot=typewriter] .ll-w{position:relative;top:calc(var(--jy,0px)*var(--ll-jitter-k,1));color:color-mix(in srgb,currentColor")
    expect(sheet).not.toMatch(/inline-block|translate:|rotate:|opacity:var/)
  })

  it("reserve holds the room of the finished text from the first frame: an invisible copy in flow, the typed text laid over it", () => {
    const { container } = render(<Typewriter text={["one", "two lines"]} reserve startOnView={false} delay={0} seed="r" />)
    const root = container.querySelector('[data-slot="typewriter"]') as HTMLElement
    const copy = root.querySelector('[data-slot="typewriter-reserve"]') as HTMLElement
    const typed = root.querySelector(':scope > span[aria-hidden]:not([data-slot])') as HTMLElement
    expect(root).toHaveAttribute("data-reserve", "")
    expect(root).toHaveClass("inline-block", "relative")
    expect(copy).toHaveAttribute("aria-hidden", "true")
    expect(copy).toHaveClass("invisible")
    expect(copy.textContent).toBe("one\ntwo lines")
    expect(typed).toHaveClass("absolute", "inset-0")
    expect(typed.textContent).toBe("")
    advance(6000)
    expect(typed.textContent).toBe("one\ntwo lines")
    expect(root.querySelectorAll("[aria-live]")).toHaveLength(1)
    expect(root.querySelector("[aria-live]")?.textContent).toBe("one\ntwo lines")
  })

  it("reserve on a cycle holds the longest phrase, leaves room for the caret, and yields to a display class of your own", () => {
    const { container } = render(<Typewriter text={["tape", "small good things", "ink"]} mode="cycle" reserve cursor="block" className="block" startOnView={false} seed="c" />)
    const root = container.querySelector('[data-slot="typewriter"]') as HTMLElement
    const copy = root.querySelector('[data-slot="typewriter-reserve"]') as HTMLElement
    expect(copy.textContent).toBe("small good things")
    expect(copy.querySelector("span")).toHaveClass("inline-block", "w-[0.6em]")
    expect(root).toHaveClass("block")
    expect(root).not.toHaveClass("inline-block")
  })

  it("without reserve it is the inline element it was: no copy, no overlay", () => {
    const { container } = render(<Typewriter text="plain" startOnView={false} seed="n" />)
    const root = container.querySelector('[data-slot="typewriter"]') as HTMLElement
    expect(root).not.toHaveAttribute("data-reserve")
    expect(root).toHaveClass("inline")
    expect(root.querySelector('[data-slot="typewriter-reserve"]')).toBeNull()
    expect(root.querySelector(".absolute.inset-0")).toBeNull()
  })

  it("the server sends the whole text, and hydration is quiet", async () => {
    vi.useRealTimers()
    const tree = <Typewriter text={["Hello", "world"]} seed="ssr" />
    const a = renderToString(tree)
    expect(renderToString(tree)).toBe(a)
    expect(a).toContain("Hello")
    expect(a).toContain("world")
    expect(a).toContain("@keyframes ll-caret")
    const host = document.createElement("div")
    host.innerHTML = a
    document.body.appendChild(host)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(host, tree)
    })
    expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
    errors.mockRestore()
    host.remove()
  })
})

describe("typing plan", () => {
  it("is deterministic and starts from an empty page", () => {
    const a = typingPlan(["Hello, world."], OPTS)
    expect(typingPlan(["Hello, world."], OPTS)).toEqual(a)
    expect(typingPlan(["Hello, world."], { ...OPTS, seed: "t" })).not.toEqual(a)
    expect(a.steps[0]).toEqual({ at: 0, text: "" })
    expect(a.steps).toHaveLength("Hello, world.".length + 1)
    expect(a.steps[a.steps.length - 1].text).toBe("Hello, world.")
  })

  it("commas and full stops hold the hand", () => {
    const flat = typingPlan(["a".repeat(32)], { ...OPTS, speed: 100 }).total
    const commas = typingPlan(["a,".repeat(16)], { ...OPTS, speed: 100 }).total
    const stops = typingPlan(["a.".repeat(16)], { ...OPTS, speed: 100 }).total
    expect(commas).toBeGreaterThan(flat * 1.5)
    expect(stops).toBeGreaterThan(commas)
  })

  it("speed scales the whole plan", () => {
    const slow = typingPlan(["x".repeat(40)], { ...OPTS, speed: 10 })
    const fast = typingPlan(["x".repeat(40)], { ...OPTS, speed: 40 })
    expect(slow.total / fast.total).toBeGreaterThan(3)
  })

  it("loop ends on an empty page, cycle backspaces", () => {
    const l = typingPlan(["ab"], { ...OPTS, loop: true })
    expect(l.steps[l.steps.length - 1].text).toBe("")
    const c = typingPlan(["ab", "cd"], { ...OPTS, mode: "cycle" })
    const texts = c.steps.map((s) => s.text)
    expect(texts.indexOf("ab")).toBeLessThan(texts.indexOf("a", 3))
    expect(texts).toContain("")
  })
})

describe("caret drawing", () => {
  it("draws all three shapes, small", () => {
    for (const shape of ["block", "bar", "underscore"]) {
      const f = runRecipe(typewriterCaretRecipe as never, { box: { w: 10, h: 20 }, params: { shape }, seed: "c", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } })
      expect(f.parts.rest ?? "").not.toBe("")
      expect((f.parts.rest ?? "").length).toBeLessThan(2500)
      expect(f.parts.rest ?? "").not.toMatch(/NaN|undefined/)
    }
  })
})
