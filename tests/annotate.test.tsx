import * as React from "react"
import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Annotate, type AnnotateType } from "@/components/ui/annotate"
import { axeCheck } from "./helpers"
import { THREE_LINES, fireIntersection, inkSvgs, installIntersection, mockLines } from "./_marks-lib"

let restore: Array<() => void> = []
afterEach(() => {
  restore.forEach((r) => r())
  restore = []
})
const lines = () => restore.push(mockLines(["highlight", "underline", "circled", "strike", "scribble"], THREE_LINES))

describe("Annotate", () => {
  const CASES: Array<[AnnotateType, string, string, string]> = [
    ["highlight", "MARK", "highlight", "highlight"],
    ["underline", "SPAN", "underline", "underline"],
    ["circle", "SPAN", "circled", "circled"],
    ["box", "SPAN", "circled", "circled"],
    ["brackets", "SPAN", "circled", "circled"],
    ["strike-through", "S", "strike", "strike"],
    ["crossed-off", "S", "strike", "strike"],
    ["scribble", "SPAN", "scribble", "scribble"],
  ]

  it.each(CASES)("type=%s is the matching mark (%s, data-slot %s) with the words as plain text", (type, tag, slot, kind) => {
    lines()
    const { getByText } = render(<Annotate type={type}>the words</Annotate>)
    const el = getByText("the words")
    expect(el.tagName).toBe(tag)
    expect(el).toHaveAttribute("data-slot", slot)
    expect(el).toHaveAttribute("data-annotate", type)
    expect(inkSvgs(el).length).toBeGreaterThan(0)
    expect(inkSvgs(el)[0].getAttribute("data-ink")).toBe(kind)
    expect(el.textContent).toBe("the words")
  })

  it("box and brackets are shapes of Circled; crossed-off is the cross kind of Strike", () => {
    lines()
    const box = render(<Annotate type="box">b</Annotate>)
    expect(box.getByText("b")).toHaveAttribute("data-shape", "box")
    box.unmount()
    const br = render(<Annotate type="brackets">b</Annotate>)
    expect(br.getByText("b")).toHaveAttribute("data-shape", "brackets")
    br.unmount()
    const x = render(<Annotate type="crossed-off">x</Annotate>)
    expect(x.getByText("x")).toHaveAttribute("data-kind", "cross")
  })

  it("color routes to a highlighter tone for highlight and to a pen for everything else", () => {
    lines()
    const hl = render(<Annotate type="highlight" color="pink" seed="s">h</Annotate>)
    expect(hl.getByText("h")).toHaveAttribute("data-tone", "pink")
    expect(inkSvgs(hl.getByText("h"))[0].innerHTML).toContain("var(--ll-bubblegum)")
    hl.unmount()
    const ul = render(<Annotate type="underline" color="red" seed="s">u</Annotate>)
    expect(inkSvgs(ul.getByText("u"))[0].innerHTML).toContain("var(--ll-red)")
  })

  it("show, animate and delay reach the mark", () => {
    lines()
    restore.push(installIntersection())
    const { getByText, rerender } = render(<Annotate type="highlight" animate show={false}>toggle</Annotate>)
    expect(getByText("toggle")).toHaveAttribute("data-mark", "off")
    rerender(<Annotate type="highlight" animate show delay={300}>toggle</Annotate>)
    const el = getByText("toggle")
    expect(el).toHaveAttribute("data-mark", "idle")
    expect(inkSvgs(el).map((s) => s.style.getPropertyValue("--ll-draw-delay"))[0]).toBe("300ms")
    act(() => fireIntersection(el))
    expect(el).toHaveAttribute("data-mark", "in")
  })

  it("className and props pass through; axe is clean", async () => {
    lines()
    const { getByText, container } = render(
      <p>
        Read <Annotate type="circle" className="font-bold" id="c">this</Annotate> twice.
      </p>,
    )
    expect(getByText("this")).toHaveClass("font-bold")
    expect(getByText("this")).toHaveAttribute("id", "c")
    await axeCheck(container)
  })
})
