import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Handwritten } from "@/components/ui/handwritten"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck } from "./helpers"

const words = (el: Element) => Array.from(el.querySelectorAll<HTMLElement>(".ll-w"))

describe("Handwritten", () => {
  it("wraps every word in a seeded inline span and keeps the text intact", () => {
    const { getByTestId } = render(<Handwritten data-testid="h">the quick brown fox</Handwritten>)
    const el = getByTestId("h")
    expect(el).toHaveAttribute("data-slot", "handwritten")
    expect(el).toHaveClass("ll-hand-jitter")
    expect(words(el).map((w) => w.textContent)).toEqual(["the", "quick", "brown", "fox"])
    expect(el.textContent).toBe("the quick brown fox")
    for (const w of words(el)) {
      expect(w.style.getPropertyValue("--jy")).toMatch(/^-?\d+(\.\d+)?px$/)
      expect(w.style.getPropertyValue("--jr")).toMatch(/^-?\d+(\.\d+)?deg$/)
      expect(Number(w.style.getPropertyValue("--jo"))).toBeGreaterThan(0.8)
      expect(Number(w.style.getPropertyValue("--jo"))).toBeLessThanOrEqual(1)
    }
  })

  it("words are plain inline text: no layer of their own (WebKit clipped a final d, l or ! of a rotated or faded inline-block), the offset and the lightness are relative and color", () => {
    const { getByTestId } = render(<Handwritten data-testid="h">the quick brown fox</Handwritten>)
    expect(getByTestId("h").querySelector("style")).toBeNull()
    const sheet = document.head.querySelector('style[data-href="ll-handwritten"]')?.textContent ?? ""
    expect(sheet).toContain("[data-written] .ll-w{display:inline;position:relative;translate:none;rotate:none;opacity:1;")
    expect(sheet).toMatch(/top:calc\(var\(--jy,0px\)\*var\(--ll-jitter-k,1\)\)/)
    expect(sheet).toContain("color:color-mix(in srgb,currentColor")
    expect(sheet).not.toMatch(/inline-block/)
  })

  it("the sheet hangs on data-written, so a component that gives the element its own data-slot (Callout) still gets it", () => {
    const { getByTestId } = render(
      <Handwritten data-testid="h" data-slot="callout-text">
        call mum
      </Handwritten>,
    )
    expect(getByTestId("h")).toHaveAttribute("data-written", "")
    expect(getByTestId("h")).toHaveAttribute("data-slot", "callout-text")
  })

  it("strength 0 adds no stylesheet at all", () => {
    document.head.querySelectorAll('style[data-href="ll-handwritten"]').forEach((n) => n.remove())
    const { getByTestId } = render(<Handwritten strength={0} data-testid="p">plain</Handwritten>)
    expect(document.head.querySelector('style[data-href="ll-handwritten"]')).toBeNull()
    expect(getByTestId("p")).not.toHaveAttribute("data-written")
  })

  it("the same seed writes the same line; another seed writes it differently", () => {
    const html = (seed: string) => {
      const { getByTestId, unmount } = render(<Handwritten data-testid="h" seed={seed}>the quick brown fox jumps</Handwritten>)
      const out = getByTestId("h").innerHTML
      unmount()
      return out
    }
    expect(html("a")).toBe(html("a"))
    expect(html("a")).not.toBe(html("b"))
  })

  it("leaves code, keys, links and forms exactly as typed, and reaches inside other inline elements", () => {
    const { getByTestId } = render(
      <Handwritten data-testid="h" as="p">
        press <kbd>Ctrl</kbd> then run <code>npm test</code> or read <a href="#x">the docs</a> and <strong>be <em>very</em> careful</strong>
      </Handwritten>,
    )
    const el = getByTestId("h")
    expect(el.tagName).toBe("P")
    expect(el.querySelector("kbd")!.querySelector(".ll-w")).toBeNull()
    expect(el.querySelector("code")!.querySelector(".ll-w")).toBeNull()
    expect(el.querySelector("a")!.querySelector(".ll-w")).toBeNull()
    expect(words(el.querySelector("strong")!).map((w) => w.textContent)).toEqual(["be", "very", "careful"])
    expect(words(el.querySelector("em")!)).toHaveLength(1)
    expect(el.textContent).toBe("press Ctrl then run npm test or read the docs and be very careful")
  })

  it("data-handwritten=off opts an element out", () => {
    const { getByTestId } = render(
      <Handwritten data-testid="h">
        hello <span data-handwritten="off">plain words here</span>
      </Handwritten>,
    )
    expect(words(getByTestId("h"))).toHaveLength(1)
  })

  it("strength 0 renders plain text with no spans and no utility class; strength scales the jitter", () => {
    const plain = render(<Handwritten data-testid="p" strength={0}>no spans here</Handwritten>)
    expect(words(plain.getByTestId("p"))).toHaveLength(0)
    expect(plain.getByTestId("p")).not.toHaveClass("ll-hand-jitter")
    plain.unmount()
    const max = (s: number) => {
      const { getByTestId, unmount } = render(<Handwritten data-testid="h" seed="k" strength={s}>one two three four five six seven eight nine ten</Handwritten>)
      const m = Math.max(...words(getByTestId("h")).map((w) => Math.abs(parseFloat(w.style.getPropertyValue("--jy")))))
      unmount()
      return m
    }
    expect(max(2)).toBeGreaterThan(max(0.5))
  })

  it("numbers, nested arrays and non-element children survive; components are left alone", () => {
    const Box = () => <b>a component</b>
    const { getByTestId } = render(<Handwritten data-testid="h">{["one ", 2, " three"]} <Box /></Handwritten>)
    expect(getByTestId("h").textContent).toBe("one 2 three a component")
    expect(getByTestId("h").querySelector("b")!.querySelector(".ll-w")).toBeNull()
  })

  it("compact density writes it lighter", () => {
    const max = (density?: "compact") => {
      const ui = <Handwritten data-testid="h" seed="k">one two three four five six seven eight nine ten</Handwritten>
      const { getByTestId, unmount } = render(density ? <InkProvider density={density}>{ui}</InkProvider> : ui)
      const m = Math.max(...words(getByTestId("h")).map((w) => Math.abs(parseFloat(w.style.getPropertyValue("--jy")))))
      unmount()
      return m
    }
    expect(max("compact")).toBeLessThan(max())
  })

  it("has no axe violations and merges className", async () => {
    const { container, getByTestId } = render(<Handwritten data-testid="h" as="p" className="text-lg">accessible words</Handwritten>)
    expect(getByTestId("h")).toHaveClass("text-lg", "ll-hand-jitter")
    await axeCheck(container)
  })

  it("is byte-identical on the server twice and hydrates without a warning", async () => {
    const ui = <Handwritten as="p">server written words</Handwritten>
    const a = renderToString(ui)
    expect(a).toBe(renderToString(ui))
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const div = document.createElement("div")
    div.innerHTML = a
    document.body.appendChild(div)
    await act(async () => {
      hydrateRoot(div, ui)
    })
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
    div.remove()
  })
})
