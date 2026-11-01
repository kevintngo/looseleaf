import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Skeleton } from "@/components/ui/skeleton"
import { InkProvider } from "@/lib/ink/react"
import { SKELETON_BOIL_S, SKELETON_FRAMES, skeletonCss } from "@/lib/ink/recipes/skeleton-ink"
import { axeCheck } from "./helpers"

describe("Skeleton", () => {
  it("is a plain div with upstream's slot, shaped by className", () => {
    const { container } = render(<Skeleton className="h-4 w-[250px]" />)
    const s = container.querySelector("[data-slot=skeleton]") as HTMLElement
    expect(s.tagName).toBe("DIV")
    expect(s).toHaveClass("h-4", "w-[250px]", "block")
    expect(s.children).toHaveLength(0)
    expect(s.textContent).toBe("")
  })

  it("forwards ref-less props: id, data attributes, aria, style (merged with its own phase variable)", () => {
    const { container } = render(<Skeleton id="s1" data-testid="sk" aria-hidden="true" style={{ height: 10 }} />)
    const s = container.querySelector("[data-slot=skeleton]") as HTMLElement
    expect(s).toHaveAttribute("id", "s1")
    expect(s).toHaveAttribute("data-testid", "sk")
    expect(s).toHaveAttribute("aria-hidden", "true")
    expect(s.style.height).toBe("10px")
    expect(s.style.getPropertyValue("--ll-sk-phase")).toMatch(/^[0-2]$/)
  })

  it("has no ink of its own: no svg, however many there are (one stylesheet for the page)", () => {
    const { container } = render(
      <div>
        {Array.from({ length: 300 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-40" />
        ))}
      </div>
    )
    expect(container.querySelectorAll("[data-slot=skeleton]")).toHaveLength(300)
    expect(container.querySelectorAll("svg")).toHaveLength(0)
    expect(document.head.querySelectorAll('style[data-href="ll-skeleton"]')).toHaveLength(1)
  })

  it("spreads the phase of the boil over its seeds so a page of them does not flicker in unison", () => {
    const { container } = render(
      <div>
        {Array.from({ length: 30 }, (_, i) => (
          <Skeleton key={i} seed={i} />
        ))}
      </div>
    )
    const phases = new Set(Array.from(container.querySelectorAll<HTMLElement>("[data-slot=skeleton]")).map((s) => s.style.getPropertyValue("--ll-sk-phase")))
    expect(phases.size).toBe(SKELETON_FRAMES)
  })

  it("is invisible to assistive tech by being empty, and has no axe violations, alone or standing in for a card", async () => {
    const { container } = render(
      <div aria-busy="true">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    )
    await axeCheck(container)
  })
})

describe("skeleton stylesheet", () => {
  const css = skeletonCss()

  it("is built once", () => {
    expect(skeletonCss()).toBe(css)
  })

  it("has three frames of every tile as custom properties, each an alpha shape as a data-URI svg with no colour of its own", () => {
    for (const kind of ["eh", "ev", "ha", "ci"]) {
      for (let f = 0; f < SKELETON_FRAMES; f++) {
        const m = new RegExp(`--ll-sk-${kind}${f}:url\\("data:image/svg\\+xml,([^"]+)"\\)`).exec(css)
        expect(m, `${kind}${f}`).toBeTruthy()
        const svg = decodeURIComponent(m![1])
        expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
        expect(svg).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b|var\(--/i)
        expect(svg).toContain("currentColor")
      }
    }
  })

  it("the three frames are different drawings", () => {
    const tiles = [0, 1, 2].map((f) => new RegExp(`--ll-sk-ha${f}:(url\\("[^"]+"\\))`).exec(css)![1])
    expect(new Set(tiles).size).toBe(3)
  })

  it("boils by stepping the mask image, at its own slow pace, and cycles back to the first frame", () => {
    expect(css).toContain("@keyframes ll-sk-hatch{")
    expect(css).toContain("@keyframes ll-sk-outline{")
    expect(css).toContain("@keyframes ll-sk-circle{")
    expect(css).toContain(`${SKELETON_BOIL_S}s steps(1,end) infinite`)
    const hatch = /@keyframes ll-sk-hatch\{(.*?)\}\}/.exec(css)![1]
    expect(hatch.match(/(?<!-webkit-)mask-image:var\(--ll-sk-ha\d\)/g)).toHaveLength(SKELETON_FRAMES + 1)
    expect(hatch.endsWith("var(--ll-sk-ha0)")).toBe(true)
  })

  it("paints the masks with the page's pencil tokens and leaves the element's wash to a token too", () => {
    expect(css).toContain("var(--ll-pencil)")
    expect(css).toContain("var(--ll-pencil-mark)")
    expect(css).toContain("var(--ll-paper-shade)")
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it("gives a rounded-full box one drawn circle", () => {
    expect(css).toContain("[data-slot=skeleton].rounded-full::before")
    expect(css).toContain("animation-name:ll-sk-circle")
  })

  it("holds still for reduced motion (OS and in-app) and calm density, and steps aside in Windows high contrast", () => {
    expect(css).toContain("@media (prefers-reduced-motion:reduce)")
    expect(css).toContain("[data-motion=reduced] [data-slot=skeleton]::before")
    expect(css).toContain("[data-density=calm] [data-slot=skeleton]::after")
    expect(css).toContain("@media (forced-colors:active)")
    expect(css).toContain("outline:1px dashed GrayText")
  })

  it("is well-formed: braces and quotes balance, and it stays small enough for one page-wide stylesheet", () => {
    expect((css.match(/\{/g) ?? []).length).toBe((css.match(/\}/g) ?? []).length)
    expect((css.match(/\(/g) ?? []).length).toBe((css.match(/\)/g) ?? []).length)
    expect((css.match(/"/g) ?? []).length % 2).toBe(0)
    expect(css.length).toBeLessThan(28 * 1024)
  })
})

describe("Skeleton on the server and hydration", () => {
  it("renders the div, the hoisted stylesheet once, and the same bytes twice", () => {
    const tree = () => (
      <div>
        <Skeleton className="h-4 w-40" seed="a" />
        <Skeleton className="h-4 w-24" seed="b" />
      </div>
    )
    const html = renderToString(tree())
    expect(html.match(/data-slot="skeleton"/g)).toHaveLength(2)
    expect(html.match(/href="ll-skeleton"/g)?.length ?? 0).toBeLessThanOrEqual(1)
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare and inside the provider)", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(
        <div>
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) as React.ReactElement
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
      expect(container.querySelectorAll("[data-slot=skeleton]").length).toBe(2)
      act(() => root?.unmount())
      container.remove()
    }
  })
})
