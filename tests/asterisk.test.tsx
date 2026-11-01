import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Asterisk, type AsteriskMark } from "@/components/ui/asterisk"
import { axeCheck } from "./helpers"

describe("Asterisk", () => {
  it("is decorative by default: an aria-hidden glyph drawn as intrinsic art in red pencil", () => {
    const { container } = render(<p>Free shipping<Asterisk data-testid="a" /></p>)
    const host = container.querySelector("[data-slot=asterisk]") as HTMLElement
    expect(host).toHaveAttribute("data-mark", "asterisk")
    const svg = host.querySelector("svg") as SVGElement
    expect(svg).toHaveAttribute("data-ink", "icon")
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg.getAttribute("class")).toContain("text-red")
    expect(svg.innerHTML).toContain("currentColor")
    expect(host.querySelector("[aria-hidden=true]")).toBeTruthy()
    expect(container.textContent).toBe("Free shipping")
  })

  it("draws four different marks, and another seed draws the same mark a little differently", () => {
    const html = (mark: AsteriskMark, seed = "s") => {
      const { container, unmount } = render(<Asterisk mark={mark} seed={seed} />)
      const out = container.querySelector("svg")!.innerHTML
      unmount()
      return out
    }
    const all = (["asterisk", "star", "dagger", "double-dagger"] as const).map((m) => html(m))
    expect(new Set(all).size).toBe(4)
    expect(html("asterisk", "a")).toBe(html("asterisk", "a"))
    expect(html("asterisk", "a")).not.toBe(html("asterisk", "b"))
  })

  it("text inside comes first and the mark follows it", () => {
    const { container } = render(<Asterisk>fine print</Asterisk>)
    expect(container.textContent).toBe("fine print")
    expect(container.querySelector("[data-slot=asterisk]")!.firstChild!.textContent).toBe("fine print")
  })

  it("with a label it is announced as an image; with href it is a link to the footnote", () => {
    const named = render(<Asterisk label="footnote 1" />)
    expect(named.getByRole("img", { name: "footnote 1" })).toBeInTheDocument()
    named.unmount()
    const link = render(<Asterisk label="footnote 1" href="#fn1" />)
    const a = link.getByRole("link", { name: "footnote 1" })
    expect(a).toHaveAttribute("href", "#fn1")
    expect(a.querySelector("svg")).toBeTruthy()
  })

  it("tone picks the pen colour class; className merges", () => {
    const { container } = render(<Asterisk tone="blue" className="ms-1" />)
    expect(container.querySelector("svg")!.getAttribute("class")).toContain("text-ink-you")
    expect(container.querySelector("[data-slot=asterisk]")).toHaveClass("ms-1")
  })

  it("has no axe violations in any form", async () => {
    const { container } = render(
      <div>
        <p>
          One<Asterisk /> two<Asterisk label="footnote 2" /> three<Asterisk label="footnote 3" href="#n3" />
        </p>
      </div>,
    )
    await axeCheck(container)
  })

  it("is identical on the server twice and hydrates without a warning", async () => {
    const ui = <p>Price<Asterisk mark="dagger" seed="s" /></p>
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
