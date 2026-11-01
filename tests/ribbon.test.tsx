import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Ribbon, ribbonSizeList, ribbonToneList, ribbonVariantList } from "@/components/ui/ribbon"
import { InkProvider, inkCache } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { RIBBON_SIZES, ribbonDrop, ribbonInset, ribbonRecipe } from "@/lib/ink/recipes/ribbon-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 43)
})
afterEach(() => restore())

describe("Ribbon", () => {
  it("is text on a band: the words are DOM, the drawing is decoration", () => {
    const { getByText, container } = renderUI(<Ribbon>New arrivals</Ribbon>)
    const el = getByText("New arrivals")
    expect(el).toHaveAttribute("data-slot", "ribbon")
    expect(el).toHaveAttribute("data-variant", "banner")
    expect(el).toHaveAttribute("data-ink-host")
    expectInkLayers(container, { kinds: ["ribbon"], absolute: true, layers: ["rest"] })
    expect(container.querySelector('svg[data-ink="ribbon"]')).toHaveAttribute("aria-hidden", "true")
  })

  it("draws every variant, size and tone, cleanly", () => {
    for (const variant of ribbonVariantList) {
      for (const size of ribbonSizeList) {
        for (const tone of ribbonToneList) {
          const { container, unmount } = renderUI(
            <Ribbon variant={variant} size={size} tone={tone}>
              Sale
            </Ribbon>
          )
          const svg = container.querySelector('svg[data-ink="ribbon"]')!
          expect(svg.innerHTML).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
          expect(svg.innerHTML).toContain(`var(--ll-${tone})`)
          unmount()
        }
      }
    }
  })

  it("leaves room for the tails: padding and height follow the size", () => {
    const { getByText } = renderUI(<Ribbon size="lg">Big</Ribbon>)
    const el = getByText("Big")
    expect(el.style.height).toBe(`${RIBBON_SIZES.lg.band + RIBBON_SIZES.lg.drop}px`)
    expect(el.style.paddingBottom).toBe(`${RIBBON_SIZES.lg.drop}px`)
    expect(el.style.paddingInline).toBe(`${ribbonInset("banner", "lg") + 14}px`)
    const flag = renderUI(<Ribbon variant="flag">Flag</Ribbon>).getByText("Flag")
    expect(flag.style.paddingBottom).toBe("0px")
    expect(ribbonDrop("flag", "default")).toBe(0)
  })

  it("is accessible as a heading label, as a link and as a button", async () => {
    const { container, getByRole } = renderUI(
      <div>
        <Ribbon>Plain</Ribbon>
        <Ribbon asChild variant="flag">
          <a href="#x">Read the story</a>
        </Ribbon>
        <Ribbon asChild tone="sky">
          <button type="button">Shop</button>
        </Ribbon>
      </div>
    )
    await axeCheck(container)
    expect(getByRole("link", { name: "Read the story" })).toHaveAttribute("data-slot", "ribbon")
    expect(getByRole("button", { name: "Shop" })).toHaveAttribute("data-slot", "ribbon")
  })

  it("asChild draws inside the child element and keeps its behaviour", async () => {
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(
      <Ribbon asChild>
        <button type="button" onClick={onClick}>
          Go
        </button>
      </Ribbon>
    )
    const b = getByRole("button", { name: "Go" })
    expect(b.querySelector(':scope > svg[data-ink="ribbon"]')).not.toBeNull()
    await user.click(b)
    expect(onClick).toHaveBeenCalledTimes(1)
    b.focus()
    await user.keyboard("{Enter}")
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it("only a ribbon you can point at has a hover layer", () => {
    const plain = renderUI(<Ribbon>Plain</Ribbon>)
    expect(plain.container.querySelector('[data-layer="hover"]')).toBeNull()
    const link = renderUI(
      <Ribbon asChild>
        <a href="#x">Link</a>
      </Ribbon>
    )
    expect(link.container.querySelector('[data-layer="hover"]')).not.toBeNull()
    const clickable = renderUI(<Ribbon onClick={() => {}}>Click</Ribbon>)
    expect(clickable.container.querySelector('[data-layer="hover"]')).not.toBeNull()
  })

  it("focus ring is a lazy layer, made on the first keyboard focus", () => {
    const { container, getByRole } = renderUI(
      <Ribbon asChild>
        <a href="#x">Link</a>
      </Ribbon>
    )
    expect(container.querySelector('[data-layer="focus"]')).toBeNull()
    const link = getByRole("link")
    vi.spyOn(link, "matches").mockImplementation((s: string) => s.includes("focus-visible"))
    act(() => link.focus())
    expect(container.querySelector('[data-layer="focus"]')).not.toBeNull()
  })

  it("same seed, same hand; a click does not redraw", async () => {
    const a = renderUI(<Ribbon seed="k">Same</Ribbon>).container.querySelector("svg")!.innerHTML
    const b = renderUI(<Ribbon seed="k">Same</Ribbon>).container.querySelector("svg")!.innerHTML
    expect(b).toBe(a)
    const c = renderUI(<Ribbon seed="other">Same</Ribbon>).container.querySelector("svg")!.innerHTML
    expect(c).not.toBe(a)
    const { getByText, user } = renderUI(<Ribbon onClick={() => {}}>Press</Ribbon>)
    const runs = inkCache.stats().runs
    await user.click(getByText("Press"))
    expect(inkCache.stats().runs).toBe(runs)
  })

  it("renders identically on the server and hydrates cleanly, bare and in a provider", async () => {
    const tree = (
      <div>
        <Ribbon>Server</Ribbon>
        <Ribbon variant="flag" tone="lemon">
          Flag
        </Ribbon>
      </div>
    )
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(tree) as React.ReactElement)
      expect(renderToString(wrap(tree) as React.ReactElement)).toBe(a)
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(tree))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })
})

describe("ribbon drawing", () => {
  const run = (params: object, box: { w: number; h: number }, density: "comfortable" | "calm" = "comfortable") =>
    runRecipe(ribbonRecipe, { box, params: params as never, seed: "r", tier: "lo", density, dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } })

  it("a banner fits the lo budget (about 8 KB), the notched ones are cheaper", () => {
    const S = RIBBON_SIZES.default
    const banner = run({ variant: "banner", tone: "marker", size: "default" }, { w: 200, h: S.band + S.drop }).parts.rest ?? ""
    expect(banner.length).toBeLessThan(9000)
    expect((banner.match(/<(path|g)\b/g) ?? []).length).toBeLessThanOrEqual(18)
    for (const variant of ["swallow", "flag"]) {
      const r = run({ variant, tone: "marker", size: "default" }, { w: 200, h: S.band }).parts.rest ?? ""
      expect(r.length).toBeLessThan(7000)
      expect((r.match(/<(path|g)\b/g) ?? []).length).toBeLessThanOrEqual(12)
    }
  })

  it("calm density is cheaper and uses the pencil", () => {
    const S = RIBBON_SIZES.default
    const p = { variant: "banner", tone: "marker", size: "default" }
    const calm = run(p, { w: 200, h: S.band + S.drop }, "calm").parts.rest ?? ""
    const normal = run(p, { w: 200, h: S.band + S.drop }).parts.rest ?? ""
    expect(calm.length).toBeLessThan(normal.length)
  })

  it("survives absurd boxes", () => {
    for (const box of [{ w: 4, h: 4 }, { w: 900, h: 20 }, { w: 30, h: 400 }, { w: 1200, h: 60 }]) {
      for (const variant of ribbonVariantList) {
        const rest = run({ variant, tone: "sky", size: "lg", hoverable: true }, box).parts.rest ?? ""
        expect(rest).not.toMatch(/NaN|Infinity/)
      }
    }
  })
})
