import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icon } from "@/components/ui/icon"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { alertRecipe, type AlertTone } from "@/lib/ink/recipes/alert-ink"
import Default from "@/docs/examples/alert/01-default"
import Tones from "@/docs/examples/alert/02-tones"
import Note from "@/docs/examples/alert/03-note"
import Billing from "@/docs/examples/alert/04-billing"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(480, 72)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const TONES: AlertTone[] = ["default", "destructive", "info", "success", "warning", "note"]

function Sample(props: React.ComponentProps<typeof Alert>) {
  return (
    <Alert {...props}>
      <Icon name="info" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components with the CLI.</AlertDescription>
    </Alert>
  )
}

describe("Alert structure", () => {
  it("has upstream's three parts and slots, and is a live region", () => {
    const { container, getByRole } = render(<Sample />)
    for (const slot of ["alert", "alert-title", "alert-description"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    const alert = getByRole("alert")
    expect(alert.tagName).toBe("DIV")
    expect(alert).toHaveTextContent("Heads up!")
    expect(alert).toHaveClass("relative", "isolate", "grid", "w-full")
  })

  it("keeps upstream's grid: an icon column only when there is an icon", () => {
    const { getByRole } = render(<Sample />)
    const cls = getByRole("alert").className
    expect(cls).toContain("grid-cols-[0_1fr]")
    expect(cls).toContain("has-[>svg:not(.absolute)]:grid-cols-[calc(var(--spacing)*4)_1fr]")
    expect(cls).toContain("[&>svg:not(.absolute)]:size-4")
    expect(getByRole("alert").querySelector("[data-slot=alert-title]")).toHaveClass("col-start-2")
  })

  it("sets every tone as data-variant and never draws a border, background or radius of its own", () => {
    for (const tone of TONES.filter((t) => t !== "note")) {
      const { getByRole, unmount } = render(<Sample variant={tone} />)
      const a = getByRole("alert")
      expect(a).toHaveAttribute("data-variant", tone)
      expect(a.className).not.toMatch(/\b(border|rounded|bg-card)\b/)
      unmount()
    }
  })

  it("the destructive title and description are red on the slip", () => {
    const { getByRole } = render(<Sample variant="destructive" />)
    expect(getByRole("alert").className).toContain("text-destructive")
    expect(getByRole("alert").className).toContain("*:data-[slot=alert-description]:text-destructive")
    expect(getByRole("alert").className).not.toContain("text-destructive/90")
  })

  it("clamps the title to one line and pads for density", () => {
    const { getByRole } = render(<Sample />)
    expect(getByRole("alert").querySelector("[data-slot=alert-title]")).toHaveClass("line-clamp-1", "font-bold")
    expect(getByRole("alert").className).toContain("calm:py-2")
    expect(getByRole("alert").className).toContain("compact:py-2.5")
  })
})

describe("Alert drawing", () => {
  it("is its own host: a rest-only drawing behind the content", () => {
    const { getByRole, container } = render(<Sample variant="info" />)
    const a = getByRole("alert")
    expect(a).toHaveAttribute("data-ink-host")
    expect(a).toHaveAttribute("data-ink-ready")
    expect(a.firstElementChild).toHaveAttribute("data-ink", "alert")
    expectInkLayers(container, { kinds: ["alert", "icon"], layers: ["rest"] })
    expect(a.querySelector("svg[data-ink=alert] > g[data-layer=rest], svg[data-ink=alert]")).not.toBeNull()
  })

  it("circles the icon (a part the CSS hides when there is no icon)", () => {
    const { getByRole } = render(<Sample variant="success" />)
    const a = getByRole("alert")
    expect(a.querySelector('svg[data-ink=alert] [data-part="icon-mark"]')).not.toBeNull()
    expect(a.className).toContain("[&:not(:has(>svg:not(.absolute)))>svg_[data-part=icon-mark]]:hidden")
  })

  it("is not interactive: no hover, pressed or focus layers", () => {
    const { getByRole } = render(<Sample variant="destructive" />)
    const names = Array.from(getByRole("alert").querySelectorAll("svg[data-ink=alert] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))
    expect(names).toEqual(["rest"])
  })

  it("the note variant is a sticky Paper with a taped corner, no ink host", () => {
    const { getByRole, container } = render(<Sample variant="note" seed="n" />)
    const a = getByRole("alert")
    expect(a).toHaveAttribute("data-slot", "alert")
    expect(a).toHaveAttribute("data-stock", "sticky-yellow")
    expect(a).toHaveClass("ll-paper")
    expect(container.querySelector('[data-slot="tape"]')).not.toBeNull()
    expect(a).not.toHaveAttribute("data-ink-host")
    expect(container.querySelector("svg[data-ink=alert]")).toBeNull()
  })

  it("has no accessibility violations in any tone", async () => {
    for (const tone of TONES) {
      const { container, unmount } = renderUI(<Sample variant={tone} />)
      await axeCheck(container)
      unmount()
    }
  })
})

describe("alertRecipe", () => {
  const req = { seed: "r", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const run = (tone: AlertTone, box = { w: 480, h: 72 }, density: "comfortable" | "compact" | "calm" = "comfortable") => runRecipe(alertRecipe, { ...req, density, params: { tone }, box })
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("each tone draws a different rest layer; note draws nothing", () => {
    const seen = new Set<string>()
    for (const tone of TONES.filter((t) => t !== "note")) {
      const f = run(tone)
      expect(f.layers).toEqual(["rest"])
      seen.add(f.parts.rest!)
    }
    expect(seen.size).toBe(5)
    expect(run("note").layers).toEqual([])
  })

  it("tones differ by pattern, not only colour: hatch, double rule, marker strip, highlighter fill", () => {
    const strip = (t: AlertTone) => run(t).parts.rest!
    expect(strip("destructive")).toContain("var(--ll-red)")
    expect(strip("info")).toContain("var(--ll-ink-you)")
    expect(strip("success")).toContain("var(--ll-grass)")
    expect(strip("warning")).toContain("var(--ll-hi)")
    expect(run("default", undefined, "calm").parts.rest!.length).toBeLessThan(run("default").parts.rest!.length)
  })

  it("stays inside the budget of a surface at common sizes and does not explode at absurd ones", () => {
    for (const tone of TONES.filter((t) => t !== "note")) {
      for (const box of [{ w: 280, h: 56 }, { w: 480, h: 72 }, { w: 720, h: 120 }, { w: 1200, h: 200 }]) {
        const s = run(tone, box).parts.rest!
        expect(s.length, `${tone} ${box.w}x${box.h}`).toBeLessThan(box.w > 700 ? 30_000 : 20_000)
        expect(s).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
      }
      expect(nodes(run(tone, { w: 320, h: 64 }).parts.rest!)).toBeLessThanOrEqual(40)
    }
  })

  it("mirrors the margin mark and the icon circle for right-to-left", () => {
    const run = (tone: AlertTone, dir: "ltr" | "rtl") => runRecipe(alertRecipe, { ...req, dir, density: "comfortable", params: { tone }, box: { w: 480, h: 72 } }).parts.rest!
    for (const tone of ["destructive", "info", "success", "default"] as const) expect(run(tone, "rtl"), tone).not.toBe(run(tone, "ltr"))
    expect(run("warning", "rtl")).not.toMatch(/NaN|undefined/)
  })

  it("is deterministic and follows the density", () => {
    expect(run("info").parts.rest).toBe(run("info").parts.rest)
    expect(run("info", undefined, "compact").parts.rest).not.toBe(run("info").parts.rest)
  })
})

describe("SSR and hydration", () => {
  it("renders identical markup twice", () => {
    for (const tone of ["destructive", "note"] as const) expect(renderToString(<Sample variant={tone} seed="x" />)).toBe(renderToString(<Sample variant={tone} seed="x" />))
  })

  it("hydrates without warnings, bare and inside the provider", () => {
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      const ui = wrap(<Sample variant="warning" />)
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
      expect(container.querySelector("[role=alert] > svg[data-ink=alert]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("examples", () => {
  it("Default and destructive renders two alerts", async () => {
    const { getAllByRole } = renderUI(<Default />)
    expect(getAllByRole("alert")).toHaveLength(2)
    await axeCheck()
  })

  it("Tones renders four alerts, the last without icon or title", async () => {
    const { getAllByRole } = renderUI(<Tones />)
    const alerts = getAllByRole("alert")
    expect(alerts).toHaveLength(4)
    expect(alerts[3].querySelector("[data-slot=alert-title]")).toBeNull()
    await axeCheck()
  })

  it("Sticky note is a Paper", async () => {
    const { getByRole } = renderUI(<Note />)
    expect(getByRole("alert")).toHaveAttribute("data-stock", "sticky-yellow")
    await axeCheck()
  })

  it("Billing swaps the destructive alert for a success one when the card is updated", async () => {
    const { user, getByRole } = renderUI(<Billing />)
    expect(getByRole("alert")).toHaveAttribute("data-variant", "destructive")
    await user.click(getByRole("button", { name: "Update card" }))
    expect(getByRole("alert")).toHaveAttribute("data-variant", "success")
    await axeCheck()
  })
})
