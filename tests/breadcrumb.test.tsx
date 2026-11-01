import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { breadcrumbPageRecipe } from "@/lib/ink/recipes/breadcrumb-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(88, 28)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

function Demo({ page }: { page?: Partial<React.ComponentProps<typeof BreadcrumbPage>> }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="/components">Components</a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage {...page}>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

describe("Breadcrumb", () => {
  it("is a labelled nav with an ordered list, upstream's slots, and links that go somewhere", () => {
    const { getByRole, container } = renderUI(<Demo />)
    const nav = getByRole("navigation", { name: "breadcrumb" })
    expect(nav).toHaveAttribute("data-slot", "breadcrumb")
    const list = within(nav).getByRole("list")
    expect(list.tagName).toBe("OL")
    expect(list).toHaveAttribute("data-slot", "breadcrumb-list")
    expect(list.className).toContain("flex-wrap")
    expect(container.querySelectorAll('[data-slot="breadcrumb-item"]')).toHaveLength(3)
    const home = within(nav).getByRole("link", { name: "Home" })
    expect(home).toHaveAttribute("href", "/")
    expect(home).toHaveAttribute("data-slot", "breadcrumb-link")
    expect(home.className).toContain("hover:ll-swipe")
    expect(within(nav).getByRole("link", { name: "Components" })).toHaveAttribute("href", "/components")
  })

  it("the current page is a disabled link with aria-current, underlined by a drawing that is its ink host", () => {
    const { getByRole } = renderUI(<Demo />)
    const page = getByRole("link", { name: "Breadcrumb" })
    expect(page).toHaveAttribute("data-slot", "breadcrumb-page")
    expect(page).toHaveAttribute("aria-current", "page")
    expect(page).toHaveAttribute("aria-disabled", "true")
    expect(page).toHaveAttribute("data-ink-host")
    expect(page).toHaveAttribute("data-ink-ready")
    expectInkLayers(page, { min: 1, kinds: ["crumb"], absolute: true, layers: ["rest"] })
    expect(page.querySelector(":scope > svg[data-ink=crumb]")).toBeTruthy()
  })

  it("the page is not a host before there is a drawing (no stand-in outline around a word on the server)", () => {
    const html = renderToString(<Demo />)
    expect(html).toContain('data-slot="breadcrumb-page"')
    const tag = /<span[^>]*data-slot="breadcrumb-page"[^>]*>/.exec(html)![0]
    expect(tag).not.toContain("data-ink-host")
  })

  it("a seed pins the hand and the ref reaches the label", () => {
    const ref = React.createRef<HTMLSpanElement>()
    const a = renderUI(<Demo page={{ seed: "x", ref }} />)
    expect(ref.current).toBe(a.getByRole("link", { name: "Breadcrumb" }))
    const svg = ref.current!.querySelector("svg")!.innerHTML
    a.unmount()
    const b = renderUI(<Demo page={{ seed: "x" }} />)
    expect(b.getByRole("link", { name: "Breadcrumb" }).querySelector("svg")!.innerHTML).toBe(svg)
  })

  it("separators are hidden decoration: a pencil slash by default, any node instead", () => {
    const { container } = renderUI(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>a</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>b</BreadcrumbItem>
          <BreadcrumbSeparator>
            <Icon name="chevron-right" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>c</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    const seps = container.querySelectorAll('[data-slot="breadcrumb-separator"]')
    expect(seps).toHaveLength(2)
    for (const s of seps) {
      expect(s).toHaveAttribute("role", "presentation")
      expect(s).toHaveAttribute("aria-hidden", "true")
      expect(s.tagName).toBe("LI")
    }
    expect(seps[0].querySelector('svg[data-icon="slash"]')).toBeTruthy()
    expect(seps[1].querySelector('svg[data-icon="chevron-right"]')).toBeTruthy()
    expect(seps[1].querySelector('svg[data-icon="slash"]')).toBeNull()
  })

  it("the ellipsis stands for the crumbs left out and opens a dropdown of them", async () => {
    const { user } = renderUI(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1" aria-label="Toggle menu">
                <BreadcrumbEllipsis className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Documentation</DropdownMenuItem>
                <DropdownMenuItem>Themes</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
      { user: { pointerEventsCheck: 0 } }
    )
    const dots = document.querySelector('[data-slot="breadcrumb-ellipsis"]')!
    expect(dots).toHaveAttribute("aria-hidden", "true")
    expect(dots).toHaveAttribute("role", "presentation")
    expect(dots.querySelector('svg[data-icon="ellipsis"]')).toBeTruthy()
    expect(dots).toHaveTextContent("More")
    await user.click(screen.getByRole("button", { name: "Toggle menu" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getAllByRole("menuitem").map((i) => i.textContent)).toEqual(["Documentation", "Themes"])
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Demo />)
    await axeCheck(container)
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = <Demo />
    const html = renderToString(tree)
    expect(renderToString(tree)).toBe(html)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(tree) as React.ReactElement
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
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("breadcrumbPageRecipe", () => {
  const req = { seed: "s", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("draws two pulls of blue felt, one pencil pull in calm, within the lo budget at any width", () => {
    for (const w of [40, 88, 200, 520]) {
      const f = runRecipe(breadcrumbPageRecipe, { ...req, box: { w, h: 28 }, params: {}, density: "comfortable" })
      expect(f.layers).toEqual(["rest"])
      expect(nodes(f.parts.rest!)).toBeLessThanOrEqual(12)
      expect(f.parts.rest!.length).toBeLessThanOrEqual(8000)
    }
    const calm = runRecipe(breadcrumbPageRecipe, { ...req, box: { w: 88, h: 28 }, params: {}, density: "calm" })
    const rich = runRecipe(breadcrumbPageRecipe, { ...req, box: { w: 88, h: 28 }, params: {}, density: "comfortable" })
    expect(calm.parts.rest!.length).toBeLessThan(rich.parts.rest!.length)
  })

  it("draws sane markup at every size, density and tier", () => {
    for (const [w, h] of [[8, 28], [88, 28], [300, 30], [700, 40]]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const out = Object.values(runRecipe(breadcrumbPageRecipe, { ...req, box: { w, h }, params: {}, density, tier }).parts).join("")
          expect(out, `${w}x${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
  })
})
