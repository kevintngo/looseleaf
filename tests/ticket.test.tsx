import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Ticket, TicketBody, TicketDescription, TicketNumber, TicketStub, TicketTitle } from "@/components/ui/ticket"
import { TICKET, ticketPath, ticketRecipe, type TicketParams } from "@/lib/ink/recipes/ticket-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(470, 150)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Admit(props: React.ComponentProps<typeof Ticket>) {
  return (
    <Ticket {...props}>
      <TicketBody>
        <TicketTitle>Admit one</TicketTitle>
        <TicketDescription>Le Grand Jardin</TicketDescription>
      </TicketBody>
      <TicketStub>
        <TicketNumber>No. 0042</TicketNumber>
      </TicketStub>
    </Ticket>
  )
}

describe("Ticket", () => {
  it("renders its parts with their data-slots; the stub is an aside", () => {
    const { container } = render(<Admit />)
    for (const slot of ["ticket", "ticket-body", "ticket-stub", "ticket-title", "ticket-description", "ticket-number"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    const stub = container.querySelector('[data-slot="ticket-stub"]') as HTMLElement
    expect(stub.tagName).toBe("ASIDE")
    expect(stub.style.width).toBe("88px")
    expect(stub).toHaveClass("shrink-0")
    expect(container.firstElementChild).toHaveClass("relative", "isolate", "flex")
  })

  it("the whole silhouette is one drawn sheet on the root, once measured", () => {
    const { container } = render(<Admit seed="t" />)
    const t = container.firstElementChild as HTMLElement
    const svg = container.querySelector(':scope > div > svg[data-ink="sheet"]')!
    expect(svg.parentElement).toBe(t)
    expect(t).toHaveAttribute("data-ink-host")
    expect(t).toHaveAttribute("data-ink-ready")
    expect(t.style.getPropertyValue("--ll-tilt")).toMatch(/deg$/)
    expect(t.className).not.toContain("bg-index-card")
    expectInkLayers(container, { min: 1, kinds: ["sheet"], absolute: true, layers: ["rest"] })
  })

  it("until it is measured it wears a plain card, so it is never a floating label on the desk", () => {
    restore()
    restore = () => {}
    const { container } = render(<Admit />)
    const t = container.firstElementChild as HTMLElement
    expect(t).toHaveClass("bg-index-card", "shadow-card")
    expect(t).not.toHaveAttribute("data-ink-host")
    expect(container.querySelector("svg")).toBeNull()
  })

  it("the stub goes where you say: width, side, or nowhere", () => {
    const { container, rerender } = render(<Admit stubWidth={120} />)
    expect((container.querySelector('[data-slot="ticket-stub"]') as HTMLElement).style.width).toBe("120px")
    rerender(<Admit stub="start" />)
    expect(container.firstElementChild).toHaveClass("flex-row-reverse")
    expect(container.firstElementChild).toHaveAttribute("data-stub", "start")
    rerender(<Admit stub="none" />)
    expect(container.firstElementChild).toHaveAttribute("data-stub", "none")
  })

  it("punched marks a used ticket", () => {
    const { container } = render(<Admit punched />)
    expect(container.firstElementChild).toHaveAttribute("data-punched")
  })

  it("takes a tilt: seeded, a number, or none", () => {
    const { container, rerender } = render(<Admit seed="a" />)
    const t = container.firstElementChild as HTMLElement
    expect(Math.abs(parseFloat(t.style.getPropertyValue("--ll-tilt")))).toBeLessThanOrEqual(1.2)
    rerender(<Admit seed="a" tilt={-2} />)
    expect(t.style.getPropertyValue("--ll-tilt")).toBe("-2deg")
    rerender(<Admit seed="a" tilt={false} />)
    expect(t.style.getPropertyValue("--ll-tilt")).toBe("0deg")
  })

  it("passes className, ref, style and props through", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByTestId } = render(<Admit ref={ref} className="max-w-xl" style={{ minHeight: 130 }} data-testid="t" id="t1" aria-label="Ticket" role="group" />)
    expect(ref.current).toBe(getByTestId("t"))
    expect(getByTestId("t")).toHaveClass("max-w-xl")
    expect(getByTestId("t").style.minHeight).toBe("130px")
    expect(getByTestId("t")).toHaveAttribute("role", "group")
  })

  it("has no axe violations, one ticket or several, inside a main landmark", async () => {
    const { container } = renderUI(
      <main>
        <Admit role="group" aria-label="Ticket 1" />
        <Admit role="group" aria-label="Ticket 2" punched stub="start" />
      </main>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Admit size={[470, 150]} seed="s" />)
    expectHydrates(<Admit seed="h" punched />, 'svg[data-ink="sheet"]', [470, 150])
  })
})

describe("ticketRecipe", () => {
  const p: TicketParams = { stock: "kraft", stub: "end", stubWidth: 96, punched: true }

  it("is deterministic per seed, differs across seeds, clean at every size, density and tier", () => {
    const a = run(ticketRecipe, p, 470, 150).parts.rest!
    expect(a).toBe(run(ticketRecipe, p, 470, 150).parts.rest)
    expect(a).not.toBe(run(ticketRecipe, p, 470, 150, { seed: "x" }).parts.rest)
    for (const [w, h] of [[120, 60], [320, 100], [470, 150], [900, 300]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const stub of ["end", "start", "none"] as const) {
            const f = run(ticketRecipe, { ...p, stub, stubWidth: Math.min(96, w / 3) }, w, h, { density, tier })
            expect(f.layers).toEqual(["rest"])
            expectClean(f.parts.rest!)
          }
        }
      }
    }
  })

  it("cuts a bite and a row of holes along the tear, and the holes are subpaths of the outline", () => {
    const { d, holesD } = ticketPath(470, 150, 374)
    expect(d.match(/A/g)!.length).toBe(4 + 2)
    expect(holesD.match(/z/gi)!.length).toBeGreaterThan(10)
    expect(ticketPath(470, 150, -1).d.match(/A/g)!.length).toBe(4)
    expect(ticketPath(470, 150, -1).holesD).toBe("")
    expect(TICKET.notch).toBeGreaterThan(TICKET.hole * 4)
  })

  it("mirrors the stub for a start stub and for right-to-left pages, and back again for both", () => {
    const q = { ...p, punched: false }
    const end = run(ticketRecipe, q, 470, 150).parts.rest!
    const start = run(ticketRecipe, { ...q, stub: "start" }, 470, 150).parts.rest!
    const rtl = run(ticketRecipe, q, 470, 150, { dir: "rtl" }).parts.rest!
    const both = run(ticketRecipe, { ...q, stub: "start" }, 470, 150, { dir: "rtl" }).parts.rest!
    expect(start).not.toBe(end)
    expect(rtl).toBe(start.replace(/x="[^"]*"/g, (m) => m))
    expect(both).toBe(end)
  })

  it("punches the hole at the END of the reading line, away from where the words start: right in LTR, left in RTL, whichever side the stub is on", () => {
    const hole = (f: string) => {
      const all = [...f.matchAll(/M([\d.]+) ([\d.]+)a5\.6 5\.6/g)]
      const m = all[all.length - 1]
      return { x: Number(m[1]) + 5.6, y: Number(m[2]) }
    }
    const at = (params: TicketParams, dir?: "rtl") => hole(run(ticketRecipe, params, 470, 150, dir ? { dir } : undefined).parts.rest!)
    expect(at(p).x).toBeGreaterThan(374 - 60)
    expect(at(p).x).toBeLessThan(374)
    expect(at(p, "rtl").x).toBeGreaterThan(470 - 374)
    expect(at(p, "rtl").x).toBeLessThan(96 + 60)
    expect(at({ ...p, stub: "start" }).x).toBeGreaterThan(470 - 60)
    expect(at({ ...p, stub: "none", stubWidth: 0 }).x).toBeGreaterThan(470 - 60)
    expect(at(p).y).toBeGreaterThan(150 - 50)
    expect(at(p).y).toBeLessThan(150 - 10)
  })

  it("stays a small drawing: one silhouette, its frames and the tiles", () => {
    const f = run(ticketRecipe, p, 470, 150).parts.rest!
    expect(nodes(f)).toBeLessThan(40)
    expect(f.length).toBeLessThan(9000)
  })
})
