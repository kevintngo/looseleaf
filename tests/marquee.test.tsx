import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Marquee, MarqueeControl, MarqueeItem } from "@/components/ui/marquee"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { marqueeBandRecipe, marqueeControlRecipe } from "@/lib/ink/recipes/marquee-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(400, 44)
})
afterEach(() => restore())

const Ticker = (p: Partial<React.ComponentProps<typeof Marquee>> = {}) => (
  <Marquee {...p}>
    <MarqueeItem>Fresh bread at seven</MarqueeItem>
    <MarqueeItem>Open late on Fridays</MarqueeItem>
  </Marquee>
)
const root = (c: HTMLElement) => c.querySelector('[data-slot="marquee"]') as HTMLElement
const groups = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('[data-slot="marquee-group"]'))

describe("Marquee", () => {
  it("is a named ticker: one readable copy of the text, the rest hidden and inert", () => {
    const { container, getByRole } = renderUI(<Ticker />)
    expect(getByRole("marquee", { name: "Ticker" })).toBeInTheDocument()
    const g = groups(container)
    expect(g.length).toBeGreaterThanOrEqual(2)
    expect(g[0]).not.toHaveAttribute("aria-hidden")
    expect(g[0]).toHaveTextContent("Fresh bread at seven")
    for (const copy of g.slice(1)) {
      expect(copy).toHaveAttribute("aria-hidden", "true")
      expect(copy).toHaveAttribute("inert")
      expect(copy).toHaveAttribute("data-copy")
    }
  })

  it("is accessible", async () => {
    const { container } = renderUI(<Ticker />)
    await axeCheck(container)
  })

  it("has a pause button that stops and starts it", async () => {
    const onPausedChange = vi.fn()
    const { container, getByRole, user } = renderUI(<Ticker onPausedChange={onPausedChange} />)
    const b = getByRole("button", { name: "Pause ticker" })
    expect(b).toHaveAttribute("aria-pressed", "false")
    expect(root(container)).not.toHaveAttribute("data-paused")
    await user.click(b)
    expect(b).toHaveAttribute("aria-pressed", "true")
    expect(root(container)).toHaveAttribute("data-paused")
    expect(onPausedChange).toHaveBeenLastCalledWith(true)
    b.focus()
    await user.keyboard(" ")
    expect(b).toHaveAttribute("aria-pressed", "false")
  })

  it("controlled and default pause; controls can be left out or placed", () => {
    const { container, rerender, queryByRole } = renderUI(<Ticker paused />)
    expect(root(container)).toHaveAttribute("data-paused")
    rerender(<Ticker paused={false} />)
    expect(root(container)).not.toHaveAttribute("data-paused")
    rerender(<Ticker defaultPaused controls={false} />)
    expect(queryByRole("button")).toBeNull()
  })

  it("a control can be composed by hand, but only inside a ticker", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<MarqueeControl />)).toThrow(/inside <Marquee>/)
    spy.mockRestore()
  })

  it("sizes itself to the text: enough copies to fill the band, a duration from the speed", () => {
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth")
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get(this: HTMLElement) {
        const slot = this.getAttribute("data-slot")
        return slot === "marquee-viewport" ? 900 : slot === "marquee-group" ? 300 : 400
      },
    })
    try {
      const { container } = renderUI(<Ticker speed={50} />)
      expect(groups(container)).toHaveLength(4)
      expect(root(container).style.getPropertyValue("--ll-marquee-shift")).toBe("-25%")
      expect(root(container).style.getPropertyValue("--ll-marquee-dur")).toBe("6.00s")
    } finally {
      if (desc) Object.defineProperty(HTMLElement.prototype, "offsetWidth", desc)
    }
  })

  it("never runs faster than a readable pace for a short text", () => {
    const { container } = renderUI(<Ticker speed={5000} />)
    expect(Number.parseFloat(root(container).style.getPropertyValue("--ll-marquee-dur"))).toBeGreaterThanOrEqual(4)
  })

  it("direction=end runs it the other way", () => {
    const { container } = renderUI(<Ticker direction="end" />)
    expect(root(container)).toHaveAttribute("data-direction", "reverse")
  })

  it("carries its keyframes, its pause rules and its reduced-motion rules", () => {
    const html = renderToString(<Ticker />)
    expect(html).toContain("@keyframes ll-marquee{")
    expect(html).toContain("animation-play-state:paused")
    expect(html).toContain("prefers-reduced-motion:reduce")
    expect(html).toContain("[data-motion=reduced]")
    expect(html).toContain("ll-marquee-rtl")
  })

  it("the band is a strip of tape, the control a small ringed button, both on ink hosts", () => {
    const { container } = renderUI(<Ticker tape="washi-dots" color="sky" />)
    expectInkLayers(container, { min: 2, kinds: ["marquee-band", "marquee-control", "doodle"] })
    expect(root(container).querySelector(":scope > svg[data-ink='marquee-band']")?.innerHTML).toContain("var(--ll-sky)")
  })

  it("renders identically on the server and hydrates cleanly", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(<Ticker />) as React.ReactElement)
      expect(renderToString(wrap(<Ticker />) as React.ReactElement)).toBe(a)
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(<Ticker />))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })

  it("MarqueeItem without a separator", () => {
    const { container } = renderUI(
      <Marquee controls={false}>
        <MarqueeItem separator={false}>plain</MarqueeItem>
      </Marquee>,
    )
    expect(container.querySelector('[data-slot="marquee-item"] svg')).toBeNull()
    fireEvent.mouseEnter(root(container))
  })
})

describe("marquee reduced-motion strip", () => {
  it("centers the still strip with `safe center`, so a row wider than the tape starts at the reading edge instead of being cropped on both sides", () => {
    const { container } = renderUI(<Ticker />)
    const css = Array.from(container.ownerDocument.querySelectorAll("style")).map((n) => n.textContent ?? "").join("\n")
    expect(css).toContain("justify-content:center;justify-content:safe center")
  })
})

describe("marquee drawing", () => {
  const run = (recipe: unknown, params: object, box: { w: number; h: number }) =>
    runRecipe(recipe as Parameters<typeof runRecipe>[0], { box, params, seed: "m", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } })

  it("clips the sideways bleed of its drawing (a strip that runs to the window edge must not make the page scroll), and only that axis", () => {
    const { container } = renderUI(<Ticker />)
    const cls = root(container).className
    expect(cls).toMatch(/(^|\s)overflow-x-clip(\s|$)/)
    expect(cls).not.toMatch(/(^|\s)overflow-(hidden|auto|scroll)(\s|$)/)
    expect(cls).not.toMatch(/(^|\s)overflow-y-/)
  })

  it("the band is a tape as long as the box, in any kind", () => {
    for (const kind of ["masking", "washi-dots", "washi-stripes", "washi-zigzag", "washi-gingham", "kraft", "clear"]) {
      const f = run(marqueeBandRecipe, { kind }, { w: 600, h: 44 })
      expect(f.parts.rest ?? "").not.toMatch(/NaN|undefined/)
      expect((f.parts.rest ?? "").length).toBeLessThan(20000)
    }
  })

  it("the control draws bars while running and a triangle while paused", () => {
    const running = run(marqueeControlRecipe, { paused: false }, { w: 28, h: 28 }).parts.rest ?? ""
    const paused = run(marqueeControlRecipe, { paused: true }, { w: 28, h: 28 }).parts.rest ?? ""
    expect(running).not.toBe(paused)
    expect(running.length).toBeLessThan(5000)
  })
})
