import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { StampButton, StampSurface, useStampSurface, type StampImpression } from "@/components/ui/stamp-button"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { STAMP_KNOB, stampButtonRecipe } from "@/lib/ink/recipes/stamp-button-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(140, STAMP_KNOB + 38)
})
afterEach(() => restore())

const Doc = (p: Partial<React.ComponentProps<typeof StampSurface>> = {}) => (
  <StampSurface className="h-64 w-96" {...p}>
    <p>Invoice 2026-031</p>
    <StampButton stamp="stamp-approved">Approve</StampButton>
    <StampButton stamp="stamp-void" place={{ x: 0.3, y: 0.3 }}>
      Void
    </StampButton>
  </StampSurface>
)

const impressions = (c: HTMLElement) => [...c.querySelectorAll('[data-slot="stamp-impression"]')] as SVGElement[]

describe("StampButton", () => {
  it("is a button named by its label, in the colour of its ink", () => {
    const { getByRole } = renderUI(<Doc />)
    const b = getByRole("button", { name: "Approve" })
    expect(b).toHaveAttribute("data-slot", "stamp-button")
    expect(b).toHaveAttribute("data-ink-tone", "green")
    expect(getByRole("button", { name: "Void" })).toHaveAttribute("data-ink-tone", "red")
    expect(b).toHaveAttribute("type", "button")
  })

  it("the label defaults to the stamp's own word", () => {
    const { getByRole } = renderUI(
      <StampSurface>
        <StampButton stamp="stamp-paid" />
        <StampButton text="reviewed" ink="ink-you" />
      </StampSurface>
    )
    expect(getByRole("button", { name: "Paid" })).toBeInTheDocument()
    expect(getByRole("button", { name: "Reviewed" })).toHaveAttribute("data-ink-tone", "ink-you")
  })

  it("draws the tool as an ink host with a lazy ring", () => {
    const { container } = renderUI(<Doc />)
    expectInkLayers(container, { kinds: ["stamp-tool", "stamp"], layers: ["rest", "hover"], absolute: false } as never)
  })

  it("is accessible, fresh and stamped", async () => {
    const { container, user, getByRole } = renderUI(<Doc />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Approve" }))
    await axeCheck(container)
  })

  it("pressing it lands an impression on the page, named by its words, and reports it", async () => {
    const onStamp = vi.fn()
    const { user, getByRole, container } = renderUI(
      <StampSurface className="h-64 w-96">
        <StampButton stamp="stamp-approved" onStamp={onStamp}>
          Approve
        </StampButton>
      </StampSurface>
    )
    expect(impressions(container)).toHaveLength(0)
    await user.click(getByRole("button", { name: "Approve" }))
    expect(impressions(container)).toHaveLength(1)
    expect(getByRole("img", { name: "Approved" })).toHaveAttribute("data-slot", "stamp-impression")
    expect(onStamp).toHaveBeenCalledTimes(1)
    const imp = onStamp.mock.calls[0][0] as StampImpression
    expect(imp).toMatchObject({ id: "stamp-approved", name: "stamp-approved", press: 1 })
    expect(imp.x).toBeGreaterThanOrEqual(0.04)
    expect(imp.x).toBeLessThanOrEqual(0.96)
    expect(imp.seed).toBe("stamp-approved#1")
    expect(getByRole("status")).toHaveTextContent("Approved stamped.")
  })

  it("lands where it is aimed, give or take a few percent, with its own small turn", async () => {
    const { user, getByRole, container } = renderUI(<Doc />)
    await user.click(getByRole("button", { name: "Void" }))
    const el = impressions(container)[0] as unknown as HTMLElement
    const left = parseFloat(el.style.left), top = parseFloat(el.style.top)
    expect(Math.abs(left - 30)).toBeLessThanOrEqual(3)
    expect(Math.abs(top - 30)).toBeLessThanOrEqual(3)
    expect(el.style.translate).toBe("-50% -50%")
    expect(Math.abs(parseFloat(el.style.rotate))).toBeLessThanOrEqual(3.5)
  })

  it("striking the same stamp again replaces its impression with a fresh strike; other stamps add", async () => {
    const { user, getByRole, container } = renderUI(<Doc />)
    await user.click(getByRole("button", { name: "Approve" }))
    const seeds = () => impressions(container).map((e) => e.getAttribute("data-id"))
    expect(seeds()).toEqual(["stamp-approved"])
    await user.click(getByRole("button", { name: "Approve" }))
    expect(seeds()).toEqual(["stamp-approved"])
    await user.click(getByRole("button", { name: "Void" }))
    expect(seeds()).toEqual(["stamp-approved", "stamp-void"])
    await user.click(getByRole("button", { name: "Approve" }))
    expect(seeds()).toEqual(["stamp-void", "stamp-approved"])
  })

  it("every strike is a new impression: another seed, another wear", async () => {
    const seeds: string[] = []
    const { user, getByRole } = renderUI(
      <StampSurface>
        <StampButton stamp="stamp-approved" onStamp={(i) => seeds.push(i.seed)}>
          Approve
        </StampButton>
      </StampSurface>
    )
    await user.click(getByRole("button", { name: "Approve" }))
    await user.click(getByRole("button", { name: "Approve" }))
    await user.click(getByRole("button", { name: "Approve" }))
    expect(seeds).toEqual(["stamp-approved#1", "stamp-approved#2", "stamp-approved#3"])
  })

  it("Enter and Space stamp, like a click", async () => {
    const { user, getByRole, container } = renderUI(<Doc />)
    getByRole("button", { name: "Approve" }).focus()
    await user.keyboard("{Enter}")
    getByRole("button", { name: "Void" }).focus()
    await user.keyboard(" ")
    expect(impressions(container)).toHaveLength(2)
  })

  it("the surface's value is JSON: controlled, cleared by the parent, capped by max", async () => {
    const onValueChange = vi.fn()
    function Parent() {
      const [v, setV] = React.useState<StampImpression[]>([])
      return (
        <>
          <Doc value={v} onValueChange={(n) => (setV(n), onValueChange(n))} />
          <button onClick={() => setV([])}>clear</button>
        </>
      )
    }
    const { user, getByRole, container, getByText } = renderUI(<Parent />)
    await user.click(getByRole("button", { name: "Approve" }))
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ id: "stamp-approved", press: 1 })])
    expect(impressions(container)).toHaveLength(1)
    await user.click(getByText("clear"))
    expect(impressions(container)).toHaveLength(0)
    await user.click(getByRole("button", { name: "Approve" }))
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ press: 1 })])
    const capped = renderUI(<Doc max={1} />)
    await capped.user.click(within(capped.container).getByRole("button", { name: "Approve" }))
    await capped.user.click(within(capped.container).getByRole("button", { name: "Void" }))
    expect(impressions(capped.container)).toHaveLength(1)
    expect(impressions(capped.container)[0].getAttribute("data-id")).toBe("stamp-void")
  })

  it("defaultValue seeds an uncontrolled page", () => {
    const seed: StampImpression = { id: "stamp-paid", name: "stamp-paid", press: 1, x: 0.5, y: 0.5, turn: 0, seed: "stamp-paid#1" }
    const { container } = renderUI(<Doc defaultValue={[seed]} />)
    expect(impressions(container)).toHaveLength(1)
  })

  it("outside a surface it still stamps: on itself", async () => {
    const { user, getByRole, container } = renderUI(<StampButton stamp="stamp-paid">Pay</StampButton>)
    expect(container.querySelector('[data-slot="stamp-surface"]')).not.toBeNull()
    await user.click(getByRole("button", { name: "Pay" }))
    expect(impressions(container)).toHaveLength(1)
  })

  it("disabled cannot be pressed and draws the dashed die only", async () => {
    const onStamp = vi.fn()
    const { user, getByRole, container } = renderUI(
      <StampSurface>
        <StampButton stamp="stamp-approved" disabled onStamp={onStamp}>
          Approve
        </StampButton>
      </StampSurface>
    )
    await user.click(getByRole("button", { name: "Approve" }))
    expect(onStamp).not.toHaveBeenCalled()
    expect(container.querySelector('svg[data-ink="stamp-tool"] [data-layer="disabled"]')).not.toBeNull()
    expect(container.querySelector('svg[data-ink="stamp-tool"] [data-layer="rest"]')).toBeNull()
  })

  it("a handler that prevents the click stops the stamp", async () => {
    const onStamp = vi.fn()
    const { user, getByRole } = renderUI(
      <StampSurface>
        <StampButton stamp="stamp-approved" onClick={(e) => e.preventDefault()} onStamp={onStamp}>
          Approve
        </StampButton>
      </StampSurface>
    )
    await user.click(getByRole("button", { name: "Approve" }))
    expect(onStamp).not.toHaveBeenCalled()
  })

  it("asChild puts the tool on your element", async () => {
    const { user, getByRole, container } = renderUI(
      <StampSurface>
        <StampButton stamp="stamp-received" asChild>
          <a href="#log" role="button">
            Log it
          </a>
        </StampButton>
      </StampSurface>
    )
    const a = getByRole("button", { name: "Log it" })
    expect(a.tagName).toBe("A")
    expect(a.querySelector(':scope > svg[data-ink="stamp-tool"]')).not.toBeNull()
    await user.click(a)
    expect(impressions(container)).toHaveLength(1)
  })

  it("the page gives under the stamp, and holds still with reduced motion", async () => {
    const animate = vi.fn()
    ;(Element.prototype as unknown as { animate: unknown }).animate = animate
    try {
      const { user, getByRole } = renderUI(<Doc />)
      await user.click(getByRole("button", { name: "Approve" }))
      expect(animate).toHaveBeenCalledTimes(1)
      expect((animate.mock.calls[0][0] as Array<{ translate: string }>).map((f) => f.translate)).toEqual(["0 0", "0 2px", "0 0"])
      animate.mockClear()
      const calm = renderUI(
        <div data-motion="reduced">
          <Doc />
        </div>
      )
      await calm.user.click(within(calm.container).getByRole("button", { name: "Approve" }))
      expect(animate).not.toHaveBeenCalled()
    } finally {
      delete (Element.prototype as unknown as { animate?: unknown }).animate
    }
  })

  it("the impression's landing is an enter animation, not a permanent transform", async () => {
    const { user, getByRole, container } = renderUI(<Doc />)
    await user.click(getByRole("button", { name: "Approve" }))
    const cls = impressions(container)[0].getAttribute("class") ?? ""
    expect(cls).toContain("animate-in")
    expect(cls).toContain("zoom-in-[1.7]")
    expect(cls).toContain("duration-(--ll-dur-pop)")
  })

  it("useStampSurface outside a surface says so", () => {
    function Probe() {
      useStampSurface()
      return null
    }
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<Probe />)).toThrow(/inside <StampSurface>/)
    spy.mockRestore()
  })

  it("renders identically on the server and hydrates cleanly, bare and in a provider", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(<Doc />) as React.ReactElement)
      expect(renderToString(wrap(<Doc />) as React.ReactElement)).toBe(a)
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(<Doc />))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })
})

describe("stamp button drawing", () => {
  const run = (params: object, density: "comfortable" | "calm" = "comfortable", lazy?: ("pressed" | "focus")[]) =>
    runRecipe(stampButtonRecipe, { box: { w: 140, h: STAMP_KNOB + 38 }, params: params as never, seed: "s", tier: "lo", density, dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 }, lazy })

  it("every ink fits the lo budget", () => {
    for (const ink of ["red", "ink-you", "green", "ink"]) {
      const rest = run({ ink }).parts.rest ?? ""
      expect(rest.length).toBeGreaterThan(1000)
      expect(rest.length).toBeLessThan(12000)
      expect(rest).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
    }
  })

  it("disabled is a static alternative: no rest layer, no hover", () => {
    const d = run({ ink: "green", disabled: true })
    expect(d.parts.disabled).toBeTruthy()
    expect(d.parts.rest).toBeUndefined()
    expect(d.parts.hover).toBeUndefined()
  })

  it("pressed and focus are lazy", () => {
    expect(run({ ink: "red" }).parts.pressed).toBeUndefined()
    const both = run({ ink: "red" }, "comfortable", ["pressed", "focus"])
    expect(both.parts.pressed).toBeTruthy()
    expect(both.parts.focus).toBeTruthy()
  })

  it("calm draws less", () => {
    expect((run({ ink: "red" }, "calm").parts.rest ?? "").length).toBeLessThan((run({ ink: "red" }).parts.rest ?? "").length)
  })
})
