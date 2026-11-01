import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers } from "./helpers"
import { THREE_LINES, fireIntersection, inkSvgs, installIntersection, mockLines } from "./_marks-lib"

export interface TextMarkSpec {
  name: string
  slot: string
  kind: string
  tag: string
  mode: "lines" | "box"
  over: boolean
  drawOn: "wipe" | "reveal"
  make: (props: Record<string, unknown>, children?: React.ReactNode) => React.ReactElement
  variants: Array<Record<string, unknown>>
}

export function describeTextMark(spec: TextMarkSpec): void {
  let restore: Array<() => void> = []
  afterEach(() => {
    restore.forEach((r) => r())
    restore = []
  })
  const lines = () => restore.push(mockLines(spec.slot, THREE_LINES))
  const expected = spec.mode === "lines" ? 3 : 1

  describe(`${spec.name} (shared text-mark behaviour)`, () => {
    it(`is a <${spec.tag}> with data-slot="${spec.slot}" and the words as plain text`, () => {
      lines()
      const { getByText } = render(spec.make({}, "the words"))
      const el = getByText("the words")
      expect(el.tagName.toLowerCase()).toBe(spec.tag)
      expect(el).toHaveAttribute("data-slot", spec.slot)
      expect(el.textContent).toBe("the words")
    })

    it(`draws ${expected} aria-hidden drawing${expected > 1 ? "s" : ""} as direct children of the host, ${spec.over ? "in front of" : "behind"} the words`, () => {
      lines()
      const { getByText, container } = render(spec.make({}, "a phrase that wraps"))
      const host = getByText("a phrase that wraps")
      expect(host).toHaveAttribute("data-ink-host")
      expect(host).toHaveAttribute("data-ink-ready")
      const svgs = inkSvgs(host)
      expect(svgs).toHaveLength(expected)
      for (const s of svgs) {
        expect(s).toHaveAttribute("aria-hidden", "true")
        expect(s).toHaveAttribute("focusable", "false")
        expect(s.getAttribute("data-ink")).toBe(spec.kind)
        expect(s.style.zIndex).toBe(spec.over ? "1" : "-1")
        expect(s.style.pointerEvents).toBe("none")
        expect(s.innerHTML).not.toMatch(/NaN|undefined|Infinity/)
      }
      expectInkLayers(container, { min: expected, kinds: [spec.kind], absolute: true, layers: ["rest"] })
      expect(container.querySelector("svg text")).toBeNull()
    })

    it("claims no ink host and draws nothing before it has a layout (the browser's own decoration is the fallback)", () => {
      const { getByText } = render(spec.make({}, "no layout"))
      const el = getByText("no layout")
      expect(inkSvgs(el)).toHaveLength(0)
      expect(el).not.toHaveAttribute("data-ink-host")
    })

    it("show=false removes the drawing, show=true brings it back", () => {
      lines()
      const { getByText, rerender } = render(spec.make({ show: false }, "toggled"))
      expect(inkSvgs(getByText("toggled"))).toHaveLength(0)
      expect(getByText("toggled")).toHaveAttribute("data-mark", "off")
      rerender(spec.make({ show: true }, "toggled"))
      expect(inkSvgs(getByText("toggled"))).toHaveLength(expected)
      expect(getByText("toggled")).toHaveAttribute("data-mark", "in")
    })

    it("the same seed draws the same mark, another seed another; variants change the drawing", () => {
      lines()
      const html = (props: Record<string, unknown>, seed: string) => {
        const { getByText, unmount } = render(spec.make({ ...props, seed }, `v${seed}${JSON.stringify(props).length}`))
        const out = inkSvgs(getByText(`v${seed}${JSON.stringify(props).length}`)).map((s) => s.innerHTML).join("")
        unmount()
        return out
      }
      expect(html({}, "a")).toBe(html({}, "a"))
      expect(html({}, "a")).not.toBe(html({}, "b"))
      for (const v of spec.variants) expect(html(v, "a")).not.toBe(html({}, "a"))
    })

    it("merges className after the defaults and forwards props and ref", () => {
      lines()
      const ref = React.createRef<HTMLElement>()
      const { getByText } = render(spec.make({ ref, className: "font-bold", id: "x" }, "props"))
      expect(getByText("props")).toHaveClass("relative", "isolate", "font-bold")
      expect(getByText("props")).toHaveAttribute("id", "x")
      expect(ref.current).toBe(getByText("props"))
    })

    it("asChild puts the drawing inside the child element", () => {
      lines()
      const { container } = render(spec.make({ asChild: true }, <a href="#x">linked</a>))
      const a = container.querySelector("a") as HTMLElement
      expect(a).toHaveAttribute("data-slot", spec.slot)
      expect(inkSvgs(a)).toHaveLength(expected)
    })

    describe("animate", () => {
      beforeEach(() => {
        restore.push(installIntersection())
        lines()
      })

      it("holds the drawing back until the host scrolls into view, then draws it on", () => {
        const { getByText } = render(spec.make({ animate: true }, "slow"))
        const el = getByText("slow")
        expect(el).toHaveAttribute("data-animate")
        expect(el).toHaveAttribute("data-mark", "idle")
        expect(el.className).toContain(spec.drawOn === "wipe" ? "clip-path" : "stroke-dasharray:1")
        act(() => fireIntersection(el))
        expect(el).toHaveAttribute("data-mark", "in")
        expect(el.className).toContain(spec.drawOn === "wipe" ? "animate-[ll-wipe" : "animate-[ll-draw")
      })

      it("staggers the lines and honours delay", () => {
        const { getByText } = render(spec.make({ animate: true, delay: 200 }, "stagger"))
        const delays = inkSvgs(getByText("stagger")).map((s) => s.style.getPropertyValue("--ll-draw-delay"))
        expect(delays).toEqual(["200ms", "580ms", "960ms"].slice(0, expected))
      })

      it("a mark that is already in view when it appears is drawn on at once", () => {
        const { getByText } = render(spec.make({ animate: true }, "visible"))
        const el = getByText("visible")
        act(() => fireIntersection(el))
        expect(inkSvgs(el)).toHaveLength(expected)
      })

      it("without animate there is no gate", () => {
        const { getByText } = render(spec.make({}, "plain"))
        expect(getByText("plain")).not.toHaveAttribute("data-animate")
        expect(getByText("plain")).toHaveAttribute("data-mark", "in")
      })
    })

    describe("in a page", () => {
      it("has no axe violations and adds nothing to the text", async () => {
        lines()
        const { container } = render(<p>Read {spec.make({}, "this part")} twice.</p>)
        expect(container.textContent).toBe("Read this part twice.")
        await axeCheck(container)
      })

      it("keeps drawing inside a calm InkProvider in a right-to-left page", () => {
        lines()
        const { getByText } = render(
          <div dir="rtl">
            <InkProvider density="calm">{spec.make({}, "calm")}</InkProvider>
          </div>,
        )
        expect(inkSvgs(getByText("calm"))).toHaveLength(expected)
      })

      it("renders the same on the server twice (no drawing without a layout) and hydrates without a warning", async () => {
        const ui = <p>{spec.make({}, "server")} text</p>
        const a = renderToString(ui)
        expect(a).toBe(renderToString(ui))
        expect(a).not.toContain("<svg")
        expect(a).toContain(`data-slot="${spec.slot}"`)
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
