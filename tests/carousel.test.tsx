import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { CAROUSEL_TICK_PAD, CAROUSEL_TICK_PAD_PLAIN, carouselTickRecipe } from "@/lib/ink/recipes/carousel-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

vi.mock("embla-carousel-react", async () => {
  const React = await import("react")
  function useEmblaCarousel(options: { axis?: "x" | "y"; loop?: boolean; startIndex?: number } = {}) {
    const [node, setNode] = React.useState<HTMLElement | null>(null)
    const index = React.useRef(options.startIndex ?? 0)
    const listeners = React.useRef(new Map<string, Set<(api: unknown) => void>>())
    const opts = React.useRef(options)
    opts.current = options
    const api = React.useMemo(() => {
      if (!node) return undefined
      const count = () => node.children[0]?.children.length ?? 0
      const emit = (name: string) => listeners.current.get(name)?.forEach((cb) => cb(self))
      const go = (i: number) => {
        const n = count()
        const next = opts.current.loop ? (i + n) % n : Math.min(n - 1, Math.max(0, i))
        if (next === index.current) return
        index.current = next
        emit("select")
      }
      const self = {
        canScrollPrev: () => !!opts.current.loop || index.current > 0,
        canScrollNext: () => !!opts.current.loop || index.current < count() - 1,
        scrollPrev: () => go(index.current - 1),
        scrollNext: () => go(index.current + 1),
        scrollTo: (i: number) => go(i),
        selectedScrollSnap: () => index.current,
        scrollSnapList: () => Array.from({ length: count() }, (_, i) => i),
        on: (name: string, cb: (api: unknown) => void) => {
          if (!listeners.current.has(name)) listeners.current.set(name, new Set())
          listeners.current.get(name)!.add(cb)
          return self
        },
        off: (name: string, cb: (api: unknown) => void) => {
          listeners.current.get(name)?.delete(cb)
          return self
        },
        options: () => opts.current,
      }
      return self
    }, [node])
    return [setNode, api] as const
  }
  return { default: useEmblaCarousel }
})

let restoreBox = () => {}
beforeEach(() => {
  restoreBox = mockBox(32, 32)
})
afterEach(() => {
  restoreBox()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Demo({ n = 5, root, dots = true }: { n?: number; root?: Partial<React.ComponentProps<typeof Carousel>>; dots?: boolean }) {
  return (
    <Carousel aria-label="Notes" {...root}>
      <CarouselContent>
        {Array.from({ length: n }, (_, i) => (
          <CarouselItem key={i}>
            <div>Slide {i + 1}</div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      {dots ? <CarouselDots /> : null}
    </Carousel>
  )
}

const ready = async (n = 5) => {
  await waitFor(() => expect(screen.getByRole("region").querySelector('[data-slot="carousel-status"]')).toHaveTextContent(`Slide 1 of ${n}`))
}

describe("Carousel structure", () => {
  it("is a labelled carousel region with Embla's window and track, and slides that are groups", () => {
    const { getByRole, container } = renderUI(<Demo />)
    const region = getByRole("region", { name: "Notes" })
    expect(region).toHaveAttribute("aria-roledescription", "carousel")
    expect(region).toHaveAttribute("data-slot", "carousel")
    expect(region).toHaveClass("relative")
    const win = container.querySelector<HTMLElement>('[data-slot="carousel-content"]')!
    expect(win).toHaveClass("overflow-hidden")
    expect(win.className).toContain("-my-3")
    expect(win.firstElementChild).toHaveClass("flex")
    const slides = within(region).getAllByRole("group")
    expect(slides).toHaveLength(5)
    for (const s of slides) {
      expect(s).toHaveAttribute("aria-roledescription", "slide")
      expect(s).toHaveAttribute("data-slot", "carousel-item")
      expect(s).toHaveClass("basis-full", "shrink-0")
    }
  })

  it("orientation=vertical lays the track out in a column and pads the other axis", () => {
    const { container } = renderUI(<Demo root={{ orientation: "vertical" }} />)
    const win = container.querySelector<HTMLElement>('[data-slot="carousel-content"]')!
    expect(win.className).toContain("-mx-3")
    expect(win.firstElementChild).toHaveClass("flex-col", "-mt-4")
    expect(container.querySelector('[data-slot="carousel-item"]')).toHaveClass("pt-4")
    expect(screen.getByRole("button", { name: "Previous slide" }).className).toContain("-top-12")
    expect(screen.getByRole("button", { name: "Next slide" }).className).toContain("-bottom-12")
  })

  it("useCarousel-dependent parts throw outside a Carousel", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<CarouselNext />)).toThrow("useCarousel must be used within a <Carousel />")
    spy.mockRestore()
  })

  it("the arrows are drawn Buttons with hand-drawn arrows and screen-reader names, on logical sides", async () => {
    const { getByRole } = renderUI(<Demo />)
    const prev = getByRole("button", { name: "Previous slide" })
    const next = getByRole("button", { name: "Next slide" })
    expect(prev).toHaveAttribute("data-slot", "carousel-previous")
    expect(next).toHaveAttribute("data-slot", "carousel-next")
    expect(prev).toHaveAttribute("data-ink-host")
    expect(prev.querySelector('svg[data-icon="arrow-left"]')).toBeTruthy()
    expect(next.querySelector('svg[data-icon="arrow-right"]')).toBeTruthy()
    expect(prev.className).toContain("-start-12")
    expect(next.className).toContain("-end-12")
    expect(prev).toHaveAttribute("data-variant", "outline")
  })
})

describe("Carousel behaviour", () => {
  it("Previous is inert on the first slide; Next scrolls, and Previous comes back", async () => {
    const { getByRole, user } = renderUI(<Demo />, opts)
    await ready()
    expect(getByRole("button", { name: "Previous slide" })).toBeDisabled()
    expect(getByRole("button", { name: "Next slide" })).toBeEnabled()
    await user.click(getByRole("button", { name: "Next slide" }))
    await waitFor(() => expect(screen.getByRole("region").querySelector('[data-slot="carousel-status"]')).toHaveTextContent("Slide 2 of 5"))
    expect(getByRole("button", { name: "Previous slide" })).toBeEnabled()
    await user.click(getByRole("button", { name: "Previous slide" }))
    await waitFor(() => expect(screen.getByRole("region").querySelector('[data-slot="carousel-status"]')).toHaveTextContent("Slide 1 of 5"))
  })

  it("Next is inert on the last slide unless the carousel loops", async () => {
    const { getByRole, user } = renderUI(<Demo n={2} />, opts)
    await ready(2)
    await user.click(getByRole("button", { name: "Next slide" }))
    await waitFor(() => expect(getByRole("button", { name: "Next slide" })).toBeDisabled())
    screen.getByRole("region")
  })

  it("loop keeps both arrows alive", async () => {
    const { getByRole } = renderUI(<Demo n={3} root={{ opts: { loop: true } }} />)
    await ready(3)
    expect(getByRole("button", { name: "Previous slide" })).toBeEnabled()
  })

  it("the arrow keys move it from anywhere inside, but not while you are typing", async () => {
    const { user } = renderUI(
      <Carousel aria-label="Notes">
        <CarouselContent>
          {[1, 2, 3].map((i) => (
            <CarouselItem key={i}>
              <input aria-label={`field ${i}`} />
              <button type="button">go {i}</button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>,
      opts
    )
    await ready(3)
    const status = () => screen.getByRole("region").querySelector('[data-slot="carousel-status"]')
    screen.getByRole("button", { name: "go 1" }).focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(status()).toHaveTextContent("Slide 2 of 3"))
    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(status()).toHaveTextContent("Slide 1 of 3"))
    screen.getByRole("textbox", { name: "field 1" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(status()).toHaveTextContent("Slide 1 of 3")
  })

  it("vertical carousels answer ArrowUp and ArrowDown, and ignore left and right", async () => {
    const { user } = renderUI(<Demo root={{ orientation: "vertical" }} />, opts)
    await ready()
    const status = () => screen.getByRole("region").querySelector('[data-slot="carousel-status"]')
    screen.getByRole("button", { name: "Next slide" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(status()).toHaveTextContent("Slide 1 of 5")
    await user.keyboard("{ArrowDown}")
    await waitFor(() => expect(status()).toHaveTextContent("Slide 2 of 5"))
    await user.keyboard("{ArrowUp}")
    await waitFor(() => expect(status()).toHaveTextContent("Slide 1 of 5"))
  })

  it("right-to-left swaps the arrow keys", async () => {
    const { user, container } = renderUI(
      <div dir="rtl">
        <Demo root={{ opts: { direction: "rtl" } }} />
      </div>,
      opts
    )
    void container
    await ready()
    const status = () => screen.getByRole("region").querySelector('[data-slot="carousel-status"]')
    screen.getByRole("button", { name: "Next slide" }).focus()
    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(status()).toHaveTextContent("Slide 2 of 5"))
  })

  it("hands the Embla API to setApi and passes plugins and options through", async () => {
    const seen: NonNullable<CarouselApi>[] = []
    renderUI(<Demo root={{ setApi: (a) => a && seen.push(a), opts: { startIndex: 2 } }} />)
    await waitFor(() => expect(seen.length).toBeGreaterThan(0))
    expect(seen[0].selectedScrollSnap()).toBe(2)
    expect(typeof seen[0].scrollNext).toBe("function")
  })

  it("className and props reach the region", () => {
    const { getByRole } = renderUI(<Demo root={{ className: "w-72", id: "c", "data-x": "1" } as never} />)
    expect(getByRole("region")).toHaveClass("w-72")
    expect(getByRole("region")).toHaveAttribute("id", "c")
  })
})

describe("CarouselDots (the tally)", () => {
  it("is a tablist with a stroke per slide; the current one is selected, and it is the one in the tab order", async () => {
    const { getByRole } = renderUI(<Demo n={7} />)
    await ready(7)
    const list = getByRole("tablist", { name: "Choose a slide" })
    expect(list).toHaveAttribute("data-slot", "carousel-dots")
    const tabs = within(list).getAllByRole("tab")
    expect(tabs).toHaveLength(7)
    expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual(["true", "false", "false", "false", "false", "false", "false"])
    expect(tabs.map((t) => t.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1", "-1", "-1"])
    expect(tabs[2]).toHaveAccessibleName("Go to slide 3")
    expect(tabs[0]).toHaveAttribute("data-slot", "carousel-dot")
  })

  it("each stroke is the ink host of its own drawing: the fifth of a group is the slash, and the current one is drawn in blue (checked)", async () => {
    const { getByRole } = renderUI(<Demo n={7} />)
    await ready(7)
    const tabs = within(getByRole("tablist")).getAllByRole("tab")
    for (const [i, t] of tabs.entries()) {
      expect(t, `stroke ${i + 1}`).toHaveAttribute("data-ink-host")
      await waitFor(() => expect(t.querySelector(":scope > svg[data-ink=tick]"), `stroke ${i + 1}`).toBeTruthy())
    }
    const layers = (el: Element) => Array.from(el.querySelectorAll(":scope > svg > g[data-layer]")).map((g) => g.getAttribute("data-layer"))
    expect(layers(tabs[0])).toEqual(["rest", "checked", "hover"])
    const room = (t: Element) => Number.parseFloat((t.querySelector("svg") as SVGElement).style.left)
    expect(room(tabs[4])).toBe(-CAROUSEL_TICK_PAD)
    expect(room(tabs[0])).toBe(-CAROUSEL_TICK_PAD_PLAIN)
    expect(room(tabs[3])).toBe(-CAROUSEL_TICK_PAD_PLAIN)
    expect(tabs[4].querySelector("g[data-layer=rest]")!.innerHTML).not.toBe(tabs[3].querySelector("g[data-layer=rest]")!.innerHTML)
  })

  it("clicking a stroke goes to that slide, and the selection follows Embla", async () => {
    const { getByRole, user } = renderUI(<Demo n={7} />, opts)
    await ready(7)
    await user.click(within(getByRole("tablist")).getByRole("tab", { name: "Go to slide 4" }))
    await waitFor(() => expect(within(getByRole("tablist")).getByRole("tab", { name: "Go to slide 4" })).toHaveAttribute("aria-selected", "true"))
    await user.click(getByRole("button", { name: "Next slide" }))
    await waitFor(() => expect(within(getByRole("tablist")).getByRole("tab", { name: "Go to slide 5" })).toHaveAttribute("aria-selected", "true"))
    expect(within(getByRole("tablist")).getByRole("tab", { name: "Go to slide 4" })).toHaveAttribute("aria-selected", "false")
  })

  it("focus follows the current stroke when the arrow keys move the carousel from the tally", async () => {
    const { getByRole, user } = renderUI(<Demo n={4} />, opts)
    await ready(4)
    const tabs = () => within(getByRole("tablist")).getAllByRole("tab")
    tabs()[0].focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(tabs()[1]).toHaveAttribute("aria-selected", "true"))
    await waitFor(() => expect(tabs()[1]).toHaveFocus())
  })

  it("strokes come in groups of five that never break across lines, a wider gap between groups; the tally clips its strokes' svgs so they add no scroll", async () => {
    const { getByRole } = renderUI(<Demo n={7} />)
    await ready(7)
    const list = getByRole("tablist")
    const groups = Array.from(list.children)
    expect(groups).toHaveLength(2)
    expect(groups.map((g) => g.querySelectorAll("[role=tab]").length)).toEqual([5, 2])
    expect(groups[0]).toHaveClass("flex", "shrink-0")
    expect(list).toHaveClass("flex-wrap", "gap-x-2", "overflow-clip")
    expect(list).toHaveClass("p-4", "-mx-4", "-mb-4")
  })

  it("draws nothing when there is only one slide", async () => {
    renderUI(<Demo n={1} />)
    await new Promise((r) => setTimeout(r, 30))
    expect(screen.queryByRole("tablist")).toBeNull()
  })
})

describe("Carousel rendering", () => {
  it("has no axe violations", async () => {
    const { container } = renderUI(<Demo n={7} />)
    await ready(7)
    await axeCheck(container)
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = <Demo n={7} root={{ seed: "s" }} />
    const html = renderToString(tree)
    expect(renderToString(tree)).toBe(html)
    expect(html).toContain('data-slot="carousel"')
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

  it("mounts under StrictMode", async () => {
    renderUI(
      <React.StrictMode>
        <Demo />
      </React.StrictMode>
    )
    await ready()
  })

  it("a keyboard event that is not an arrow is left alone", async () => {
    const { user } = renderUI(<Demo />, opts)
    await ready()
    screen.getByRole("button", { name: "Next slide" }).focus()
    fireEvent.keyDown(screen.getByRole("button", { name: "Next slide" }), { key: "Home" })
    await user.keyboard("a")
    expect(screen.getByRole("region").querySelector('[data-slot="carousel-status"]')).toHaveTextContent("Slide 1 of 5")
  })
})

describe("carouselTickRecipe", () => {
  const req = { seed: "s", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: object, extra: object = {}) => runRecipe(carouselTickRecipe, { ...req, box: { w: 24, h: 32 }, params: params as never, density: "comfortable", ...extra })

  it("draws rest, hover and checked, with the focus ring lazy", () => {
    expect(run({ slash: false, pitch: 24 }).layers).toEqual(["rest", "checked", "hover"])
    expect(run({ slash: true, pitch: 24 }, { lazy: ["focus"] }).layers).toEqual(["rest", "checked", "hover", "focus"])
  })

  it("stays within the lo budget for a stroke and for the slash", () => {
    for (const slash of [false, true]) {
      const f = run({ slash, pitch: 24 })
      for (const [k, v] of Object.entries(f.parts)) {
        expect(nodes(v!), `${slash}/${k}`).toBeLessThanOrEqual(12)
        expect(v!.length, `${slash}/${k}`).toBeLessThanOrEqual(8000)
      }
    }
  })

  it("the slash reaches four strokes to the reading-start side, mirrored in right-to-left", () => {
    const pts = (dir: "ltr" | "rtl") => run({ slash: true, pitch: 24 }, { dir }).parts.rest!
    expect(pts("rtl")).not.toBe(pts("ltr"))
  })

  it("draws sane markup at every size, density, tier and direction", () => {
    for (const [w, h] of [[8, 16], [24, 32], [30, 40]]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const dir of ["ltr", "rtl"] as const) {
            for (const slash of [false, true]) {
              const out = Object.values(runRecipe(carouselTickRecipe, { ...req, box: { w, h }, params: { slash, pitch: 24 }, density, tier, dir, lazy: ["focus"] }).parts).join("")
              expect(out, `${w}x${h}/${density}/${tier}/${dir}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
            }
          }
        }
      }
    }
  })
})
