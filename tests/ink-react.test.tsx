import * as React from "react"
import { StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { box, focusRing } from "@/lib/ink"
import {
  Ink, InkDefs, InkProvider, inkCache, inkFrame, mergeRefs, useDensity, useInk, useInkKnobs, useInkSeed, useMergedRef,
} from "@/lib/ink/react"
import {
  DEFAULT_KNOBS, bucketBox, defineRecipe, getRecipe, resolveKnobs, runRecipe, stableStringify, INK_LAYER_ORDER, type Recipe,
} from "@/lib/ink/recipes"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

const probe = defineRecipe<{ disabled?: boolean; tone?: string }>({
  id: "test-probe",
  layers: ["rest", "hover", "focus", "disabled"],
  lazy: ["focus"],
  pad: 8,
  draw(ink, { w, h }, { disabled }, ctx) {
    ctx.lazy("focus", (fink) => focusRing(fink, 0, 0, w, h, { r: 3 }))
    if (ctx.lazyOnly) return
    if (disabled) {
      ink.layer("disabled", () => box(ink, 0, 0, w, h, { pen: "pencil" }))
      return
    }
    ink.layer("rest", () => box(ink, 0, 0, w, h))
    ink.layer("hover", () => box(ink, 1, 1, w - 2, h - 2, { pen: "ink.fine" }))
  },
})

interface ProbeProps extends React.ComponentProps<"button"> {
  params?: { disabled?: boolean; tone?: string }
  seed?: string
  size?: readonly [number, number]
  layers?: "lazy" | "all"
  tier?: "lo" | "hi"
}

function Probe({ params = {}, seed, size, layers, tier, children = "Probe", ref, ...props }: ProbeProps) {
  const { hostRef, hostProps, node } = useInk({ recipe: probe, params, kind: "probe", seed, size, layers, tier })
  return (
    <button ref={useMergedRef<HTMLElement>(hostRef, ref as React.Ref<HTMLElement> | undefined)} {...hostProps} {...props} className="relative isolate">
      {node}
      {children}
    </button>
  )
}

let W = 120
let H = 36
const proto = HTMLElement.prototype
const descW = Object.getOwnPropertyDescriptor(proto, "offsetWidth")
const descH = Object.getOwnPropertyDescriptor(proto, "offsetHeight")
function mockBox(w: number, h: number) {
  W = w
  H = h
  Object.defineProperty(proto, "offsetWidth", { configurable: true, get: () => W })
  Object.defineProperty(proto, "offsetHeight", { configurable: true, get: () => H })
}

class FakeRO {
  static all: FakeRO[] = []
  observed = new Set<Element>()
  constructor(readonly cb: ResizeObserverCallback) {
    FakeRO.all.push(this)
  }
  observe(el: Element) {
    this.observed.add(el)
  }
  unobserve(el: Element) {
    this.observed.delete(el)
  }
  disconnect() {
    this.observed.clear()
  }
  static fire(el: Element) {
    for (const ro of FakeRO.all) if (ro.observed.has(el)) ro.cb([{ target: el } as ResizeObserverEntry], ro as unknown as ResizeObserver)
  }
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", FakeRO)
})
afterAll(() => {
  vi.unstubAllGlobals()
})
afterEach(() => {
  if (descW) Object.defineProperty(proto, "offsetWidth", descW)
  if (descH) Object.defineProperty(proto, "offsetHeight", descH)
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layerNames = (root: ParentNode) => Array.from(root.querySelectorAll("svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("defineRecipe", () => {
  it("registers by id and rejects malformed ids and undeclared lazy layers", () => {
    expect(getRecipe("test-probe")).toBe(probe)
    expect(() => defineRecipe({ id: "Bad_Id", layers: ["rest"], pad: 4, draw() {} })).toThrow(/kebab-case/)
    expect(() => defineRecipe({ id: "x-lazy", layers: ["rest"], lazy: ["focus"], pad: 4, draw() {} })).toThrow(/lazy layer/)
  })

  it("is pure: same request, byte-identical frame; another seed, another drawing", () => {
    const req = { box: { w: 120, h: 36 }, params: {}, seed: "a", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
    const a = runRecipe(probe, req)
    const b = runRecipe(probe, req)
    expect(a).toEqual(b)
    expect(runRecipe(probe, { ...req, seed: "b" }).parts.rest).not.toBe(a.parts.rest)
  })

  it("drops empty layers and paints in INK_LAYER_ORDER", () => {
    const f = runRecipe(probe, { box: { w: 100, h: 30 }, params: { disabled: true }, seed: "d", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
    expect(f.layers).toEqual(["disabled"])
    expect(f.parts.rest).toBeUndefined()
    const g = runRecipe(probe, { box: { w: 100, h: 30 }, params: {}, seed: "d", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS, lazy: ["focus"] })
    expect(g.layers).toEqual(["rest", "hover", "focus"])
    expect(INK_LAYER_ORDER.indexOf("rest")).toBeLessThan(INK_LAYER_ORDER.indexOf("focus"))
  })

  it("keys: stable JSON, buckets, density knobs", () => {
    expect(stableStringify({ b: 1, a: [2, { d: 1, c: undefined }] })).toBe(stableStringify({ a: [2, { d: 1 }], b: 1 }))
    expect(bucketBox(121, 37)).toEqual({ w: 120, h: 38 })
    expect(bucketBox(1, 1)).toEqual({ w: 4, h: 2 })
    expect(resolveKnobs(DEFAULT_KNOBS, "calm")).toEqual(DEFAULT_KNOBS)
    expect(resolveKnobs(DEFAULT_KNOBS, "compact").misreg).toBeLessThan(1)
  })

  it("uses only var(--ll-*) colors and no NaN", () => {
    const f = runRecipe(probe, { box: { w: 100, h: 30 }, params: {}, seed: "c", tier: "hi", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS, lazy: ["focus"] })
    const all = Object.values(f.parts).join("")
    expect(all).not.toMatch(/#[0-9a-f]{3,8}\b|NaN|undefined|Infinity/i)
    expect(all).toMatch(/var\(--ll-/)
  })
})

describe("memo", () => {
  const req = { box: { w: 140, h: 40 }, params: {}, seed: "memo-1", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }

  it("does not re-run the recipe for the same key, and buckets sizes", () => {
    const before = inkCache.stats()
    const a = inkFrame(probe, req)
    const b = inkFrame(probe, { ...req, box: { w: 141, h: 40 } })
    const c = inkFrame(probe, req)
    expect(b.key).toBe(a.key)
    expect(c.parts).toEqual(a.parts)
    expect(inkCache.stats().runs - before.runs).toBe(1)
    expect(inkCache.stats().hits - before.hits).toBe(2)
  })

  it("a different seed, tier, density, dir, params or size is a new drawing", () => {
    const before = inkCache.stats().runs
    const base = { ...req, seed: "memo-2" }
    inkFrame(probe, base)
    inkFrame(probe, { ...base, seed: "memo-3" })
    inkFrame(probe, { ...base, tier: "hi" })
    inkFrame(probe, { ...base, density: "compact" })
    inkFrame(probe, { ...base, dir: "rtl" })
    inkFrame(probe, { ...base, params: { tone: "x" } })
    inkFrame(probe, { ...base, box: { w: 160, h: 40 } })
    expect(inkCache.stats().runs - before).toBe(7)
  })

  it("calm density is always tier lo (hi and lo share one entry)", () => {
    const before = inkCache.stats().runs
    const a = inkFrame(probe, { ...req, seed: "memo-4", density: "calm", tier: "hi" })
    const b = inkFrame(probe, { ...req, seed: "memo-4", density: "calm", tier: "lo" })
    expect(a.key).toBe(b.key)
    expect(inkCache.stats().runs - before).toBe(1)
  })

  it("lazy layers: one extra run, byte-identical to generating them up front, cached afterwards", () => {
    const seed = "memo-lazy"
    const lazyFirst = inkFrame(probe, { ...req, seed, lazy: ["focus"] })
    const eagerKeyed = inkFrame(probe, { ...req, seed: "memo-lazy-2" })
    const r0 = inkCache.stats().runs
    const upgraded = inkFrame(probe, { ...req, seed: "memo-lazy-2", lazy: ["focus"] })
    expect(inkCache.stats().runs - r0).toBe(1)
    expect(eagerKeyed.layers).toEqual(["rest", "hover"])
    expect(upgraded.layers).toEqual(["rest", "hover", "focus"])
    const asked = inkFrame(probe, { ...req, seed, lazy: ["focus"] })
    expect(asked.parts.focus).toBe(lazyFirst.parts.focus)
    inkFrame(probe, { ...req, seed: "memo-lazy-2", lazy: ["focus"] })
    expect(inkCache.stats().runs - r0).toBe(1)
    const direct = runRecipe(probe, { ...req, seed: "memo-lazy-2", box: bucketBox(140, 40), lazy: ["focus"] })
    expect(upgraded.parts.focus).toBe(direct.parts.focus)
    expect(upgraded.parts.rest).toBe(direct.parts.rest)
  })

  it("a recipe defined again under the same id (hot reload) gets a new revision and never serves stale drawings", () => {
    const make = (tag: string) =>
      defineRecipe<Record<string, never>>({ id: "test-hmr", layers: ["rest"], pad: 4, draw(ink, { w, h }) { ink.layer("rest", () => box(ink, 0, 0, w, h, { pen: tag === "a" ? "ink" : "blue" })) } })
    const a = make("a")
    const b = make("b")
    expect(b.rev).toBe(a.rev + 1)
    const r = { box: { w: 100, h: 30 }, params: {}, seed: "hmr", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
    expect(inkFrame(a, r).parts.rest).not.toBe(inkFrame(b, r).parts.rest)
    expect(getRecipe("test-hmr")).toBe(b)
  })

  it("evicts least recently used frames when resized", () => {
    inkCache.resize({ max: 2 })
    for (const s of ["e1", "e2", "e3"]) inkFrame(probe, { ...req, seed: s })
    expect(inkCache.stats().size).toBeLessThanOrEqual(2)
    inkCache.resize({ max: 600 })
  })
})

describe("useInk on the server", () => {
  it("renders the host with data-ink-host and no svg before a measure", () => {
    const html = renderToString(<Probe />)
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("data-ink-ready")
    expect(html).not.toContain("<svg")
  })

  it("with an explicit size renders the exact final markup, byte-identical twice", () => {
    const a = renderToString(<Probe size={[120, 36]} seed="s" />)
    const b = renderToString(<Probe size={[120, 36]} seed="s" />)
    expect(a).toBe(b)
    expect(a).toContain('data-ink-ready=""')
    expect(a).toMatch(/<svg data-ink="probe" aria-hidden="true" focusable="false" class="pointer-events-none absolute"/)
    expect(a).toContain('viewBox="-8 -8 136 52"')
    expect(a).toContain('preserveAspectRatio="none"')
    expect(a).toContain("calc(100% + 16px)")
    expect(a.match(/data-layer="/g)).toHaveLength(2)
    expect(a).not.toContain('data-layer="focus"')
    expect(a).not.toMatch(/NaN|undefined|Infinity/)
  })

  it("useId seeds: the same tree on the server twice gives the same drawing; another seed differs", () => {
    const tree = (s?: string) => <Probe size={[120, 36]} seed={s} />
    expect(renderToString(tree())).toBe(renderToString(tree()))
    expect(renderToString(tree("one"))).not.toBe(renderToString(tree("two")))
  })

  it("tier hi and layers=all generate lazy layers up front", () => {
    expect(renderToString(<Probe size={[120, 36]} layers="all" />)).toContain('data-layer="focus"')
    expect(renderToString(<Probe size={[120, 36]} tier="hi" />)).toContain('data-layer="focus"')
    expect(renderToString(<Probe size={[120, 36]} tier="lo" />)).not.toContain('data-layer="focus"')
  })

  it("a disabled drawing is a static alternative: only the disabled layer, no rest", () => {
    const html = renderToString(<Probe size={[120, 36]} params={{ disabled: true }} />)
    expect(html).toContain('data-layer="disabled"')
    expect(html).not.toContain('data-layer="rest"')
  })
})

describe("useInk in the DOM", () => {
  it("measures the host in a layout effect, draws behind the content and marks the host ready", () => {
    mockBox(121, 37)
    const { getByRole } = render(<Probe />)
    const host = getByRole("button")
    expect(host).toHaveAttribute("data-ink-host")
    expect(host).toHaveAttribute("data-ink-ready")
    const svg = host.querySelector(":scope > svg[data-ink]") as SVGElement
    expect(svg).toBeTruthy()
    expect(svg.getAttribute("aria-hidden")).toBe("true")
    expect(svg.getAttribute("focusable")).toBe("false")
    expect(svg.getAttribute("viewBox")).toBe("-8 -8 136 54")
    expect(svg.style.zIndex).toBe("-1")
    expect(layerNames(host)).toEqual(["rest", "hover"])
    expectInkLayers(host, { min: 1, kinds: ["probe"], absolute: true })
  })

  it("draws nothing while the host has no size (display none, jsdom) and keeps the pre-measure marker", () => {
    mockBox(0, 0)
    const { getByRole } = render(<Probe />)
    expect(getByRole("button")).not.toHaveAttribute("data-ink-ready")
    expect(getByRole("button").querySelector("svg")).toBeNull()
  })

  it("re-render, StrictMode and remount with the same seed never re-run the recipe", () => {
    mockBox(160, 40)
    const r0 = inkCache.stats().runs
    const { rerender, unmount } = render(
      <StrictMode>
        <Probe seed="stable" />
      </StrictMode>,
    )
    const r1 = inkCache.stats().runs
    expect(r1 - r0).toBe(1)
    rerender(
      <StrictMode>
        <Probe seed="stable">Other label</Probe>
      </StrictMode>,
    )
    expect(inkCache.stats().runs).toBe(r1)
    unmount()
    render(<Probe seed="stable" />)
    expect(inkCache.stats().runs).toBe(r1)
  })

  it("remeasures through the shared ResizeObserver: a new bucket redraws, the same bucket does not", () => {
    mockBox(120, 36)
    const { getByRole } = render(<Probe seed="ro" />)
    const host = getByRole("button")
    expect(FakeRO.all.some((ro) => ro.observed.has(host))).toBe(true)
    const before = inkCache.stats().runs
    mockBox(121, 36)
    act(() => FakeRO.fire(host))
    expect(inkCache.stats().runs).toBe(before)
    mockBox(200, 36)
    act(() => FakeRO.fire(host))
    expect(inkCache.stats().runs).toBe(before + 1)
    expect(host.querySelector("svg")?.getAttribute("viewBox")).toBe("-8 -8 216 52")
  })

  it("uses ONE ResizeObserver for many hosts", () => {
    mockBox(100, 30)
    const n = FakeRO.all.length
    render(
      <>
        <Probe seed="m1" />
        <Probe seed="m2" />
        <Probe seed="m3" />
      </>,
    )
    expect(FakeRO.all.length).toBe(n === 0 ? 1 : n)
  })

  it("adds the lazy focus layer on the first focusin, without touching the other layers, and keeps it", () => {
    mockBox(120, 36)
    const { getByRole } = render(<Probe seed="lazy" />)
    const host = getByRole("button")
    const rest = host.querySelector('[data-layer="rest"]')
    expect(layerNames(host)).toEqual(["rest", "hover"])
    vi.spyOn(host, "matches").mockImplementation(() => true)
    act(() => {
      host.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
    })
    expect(layerNames(host)).toEqual(["rest", "hover", "focus"])
    expect(host.querySelector('[data-layer="rest"]')).toBe(rest)
    act(() => {
      host.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
    })
    expect(layerNames(host)).toEqual(["rest", "hover", "focus"])
  })

  it("a focus that is not :focus-visible (a mouse click) does not pay for the ring", () => {
    mockBox(120, 36)
    const { getByRole } = render(<Probe seed="lazy-mouse" />)
    const host = getByRole("button")
    vi.spyOn(host, "matches").mockImplementation(() => false)
    act(() => {
      host.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
    })
    expect(layerNames(host)).toEqual(["rest", "hover"])
  })

  it("an element focused before it mounted gets its ring", () => {
    mockBox(120, 36)
    const spy = vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, sel: string) {
      return sel === ":focus-visible"
    })
    const { getByRole } = render(<Probe seed="autofocus" autoFocus />)
    spy.mockRestore()
    expect(getByRole("button")).toHaveFocus()
    expect(layerNames(getByRole("button"))).toContain("focus")
  })

  it("tier hi and layers=all draw the ring up front", () => {
    mockBox(120, 36)
    const { getByRole } = render(<Probe seed="all" layers="all" />)
    expect(layerNames(getByRole("button"))).toEqual(["rest", "hover", "focus"])
  })

  it("still hosts still work with a user ref and handlers", async () => {
    mockBox(120, 36)
    const ref = React.createRef<HTMLButtonElement>()
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(<Probe ref={ref} seed="ref" onClick={onClick} />)
    expect(ref.current).toBe(getByRole("button"))
    await user.click(getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("is accessible: the drawing is aria-hidden and never focusable", async () => {
    mockBox(120, 36)
    const { container } = render(<Probe seed="axe" layers="all" />)
    await axeCheck(container)
    expect(container.querySelector("svg")?.querySelector("a,button,input,[tabindex]")).toBeNull()
  })

  it("detects rtl from the nearest dir attribute and hands it to the recipe", () => {
    mockBox(120, 36)
    const dirs: string[] = []
    const rec = defineRecipe<Record<string, never>>({
      id: "test-dir",
      layers: ["rest"],
      pad: 4,
      draw(ink, { w, h }, _p, ctx) {
        dirs.push(ctx.dir)
        ink.layer("rest", () => box(ink, 0, 0, w, h))
      },
    })
    function D() {
      const { hostRef, hostProps, node } = useInk({ recipe: rec, params: {}, seed: "dir" })
      return (
        <div ref={hostRef} {...hostProps}>
          {node}
        </div>
      )
    }
    render(<D />)
    expect(dirs.at(-1)).toBe("ltr")
    render(
      <div dir="rtl">
        <D />
      </div>,
    )
    expect(dirs.at(-1)).toBe("rtl")
  })
})

describe("hydration", () => {
  function hydrate(ui: React.ReactElement) {
    const container = document.createElement("div")
    document.body.appendChild(container)
    container.innerHTML = renderToString(ui)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined
    act(() => {
      root = hydrateRoot(container, ui)
    })
    const calls = errors.mock.calls.map((c) => String(c[0]))
    errors.mockRestore()
    return { container, calls, unmount: () => act(() => root?.unmount()) }
  }

  it("a host with an explicit size hydrates without warnings and keeps its drawing", () => {
    mockBox(120, 36)
    const { container, calls, unmount } = hydrate(<Probe size={[120, 36]} seed="h1" />)
    expect(calls).toEqual([])
    expect(container.querySelectorAll("svg[data-ink]")).toHaveLength(1)
    unmount()
    container.remove()
  })

  it("a host without a size hydrates, then measures and draws", () => {
    mockBox(120, 36)
    const ui = <Probe seed="h2" />
    const container = document.createElement("div")
    document.body.appendChild(container)
    container.innerHTML = renderToString(ui)
    expect(container.querySelector("svg")).toBeNull()
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined
    act(() => {
      root = hydrateRoot(container, ui)
    })
    expect(errors.mock.calls).toEqual([])
    errors.mockRestore()
    expect(container.querySelector("svg[data-ink]")).toBeTruthy()
    expect(container.querySelector("[data-ink-ready]")).toBeTruthy()
    act(() => root?.unmount())
    container.remove()
  })

  it("useId based seeds agree between the server render and hydration", () => {
    mockBox(120, 36)
    function Seeded() {
      const s = useInkSeed()
      return <span data-seed={s} />
    }
    const container = document.createElement("div")
    document.body.appendChild(container)
    container.innerHTML = renderToString(<Seeded />)
    const server = container.querySelector("span")?.getAttribute("data-seed")
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined
    act(() => {
      root = hydrateRoot(container, <Seeded />)
    })
    expect(errors.mock.calls).toEqual([])
    errors.mockRestore()
    expect(container.querySelector("span")?.getAttribute("data-seed")).toBe(server)
    act(() => root?.unmount())
    container.remove()
  })
})

describe("<Ink/>", () => {
  it("marks its parent as the host and draws for it", () => {
    mockBox(120, 36)
    const { getByTestId } = render(
      <div data-testid="host" className="relative isolate">
        <Ink recipe={probe} params={{}} kind="probe" seed="ink-c" />
        content
      </div>,
    )
    const host = getByTestId("host")
    expect(host).toHaveAttribute("data-ink-host")
    expect(host).toHaveAttribute("data-ink-ready")
    expect(layerNames(host)).toEqual(["rest", "hover"])
  })

  it("renders an identical empty svg on the server and unmarks the host on unmount", () => {
    const html = renderToString(
      <div>
        <Ink recipe={probe} params={{}} kind="probe" seed="ink-s" />
      </div>,
    )
    expect(html).toMatch(/<svg data-ink="probe" aria-hidden="true" focusable="false"/)
    expect(html).not.toContain("data-layer")
    mockBox(120, 36)
    const { getByTestId, unmount } = render(
      <div data-testid="host2">
        <Ink recipe={probe} params={{}} kind="probe" seed="ink-c2" />
      </div>,
    )
    const host = getByTestId("host2")
    unmount()
    expect(host).not.toHaveAttribute("data-ink-host")
  })
})

describe("InkProvider and InkDefs", () => {
  it("renders a display:contents wrapper with the scope and density attributes", () => {
    const { container } = render(
      <InkProvider density="calm" theme="forest" motion="reduced" textures={false}>
        <span>x</span>
      </InkProvider>,
    )
    const wrap = container.querySelector("[data-ll-scope]") as HTMLElement
    expect(wrap.style.display).toBe("contents")
    expect(wrap.getAttribute("data-density")).toBe("calm")
    expect(wrap.getAttribute("data-theme")).toBe("forest")
    expect(wrap.getAttribute("data-motion")).toBe("reduced")
  })

  it("mounts the grain masks once, even if InkDefs is rendered again", () => {
    render(
      <InkProvider textures={false}>
        <InkDefs />
        <InkDefs />
      </InkProvider>,
    )
    expect(document.querySelectorAll("[data-ll-defs]")).toHaveLength(1)
    expect(document.getElementById("ll-felt-0")).toBeTruthy()
    expect(document.getElementById("ll-graphite-5")).toBeTruthy()
    const svg = document.querySelector("[data-ll-defs]") as SVGElement
    expect(svg.getAttribute("aria-hidden")).toBe("true")
    expect(svg.getAttribute("width")).toBe("0")
    expect(svg.style.display).not.toBe("none")
  })

  it("InkDefs can also define the paper tiles as svg patterns", () => {
    render(<InkDefs patterns={["relief", "fibre"]} />)
    expect(document.getElementById("ll-tex-relief")).toBeTruthy()
    expect(document.getElementById("ll-tex-fibre-2")).toBeTruthy()
    expect(document.getElementById("ll-tex-linen")).toBeNull()
  })

  it("useInk without a provider or InkDefs injects the masks once", () => {
    mockBox(120, 36)
    render(
      <>
        <Probe seed="np1" />
        <Probe seed="np2" />
      </>,
    )
    expect(document.querySelectorAll("[data-ll-defs]")).toHaveLength(1)
    expect(document.getElementById("ll-felt-0")).toBeTruthy()
  })

  it("useInk under a provider does not inject a second copy", () => {
    mockBox(120, 36)
    render(
      <InkProvider textures={false}>
        <Probe seed="wp1" />
      </InkProvider>,
    )
    expect(document.querySelectorAll("[data-ll-defs]")).toHaveLength(1)
  })

  it("injects no paper / desk tiles by default: Paper brings its own", () => {
    render(
      <InkProvider defs={false}>
        <span />
      </InkProvider>,
    )
    expect(Array.from(document.head.querySelectorAll("style")).filter((s) => s.textContent?.includes("--ll-tex-"))).toHaveLength(0)
  })

  it("`textures` opts in: all tiles, or a chosen few, one deduped <style> per tile in <head>", () => {
    render(
      <>
        <InkProvider defs={false} textures={["linen", "mottle"]}>
          <span />
        </InkProvider>
        <InkProvider defs={false} textures={["linen"]}>
          <span />
        </InkProvider>
      </>,
    )
    const has = (name: string) => Array.from(document.head.querySelectorAll("style")).filter((s) => s.textContent?.includes(`--ll-tex-${name}:`))
    expect(has("linen")).toHaveLength(1)
    expect(has("mottle")).toHaveLength(1)
    expect(has("relief")).toHaveLength(0)
  })

  it("`textures` true injects every tile", () => {
    render(
      <InkProvider defs={false} textures>
        <span />
      </InkProvider>,
    )
    for (const name of ["relief", "slip", "fibre", "cloud", "mottle", "linen", "kraft"]) {
      expect(Array.from(document.head.querySelectorAll("style")).some((s) => s.textContent?.includes(`--ll-tex-${name}:`)), name).toBe(true)
    }
  })

  it("passes density to hooks, and density changes the drawing key", () => {
    mockBox(120, 36)
    let seen = ""
    function Spy() {
      seen = useDensity()
      return null
    }
    const { rerender } = render(
      <InkProvider density="compact" defs={false} textures={false}>
        <Spy />
        <Probe seed="dens" />
      </InkProvider>,
    )
    expect(seen).toBe("compact")
    const compact = document.querySelector("svg[data-ink] g[data-layer='rest']")?.innerHTML
    rerender(
      <InkProvider density="calm" defs={false} textures={false}>
        <Spy />
        <Probe seed="dens" />
      </InkProvider>,
    )
    expect(seen).toBe("calm")
    const svg = document.querySelector("svg[data-ink]") as SVGElement
    expect(svg.hasAttribute("data-still")).toBe(true)
    expect(svg.querySelector("g[data-layer='rest']")?.innerHTML).not.toBe(compact)
  })

  it("reads the theme knobs from CSS once and again when data-theme changes", async () => {
    mockBox(120, 36)
    const style = document.createElement("style")
    style.textContent = "[data-ll-scope]{--ll-wobble:1}[data-theme='wild'] [data-ll-scope],[data-theme='wild']{--ll-wobble:2}"
    document.head.appendChild(style)
    const calls: number[] = []
    const rec = defineRecipe<Record<string, never>>({
      id: "test-knobs",
      layers: ["rest"],
      pad: 4,
      draw(ink, { w, h }, _p, ctx) {
        calls.push(ctx.knobs.wobble)
        ink.layer("rest", () => box(ink, 0, 0, w, h))
      },
    })
    function K() {
      const { hostRef, hostProps, node } = useInk({ recipe: rec, params: {}, seed: "k" })
      return (
        <div ref={hostRef} {...hostProps}>
          {node}
        </div>
      )
    }
    render(
      <InkProvider defs={false} textures={false}>
        <K />
      </InkProvider>,
    )
    expect(calls.at(-1)).toBe(1)
    await act(async () => {
      document.documentElement.setAttribute("data-theme", "wild")
      await Promise.resolve()
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    document.documentElement.removeAttribute("data-theme")
    style.remove()
    expect(calls.at(-1)).toBe(2)
  })
})

describe("refs", () => {
  it("mergeRefs forwards to callback and object refs and runs the cleanups", () => {
    const seen: unknown[] = []
    const obj = { current: null as HTMLElement | null }
    const cb = (el: HTMLElement | null) => {
      seen.push(el)
    }
    const merged = mergeRefs<HTMLElement>(cb, obj, undefined, null)
    const el = document.createElement("i")
    const cleanup = merged(el) as () => void
    expect(obj.current).toBe(el)
    expect(seen).toEqual([el])
    cleanup()
    expect(obj.current).toBeNull()
    expect(seen).toEqual([el, null])
  })
})

export type _Recipe = Recipe<unknown>

describe("InkProvider: knobs memo and direction (audit 4.7, 4.14)", () => {
  it("an inline `knobs` literal does not make a new context value, so no host redraws when the parent renders", () => {
    mockBox(120, 36)
    const seen = new Set<unknown>()
    function Spy() {
      seen.add(useInkKnobs())
      return null
    }
    const App = ({ n }: { n: number }) => (
      <InkProvider defs={false} knobs={{ wobble: 1.5 }}>
        <Spy />
        <span>{n}</span>
      </InkProvider>
    )
    const { rerender } = render(<App n={1} />)
    rerender(<App n={2} />)
    rerender(<App n={3} />)
    expect(seen.size).toBe(1)
    rerender(
      <InkProvider defs={false} knobs={{ wobble: 2 }}>
        <Spy />
      </InkProvider>,
    )
    expect(seen.size).toBe(2)
  })

  it("under a provider, toggling <html dir> at runtime redraws direction-aware art", async () => {
    mockBox(120, 36)
    const dirs: string[] = []
    const rec = defineRecipe<Record<string, never>>({
      id: "test-dir-follow",
      layers: ["rest"],
      pad: 4,
      draw(ink, { w, h }, _p, ctx) {
        dirs.push(ctx.dir)
        ink.layer("rest", () => box(ink, 0, 0, w, h))
      },
    })
    function D() {
      const { hostRef, hostProps, node } = useInk({ recipe: rec, params: {}, seed: "dir-follow" })
      return (
        <div ref={hostRef} {...hostProps}>
          {node}
        </div>
      )
    }
    document.documentElement.setAttribute("dir", "ltr")
    render(
      <InkProvider defs={false}>
        <D />
      </InkProvider>,
    )
    expect(dirs.at(-1)).toBe("ltr")
    inkCache.clear()
    await act(async () => {
      document.documentElement.setAttribute("dir", "rtl")
      await Promise.resolve()
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(dirs.at(-1)).toBe("rtl")
    inkCache.clear()
    await act(async () => {
      document.documentElement.setAttribute("dir", "ltr")
      await Promise.resolve()
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    document.documentElement.removeAttribute("dir")
    expect(dirs.at(-1)).toBe("ltr")
  })

  it("a host inside a `dir` island keeps the island's direction under an ltr provider", () => {
    mockBox(120, 36)
    const dirs: string[] = []
    const rec = defineRecipe<Record<string, never>>({
      id: "test-dir-island",
      layers: ["rest"],
      pad: 4,
      draw(ink, { w, h }, _p, ctx) {
        dirs.push(ctx.dir)
        ink.layer("rest", () => box(ink, 0, 0, w, h))
      },
    })
    function D() {
      const { hostRef, hostProps, node } = useInk({ recipe: rec, params: {}, seed: "dir-island" })
      return (
        <div ref={hostRef} {...hostProps}>
          {node}
        </div>
      )
    }
    render(
      <InkProvider defs={false}>
        <div dir="rtl">
          <D />
        </div>
      </InkProvider>,
    )
    expect(dirs.at(-1)).toBe("rtl")
  })
})
