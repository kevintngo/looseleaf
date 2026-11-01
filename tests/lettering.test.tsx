import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Lettering } from "@/components/ui/lettering"
import { axeCheck } from "./helpers"

describe("Lettering", () => {
  it("is a heading in the script font with the riso offset and real text", () => {
    const { getByRole } = render(<Lettering>Hello, paper</Lettering>)
    const h = getByRole("heading", { level: 2, name: "Hello, paper" })
    expect(h).toHaveAttribute("data-slot", "lettering")
    expect(h).toHaveClass("ll-riso", "font-script", "text-6xl")
    expect(h.textContent).toBe("Hello, paper")
  })

  it("any element, any size, any second colour", () => {
    const { getByTestId } = render(
      <>
        <Lettering as="h1" size="hero" tone="teal" data-testid="a">One</Lettering>
        <Lettering as="p" size="sm" tone="grape" data-testid="b">Two</Lettering>
      </>,
    )
    expect(getByTestId("a").tagName).toBe("H1")
    expect(getByTestId("a")).toHaveClass("[--ll-riso:var(--ll-teal)]")
    expect(getByTestId("a")).toHaveAttribute("data-size", "hero")
    expect(getByTestId("b").tagName).toBe("P")
    expect(getByTestId("b")).toHaveClass("text-3xl", "[--ll-riso:var(--ll-grape)]")
  })

  it("duotone adds a third pass in another accent through a token", () => {
    const { getByTestId } = render(<Lettering data-testid="d" duotone="sky">Two colours</Lettering>)
    expect(getByTestId("d").style.getPropertyValue("--ll-riso-b")).toBe("var(--ll-sky)")
    expect(getByTestId("d").className).toContain("var(--ll-riso-b)")
  })

  it("wobble writes each word a hair off the baseline; 0 leaves the text typeset", () => {
    const plain = render(<Lettering data-testid="p">three little words</Lettering>)
    expect(plain.getByTestId("p").querySelectorAll(".ll-w")).toHaveLength(0)
    plain.unmount()
    const w = render(<Lettering data-testid="w" wobble={1.4} seed="k">three little words</Lettering>)
    expect(w.getByTestId("w").querySelectorAll(".ll-w")).toHaveLength(3)
    expect(w.getByTestId("w").textContent).toBe("three little words")
  })

  it("uses no gradient or filter", () => {
    const { getByTestId } = render(<Lettering data-testid="g" duotone="lemon">x</Lettering>)
    expect(getByTestId("g").className).not.toMatch(/gradient|filter|blur/)
  })

  it("has no axe violations and merges className", async () => {
    const { container, getByTestId } = render(<Lettering data-testid="c" className="text-center">Accessible</Lettering>)
    expect(getByTestId("c")).toHaveClass("text-center", "ll-riso")
    await axeCheck(container)
  })

  it("is identical on the server twice and hydrates without a warning", async () => {
    const ui = <Lettering wobble={1} seed="s">Server title</Lettering>
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
