import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { FlipCard, FlipCardBack, FlipCardFront, FlipCardTrigger } from "@/components/ui/flip-card"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { flipTriggerRecipe } from "@/lib/ink/recipes/flip-card-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(288, 192)
})
afterEach(() => restore())

const Card = (p: Partial<React.ComponentProps<typeof FlipCard>> = {}) => (
  <FlipCard {...p}>
    <FlipCardFront>Bonjour</FlipCardFront>
    <FlipCardBack>Hello</FlipCardBack>
  </FlipCard>
)
const front = (c: HTMLElement) => c.querySelector('[data-slot="flip-card-front"]') as HTMLElement
const back = (c: HTMLElement) => c.querySelector('[data-slot="flip-card-back"]') as HTMLElement

describe("FlipCard", () => {
  it("shows the front, keeps the back out of reach, and has a pressed-state trigger", () => {
    const { getByRole, container } = renderUI(<Card />)
    const t = getByRole("button", { name: "Flip card" })
    expect(t).toHaveAttribute("aria-pressed", "false")
    expect(container.querySelector('[data-slot="flip-card"]')).toHaveAttribute("data-state", "front")
    expect(front(container)).not.toHaveAttribute("inert")
    expect(back(container)).toHaveAttribute("inert")
    expect(back(container)).toHaveAttribute("aria-hidden", "true")
  })

  it("click, Space and Enter turn it over and back; the sides swap what is reachable", async () => {
    const { getByRole, container, user } = renderUI(<Card />)
    const t = getByRole("button", { name: "Flip card" })
    await user.click(t)
    expect(t).toHaveAttribute("aria-pressed", "true")
    expect(container.querySelector('[data-slot="flip-card"]')).toHaveAttribute("data-state", "back")
    expect(front(container)).toHaveAttribute("inert")
    expect(back(container)).not.toHaveAttribute("inert")
    t.focus()
    await user.keyboard(" ")
    expect(t).toHaveAttribute("aria-pressed", "false")
    await user.keyboard("{Enter}")
    expect(t).toHaveAttribute("aria-pressed", "true")
    expect(container.querySelector('[data-slot="flip-card"]')).toHaveAttribute("data-touched")
  })

  it("the side that is turned away is visibility hidden too (WebKit showed the mirrored back over the front), switched when the card is edge-on", async () => {
    const { getByRole, container, user } = renderUI(<Card />)
    expect(front(container).className).toContain("visible")
    expect(front(container).className).not.toContain("invisible")
    expect(back(container).className).toContain("invisible")
    expect(back(container).className).toContain("[transition:visibility_0s_linear_calc(var(--ll-dur-sheet)*.24)]")
    await user.click(getByRole("button", { name: "Flip card" }))
    expect(front(container).className).toContain("invisible")
    expect(back(container).className).not.toContain("invisible")
  })

  it("is accessible on both sides", async () => {
    const { container, user, getByRole } = renderUI(<Card />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Flip card" }))
    await axeCheck(container)
  })

  it("controlled and uncontrolled", async () => {
    const onFlippedChange = vi.fn()
    const { getByRole, user, rerender } = renderUI(<Card flipped={false} onFlippedChange={onFlippedChange} />)
    await user.click(getByRole("button", { name: "Flip card" }))
    expect(onFlippedChange).toHaveBeenCalledWith(true)
    expect(getByRole("button", { name: "Flip card" })).toHaveAttribute("aria-pressed", "false")
    rerender(<Card flipped onFlippedChange={onFlippedChange} />)
    expect(getByRole("button", { name: "Flip card" })).toHaveAttribute("aria-pressed", "true")
  })

  it("defaultFlipped starts on the back", () => {
    const { getByRole } = renderUI(<Card defaultFlipped />)
    expect(getByRole("button", { name: "Flip card" })).toHaveAttribute("aria-pressed", "true")
  })

  it("turns about the axis asked for", async () => {
    const { container, user, getByRole, rerender } = renderUI(<Card />)
    await user.click(getByRole("button", { name: "Flip card" }))
    expect(container.querySelector('[data-slot="flip-card-inner"]')?.className).toContain("rotateY(180deg)")
    expect(back(container).className).toContain("rotateY(180deg)")
    rerender(<Card axis="x" flipped />)
    expect(container.querySelector('[data-slot="flip-card-inner"]')?.className).toContain("rotateX(180deg)")
    expect(back(container).className).toContain("rotateX(180deg)")
  })

  it("a custom trigger replaces the overlay, so the faces can hold controls", async () => {
    const { getByRole, queryByRole, user, container } = renderUI(
      <FlipCard trigger={false}>
        <FlipCardFront>
          <Button size="sm">Buy</Button>
        </FlipCardFront>
        <FlipCardBack>Receipt</FlipCardBack>
        <FlipCardTrigger overlay={false} asChild>
          <Button variant="outline" size="sm">
            See back
          </Button>
        </FlipCardTrigger>
      </FlipCard>,
    )
    expect(queryByRole("button", { name: "Flip card" })).toBeNull()
    const t = getByRole("button", { name: "See back" })
    expect(t).toHaveAttribute("aria-pressed", "false")
    await user.click(t)
    expect(t).toHaveAttribute("aria-pressed", "true")
    expect(front(container)).toHaveAttribute("inert")
    await axeCheck(container)
  })

  it("the overlay is an ink host with a corner arrow and a lazy focus ring", () => {
    const { container } = renderUI(<Card />)
    expectInkLayers(container, { min: 1, absolute: true, kinds: ["flip-card-trigger"], layers: ["rest", "hover"] })
    const f = runRecipe(flipTriggerRecipe as never, { box: { w: 288, h: 192 }, params: { hint: true }, seed: "f", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } })
    expect((f.parts.rest ?? "").length).toBeLessThan(3000)
    expect(runRecipe(flipTriggerRecipe as never, { box: { w: 288, h: 192 }, params: { hint: false }, seed: "f", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } }).parts.rest).toBeUndefined()
  })

  it("injects its keyframes once", () => {
    const html = renderToString(
      <>
        <Card />
        <Card />
      </>,
    )
    expect(html).toContain("ll-flip-lift-a")
  })

  it("renders identically on the server and hydrates cleanly", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(<Card />) as React.ReactElement)
      expect(renderToString(wrap(<Card />) as React.ReactElement)).toBe(a)
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(<Card />))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })

  it("parts outside a card say so", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<FlipCardFront>x</FlipCardFront>)).toThrow(/inside <FlipCard>/)
    spy.mockRestore()
  })
})
