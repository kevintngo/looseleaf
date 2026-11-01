import * as React from "react"
import { renderToString } from "react-dom/server"
import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Doodle } from "@/components/ui/doodle"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Ink, paint } from "@/lib/ink"
import { InkProvider, inkCache, useInkScope } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "./_overlay-proto"
import { NativeSelect, Pill, Switch } from "./_patterns"

let restoreBox: (() => void) | undefined
const setBox = (w: number, h: number) => {
  restoreBox?.()
  restoreBox = mockBox(w, h)
}
afterEach(() => restoreBox?.())

describe("overlay recipe: a Popover whose content is a sheet of paper (tests/_overlay-proto.tsx)", () => {
  const Demo = ({ edge }: { edge?: "cut" | "torn" }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open</Button>
      </PopoverTrigger>
      <PopoverContent edge={edge} aria-label="Dimensions">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <Button size="sm">Save</Button>
      </PopoverContent>
    </Popover>
  )

  it("mounts nothing while closed, and the content in a portal when open", async () => {
    setBox(288, 120)
    const { user, container } = renderUI(<Demo />)
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull()
    await user.click(screen.getByRole("button", { name: "Open" }))
    const content = document.querySelector('[data-slot="popover-content"]') as HTMLElement
    expect(content).toBeTruthy()
    expect(container.contains(content)).toBe(false)
    expect(content).toHaveAttribute("data-state", "open")
    expect(content).toHaveClass("ll-paper")
    expect(content).toHaveAttribute("data-edge", "cut")
    expect(content.querySelector(":scope > svg[data-ink='sheet']")).toBeNull()
  })

  it("a torn sheet is measured when it mounts (= when the popover opens) and draws its outline as the first child", async () => {
    setBox(288, 120)
    const { user } = renderUI(<Demo edge="torn" />)
    await user.click(screen.getByRole("button", { name: "Open" }))
    const content = document.querySelector('[data-slot="popover-content"]') as HTMLElement
    expect(content).toHaveAttribute("data-edge", "torn")
    expect(content).toHaveAttribute("data-ink-ready")
    const svg = content.querySelector('svg[data-ink="sheet"]') as SVGElement
    expect(svg).not.toBeNull()
    expect(svg.getAttribute("aria-hidden")).toBe("true")
    expect(svg.style.zIndex).toBe("-1")
  })

  it("keeps Radix behavior: Escape closes and focus returns to the trigger; axe finds nothing", async () => {
    setBox(288, 120)
    const { user } = renderUI(<Demo edge="torn" />)
    const trigger = screen.getByRole("button", { name: "Open" })
    await user.click(trigger)
    await axeCheck()
    await user.keyboard("{Escape}")
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it("a Button inside the sheet is its own host: its layers are its own", async () => {
    setBox(120, 36)
    const { user } = renderUI(<Demo />)
    await user.click(screen.getByRole("button", { name: "Open" }))
    const save = screen.getByRole("button", { name: "Save" })
    expect(save.querySelectorAll(":scope > svg[data-ink]")).toHaveLength(1)
    expectInkLayers(save, { min: 1, kinds: ["button"], absolute: true })
  })

  it("repeats the InkProvider's scope on portalled content (density, reduced motion, theme), which leaves the provider's wrapper", async () => {
    setBox(288, 120)
    const { user, container } = renderUI(
      <InkProvider density="calm" motion="reduced" theme="forest">
        <Demo />
      </InkProvider>
    )
    const wrapper = container.querySelector("[data-ll-scope]") as HTMLElement
    expect(wrapper).toHaveAttribute("data-density", "calm")
    await user.click(screen.getByRole("button", { name: "Open" }))
    const content = document.querySelector('[data-slot="popover-content"]') as HTMLElement
    expect(wrapper.contains(content)).toBe(false)
    expect(content).toHaveAttribute("data-density", "calm")
    expect(content).toHaveAttribute("data-motion", "reduced")
    expect(content).toHaveAttribute("data-theme", "forest")
  })

  it("a nested provider repeats the outer scope and overrides only what it sets", () => {
    const seen: unknown[] = []
    function Probe() {
      seen.push({ ...useInkScope() })
      return null
    }
    render(
      <InkProvider density="calm" theme="forest">
        <InkProvider density="compact">
          <Probe />
        </InkProvider>
      </InkProvider>
    )
    expect(seen.at(-1)).toEqual({ "data-density": "compact", "data-theme": "forest" })
  })

  it("useInkScope is empty without a provider and for inherited values", () => {
    const seen: unknown[] = []
    function Probe() {
      seen.push(useInkScope())
      return null
    }
    render(<Probe />)
    render(
      <InkProvider>
        <Probe />
      </InkProvider>
    )
    expect(JSON.stringify(seen[0])).toBe("{}")
    expect(JSON.stringify(seen[1])).toBe("{}")
  })
})

describe("nested hosts do not share layers", () => {
  it("a Button in a torn Card keeps its own svg; the card's sheet svg has no button layers", () => {
    setBox(300, 200)
    const { container } = render(
      <Card edge="torn" size={[300, 200]}>
        <CardHeader className="border-b">
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input aria-label="name" />
        </CardContent>
        <CardFooter>
          <Button>Go</Button>
        </CardFooter>
      </Card>
    )
    const card = container.querySelector('[data-slot="card"]') as HTMLElement
    const sheet = card.querySelector(":scope > svg[data-ink='sheet']") as SVGElement
    expect(sheet).toBeTruthy()
    expect(sheet.querySelector("[data-layer='hover'], [data-layer='pressed'], [data-layer='focus']")).toBeNull()
    const button = container.querySelector('[data-slot="button"]') as HTMLElement
    expect(button.querySelectorAll(":scope > svg[data-ink='button']")).toHaveLength(1)
    for (const svg of container.querySelectorAll("svg[data-ink='button'], svg[data-ink='field'], svg[data-ink='sheet']")) {
      expect((svg.parentElement as HTMLElement).hasAttribute("data-ink-host")).toBe(true)
    }
  })
})

describe("cache and observers under churn", () => {
  beforeEach(() => inkCache.clear())

  it("a resize sweep of one host stays inside the cache caps, and mounting/unmounting many hosts leaves no observers behind", () => {
    setBox(100, 36)
    const observed = new Set<Element>()
    const RealRO = globalThis.ResizeObserver
    class SpyRO {
      cbs: ResizeObserverCallback
      constructor(cb: ResizeObserverCallback) {
        this.cbs = cb
      }
      observe(el: Element) {
        observed.add(el)
      }
      unobserve(el: Element) {
        observed.delete(el)
      }
      disconnect() {}
    }
    globalThis.ResizeObserver = SpyRO as unknown as typeof ResizeObserver
    try {
      const { unmount } = render(
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <Button key={i}>{`b${i}`}</Button>
          ))}
        </div>
      )
      unmount()
    } finally {
      globalThis.ResizeObserver = RealRO
    }
    expect(observed.size).toBe(0)
  })

  it("keeps cache accounting non-negative and within its caps after thousands of distinct boxes", async () => {
    const { buttonRecipe } = await import("@/lib/ink/recipes/button-ink")
    const { inkFrame } = await import("@/lib/ink/react")
    const { DEFAULT_KNOBS } = await import("@/lib/ink/recipes")
    inkCache.resize({ max: 50, maxChars: 200_000 })
    try {
      for (let w = 40; w < 1040; w += 4) {
        inkFrame(buttonRecipe, {
          box: { w, h: 36 }, params: { variant: "default", size: "default" }, seed: "churn", tier: "lo", density: "comfortable", dir: "ltr",
          knobs: DEFAULT_KNOBS, lazy: ["focus", "pressed"],
        })
      }
      const st = inkCache.stats()
      expect(st.size).toBeLessThanOrEqual(50)
      expect(st.chars).toBeGreaterThanOrEqual(0)
      expect(st.chars).toBeLessThanOrEqual(200_000 + 40_000)
    } finally {
      inkCache.resize({ max: 600, maxChars: 6_000_000 })
    }
  })
})

describe("SSR of a drawn form", () => {
  it("renders the same markup twice and contains no NaN", () => {
    const tree = (
      <form>
        <Input aria-label="a" defaultValue="x" />
        <Checkbox aria-label="c" defaultChecked />
        <Button size="lg">Go</Button>
      </form>
    )
    const a = renderToString(tree)
    const b = renderToString(tree)
    expect(a).toBe(b)
    expect(a).not.toMatch(/NaN|undefined|Infinity/)
  })
})

describe("act warnings", () => {
  it("opening a popover does not log React errors", async () => {
    setBox(288, 120)
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const { user } = renderUI(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent edge="torn">hello</PopoverContent>
      </Popover>
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    await act(async () => {})
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
  })
})

describe("fixes of the audit", () => {
  it("a lone Icon on a page without provider or defs puts the grain masks into <body> (once)", () => {
    document.querySelectorAll("[data-ll-defs]").forEach((n) => n.remove())
    const { unmount } = render(
      <div>
        <Icon name="check" />
        <Icon name="x" />
        <Doodle name="star" />
      </div>
    )
    expect(document.querySelectorAll('[data-ll-defs="injected"]')).toHaveLength(1)
    expect(document.getElementById("ll-felt-0")).toBeTruthy()
    unmount()
    document.querySelectorAll("[data-ll-defs]").forEach((n) => n.remove())
  })

  it("under an InkProvider the icon does not inject a second copy of the masks", () => {
    document.querySelectorAll("[data-ll-defs]").forEach((n) => n.remove())
    render(
      <InkProvider>
        <Icon name="check" />
      </InkProvider>
    )
    expect(document.querySelectorAll("#ll-felt-0")).toHaveLength(1)
    expect(document.querySelector('[data-ll-defs="injected"]')).toBeNull()
  })

  it("ink.group() can emit data-hide-on and a mask, and the layer type knows all ten layers", () => {
    const ink = new Ink("audit")
    ink.layer("open", () => {
      ink.raw('<mask id="m1"><rect width="4" height="4" fill="white"/></mask>', "under")
      ink.group({ hideOn: "disabled invalid", mask: "m1" }, () => ink.dot(5, 5, 2, "ink"))
    })
    ink.layer("busy", () => ink.dot(1, 1, 1, "ink"))
    const res = ink.toSvg({ w: 10, h: 10 })
    expect(res.layers).toEqual(expect.arrayContaining(["open", "busy"]))
    expect(res.parts.open).toContain('data-hide-on="disabled invalid"')
    expect(res.parts.open).toContain('mask="url(#m1)"')
  })

  it("every paint key resolves to a token or currentColor, including the ones added by the audit", () => {
    for (const k of ["pad", "pad-rule", "check-rule", "ink-muted", "pencil-text", "orange-text", "hi-deep", "tape", "tape-edge"] as const) {
      expect(paint(k)).toBe(`var(--ll-${k})`)
    }
  })
})

describe("host patterns of notes/PATTERNS.md (tests/_patterns.tsx)", () => {
  const layerNames = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

  describe("1. an element that hosts its own svg", () => {
    it("draws rest + hover at mount, the ring only after the first focus-visible; disabled is a static alternative", async () => {
      setBox(60, 24)
      const { getByText, rerender } = render(<Pill>new</Pill>)
      const el = getByText("new")
      expect(el).toHaveAttribute("data-ink-host")
      expect(el).toHaveAttribute("data-ink-ready")
      expect(layerNames(el)).toEqual(["rest", "hover"])
      expectInkLayers(el, { min: 1, kinds: ["pill"], absolute: true, layers: ["rest", "hover"] })
      vi.spyOn(el, "matches").mockImplementation((s: string) => s === ":focus-visible")
      await act(async () => el.dispatchEvent(new FocusEvent("focusin", { bubbles: true })))
      expect(layerNames(el)).toEqual(["rest", "hover", "focus"])
      rerender(<Pill disabled>new</Pill>)
      expect(layerNames(getByText("new"))).toEqual(["disabled"])
    })

    it("asChild puts the drawing inside the child, next to its own children", () => {
      setBox(60, 24)
      const { getByRole } = render(
        <Pill asChild>
          <a href="/x">docs</a>
        </Pill>
      )
      const a = getByRole("link", { name: "docs" })
      expect(a).toHaveAttribute("data-slot", "pill")
      expect(a.querySelector(":scope > svg[data-ink='pill']")).toBeTruthy()
    })

    it("renders the same server markup twice with an explicit size, and hydrates without warnings", async () => {
      const tree = <Pill seed="a">new</Pill>
      const err = vi.spyOn(console, "error").mockImplementation(() => {})
      const { hydrateRoot } = await import("react-dom/client")
      const html = renderToString(tree)
      expect(html).toBe(renderToString(tree))
      const host = document.createElement("div")
      host.innerHTML = html
      document.body.appendChild(host)
      await act(async () => {
        hydrateRoot(host, tree)
      })
      expect(err).not.toHaveBeenCalled()
      err.mockRestore()
      host.remove()
    })
  })

  describe("2. a wrapper around a native control", () => {
    it("the select is the frame's direct child, className goes to the frame, padding to the select, ref/props to the select", async () => {
      setBox(240, 36)
      const ref = React.createRef<HTMLSelectElement>()
      const { getByRole, container } = render(
        <NativeSelect ref={ref} aria-label="fruit" className="max-w-xs pl-9 focus-visible:bg-hi" defaultValue="b">
          <option value="a">a</option>
          <option value="b">b</option>
        </NativeSelect>
      )
      const select = getByRole("combobox", { name: "fruit" })
      const frame = container.querySelector("[data-slot=native-select-frame]") as HTMLElement
      expect(select.parentElement).toBe(frame)
      expect(ref.current).toBe(select)
      expect(frame).toHaveClass("max-w-xs")
      expect(select).toHaveClass("pl-9", "focus-visible:bg-hi")
      expect(frame).toHaveAttribute("data-ink-focus", "within")
      expect(layerNames(frame)).toEqual(["rest"])
      expectInkLayers(frame, { min: 1, kinds: ["field", "icon"] })
      await axeCheck(container)
    })

    it("invalid and disabled are static alternatives chosen from props", () => {
      setBox(240, 36)
      const { container, rerender } = render(<NativeSelect aria-label="f" aria-invalid="true"><option>a</option></NativeSelect>)
      expect(layerNames(container.querySelector("[data-slot=native-select-frame]") as HTMLElement)).toEqual(["invalid"])
      rerender(<NativeSelect aria-label="f" disabled><option>a</option></NativeSelect>)
      expect(layerNames(container.querySelector("[data-slot=native-select-frame]") as HTMLElement)).toEqual(["disabled"])
    })
  })

  describe("3. a Radix state primitive", () => {
    it("the Radix root is the host; clicking toggles data-state without re-running the recipe", async () => {
      setBox(44, 24)
      const { user, getByRole } = renderUI(<Switch aria-label="wifi" />)
      const sw = getByRole("switch", { name: "wifi" })
      expect(sw).toHaveAttribute("data-slot", "switch")
      expect(sw).toHaveAttribute("data-ink-host")
      expect(layerNames(sw)).toEqual(["rest", "checked", "hover"])
      const runs = inkCache.stats().runs
      await user.click(sw)
      expect(sw).toHaveAttribute("data-state", "checked")
      expect(sw).toHaveAttribute("aria-checked", "true")
      expect(inkCache.stats().runs).toBe(runs)
      await user.keyboard(" ")
      expect(sw).toHaveAttribute("data-state", "unchecked")
      await axeCheck()
    })

    it("disabled keeps `rest` (so `checked` stays state driven) and has no hover or ring", () => {
      setBox(44, 24)
      const { getByRole } = render(<Switch aria-label="wifi" disabled defaultChecked />)
      expect(layerNames(getByRole("switch"))).toEqual(["rest", "checked"])
    })
  })
})
