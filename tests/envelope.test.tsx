import * as React from "react"
import { fireEvent, render, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Envelope, EnvelopeAddress, EnvelopeFront, EnvelopeLetter, EnvelopeSender, EnvelopeTrigger } from "@/components/ui/envelope"
import { FLAP, envelopeBackRecipe, envelopeFrontRecipe, perfRectD, stampBox, type EnvelopeFrontParams } from "@/lib/ink/recipes/envelope-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(400, 250)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Mail(props: React.ComponentProps<typeof Envelope>) {
  return (
    <Envelope {...props}>
      <EnvelopeLetter>
        <p>Dear Ada, the flap is up.</p>
      </EnvelopeLetter>
      <EnvelopeFront>
        <EnvelopeSender>The Stationer</EnvelopeSender>
        <EnvelopeAddress>
          <p>Ada Lovelace</p>
          <p>Paris</p>
        </EnvelopeAddress>
        <EnvelopeTrigger />
      </EnvelopeFront>
    </Envelope>
  )
}

describe("Envelope", () => {
  it("renders its parts with their data-slots; the letter is not in the page while it is closed", () => {
    const { container, queryByText } = render(<Mail />)
    for (const slot of ["envelope", "envelope-body", "envelope-front", "envelope-trigger", "envelope-address", "envelope-sender"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    expect(container.querySelector('[data-slot="envelope"]')).toHaveAttribute("data-state", "closed")
    expect(queryByText("Dear Ada, the flap is up.")).toBeNull()
    expect(container.querySelector('[data-slot="envelope-body"]')).toHaveClass("aspect-[8/5]", "relative", "isolate")
  })

  it("draws two pieces of ink: the back panel (a sheet, with the flap) and the front panel, each on its own host", () => {
    const { container } = render(<Mail seed="e" />)
    const body = container.querySelector('[data-slot="envelope-body"]') as HTMLElement
    const front = container.querySelector('[data-slot="envelope-front"]') as HTMLElement
    const backs = Array.from(body.querySelectorAll(":scope > svg[data-ink='sheet']"))
    const fsvg = front.querySelector(":scope > svg[data-ink='envelope']")!
    expect(backs.length).toBeGreaterThan(0)
    expect(fsvg).not.toBeNull()
    expect(body).toHaveAttribute("data-ink-ready")
    expect(front).toHaveAttribute("data-ink-ready")
    const layersOf = (root: Element, sel: string) => [...new Set(Array.from(root.querySelectorAll(sel)).map((g) => g.getAttribute("data-layer")))]
    expect(layersOf(body, ":scope > svg[data-ink='sheet'] > g[data-layer]")).toEqual(["rest", "open", "hover"])
    expect(Array.from(body.querySelectorAll(":scope > [data-slot='paper-face']")).map((f) => f.getAttribute("data-layer"))).toEqual([null, "open", "hover"])
    expect(front.querySelectorAll(":scope > [data-slot='paper-face']")).toHaveLength(1)
    expect(body.querySelectorAll(":scope > [data-slot='paper-shadow']")).toHaveLength(1)
    expect(front.querySelector("[data-slot='paper-shadow']")).toBeNull()
    expect(container.querySelectorAll("svg pattern, svg image, svg mask, svg filter")).toHaveLength(0)
    expect(front.className).toContain("[&>svg]:[rotate:clamp(")
    expectInkLayers(container, { min: 2, kinds: ["sheet", "envelope"], absolute: true })
    expect(body.className).not.toContain("bg-card")
  })

  it("opens with the trigger: aria-expanded, the letter shown, the state on every host", async () => {
    const { user, container, getByRole, getByText, queryByText } = renderUI(<Mail seed="o" />)
    const trigger = getByRole("button", { name: "Open the letter" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    const letter = getByText("Dear Ada, the flap is up.").closest("[data-slot=envelope-letter]") as HTMLElement
    expect(trigger).toHaveAttribute("aria-controls", letter.id)
    expect(letter).toBeVisible()
    expect(letter).toHaveAttribute("data-state", "open")
    expect(container.querySelector('[data-slot="envelope"]')).toHaveAttribute("data-state", "open")
    expect(container.querySelector('[data-slot="envelope-body"]')).toHaveAttribute("data-state", "open")
    await user.click(trigger)
    expect(queryByText("Dear Ada, the flap is up.")).toBeNull()
  })

  it("Space and Enter open it, and the trigger has a sensible name you can change", async () => {
    const { user, getByRole } = renderUI(
      <Envelope>
        <EnvelopeLetter>hello</EnvelopeLetter>
        <EnvelopeFront>
          <EnvelopeTrigger>Read the letter from Ada</EnvelopeTrigger>
        </EnvelopeFront>
      </Envelope>,
    )
    const t = getByRole("button", { name: "Read the letter from Ada" })
    t.focus()
    await user.keyboard(" ")
    expect(t).toHaveAttribute("aria-expanded", "true")
    await user.keyboard("{Enter}")
    expect(t).toHaveAttribute("aria-expanded", "false")
  })

  it("controlled and uncontrolled", async () => {
    const onOpenChange = vi.fn()
    const { user, getByRole, rerender } = renderUI(<Mail open={false} onOpenChange={onOpenChange} />)
    const t = getByRole("button", { name: "Open the letter" })
    await user.click(t)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(t).toHaveAttribute("aria-expanded", "false")
    rerender(<Mail open onOpenChange={onOpenChange} />)
    expect(t).toHaveAttribute("aria-expanded", "true")
    const u = render(<Mail defaultOpen />)
    expect(within(u.container).getByText("Dear Ada, the flap is up.")).toBeVisible()
    u.unmount()
  })

  it("openOnHover opens with a mouse and closes when it leaves, unless it was clicked", async () => {
    const { user, getByRole, container, getByText, queryByText } = renderUI(<Mail openOnHover />)
    const body = container.querySelector('[data-slot="envelope-body"]') as HTMLElement
    fireEvent.pointerEnter(body, { pointerType: "mouse" })
    expect(getByText("Dear Ada, the flap is up.")).toBeVisible()
    fireEvent.pointerLeave(body, { pointerType: "mouse" })
    expect(queryByText("Dear Ada, the flap is up.")).toBeNull()
    fireEvent.pointerEnter(body, { pointerType: "touch" })
    expect(queryByText("Dear Ada, the flap is up.")).toBeNull()
    fireEvent.pointerEnter(body, { pointerType: "mouse" })
    const t = getByRole("button", { name: "Open the letter" })
    await user.click(t)
    expect(t).toHaveAttribute("aria-expanded", "true")
    fireEvent.pointerLeave(body, { pointerType: "mouse" })
    expect(getByText("Dear Ada, the flap is up.")).toBeVisible()
    await user.click(t)
    expect(queryByText("Dear Ada, the flap is up.")).toBeNull()
  })

  it("focus order: with the front first in the source, Tab from the trigger reaches a link in the letter it opened", async () => {
    const { user, getByRole } = renderUI(
      <Envelope defaultOpen>
        <EnvelopeFront>
          <EnvelopeAddress>Ada</EnvelopeAddress>
          <EnvelopeTrigger>Read the letter</EnvelopeTrigger>
        </EnvelopeFront>
        <EnvelopeLetter>
          <a href="#more">read more</a>
        </EnvelopeLetter>
      </Envelope>,
    )
    getByRole("button", { name: "Read the letter" }).focus()
    await user.tab()
    expect(document.activeElement).toBe(getByRole("link", { name: "read more" }))
  })

  it("disabled seals it: the trigger is disabled and a hovering mouse opens nothing", async () => {
    const { user, container, getByRole, queryByText } = renderUI(<Mail disabled openOnHover />)
    const t = getByRole("button", { name: "Open the letter" })
    expect(t).toBeDisabled()
    expect(container.querySelector('[data-slot="envelope-body"]')).toHaveAttribute("data-disabled")
    fireEvent.pointerEnter(container.querySelector('[data-slot="envelope-body"]')!, { pointerType: "mouse" })
    expect(queryByText("Dear Ada, the flap is up.")).toBeNull()
    await user.click(t)
    expect(t).toHaveAttribute("aria-expanded", "false")
  })

  it("a letter that holds keyboard focus stays open when the mouse that opened it leaves", () => {
    const { container, getByRole } = renderUI(
      <Envelope openOnHover>
        <EnvelopeFront>
          <EnvelopeTrigger />
        </EnvelopeFront>
        <EnvelopeLetter>
          <a href="#more">read more</a>
        </EnvelopeLetter>
      </Envelope>,
    )
    const body = container.querySelector('[data-slot="envelope-body"]') as HTMLElement
    fireEvent.pointerEnter(body, { pointerType: "mouse" })
    getByRole("link", { name: "read more" }).focus()
    fireEvent.pointerLeave(body, { pointerType: "mouse" })
    expect(getByRole("link", { name: "read more" })).toBeVisible()
    expect(document.activeElement).toBe(getByRole("link", { name: "read more" }))
  })

  it("makes room above itself for the flap and the letter when it is open, by container width", () => {
    const { container } = render(<Mail />)
    const spacer = container.querySelector('[data-slot="envelope"] > div[aria-hidden="true"]') as HTMLElement
    expect(spacer.className).toContain("group-data-[state=open]/env:h-[31cqw]")
    expect(container.querySelector('[data-slot="envelope"]')).toHaveClass("@container", "group/env")
  })

  it("stock, stamp, postmark and airmail reach the front drawing", () => {
    const html = (p: Partial<React.ComponentProps<typeof Envelope>>) => {
      const { container, unmount } = render(<Mail seed="f" {...p} />)
      const out = container.querySelector("[data-slot='envelope-front']")!.innerHTML
      unmount()
      return out
    }
    const base = html({})
    expect(html({ stamp: false })).not.toBe(base)
    expect(html({ stamp: "sky" })).not.toBe(base)
    expect(html({ airmail: true })).not.toBe(base)
    expect(html({ postmark: false })).not.toBe(base)
    expect(html({ stock: "paper" })).not.toBe(base)
  })

  it("passes className, style, ref and props to the outer element", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByTestId } = render(<Mail ref={ref} className="max-w-md" style={{ marginTop: 3 }} data-testid="e" />)
    expect(getByTestId("e")).toHaveClass("max-w-md", "w-full")
    expect(getByTestId("e").style.marginTop).toBe("3px")
    expect(ref.current).toBe(getByTestId("e"))
  })

  it("has no axe violations, closed and open", async () => {
    const { user, getByRole, container } = renderUI(<Mail seed="a11y" />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Open the letter" }))
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Mail size={[400, 250]} seed="s" />)
    expectHydrates(<Mail seed="h" defaultOpen />, "svg[data-ink='envelope']", [400, 250])
  })
})

describe("envelope recipes", () => {
  const f: EnvelopeFrontParams = { stock: "kraft", stamp: "tomato", postmark: true, airmail: false }

  it("the back panel has the sliver on hover and the flap when open; the pad covers the standing flap", () => {
    const r = run(envelopeBackRecipe, { stock: "kraft" }, 400, 250)
    expect(r.layers).toEqual(["rest", "open", "hover"])
    expect(r.pad).toBeGreaterThanOrEqual(250 * FLAP)
    expect(r.parts.open!.length).toBeGreaterThan(r.parts.hover!.length * 0.5)
    expect(r.parts.open).not.toBe(r.parts.hover)
  })

  it("is deterministic per seed and clean at every size, density, tier, stock and option", () => {
    const a = run(envelopeFrontRecipe, f, 400, 250).parts.rest!
    expect(a).toBe(run(envelopeFrontRecipe, f, 400, 250).parts.rest)
    expect(a).not.toBe(run(envelopeFrontRecipe, f, 400, 250, { seed: "z" }).parts.rest)
    for (const [w, h] of [[80, 50], [240, 150], [400, 250], [800, 500]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [f, { ...f, stamp: "none" as const, postmark: false }, { ...f, airmail: true, stock: "paper" as const }]) {
            expectClean(run(envelopeFrontRecipe, params, w, h, { density, tier }).parts.rest!)
          }
          const b = run(envelopeBackRecipe, { stock: "kraft" }, w, h, { density, tier })
          expectClean(Object.values(b.parts).join(""))
        }
      }
    }
  })

  it("mirrors the stamp and postmark for right-to-left pages", () => {
    expect(run(envelopeFrontRecipe, f, 400, 250, { dir: "rtl" }).parts.rest).toContain("scale(-1 1)")
    expect(run(envelopeFrontRecipe, f, 400, 250).parts.rest).not.toContain("scale(-1 1)")
  })

  it("the postmark's cancellation waves stop on the paper at every width (a 296 px sheet ran 4 px off its edge onto the desk)", () => {
    const waveEnd = (svg: string) => {
      let max = 0
      for (const m of svg.matchAll(/d="((?:M[\d.]+ -?[\d.]+(?:q4 -?3 8 0)+)+)"/g)) {
        for (const sub of m[1].matchAll(/M([\d.]+) -?[\d.]+((?:q4 -?3 8 0)+)/g)) max = Math.max(max, parseFloat(sub[1]) + 8 * sub[2].match(/q/g)!.length)
      }
      return max
    }
    for (const w of [120, 200, 240, 296, 320, 400, 640, 800]) {
      const end = waveEnd(run(envelopeFrontRecipe, f, w, w * 0.625).parts.rest!)
      expect(end, `w=${w}`).toBeGreaterThan(0)
      expect(end, `w=${w}`).toBeLessThanOrEqual(w - 3)
    }
  })

  it("perforates the stamp: bites all round, inside its box", () => {
    const d = perfRectD(10, 10, 42, 52, 2.1, 7)
    expect(d.match(/a/g)!.length).toBeGreaterThanOrEqual(2 * (Math.round(42 / 7) + Math.round(52 / 7)))
    expect(d).not.toMatch(/NaN/)
    const b = stampBox(400)
    expect(b.x + b.sw).toBeLessThan(400)
    expect(b.sh).toBeGreaterThan(b.sw)
  })

  it("stays a moderate drawing: the front is paper, seams, a stamp and a postmark", () => {
    const front = run(envelopeFrontRecipe, f, 400, 250).parts.rest!
    expect(nodes(front)).toBeLessThan(80)
    expect(front.length).toBeLessThan(12000)
    const air = run(envelopeFrontRecipe, { ...f, airmail: true }, 400, 250).parts.rest!
    expect(air.length).toBeLessThan(16000)
  })
})
