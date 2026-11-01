import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { axeCheck, renderUI } from "./helpers"

describe("Label", () => {
  it("is a real <label> with upstream's slot and the hand font", () => {
    const { getByText } = render(<Label htmlFor="x">Email</Label>)
    const l = getByText("Email")
    expect(l.tagName).toBe("LABEL")
    expect(l).toHaveAttribute("data-slot", "label")
    expect(l).toHaveAttribute("for", "x")
    expect(l).toHaveClass("font-hand", "select-none", "flex", "items-center")
  })

  it("names its control and hands the click to it (htmlFor and nesting)", async () => {
    const { getByLabelText, getByText, user } = renderUI(
      <div>
        <Label htmlFor="a">Alpha</Label>
        <input id="a" />
        <Label>
          Beta
          <input />
        </Label>
      </div>,
    )
    await user.click(getByText("Alpha"))
    expect(getByLabelText("Alpha")).toHaveFocus()
    await user.click(getByText("Beta"))
    expect(getByLabelText("Beta")).toHaveFocus()
  })

  it("does not change focus or selection when text inside is double-clicked (Radix Label prevents text selection)", async () => {
    const { getByText, user } = renderUI(<Label htmlFor="q">Select me</Label>)
    const evt = new MouseEvent("mousedown", { bubbles: true, cancelable: true, detail: 2 })
    getByText("Select me").dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(true)
    await user.click(getByText("Select me"))
  })

  it("merges className after the defaults", () => {
    const { getByText } = render(<Label className="text-lg text-ink-you">Big</Label>)
    expect(getByText("Big")).toHaveClass("text-lg", "text-ink-you")
    expect(getByText("Big")).not.toHaveClass("text-[15px]", "text-foreground")
  })
})

describe("Label required", () => {
  it("draws a decorative red-pencil star after the text and leaves the accessible name alone", () => {
    const { getByLabelText, getByText } = render(
      <>
        <Label htmlFor="e" required>
          Email
        </Label>
        <Input id="e" required />
      </>,
    )
    const star = getByText("Email").querySelector("svg[data-slot=label-required]") as SVGElement
    expect(star).toBeTruthy()
    expect(star).toHaveAttribute("aria-hidden", "true")
    expect(star).toHaveAttribute("focusable", "false")
    expect(star).toHaveAttribute("data-ink", "icon")
    expect(star.getAttribute("class")).toContain("text-red")
    expect(star.innerHTML).toContain("currentColor")
    expect(getByLabelText("Email")).toBeRequired()
    expect(getByText("Email").textContent).toBe("Email")
  })

  it("is off by default", () => {
    const { getByText } = render(<Label>Plain</Label>)
    expect(getByText("Plain").querySelector("svg")).toBeNull()
  })

  it("seed pins the star's hand; different seeds draw it a little differently", () => {
    const star = (seed: string) => {
      const { getByText, unmount } = render(
        <Label required seed={seed}>
          L{seed}
        </Label>,
      )
      const html = getByText(`L${seed}`).querySelector("svg")?.innerHTML
      unmount()
      return html
    }
    expect(star("same")).toBe(star("same"))
    expect(star("same")).not.toBe(star("other"))
  })
})

describe("Label and its control's state", () => {
  it("dims with a disabled peer (checkbox, or a drawn Input frame marked peer) and inside a disabled group", () => {
    const { getByText } = render(
      <div>
        <Checkbox id="c" disabled />
        <Label htmlFor="c">Peer box</Label>
        <Input className="peer" id="i" disabled />
        <Label htmlFor="i">Peer input</Label>
        <div className="group" data-disabled="true">
          <Label>Grouped</Label>
        </div>
      </div>,
    )
    expect(getByText("Peer box")).toHaveClass("peer-disabled:text-pencil-text", "peer-disabled:cursor-not-allowed")
    expect(getByText("Peer input")).toHaveClass("peer-has-[>input:disabled]:text-pencil-text", "peer-has-[>textarea:disabled]:text-pencil-text")
    expect(getByText("Peer input").previousElementSibling).toHaveClass("peer")
    expect(getByText("Grouped")).toHaveClass("group-data-[disabled=true]:pointer-events-none", "group-data-[disabled=true]:text-pencil-text")
  })

  it("has no axe violations, with or without the star", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="a1" required>
          One
        </Label>
        <Input id="a1" required />
        <Label htmlFor="a2">Two</Label>
        <Input id="a2" />
      </div>,
    )
    await axeCheck(container)
  })
})

describe("Label on the server and hydration", () => {
  it("renders the star on the server, deterministically", () => {
    const tree = () => (
      <Label htmlFor="s" required>
        Name
      </Label>
    )
    const html = renderToString(tree())
    expect(html).toContain('data-slot="label-required"')
    expect(html).not.toMatch(/NaN|undefined/)
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings", () => {
    const ui = (
      <Label htmlFor="h" required>
        Hydrated
      </Label>
    )
    const container = document.createElement("div")
    document.body.appendChild(container)
    container.innerHTML = renderToString(ui)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined
    act(() => {
      root = hydrateRoot(container, ui)
    })
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
    act(() => root?.unmount())
    container.remove()
  })
})
