import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Reveal } from "@/components/ui/reveal"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, renderUI } from "./helpers"

type Entry = { isIntersecting: boolean }
let callbacks: Array<(e: Entry[]) => void> = []
let disconnects = 0
let options: Array<IntersectionObserverInit | undefined> = []
const original = globalThis.IntersectionObserver

beforeEach(() => {
  callbacks = []
  disconnects = 0
  options = []
  globalThis.IntersectionObserver = class {
    constructor(cb: (e: Entry[]) => void, o?: IntersectionObserverInit) {
      callbacks.push(cb)
      options.push(o)
    }
    observe() {}
    unobserve() {}
    disconnect() {
      disconnects++
    }
  } as unknown as typeof IntersectionObserver
})
afterEach(() => {
  globalThis.IntersectionObserver = original
  document.documentElement.removeAttribute("data-motion")
})

const root = (c: HTMLElement) => c.querySelector('[data-slot="reveal"]') as HTMLElement
const enter = (yes = true) => act(() => callbacks[callbacks.length - 1]([{ isIntersecting: yes }]))

describe("Reveal", () => {
  it("holds its children back once mounted, and draws them on when they scroll into view", () => {
    const onReveal = vi.fn()
    const { container } = render(
      <Reveal onReveal={onReveal}>
        <p>Hello</p>
      </Reveal>,
    )
    expect(root(container)).toHaveAttribute("data-state", "hidden")
    expect(root(container)).toHaveAttribute("data-armed")
    enter()
    expect(root(container)).toHaveAttribute("data-state", "visible")
    expect(onReveal).toHaveBeenCalledTimes(1)
    expect(disconnects).toBeGreaterThan(0)
  })

  it("the server sends everything visible and unarmed, so nothing depends on script", () => {
    const html = renderToString(<Reveal effect="soak">x</Reveal>)
    const tag = /<div[^>]*data-slot="reveal"[^>]*>/.exec(html)?.[0] ?? ""
    expect(tag).toContain('data-state="visible"')
    expect(tag).not.toContain("data-armed")
    expect(renderToString(<Reveal effect="soak">x</Reveal>)).toBe(html)
  })

  it("its content stays in the accessibility tree while hidden", async () => {
    const { container, getByRole } = renderUI(
      <Reveal>
        <h2>Still readable</h2>
      </Reveal>,
    )
    expect(root(container)).toHaveAttribute("data-state", "hidden")
    expect(getByRole("heading", { name: "Still readable" })).toBeInTheDocument()
    await axeCheck(container)
  })

  it("once={false} hides it again when it leaves, and reveals every time", () => {
    const onReveal = vi.fn()
    const { container } = render(
      <Reveal once={false} onReveal={onReveal}>
        x
      </Reveal>,
    )
    enter()
    enter(false)
    expect(root(container)).toHaveAttribute("data-state", "hidden")
    enter()
    expect(onReveal).toHaveBeenCalledTimes(2)
  })

  it("asks the observer for every 5 %, and counts a very tall element once 40 % of the window shows", () => {
    render(<Reveal threshold={0.6}>x</Reveal>)
    const t = options[0]?.threshold as number[]
    expect(t[0]).toBe(0)
    expect(t[t.length - 1]).toBe(1)
    expect(t).toHaveLength(21)
    const { container } = render(<Reveal threshold={0.6}>tall</Reveal>)
    const cb = callbacks[callbacks.length - 1] as unknown as (e: object[]) => void
    act(() => cb([{ isIntersecting: true, intersectionRatio: 0.1, intersectionRect: { height: 10 } }]))
    expect(root(container)).toHaveAttribute("data-state", "hidden")
    act(() => cb([{ isIntersecting: true, intersectionRatio: 0.1, intersectionRect: { height: window.innerHeight } }]))
    expect(root(container)).toHaveAttribute("data-state", "visible")
  })

  it("each effect uses one of the theme's keyframes and duration tokens", () => {
    const cases = [
      ["wipe", "ll-wipe", "--ll-dur-draw"],
      ["soak", "ll-soak", "--ll-dur-soak"],
      ["drop", "ll-drop", "--ll-dur-drop"],
      ["pop", "ll-pop", "--ll-dur-pop"],
      ["toss", "ll-toss", "--ll-dur-toss"],
    ] as const
    for (const [effect, anim, dur] of cases) {
      const { container, unmount } = render(<Reveal effect={effect}>x</Reveal>)
      expect(root(container).style.getPropertyValue("--ll-reveal-anim")).toBe(anim)
      expect(root(container).style.getPropertyValue("--ll-reveal-dur")).toBe(`var(${dur})`)
      unmount()
    }
  })

  it("delay, stagger and the wipe direction are variables", () => {
    const { container } = render(
      <Reveal delay={0.4} stagger={0.2} from="end">
        <i />
        <i />
      </Reveal>,
    )
    const r = root(container)
    expect(r.style.getPropertyValue("--ll-reveal-delay")).toBe("0.4s")
    expect(r.style.getPropertyValue("--ll-reveal-stagger")).toBe("0.2s")
    expect(r.style.getPropertyValue("--ll-wipe-l")).toBe("100%")
    expect(r).toHaveAttribute("data-stagger")
  })

  it("carries the rules that hide, play and stagger", () => {
    const html = renderToString(<Reveal stagger={0.1}>x</Reveal>)
    expect(html).toContain("[data-slot=reveal][data-armed][data-state=hidden]:not([data-stagger],[data-nib]){opacity:0}")
    expect(html).toContain("var(--ll-reveal-anim) var(--ll-reveal-dur)")
    expect(html).toContain(":nth-child(16){--ll-reveal-i:15}")
  })

  it("nib: a drawn marker tip rides the wipe, outside the clipped content; only for a wipe without stagger", () => {
    const { container } = render(
      <Reveal nib nibColor="sky" from="end">
        <p>Hello</p>
      </Reveal>,
    )
    const r = root(container)
    expect(r).toHaveAttribute("data-nib")
    expect(r).toHaveAttribute("data-from", "end")
    expect(r.querySelector(":scope > [data-slot=reveal-content] > p")).not.toBeNull()
    const nib = r.querySelector(":scope > [data-slot=reveal-nib]") as HTMLElement
    expect(nib).toHaveAttribute("aria-hidden", "true")
    expect(nib.querySelector("svg[data-ink='reveal-nib']")).not.toBeNull()
    for (const props of [{ effect: "soak" as const }, { stagger: 0.1 }]) {
      const c = render(
        <Reveal nib {...props}>
          x
        </Reveal>,
      )
      expect(c.container.querySelector("[data-slot=reveal-nib]")).toBeNull()
      expect(c.container.querySelector("[data-slot=reveal]")).not.toHaveAttribute("data-nib")
    }
  })

  it("carries the nib's keyframes and direction variables", () => {
    const html = renderToString(<Reveal nib>x</Reveal>)
    expect(html).toContain("@keyframes ll-reveal-nib")
    expect(html).toContain("--ll-nib-a:102%")
  })

  it("with reduced motion, or a provider that says so, nothing is ever hidden", () => {
    document.documentElement.setAttribute("data-motion", "reduced")
    const a = render(<Reveal>x</Reveal>)
    expect(root(a.container)).toHaveAttribute("data-state", "visible")
    expect(root(a.container)).not.toHaveAttribute("data-armed")
    a.unmount()
    document.documentElement.removeAttribute("data-motion")
    const b = render(
      <InkProvider motion="reduced">
        <Reveal>x</Reveal>
      </InkProvider>,
    )
    expect(root(b.container)).toHaveAttribute("data-state", "visible")
  })

  it("without IntersectionObserver it stays visible", () => {
    // @ts-expect-error simulating an old browser
    globalThis.IntersectionObserver = undefined
    const { container } = render(<Reveal>x</Reveal>)
    expect(root(container)).toHaveAttribute("data-state", "visible")
  })

  it("renders as another element and passes props through", () => {
    const { container } = render(
      <Reveal as="section" id="hero" className="mx-auto">
        x
      </Reveal>,
    )
    expect(container.querySelector("section#hero")).toHaveAttribute("data-slot", "reveal")
    expect(container.querySelector("section")?.className).toContain("group/reveal")
  })

  it("hydrates without warnings", async () => {
    const tree = <Reveal effect="pop">x</Reveal>
    const host = document.createElement("div")
    host.innerHTML = renderToString(tree)
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
