import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Badge, badgeVariants } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { badgeRecipe, badgeSizeList, badgeToneList, badgeVariantList, tallyWidth, type BadgeParams } from "@/lib/ink/recipes/badge-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(64, 24)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll("svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("Badge structure", () => {
  it("is a span with upstream's slot and defaults, and a drawing behind the label", () => {
    const { getByText } = render(<Badge>New</Badge>)
    const b = getByText("New")
    expect(b.tagName).toBe("SPAN")
    expect(b).toHaveAttribute("data-slot", "badge")
    expect(b).toHaveAttribute("data-variant", "default")
    expect(b).toHaveAttribute("data-size", "default")
    expect(b).toHaveClass("relative", "isolate", "font-hand", "inline-flex")
    expect(b).toHaveAttribute("data-ink-host")
    expect(b).toHaveAttribute("data-ink-ready")
    expectInkLayers(b, { min: 1, kinds: ["chip"], absolute: true, layers: ["rest"] })
  })

  it.each(badgeVariantList)("variant %s at every size draws and carries its data attributes", (variant) => {
    for (const size of badgeSizeList) {
      const { getByText, unmount } = render(
        <Badge variant={variant} size={size}>
          x
        </Badge>
      )
      const b = getByText("x")
      expect(b).toHaveAttribute("data-variant", variant)
      expect(b).toHaveAttribute("data-size", size)
      expect(b.querySelector(":scope > svg[data-ink=chip]")).toBeTruthy()
      unmount()
    }
  })

  it("badgeVariants is layout only: no colours, no rounding, no border", () => {
    for (const variant of badgeVariantList) expect(badgeVariants({ variant })).not.toMatch(/\brounded|\bbg-|\bborder\b|(?<!text-)\bshadow-|\bring/)
    expect(badgeVariants({ size: "sm" })).toContain("h-5")
    expect(badgeVariants({ size: "lg" })).toContain("h-7")
    expect(badgeVariants({ className: "mt-2" })).toContain("mt-2")
    expect(badgeVariants()).toContain("[&_svg:not(.absolute):not([class*='size-'])]:size-3.5")
  })

  it("the ink svg is decorative, behind the label, and never the first-child surprise for the label text", () => {
    const { getByText } = render(<Badge>New</Badge>)
    const b = getByText("New")
    const svg = b.querySelector("svg") as SVGElement
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg.style.zIndex).toBe("-1")
    expect(b.textContent).toBe("New")
  })

  it("forwards ref, className, id and data attributes to the span", () => {
    const ref = React.createRef<HTMLSpanElement>()
    const { getByText } = render(
      <Badge ref={ref} id="b1" className="ms-2" data-testid="t">
        Hi
      </Badge>
    )
    expect(ref.current).toBe(getByText("Hi"))
    expect(ref.current).toHaveAttribute("id", "b1")
    expect(ref.current).toHaveClass("ms-2")
    expect(ref.current).toHaveAttribute("data-testid", "t")
  })

  it("has a leading icon slot: an svg child keeps its own size and does not count as the drawing", () => {
    const { getByText } = render(
      <Badge variant="secondary">
        <Icon name="check" />
        Verified
      </Badge>
    )
    const b = getByText("Verified")
    expect(b.querySelectorAll(":scope > svg")).toHaveLength(2)
    expect(b.querySelector(":scope > svg[data-slot=icon]")).toBeTruthy()
    expect(b).toHaveClass("has-[>svg:not(.absolute)]:ps-2")
    expect(b.textContent).toBe("Verified")
  })

  it("destructive knocks the hatch out around its label and glyph with a paper halo", () => {
    const { getByText } = render(<Badge variant="destructive">Overdue</Badge>)
    const b = getByText("Overdue")
    expect(b).toHaveClass("[text-shadow:0_0_2px_var(--ll-slip),0_0_4px_var(--ll-slip)]")
    expect(b.className).toContain("drop-shadow(0_0_2px_var(--ll-slip))")
    expect(getByText("Overdue").className).not.toContain("text-white")
  })

  it("hands its icons the tier that fits the badge: 12 px for small, 14 for default", () => {
    const vb = (size?: "sm" | "default" | "lg") => {
      const { container, unmount } = render(
        <Badge size={size}>
          <Icon name="check" />x
        </Badge>
      )
      const v = container.querySelector("svg[data-slot=icon]")?.getAttribute("viewBox")
      unmount()
      return v
    }
    expect(vb("sm")).not.toBe(vb("default"))
    expect(vb("default")).not.toBe(vb("lg"))
  })

  it("draws per size: the box the host measures decides the viewBox", () => {
    restore()
    restore = mockBox(80, 28)
    const { getByText } = render(<Badge size="lg">Large</Badge>)
    expect(getByText("Large").querySelector("svg")?.getAttribute("viewBox")).toBe("-12 -12 104 52")
  })
})

describe("Badge asChild", () => {
  it("renders the child element with the badge's classes, data attributes and drawing inside it", () => {
    const { getByRole } = render(
      <Badge asChild variant="outline">
        <a href="/docs">Docs</a>
      </Badge>
    )
    const a = getByRole("link", { name: "Docs" })
    expect(a).toHaveAttribute("data-slot", "badge")
    expect(a).toHaveAttribute("data-variant", "outline")
    expect(a).toHaveAttribute("href", "/docs")
    expect(a).toHaveClass("relative", "isolate")
    expect(a.querySelector(":scope > svg[data-ink=chip]")).toBeTruthy()
    expect(a.textContent).toBe("Docs")
  })

  it("a link badge gets the hover layer, a plain badge does not", () => {
    const link = render(
      <Badge asChild>
        <a href="/x">Link</a>
      </Badge>
    )
    expect(layers(link.container)).toEqual(["rest", "hover"])
    link.unmount()
    const plain = render(<Badge>Plain</Badge>)
    expect(layers(plain.container)).toEqual(["rest"])
    plain.unmount()
    const clickable = render(<Badge onClick={() => {}}>Click</Badge>)
    expect(layers(clickable.container)).toEqual(["rest", "hover"])
  })

  it("is focusable as a link and draws its ring lazily on the first keyboard focus", async () => {
    const original = Element.prototype.matches
    const spy = vi.spyOn(Element.prototype, "matches")
    spy.mockImplementation(function (this: Element, sel: string) {
      return sel === ":focus-visible" ? this === document.activeElement : original.call(this, sel)
    })
    const { getByRole, user } = renderUI(
      <Badge asChild>
        <a href="/x">Focus me</a>
      </Badge>
    )
    const a = getByRole("link")
    expect(layers(a)).not.toContain("focus")
    await user.tab()
    expect(a).toHaveFocus()
    expect(layers(a)).toContain("focus")
    spy.mockRestore()
  })
})

describe("Badge count and tally", () => {
  it("count shows tabular digits and caps at max", () => {
    const a = render(<Badge count={8} />)
    expect(a.container.querySelector("[data-slot=badge]")?.textContent).toBe("8")
    expect(a.container.querySelector("[data-slot=badge]")).toHaveClass("ll-num")
    a.unmount()
    const b = render(<Badge count={120} max={99} />)
    expect(b.container.querySelector("[data-slot=badge]")?.textContent).toBe("99+")
    b.unmount()
    const c = render(<Badge count={7}>Seven things</Badge>)
    expect(c.container.querySelector("[data-slot=badge]")?.textContent).toBe("Seven things")
  })

  it("tally draws marks and keeps the number for screen readers", async () => {
    const { container, getByText } = render(<Badge tally count={7} variant="outline" />)
    const b = container.querySelector("[data-slot=badge]") as HTMLElement
    expect(getByText("7")).toHaveClass("sr-only")
    const slot = b.querySelector("[data-slot=badge-tally]") as HTMLElement
    expect(slot).toHaveAttribute("aria-hidden", "true")
    expect(slot.style.width).toBe(`${tallyWidth(7, 24)}px`)
    await axeCheck(container)
  })

  it("tally past 20, or without a count, falls back to digits", () => {
    const a = render(<Badge tally count={21} />)
    expect(a.container.querySelector("[data-slot=badge-tally]")).toBeNull()
    expect(a.container.textContent).toBe("21")
    a.unmount()
    const b = render(<Badge tally count={0} />)
    expect(b.container.querySelector("[data-slot=badge-tally]")).toBeNull()
    expect(b.container.textContent).toBe("0")
  })

  it("tallyWidth grows by one group per five and is monotonic", () => {
    let last = 0
    for (let n = 1; n <= 20; n++) {
      const w = tallyWidth(n, 24)
      expect(w).toBeGreaterThanOrEqual(last)
      last = w
    }
    expect(tallyWidth(10, 24)).toBeGreaterThan(tallyWidth(5, 24) * 1.5)
  })
})

describe("Badge accessibility", () => {
  it("has no axe violations across variants, with an icon, as a link and as a tally", async () => {
    const { container } = render(
      <div>
        {badgeVariantList.map((v) => (
          <Badge key={v} variant={v}>
            {v}
          </Badge>
        ))}
        <Badge>
          <Icon name="check" />
          Icon
        </Badge>
        <Badge asChild variant="link">
          <a href="/x">Link</a>
        </Badge>
        <Badge tally count={3} />
        <Badge count={12} />
      </div>
    )
    await axeCheck(container)
  })
})

describe("Badge on the server and hydration", () => {
  it("renders the host marker and no drawing before it is measured, deterministically", () => {
    restore()
    const tree = () => <Badge variant="secondary">Beta</Badge>
    const html = renderToString(tree())
    expect(html).toContain('data-slot="badge"')
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare and inside the provider) and then draws", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(
        <Badge asChild variant="link">
          <a href="/x">Hydrate</a>
        </Badge>
      ) as React.ReactElement
      const container = document.createElement("div")
      document.body.appendChild(container)
      restore()
      container.innerHTML = renderToString(ui)
      restore = mockBox(64, 24)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      expect(container.querySelector("[data-slot=badge] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })

  it("the same seed draws the same badge in two places", () => {
    const a = render(<Badge seed="s1">Same</Badge>)
    const first = a.container.querySelector("svg")?.innerHTML
    a.unmount()
    const b = render(<Badge seed="s1">Same</Badge>)
    expect(b.container.querySelector("svg")?.innerHTML).toBe(first)
  })
})

describe("badgeRecipe", () => {
  const req = { params: {}, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: object, w = 64, h = 24, extra: object = {}) =>
    runRecipe(badgeRecipe, { ...req, params: { variant: "default", size: "default", ...params } as BadgeParams, box: { w, h }, ...extra })

  it("declares rest, hover (only when hoverable) and a lazy focus", () => {
    expect(run({ variant: "default" }).layers).toEqual(["rest"])
    expect(run({ variant: "default", hoverable: true }).layers).toEqual(["rest", "hover"])
    expect(run({ variant: "default" }, 64, 24, { lazy: ["focus"] }).layers).toEqual(["rest", "focus"])
  })

  it("ghost and link have nothing at rest and their whole drawing on hover", () => {
    expect(run({ variant: "ghost" }).parts.rest ?? "").toBe("")
    expect(run({ variant: "ghost", hoverable: true }).parts.hover).toMatch(/data-part="swipe"/)
    expect(run({ variant: "link", hoverable: true }).parts.hover).toMatch(/data-part="swipe"/)
  })

  it("draws sane markup at many sizes, densities, tiers and tones (no NaN, only var(--ll-*) colours)", () => {
    for (const [w, h] of [
      [20, 20],
      [40, 20],
      [64, 24],
      [140, 28],
      [300, 24],
      [24, 24],
    ] as const) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const variant of badgeVariantList) {
            for (const tone of variant === "default" ? badgeToneList : (["marker"] as const)) {
              const f = run({ variant, tone, hoverable: true, tally: variant === "outline" ? 7 : undefined }, w, h, { density, tier, lazy: ["focus"] })
              const all = Object.values(f.parts).join("")
              expect(all, `${w}x${h}/${density}/${tier}/${variant}/${tone}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
            }
          }
        }
      }
    }
  })

  it("lo tier budget: every visible state is at most 12 nodes and 8 KB at badge sizes", () => {
    for (const variant of badgeVariantList) {
      const f = run({ variant, hoverable: true }, 96, 24)
      for (const layer of ["rest", "hover"] as const) {
        const m = f.parts[layer] ?? ""
        expect(nodes(m), `${variant}/${layer}`).toBeLessThanOrEqual(12)
        expect(m.length, `${variant}/${layer}`).toBeLessThanOrEqual(8000)
      }
    }
  })

  it("the marker blot is a data-part=fill group (the CSS nudges it on hover)", () => {
    expect(run({ variant: "default" }).parts.rest).toMatch(/data-part="fill" style="--mx:-?[\d.]+;--my:-?[\d.]+"/)
  })

  it("lazy layers never change the eager ones", () => {
    const eager = run({ variant: "default", hoverable: true })
    const withFocus = run({ variant: "default", hoverable: true }, 64, 24, { lazy: ["focus"] })
    expect(withFocus.parts.rest).toBe(eager.parts.rest)
    expect(withFocus.parts.focus).toBeTruthy()
  })
})
