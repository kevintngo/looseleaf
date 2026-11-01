import * as React from "react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"
import { Message } from "@/components/ui/message"
import { inkCache } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { bubbleReactionsRecipe, bubbleRecipe, bubbleVariantList } from "@/lib/ink/recipes/bubble-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(240, 44)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length
const layerNames = (root: ParentNode) => Array.from(root.querySelectorAll("svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

function Chat(props: React.ComponentProps<typeof Bubble>) {
  return (
    <Bubble {...props}>
      <BubbleContent>Can you add tags to my notes?</BubbleContent>
    </Bubble>
  )
}

describe("Bubble parts", () => {
  it("keeps upstream's parts, data-slots and data attributes", () => {
    const { container } = render(
      <BubbleGroup>
        <Bubble variant="muted" align="end">
          <BubbleContent>Hi</BubbleContent>
          <BubbleReactions>+1</BubbleReactions>
        </Bubble>
      </BubbleGroup>,
    )
    expect(container.querySelector('[data-slot="bubble-group"]')).not.toBeNull()
    const b = container.querySelector('[data-slot="bubble"]') as HTMLElement
    expect(b).toHaveAttribute("data-variant", "muted")
    expect(b).toHaveAttribute("data-align", "end")
    expect(b).toHaveClass("group/bubble", "relative", "flex", "w-fit", "max-w-[80%]", "min-w-0", "flex-col", "gap-1")
    expect(container.querySelector('[data-slot="bubble-content"]')).toHaveTextContent("Hi")
    const r = container.querySelector('[data-slot="bubble-reactions"]') as HTMLElement
    expect(r).toHaveAttribute("data-side", "bottom")
    expect(r).toHaveAttribute("data-align", "end")
    expect(r).toHaveClass("absolute", "z-10", "end-3", "bottom-0")
  })

  it("defaults: variant default, align start, cloud shape, tail on", () => {
    const { container } = render(<Chat />)
    const b = container.querySelector('[data-slot="bubble"]') as HTMLElement
    expect(b).toHaveAttribute("data-variant", "default")
    expect(b).toHaveAttribute("data-align", "start")
    expect(b).toHaveAttribute("data-shape", "cloud")
    expect(b).not.toHaveAttribute("data-tail")
    expect(render(<Chat tail={false} />).container.querySelector('[data-slot="bubble"]')).toHaveAttribute("data-tail", "false")
  })

  it("takes its align from the enclosing Message when it has none of its own", () => {
    const { container } = render(
      <Message align="end">
        <Chat />
      </Message>,
    )
    expect(container.querySelector('[data-slot="bubble"]')).toHaveAttribute("data-align", "end")
    const own = render(
      <Message align="end">
        <Chat align="start" />
      </Message>,
    )
    expect(own.container.querySelector('[data-slot="bubble"]')).toHaveAttribute("data-align", "start")
  })

  it("BubbleGroup hides the tail of every bubble but the last", () => {
    const { container } = render(<BubbleGroup />)
    expect(container.firstElementChild!.className).toContain("[&>[data-slot=bubble]:not(:last-child)_[data-part=tail]]:hidden")
  })
})

describe("Bubble ink", () => {
  it.each(bubbleVariantList.filter((v) => v !== "ghost"))("variant %s draws a decorative svg behind the words, tail as its own part", (variant) => {
    const { container } = render(<Chat variant={variant} />)
    const host = container.querySelector('[data-slot="bubble-content"]') as HTMLElement
    expect(host).toHaveAttribute("data-ink-host")
    expect(host).toHaveAttribute("data-ink-ready")
    expect(layerNames(host)).toEqual(["rest"])
    expectInkLayers(container, { min: 1, kinds: ["bubble"], absolute: true, layers: ["rest"] })
    expect(host.querySelector('svg[data-ink="bubble"] [data-part="tail"]')).not.toBeNull()
    expect(host.querySelector('svg[data-ink="bubble"]')).toHaveAttribute("data-still")
  })

  it("ghost is just the words: no host, no svg", () => {
    const { container } = render(<Chat variant="ghost" />)
    const c = container.querySelector('[data-slot="bubble-content"]') as HTMLElement
    expect(c).not.toHaveAttribute("data-ink-host")
    expect(container.querySelector("svg")).toBeNull()
    expect(c).toHaveClass("p-0")
  })

  it("the text is real DOM text above the ink, in the hand font", () => {
    const { getByText } = render(<Chat />)
    const c = getByText("Can you add tags to my notes?")
    expect(c).toHaveClass("font-hand", "relative", "isolate", "px-4", "py-2.5", "text-base", "leading-relaxed")
    expect(c.children[0]).toHaveAttribute("data-ink", "bubble")
  })

  it("pen=you writes in the script font and blue felt", () => {
    const { getByText, container } = render(<Chat pen="you" />)
    expect(getByText("Can you add tags to my notes?")).toHaveClass("font-script", "text-ink-you")
    expect(container.querySelector("svg")!.innerHTML).toContain("var(--ll-ink-you)")
  })

  it("a click never redraws it", async () => {
    const { user, getByRole } = renderUI(
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button">Show me the diff</button>
        </BubbleContent>
      </Bubble>,
    )
    const runs = inkCache.stats().runs
    await user.click(getByRole("button", { name: "Show me the diff" }))
    expect(inkCache.stats().runs).toBe(runs)
  })

  it("the same seed draws the same bubble, another seed another one", () => {
    const html = (seed: string) => {
      const { container, unmount } = render(
        <Bubble>
          <BubbleContent seed={seed}>Hello there</BubbleContent>
        </Bubble>,
      )
      const s = container.querySelector("svg")!.innerHTML
      unmount()
      return s
    }
    expect(html("a")).toBe(html("a"))
    expect(html("a")).not.toBe(html("b"))
  })
})

describe("Bubble as a button (asChild)", () => {
  it("is the host itself: the child element keeps its role, gains the drawing and the hover layer", async () => {
    const { getByRole, user } = renderUI(
      <Bubble variant="outline" align="end">
        <BubbleContent asChild>
          <button type="button" onClick={() => {}}>
            Run the tests
          </button>
        </BubbleContent>
      </Bubble>,
    )
    const b = getByRole("button", { name: "Run the tests" })
    expect(b).toHaveAttribute("data-slot", "bubble-content")
    expect(b).toHaveAttribute("data-ink-host")
    expect(b.querySelector('svg[data-ink="bubble"]')).not.toBeNull()
    expect(layerNames(b)).toEqual(["rest", "hover"])
    await user.tab()
    expect(b).toHaveFocus()
    expect(layerNames(b)).toEqual(expect.arrayContaining(["rest", "hover"]))
  })

  it("works with Enter and Space like any button", async () => {
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(
      <Bubble>
        <BubbleContent asChild>
          <button type="button" onClick={onClick}>
            Yes
          </button>
        </BubbleContent>
      </Bubble>,
    )
    await user.tab()
    await user.keyboard("{Enter}")
    await user.keyboard(" ")
    expect(onClick).toHaveBeenCalledTimes(2)
    expect(getByRole("button")).toHaveFocus()
  })

  it("a link works too", () => {
    const { getByRole } = render(
      <Bubble>
        <BubbleContent asChild>
          <a href="/diff">Open the diff</a>
        </BubbleContent>
      </Bubble>,
    )
    expect(getByRole("link", { name: "Open the diff" })).toHaveAttribute("data-ink-host")
  })
})

describe("Bubble shapes", () => {
  it.each(["note", "sticky"] as const)("%s is a Paper sheet, not an svg", (shape) => {
    const { container } = render(
      <Bubble shape={shape}>
        <BubbleContent>meet me at four</BubbleContent>
      </Bubble>,
    )
    const c = container.querySelector('[data-slot="bubble-content"]') as HTMLElement
    expect(c).toHaveAttribute("data-stock")
    expect(c).toHaveClass("ll-paper", "font-script")
    expect(container.querySelector('svg[data-ink="bubble"]')).toBeNull()
    expect(c).toHaveAttribute("data-edge", "curl")
    expect(container.querySelector('svg[data-ink="sheet"]')).not.toBeNull()
  })

  it("curl={false} lays the note flat as a plain CSS sheet", () => {
    const { container } = render(
      <Bubble shape="note">
        <BubbleContent paper={{ curl: false }}>flat</BubbleContent>
      </Bubble>,
    )
    const c = container.querySelector('[data-slot="bubble-content"]') as HTMLElement
    expect(c).toHaveAttribute("data-edge", "cut")
    expect(c).not.toHaveAttribute("data-ink-host")
    expect(container.querySelector("svg")).toBeNull()
  })

  it("a sticky uses a sticky stock and takes Paper props", () => {
    const { container } = render(
      <Bubble shape="sticky" variant="secondary">
        <BubbleContent paper={{ fastener: "pin", tilt: 1 }}>buy ink</BubbleContent>
      </Bubble>,
    )
    const c = container.querySelector('[data-slot="bubble-content"]') as HTMLElement
    expect(c).toHaveAttribute("data-stock", "sticky-yellow")
    expect(container.querySelector('[data-slot="fastener"]')).not.toBeNull()
  })

  it("a note carries the two creases", () => {
    const { container } = render(
      <Bubble shape="note">
        <BubbleContent>fold me</BubbleContent>
      </Bubble>,
    )
    expect(container.querySelector('[data-slot="bubble-content"]')!.className).toContain("after:[background:linear-gradient(90deg")
  })
})

describe("BubbleReactions", () => {
  it("is a sticker chip: white vinyl svg, drop shadow on the svg", () => {
    const { container } = render(
      <Bubble>
        <BubbleContent>Hi</BubbleContent>
        <BubbleReactions>+1</BubbleReactions>
      </Bubble>,
    )
    const r = container.querySelector('[data-slot="bubble-reactions"]') as HTMLElement
    expect(r).toHaveAttribute("data-ink-host")
    expect(r.querySelector('svg[data-ink="reactions"]')).not.toBeNull()
    expect(r.className).toContain("[&>svg[data-ink]]:[filter:var(--ll-drop-sticker)]")
    expect(r).toHaveTextContent("+1")
  })

  it("places itself on the top or the bottom edge, at either corner", () => {
    const { container } = render(<BubbleReactions side="top" align="start">x</BubbleReactions>)
    const r = container.firstElementChild as HTMLElement
    expect(r).toHaveClass("top-0", "-translate-y-3/4", "start-3")
  })
})

describe("bubbleRecipe", () => {
  const req = { params: { variant: "default", tail: "start" } as const, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }

  it("declares rest, hover (interactive only) and a lazy focus ring", () => {
    const f = runRecipe(bubbleRecipe, { ...req, box: { w: 240, h: 44 }, lazy: ["focus"] })
    expect(f.layers).toEqual(["rest", "focus"])
    const i = runRecipe(bubbleRecipe, { ...req, params: { ...req.params, interactive: true }, box: { w: 240, h: 44 }, lazy: ["focus"] })
    expect(i.layers).toEqual(["rest", "hover", "focus"])
    expect(i.lazyLayers).toEqual(["focus"])
    expect(runRecipe(bubbleRecipe, { ...req, params: { variant: "ghost", tail: "start" }, box: { w: 240, h: 44 } }).layers).toEqual([])
  })

  it("lo tier budget: at most 12 nodes for a bubble, and a few KB, at chat sizes", () => {
    for (const variant of bubbleVariantList.filter((v) => v !== "ghost")) {
      for (const box of [{ w: 120, h: 36 }, { w: 240, h: 44 }, { w: 420, h: 78 }]) {
        const f = runRecipe(bubbleRecipe, { ...req, params: { variant, tail: "end" }, box })
        const rest = f.parts.rest ?? ""
        expect(nodes(rest), `${variant} ${box.w}x${box.h}`).toBeLessThanOrEqual(12)
        expect(rest.length, `${variant} ${box.w}x${box.h}`).toBeLessThanOrEqual(11000)
      }
    }
  })

  it("every variant x tier x density x dir is sane (no NaN, only var(--ll-*) colors)", () => {
    for (const variant of bubbleVariantList) {
      for (const tier of ["lo", "hi"] as const) {
        for (const density of ["comfortable", "compact", "calm"] as const) {
          for (const dir of ["ltr", "rtl"] as const) {
            for (const box of [{ w: 40, h: 24 }, { w: 300, h: 60 }, { w: 640, h: 400 }]) {
              const f = runRecipe(bubbleRecipe, { ...req, params: { variant, tail: "start", pen: "you", interactive: true }, box, tier, density, dir, lazy: ["focus"] })
              const all = Object.values(f.parts).join("")
              expect(all, `${variant}/${tier}/${density}/${dir}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
            }
          }
        }
      }
    }
  })

  it("the tail follows the reading direction: start is left in LTR and right in RTL", () => {
    const bbox = (dir: "ltr" | "rtl", tail: "start" | "end") => {
      const f = runRecipe(bubbleRecipe, { ...req, params: { variant: "outline", tail }, box: { w: 240, h: 44 }, dir })
      const m = /data-part="tail"[\s\S]*$/.exec(f.parts.rest ?? "")![0]
      const xs = Array.from(m.matchAll(/M(-?[\d.]+)/g)).map((x) => Number(x[1]))
      return xs.reduce((a, b) => a + b, 0) / xs.length
    }
    expect(bbox("ltr", "start")).toBeLessThan(120)
    expect(bbox("ltr", "end")).toBeGreaterThan(120)
    expect(bbox("rtl", "start")).toBeGreaterThan(120)
    expect(bbox("rtl", "end")).toBeLessThan(120)
  })

  it("hi tier adds the halo and pooled ends the lo tier saves", () => {
    const lo = runRecipe(bubbleRecipe, { ...req, box: { w: 240, h: 44 } })
    const hi = runRecipe(bubbleRecipe, { ...req, box: { w: 240, h: 44 }, tier: "hi" })
    expect((hi.parts.rest ?? "").length).toBeGreaterThan((lo.parts.rest ?? "").length * 2)
  })

  it("calm density is a pencil hairline with a flat wash", () => {
    const calm = runRecipe(bubbleRecipe, { ...req, box: { w: 240, h: 44 }, density: "calm" })
    const comfy = runRecipe(bubbleRecipe, { ...req, box: { w: 240, h: 44 } })
    expect(calm.parts.rest).toContain("var(--ll-pencil)")
    expect(comfy.parts.rest).not.toContain("var(--ll-pencil)")
  })

  it("the reaction chip is white vinyl", () => {
    const f = runRecipe(bubbleReactionsRecipe, { params: {}, box: { w: 54, h: 26 }, seed: "c", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
    expect(f.parts.rest).toContain("var(--ll-photo)")
  })
})

describe("Bubble on the server", () => {
  it("renders the words and the host marker, no drawing before the first measure", () => {
    restore()
    const html = renderToString(<Chat variant="muted" />)
    expect(html).toContain("Can you add tags to my notes?")
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("<svg")
  })

  it("is deterministic and hydrates without a warning", async () => {
    restore()
    const tree = () => (
      <Message align="end">
        <BubbleGroup>
          <Chat variant="default" />
          <Chat variant="outline" pen="you" />
        </BubbleGroup>
      </Message>
    )
    const html = renderToString(tree())
    expect(renderToString(tree())).toBe(html)
    const root = document.createElement("div")
    root.innerHTML = html
    document.body.append(root)
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(root, tree())
    })
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
    root.remove()
  })
})

describe("Bubble accessibility", () => {
  it("has no axe violations in any variant or shape", async () => {
    const { container } = render(
      <BubbleGroup>
        {bubbleVariantList.map((v) => (
          <Chat key={v} variant={v} />
        ))}
        <Bubble shape="note">
          <BubbleContent>a note</BubbleContent>
        </Bubble>
        <Bubble shape="sticky">
          <BubbleContent>a sticky</BubbleContent>
        </Bubble>
        <Bubble variant="outline">
          <BubbleContent asChild>
            <button type="button">Reply</button>
          </BubbleContent>
          <BubbleReactions>+1</BubbleReactions>
        </Bubble>
      </BubbleGroup>,
    )
    await axeCheck(container)
  })
})
