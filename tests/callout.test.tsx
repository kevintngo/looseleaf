import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Callout } from "@/components/ui/callout"
import { axeCheck, mockBox } from "./helpers"
import { fireIntersection, inkSvgs, installIntersection } from "./_marks-lib"

let restore: Array<() => void> = []
beforeEach(() => restore.push(mockBox(56, 40)))
afterEach(() => {
  restore.forEach((r) => r())
  restore = []
})

describe("Callout", () => {
  it("is a note: handwritten real text and an aria-hidden arrow", () => {
    const { getByRole, container } = render(<Callout>check the date!</Callout>)
    const note = getByRole("note")
    expect(note).toHaveAttribute("data-slot", "callout")
    expect(note.textContent).toBe("check the date!")
    const arrow = container.querySelector("[data-slot=arrow]") as HTMLElement
    expect(arrow).toBeTruthy()
    expect(arrow).toHaveAttribute("aria-hidden", "true")
    expect(inkSvgs(arrow)).toHaveLength(1)
    expect(container.querySelector("[data-slot=callout-text]")).toHaveClass("font-script", "text-ink-you", "ll-hand-jitter")
    expect(container.querySelectorAll(".ll-w")).toHaveLength(3)
  })

  it("its words get Handwritten's layer-free sheet although the text carries its own data-slot (the sheet keys on data-written, and no local ink-room class is needed)", () => {
    const { container } = render(<Callout>check the date!</Callout>)
    const text = container.querySelector("[data-slot=callout-text]") as HTMLElement
    expect(text).toHaveAttribute("data-written", "")
    expect(text.className).not.toContain("ll-ink-room")
    const sheet = document.head.querySelector('style[data-href="ll-handwritten"]')?.textContent ?? ""
    expect(sheet.startsWith("[data-written] .ll-w{display:inline;")).toBe(true)
  })

  it("the text sits on the tail side of the arrow, by direction", () => {
    const layout = (direction: React.ComponentProps<typeof Callout>["direction"]) => {
      const { getByRole, unmount } = render(<Callout direction={direction}>x</Callout>)
      const c = getByRole("note").className
      unmount()
      return c
    }
    expect(layout("right")).toContain("flex-row ")
    expect(layout("left")).toContain("flex-row-reverse")
    expect(layout("down")).toContain("flex-col ")
    expect(layout("up")).toContain("flex-col-reverse")
    expect(layout("down-left")).toContain("items-start")
    expect(layout("up-right")).toContain("items-end")
  })

  it("is positioned by className and the arrow can be resized or dropped", () => {
    const { getByRole, container } = render(
      <Callout className="float-right clear-right -me-56 w-48" arrowClassName="h-12 w-20">
        margin
      </Callout>,
    )
    expect(getByRole("note")).toHaveClass("float-right", "clear-right", "-me-56", "w-48")
    expect(container.querySelector("[data-slot=arrow]")).toHaveClass("h-12", "w-20")
    const bare = render(<Callout arrow={false}>just words</Callout>)
    expect(bare.container.querySelector("[data-slot=arrow]")).toBeNull()
  })

  it("show=false hides the whole note", () => {
    const { getByRole } = render(<Callout show={false}>gone</Callout>)
    expect(getByRole("note", { hidden: true })).toHaveAttribute("data-mark", "off")
    expect(getByRole("note", { hidden: true })).toHaveClass("data-[mark=off]:hidden")
  })

  describe("animate", () => {
    beforeEach(() => restore.push(installIntersection()))
    it("the words fade in with the arrow drawing itself once the note scrolls into view", () => {
      const { getByRole, container } = render(<Callout animate delay={100}>hello</Callout>)
      const note = getByRole("note")
      expect(note).toHaveAttribute("data-mark", "idle")
      expect(container.querySelector("[data-slot=callout-text]")!.className).toContain("group-data-[mark=idle]/callout:opacity-0")
      expect(container.querySelector("[data-slot=arrow]")).toHaveAttribute("data-mark", "idle")
      act(() => fireIntersection(note))
      expect(note).toHaveAttribute("data-mark", "in")
    })
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <p>Text</p>
        <Callout>a note</Callout>
      </div>,
    )
    await axeCheck(container)
  })

  it("renders on the server without a drawing and hydrates without a warning", async () => {
    const ui = <Callout seed="s">server note</Callout>
    const a = renderToString(ui)
    expect(a).toBe(renderToString(ui))
    expect(a).not.toContain("<svg")
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
