import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Annotate } from "@/components/ui/annotate"
import { Arrow } from "@/components/ui/arrow"
import { Asterisk } from "@/components/ui/asterisk"
import { Bracket } from "@/components/ui/bracket"
import { Circled } from "@/components/ui/circled"
import { Handwritten } from "@/components/ui/handwritten"
import { Highlight } from "@/components/ui/highlight"
import { QuoteText } from "@/components/ui/quote"
import { Scribble } from "@/components/ui/scribble"
import { Signature } from "@/components/ui/signature"
import { Squiggle } from "@/components/ui/squiggle"
import { Strike } from "@/components/ui/strike"
import { Tally } from "@/components/ui/tally"
import { Underline } from "@/components/ui/underline"
import { Prose } from "@/components/ui/typography"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck } from "./helpers"
import { THREE_LINES, inkSvgs, mockLines } from "./_marks-lib"

let restore: Array<() => void> = []
afterEach(() => {
  restore.forEach((r) => r())
  restore = []
  vi.restoreAllMocks()
})

describe("review: Handwritten", () => {
  it("mixed static children produce no React key warning", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <Handwritten as="p">
        hello <b>bold words</b> and <i>italic</i> then {"a string"} {42} <span>tail</span>
      </Handwritten>,
    )
    expect(err.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
  })

  it("keeps a decoration on the words (inline-blocks do not inherit text-decoration by themselves)", () => {
    const { container } = render(
      <p>
        <u>
          <Handwritten>underlined words</Handwritten>
        </u>
      </p>,
    )
    const w = container.querySelector<HTMLElement>(".ll-w")!
    expect(w.className).toMatch(/text-decoration:inherit|\[text-decoration:inherit\]/)
  })
})

describe("review: Asterisk", () => {
  it("a link without a label still has an accessible name", async () => {
    const { container, getByRole } = render(
      <p>
        Free shipping<Asterisk href="#fn1" />
      </p>,
    )
    expect(getByRole("link").getAttribute("aria-label")).toBeTruthy()
    await axeCheck(container)
  })
})

describe("review: text marks", () => {
  beforeEach(() => {
    restore.push(mockLines(["highlight", "underline"], THREE_LINES))
  })

  it("survives StrictMode (double effects) with one set of svgs and no console noise", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const { getByText } = render(
      <React.StrictMode>
        <p>
          <Highlight>strict words</Highlight>
        </p>
      </React.StrictMode>,
    )
    expect(inkSvgs(getByText("strict words"))).toHaveLength(3)
    expect(err).not.toHaveBeenCalled()
  })

  it("Annotate forwards asChild, ref and unknown props to the mark", () => {
    const ref = React.createRef<HTMLElement>()
    const { container } = render(
      <Annotate type="underline" ref={ref as React.Ref<HTMLSpanElement>} data-x="1" aria-label="named">
        annotated
      </Annotate>,
    )
    expect(ref.current).toBeTruthy()
    expect(container.querySelector("[data-x]")).toBe(ref.current)
  })

  it("an empty mark does not throw", () => {
    expect(() => render(<Underline />)).not.toThrow()
  })

  it("unmount leaves no observers listening (no setState after unmount warnings)", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const { unmount } = render(<Highlight animate>gone</Highlight>)
    unmount()
    expect(err).not.toHaveBeenCalled()
  })
})

describe("review: Prose", () => {
  it("declares the layer order before its own @layer so that preflight cannot outrank it", () => {
    const html = renderToString(<Prose>hello</Prose>)
    const css = /<style[^>]*data-href="ll-prose"[^>]*>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? html
    const decl = css.indexOf("@layer theme, base, components, utilities;")
    const use = css.indexOf("@layer components {")
    expect(decl).toBeGreaterThanOrEqual(0)
    expect(decl).toBeLessThan(use)
  })
})

describe("review: show=false hides the native fallback too", () => {
  it.each([
    ["Highlight", <Highlight key="h" show={false}>x</Highlight>, "data-[mark=off]:bg-transparent"],
    ["Underline", <Underline key="u" show={false}>x</Underline>, "data-[mark=off]:no-underline"],
    ["Strike", <Strike key="s" show={false}>x</Strike>, "data-[mark=off]:no-underline"],
    ["Scribble", <Scribble key="c" show={false}>x</Scribble>, "data-[mark=off]:no-underline"],
    ["Circled", <Circled key="o" show={false}>x</Circled>, "data-[mark=off]:outline-none"],
  ])("%s carries the off-state class", (_n, ui, cls) => {
    const { container } = render(ui)
    const host = container.querySelector("[data-mark]") as HTMLElement
    expect(host).toHaveAttribute("data-mark", "off")
    expect(host.className).toContain(cls as string)
  })

  it("a mark host never leaves the global pre-measure outline visible (no flash of a box), focus stays reachable", () => {
    const { container } = render(
      <p>
        <Highlight>a</Highlight>
        <Underline>b</Underline>
        <Strike>c</Strike>
        <Scribble>d</Scribble>
      </p>,
    )
    for (const host of Array.from(container.querySelectorAll<HTMLElement>("[data-mark]"))) {
      expect(host.className).toContain("not-focus-visible:outline-none")
      expect(host.className.split(/\s+/)).not.toContain("outline-none")
    }
  })

  it("block marks are quiet too", () => {
    const { container } = render(
      <div>
        <Arrow />
        <Bracket>x</Bracket>
        <Squiggle />
        <Tally count={3} />
        <Signature>A</Signature>
        <QuoteText>q</QuoteText>
      </div>,
    )
    for (const slot of ["arrow", "bracket", "squiggle", "tally", "signature", "quote-text"]) {
      expect(container.querySelector(`[data-slot=${slot}]`)!.className.split(/\s+/)).toContain("outline-none")
    }
  })
})

describe("review: huge marks", () => {
  it("a mark over more than 60 lines keeps the browser's decoration instead of drawing hundreds of svgs", () => {
    const many = Array.from({ length: 90 }, (_, i) => ({ left: 0, top: i * 27, width: 300, height: 27 }))
    restore.push(mockLines(["highlight", "circled"], many))
    const { getByText } = render(
      <>
        <Highlight>a whole article</Highlight>
        <Circled>the same, boxed</Circled>
      </>,
    )
    expect(inkSvgs(getByText("a whole article"))).toHaveLength(0)
    expect(getByText("a whole article")).not.toHaveAttribute("data-ink-ready")
    expect(inkSvgs(getByText("the same, boxed"))).toHaveLength(0)
  })

  it("60 lines still draw", () => {
    const sixty = Array.from({ length: 60 }, (_, i) => ({ left: 0, top: i * 27, width: 300, height: 27 }))
    restore.push(mockLines("highlight", sixty))
    const { getByText } = render(<Highlight>sixty lines</Highlight>)
    expect(inkSvgs(getByText("sixty lines"))).toHaveLength(60)
  })
})

describe("review: animate gate", () => {
  function fakeObservers() {
    const made: Array<{ cb: IntersectionObserverCallback; margin?: string; targets: Element[] }> = []
    const Prev = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = class {
      o: (typeof made)[number]
      constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
        this.o = { cb, margin: opts?.rootMargin, targets: [] }
        made.push(this.o)
      }
      observe(el: Element) {
        this.o.targets.push(el)
      }
      unobserve() {}
      disconnect() {
        this.o.targets = []
      }
      takeRecords() {
        return []
      }
    } as unknown as typeof IntersectionObserver
    restore.push(() => {
      globalThis.IntersectionObserver = Prev
    })
    const see = (o: (typeof made)[number], isIntersecting: boolean) => o.cb([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
    return { made, see }
  }

  it("a mark in the bottom 12 % of a page that cannot scroll still draws after a moment", () => {
    vi.useFakeTimers()
    restore.push(() => vi.useRealTimers(), mockLines("highlight", THREE_LINES))
    const { made, see } = fakeObservers()
    const { getByText } = render(<Highlight animate>low on the page</Highlight>)
    const el = getByText("low on the page")
    expect(el).toHaveAttribute("data-mark", "idle")
    const plain = made.find((o) => !o.margin)!
    act(() => see(plain, true))
    expect(el).toHaveAttribute("data-mark", "idle")
    act(() => {
      vi.advanceTimersByTime(1300)
    })
    expect(el).toHaveAttribute("data-mark", "in")
  })

  it("scrolling past before the dwell is over cancels it, and unmounting clears it", () => {
    vi.useFakeTimers()
    restore.push(() => vi.useRealTimers(), mockLines("highlight", THREE_LINES))
    const { made, see } = fakeObservers()
    const { getByText, unmount } = render(<Highlight animate>passing by</Highlight>)
    const el = getByText("passing by")
    const plain = made.find((o) => !o.margin)!
    act(() => see(plain, true))
    act(() => see(plain, false))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(el).toHaveAttribute("data-mark", "idle")
    act(() => see(plain, true))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

void [hydrateRoot, act, InkProvider]
