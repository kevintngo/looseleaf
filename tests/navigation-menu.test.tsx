import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { navBaselineRecipe, navTabRecipe, underlineMark } from "@/lib/ink/recipes/navigation-menu-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Demo({ root, indicator = false }: { root?: Partial<React.ComponentProps<typeof NavigationMenu>>; indicator?: boolean }) {
  return (
    <NavigationMenu aria-label="Main" {...root}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#home" active>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1">
              <li>
                <NavigationMenuLink href="#intro">
                  <span>Introduction</span>
                  <span>Re-usable components.</span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild active>
                  <a href="#install">Installation</a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#alert">Alert</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a href="#docs">Docs</a>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {indicator ? <NavigationMenuIndicator /> : null}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const layers = (el: Element) => Array.from(el.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("NavigationMenu strip", () => {
  it("is a labeled nav with upstream's slots; the list stands its tabs on a pencil line it hosts", () => {
    const { container, getByRole } = renderUI(<Demo />)
    const nav = getByRole("navigation", { name: "Main" })
    expect(nav).toHaveAttribute("data-slot", "navigation-menu")
    expect(nav).toHaveAttribute("data-viewport", "true")
    expect(nav).toHaveClass("group/navigation-menu", "relative")
    const list = container.querySelector<HTMLElement>('[data-slot="navigation-menu-list"]')!
    expect(list.tagName).toBe("UL")
    expect(list).toHaveAttribute("data-ink-host")
    const rule = list.querySelector(":scope > svg[data-ink=rule]")!
    expect(rule).toHaveClass("absolute", "pointer-events-none")
    expect(Array.from(rule.querySelectorAll(":scope > g[data-layer]")).map((g) => g.getAttribute("data-layer"))).toEqual(["rest"])
    expect(container.querySelectorAll('[data-slot="navigation-menu-item"]')).toHaveLength(4)
  })

  it("a trigger is a button and the ink host of its tab: a pencil sketch at rest, a lazy focus ring, a chevron that turns over", () => {
    const { getByRole } = renderUI(<Demo />)
    const t = getByRole("button", { name: "Getting started" })
    expect(t).toHaveAttribute("data-slot", "navigation-menu-trigger")
    expect(t).toHaveAttribute("aria-expanded", "false")
    expect(t).toHaveAttribute("data-state", "closed")
    expect(t).toHaveAttribute("data-ink-host")
    expect(t).toHaveAttribute("data-ink-ready")
    expectInkLayers(t, { min: 1, kinds: ["tab", "icon"], layers: ["rest", "hover", "open"] })
    expect(layers(t)).toEqual(["rest", "open", "hover"])
    expect(t.querySelector('svg[data-icon="chevron-down"]')).toBeTruthy()
    expect(t.querySelector('svg[data-icon="chevron-down"]')!.getAttribute("class")).toContain("group-data-[state=open]:rotate-180")
  })

  it("wakes the focus ring on the first keyboard focus", async () => {
    const { getByRole, user } = renderUI(<Demo />, opts)
    const home = getByRole("link", { name: "Home" })
    expect(layers(home)).not.toContain("focus")
    await user.tab()
    expect(home).toHaveFocus()
    await waitFor(() => expect(layers(home)).toContain("focus"))
    const t = getByRole("button", { name: "Getting started" })
    vi.spyOn(t, "matches").mockImplementation((sel: string) => (sel === ":focus-visible" ? true : Element.prototype.matches.call(t, sel)))
    t.focus()
    await waitFor(() => expect(layers(t)).toContain("focus"))
  })

  it("a top-level link is a tab too; the current page is filled (data-selected + the checked layer) and has aria-current", () => {
    const { getByRole } = renderUI(<Demo />)
    const home = getByRole("link", { name: "Home" })
    expect(home).toHaveAttribute("data-slot", "navigation-menu-link")
    expect(home).toHaveAttribute("aria-current", "page")
    expect(home).toHaveAttribute("data-active")
    expect(home).toHaveAttribute("data-selected")
    expect(home).toHaveAttribute("data-ink-host")
    expect(layers(home)).toEqual(["rest", "checked", "hover"])
    const docs = getByRole("link", { name: "Docs" })
    expect(docs).not.toHaveAttribute("data-selected")
    expect(docs).toHaveAttribute("href", "#docs")
    expect(docs.querySelector(":scope > svg[data-ink=tab]")).toBeTruthy()
    expect(docs.tagName).toBe("A")
  })

  it("navigationMenuTriggerStyle is exported and lays a tab out", () => {
    const cls = navigationMenuTriggerStyle()
    expect(cls).toContain("h-9")
    expect(cls).toContain("font-hand")
    expect(cls).toContain("data-[state=open]:-translate-y-0.5")
  })
})

describe("NavigationMenu panels", () => {
  it("clicking a trigger drops the panel as a slip of paper (a CSS sheet) in the shared viewport, and the panel's links are rows, not tabs", async () => {
    const { getByRole, user, container } = renderUI(<Demo />, opts)
    const t = getByRole("button", { name: "Getting started" })
    await user.click(t)
    expect(t).toHaveAttribute("aria-expanded", "true")
    expect(t).toHaveAttribute("data-state", "open")
    const intro = await screen.findByRole("link", { name: /Introduction/ })
    const frame = container.querySelector<HTMLElement>('[data-slot="navigation-menu-viewport-frame"]')!
    expect(frame).toHaveClass("ll-paper", "ll-stock-slip", "z-(--ll-z-popover)", "empty:hidden")
    expect(frame).toHaveAttribute("data-edge", "cut")
    expect(frame.querySelector(':scope > svg[data-ink="sheet"]')).toBeNull()
    const viewport = frame.querySelector<HTMLElement>(':scope > [data-slot="navigation-menu-viewport"]')!
    expect(viewport).toBeTruthy()
    expect(viewport).toHaveAttribute("data-state", "open")
    expect(viewport.className).toContain("overflow-hidden")
    expect(viewport.contains(intro)).toBe(true)
    expect(intro.hasAttribute("data-ink-host")).toBe(false)
    expect(intro.className).toContain("hover:ll-swipe")
    const install = screen.getByRole("link", { name: "Installation" })
    expect(install).toHaveAttribute("aria-current", "page")
    expect(install.className).toContain("data-[active]:ll-swipe")
    expect(container.querySelector('[data-slot="navigation-menu-content"]')!.className).toContain("md:absolute")
  })

  it("the open trigger shows the open layer state, Escape closes the panel and returns focus to the trigger", async () => {
    const { getByRole, user } = renderUI(<Demo />, opts)
    const t = getByRole("button", { name: "Getting started" })
    await user.click(t)
    await screen.findByRole("link", { name: /Introduction/ })
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("link", { name: /Introduction/ })).toBeNull())
    expect(t).toHaveAttribute("aria-expanded", "false")
    expect(t).toHaveFocus()
  })

  it("keyboard: arrows walk the tabs, Enter opens, ArrowDown steps into the panel, Tab leaves", async () => {
    const { getByRole, user } = renderUI(<Demo />, opts)
    getByRole("link", { name: "Home" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(getByRole("button", { name: "Getting started" })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(getByRole("button", { name: "Components" })).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    await user.keyboard("{Enter}")
    await screen.findByRole("link", { name: /Introduction/ })
    await user.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("link", { name: /Introduction/ })).toHaveFocus())
  })

  it("opening another tab while one is open swaps the panel inside the same viewport", async () => {
    const { getByRole, user, container } = renderUI(<Demo />, opts)
    await user.click(getByRole("button", { name: "Getting started" }))
    await screen.findByRole("link", { name: /Introduction/ })
    await user.keyboard("{ArrowRight}{Enter}")
    expect(await screen.findByRole("link", { name: "Alert" })).toBeInTheDocument()
    expect(getByRole("button", { name: "Components" })).toHaveAttribute("data-state", "open")
    expect(getByRole("button", { name: "Getting started" })).toHaveAttribute("data-state", "closed")
    expect(container.querySelectorAll('[data-slot="navigation-menu-viewport"]')).toHaveLength(1)
  })

  it("the felt-tip underline is there while a panel is open: an intrinsic drawing stretched to the tab under it", async () => {
    const RO = globalThis.ResizeObserver
    globalThis.ResizeObserver = class {
      constructor(private cb: () => void) {}
      observe() {
        this.cb()
      }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
    try {
      const { getByRole, user, container } = renderUI(<Demo indicator />, opts)
      expect(container.querySelector('[data-slot="navigation-menu-indicator"]')).toBeNull()
      await user.click(getByRole("button", { name: "Getting started" }))
      const ind = await waitFor(() => {
        const el = container.querySelector<HTMLElement>('[data-slot="navigation-menu-indicator"]')
        expect(el).not.toBeNull()
        return el!
      })
      expect(ind).toHaveAttribute("data-state", "visible")
      expect(ind.className).toContain("transition-[transform,width]")
      expect(ind.style.width).toBe("120px")
      const svg = ind.querySelector<SVGElement>("svg[data-ink=prop]")!
      expect(svg).toHaveAttribute("preserveAspectRatio", "none")
      expect(svg).toHaveAttribute("width", "100%")
      expect(svg).toHaveAttribute("aria-hidden", "true")
    } finally {
      globalThis.ResizeObserver = RO
    }
  })

  it("viewport={false} gives each panel a slip of its own under its tab (CSS classes) and no shared viewport", async () => {
    const { getByRole, user, container } = renderUI(<Demo root={{ viewport: false }} />, opts)
    const nav = getByRole("navigation", { name: "Main" })
    expect(nav).toHaveAttribute("data-viewport", "false")
    expect(container.querySelector('[data-slot="navigation-menu-viewport"]')).toBeNull()
    await user.click(getByRole("button", { name: "Getting started" }))
    await screen.findByRole("link", { name: /Introduction/ })
    const content = container.querySelector<HTMLElement>('[data-slot="navigation-menu-content"]')!
    expect(content.className).toContain("group-data-[viewport=false]/navigation-menu:ll-paper")
    expect(content.className).toContain("group-data-[viewport=false]/navigation-menu:ll-stock-slip")
    expect(content.className).toContain("group-data-[viewport=false]/navigation-menu:absolute!")
    expect(document.querySelector('style[data-href="ll-tex-slip"]')).not.toBeNull()
  })

  it("passes stuff through: className on the root, a disabled trigger is dashed and inert", async () => {
    const { getByRole, user } = renderUI(
      <NavigationMenu className="w-full" aria-label="x">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger disabled>Nope</NavigationMenuTrigger>
            <NavigationMenuContent>Never</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
      opts
    )
    expect(getByRole("navigation")).toHaveClass("w-full")
    const t = getByRole("button", { name: "Nope" })
    expect(t).toBeDisabled()
    expect(layers(t)).toEqual(["disabled"])
    await user.click(t)
    expect(screen.queryByText("Never")).toBeNull()
  })
})

describe("NavigationMenu rendering", () => {
  it("has no axe violations closed and open", async () => {
    const { getByRole, user, container } = renderUI(<Demo indicator />, opts)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Getting started" }))
    await screen.findByRole("link", { name: /Introduction/ })
    await axeCheck(container)
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = <Demo indicator />
    const html = renderToString(tree)
    expect(renderToString(tree)).toBe(html)
    expect(html.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/\bNaN\b|\bundefined\b/)
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

  it("mounts under StrictMode", () => {
    const { getByRole } = renderUI(
      <React.StrictMode>
        <Demo />
      </React.StrictMode>
    )
    expect(within(getByRole("navigation")).getAllByRole("button")).toHaveLength(2)
  })
})

describe("navigation-menu recipes", () => {
  const req = { seed: "s", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: object, w = 120, h = 36, extra: object = {}) => runRecipe(navTabRecipe, { ...req, box: { w, h }, params: params as never, density: "comfortable", ...extra })

  it("a trigger draws rest, open and hover; a link rest, checked and hover; the focus ring is lazy; disabled is a static alternative", () => {
    expect(run({ role: "trigger" }).layers).toEqual(["rest", "open", "hover"])
    expect(run({ role: "link" }).layers).toEqual(["rest", "checked", "hover"])
    expect(run({ role: "trigger" }, 120, 36, { lazy: ["focus"] }).layers).toEqual(["rest", "open", "hover", "focus"])
    expect(run({ role: "trigger", disabled: true }).layers).toEqual(["disabled"])
  })

  it("never leaves the rest layer empty, in any density (an empty rest would show the open / checked layers all the time)", () => {
    for (const density of ["comfortable", "compact", "calm"] as const) {
      for (const role of ["trigger", "link"] as const) {
        const f = run({ role }, 120, 36, { density })
        expect(f.layers[0], `${density}/${role}`).toBe("rest")
        expect(f.parts.rest!.length).toBeGreaterThan(100)
      }
    }
  })

  it("the sketch hides while the tab is on, so the filled tab does not sit on top of it", () => {
    expect(run({ role: "trigger" }).parts.rest).toContain('data-hide-on="open"')
    expect(run({ role: "link" }).parts.rest).toContain('data-hide-on="checked"')
  })

  it("lo tier budget: each visible layer is at most 12 nodes and 8 KB", () => {
    for (const w of [60, 120, 220]) {
      for (const role of ["trigger", "link"] as const) {
        const f = run({ role }, w)
        for (const [k, v] of Object.entries(f.parts)) {
          expect(nodes(v!), `${w}/${role}/${k}`).toBeLessThanOrEqual(12)
          expect(v!.length, `${w}/${role}/${k}`).toBeLessThanOrEqual(8000)
        }
      }
    }
  })

  it("draws sane markup at every size, density, tier and direction", () => {
    for (const [w, h] of [[24, 28], [120, 36], [300, 32]]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const dir of ["ltr", "rtl"] as const) {
            for (const params of [{ role: "trigger" }, { role: "link" }, { role: "link", disabled: true }]) {
              const out = Object.values(run(params, w, h, { density, tier, dir, lazy: ["focus"] }).parts).join("")
              expect(out, `${w}x${h}/${density}/${tier}/${dir}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
            }
          }
        }
      }
      const base = Object.values(runRecipe(navBaselineRecipe, { ...req, box: { w: w * 5, h }, params: {}, density: "comfortable" }).parts).join("")
      expect(base).not.toMatch(/NaN|undefined|Infinity/)
    }
  })

  it("underlineMark is deterministic intrinsic art of a fixed height", () => {
    const a = underlineMark("u")
    expect(underlineMark("u").svg).toBe(a.svg)
    expect(underlineMark("v").svg).not.toBe(a.svg)
    expect(a.h).toBe(8)
    expect(a.svg).not.toMatch(/NaN|undefined|#[0-9a-f]{3,8}\b/i)
    expect(underlineMark("u", { calm: true }).svg.length).toBeLessThan(a.svg.length)
  })
})
