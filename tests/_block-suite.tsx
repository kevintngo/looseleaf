import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { axeCheck, expectInkLayers, mockBox } from "./helpers"
import { fireIntersection, inkSvgs, installIntersection } from "./_marks-lib"

export interface BlockMarkSpec {
  name: string
  slot: string
  kind: string
  size: [number, number]
  make: (props: Record<string, unknown>) => React.ReactElement
  variants: Array<Record<string, unknown>>
  drawOn: "reveal" | "wipe"
  ssrDraws?: boolean
}

export function describeBlockMark(spec: BlockMarkSpec): void {
  let restore: Array<() => void> = []
  beforeEach(() => restore.push(mockBox(spec.size[0], spec.size[1])))
  afterEach(() => {
    restore.forEach((r) => r())
    restore = []
  })

  describe(`${spec.name} (shared block-mark behavior)`, () => {
    it("draws one aria-hidden svg as a direct child of the ink host", () => {
      const { container, getByTestId } = render(spec.make({ "data-testid": "h" }))
      const host = getByTestId("h")
      expect(host).toHaveAttribute("data-slot", spec.slot)
      expect(host).toHaveAttribute("data-ink-host")
      expect(host).toHaveAttribute("data-ink-ready")
      const svgs = inkSvgs(host)
      expect(svgs).toHaveLength(1)
      expect(svgs[0]).toHaveAttribute("aria-hidden", "true")
      expect(svgs[0]).toHaveAttribute("focusable", "false")
      expect(svgs[0].getAttribute("data-ink")).toBe(spec.kind)
      expect(svgs[0].innerHTML).not.toMatch(/NaN|undefined|Infinity/)
      expectInkLayers(container, { min: 1, kinds: [spec.kind], absolute: true })
    })

    it("show=false removes the drawing, show=true brings it back", () => {
      const { getByTestId, rerender } = render(spec.make({ "data-testid": "h", show: false }))
      expect(inkSvgs(getByTestId("h"))).toHaveLength(0)
      expect(getByTestId("h")).toHaveAttribute("data-mark", "off")
      expect(getByTestId("h")).not.toHaveAttribute("data-ink-host")
      rerender(spec.make({ "data-testid": "h", show: true }))
      expect(inkSvgs(getByTestId("h"))).toHaveLength(1)
      expect(getByTestId("h")).toHaveAttribute("data-mark", "in")
    })

    it("the same seed draws the same mark, another seed another, and variants change it", () => {
      const html = (props: Record<string, unknown>, seed: string) => {
        const { getByTestId, unmount } = render(spec.make({ "data-testid": "h", seed, ...props }))
        const out = inkSvgs(getByTestId("h"))[0].innerHTML
        unmount()
        return out
      }
      expect(html({}, "a")).toBe(html({}, "a"))
      expect(html({}, "a")).not.toBe(html({}, "b"))
      for (const v of spec.variants) expect(html(v, "a")).not.toBe(html({}, "a"))
    })

    it("merges className and forwards props", () => {
      const { getByTestId } = render(spec.make({ "data-testid": "h", className: "opacity-90", id: "x" }))
      expect(getByTestId("h")).toHaveClass("relative", "isolate", "opacity-90")
      expect(getByTestId("h")).toHaveAttribute("id", "x")
    })

    describe("animate", () => {
      beforeEach(() => restore.push(installIntersection()))

      it("holds back until it scrolls into view, then draws on", () => {
        const { getByTestId } = render(spec.make({ "data-testid": "h", animate: true, delay: 120 }))
        const el = getByTestId("h")
        expect(el).toHaveAttribute("data-animate")
        expect(el).toHaveAttribute("data-mark", "idle")
        expect(el.className).toContain(spec.drawOn === "reveal" ? "stroke-dasharray:1" : "clip-path")
        expect(el.style.getPropertyValue("--ll-draw-delay")).not.toBe("")
        act(() => fireIntersection(el))
        expect(el).toHaveAttribute("data-mark", "in")
        expect(el.className).toContain(spec.drawOn === "reveal" ? "animate-[ll-draw" : "animate-[ll-wipe")
      })
    })

    describe("in a page", () => {
      it("has no axe violations", async () => {
        const { container } = render(<div>{spec.make({})}</div>)
        await axeCheck(container)
      })

      it("renders the same on the server twice and hydrates without a warning", async () => {
        const ui = <div>{spec.make({ seed: "s" })}</div>
        const a = renderToString(ui)
        expect(a).toBe(renderToString(ui))
        expect(a).toContain(`data-slot="${spec.slot}"`)
        if (spec.ssrDraws) expect(a).toContain("<svg")
        else expect(a).not.toContain("<svg")
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
  })
}
