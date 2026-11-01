import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Clipboard, ClipboardPaper } from "@/components/ui/clipboard"
import { clipboardBoardRecipe, clipboardClip, type BoardTone } from "@/lib/ink/recipes/clipboard-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(420, 600)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Board(props: React.ComponentProps<typeof Clipboard>) {
  return (
    <Clipboard {...props}>
      <ClipboardPaper>
        <p>Packing list</p>
      </ClipboardPaper>
    </Clipboard>
  )
}

describe("Clipboard", () => {
  it("renders the board, the paper and the clip", () => {
    const { container, getByText } = render(<Board />)
    for (const slot of ["clipboard", "clipboard-paper", "clipboard-clip"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    const b = container.firstElementChild as HTMLElement
    expect(b).toHaveAttribute("data-tone", "hardboard")
    expect(b).toHaveClass("relative", "isolate", "pt-14")
    const paper = getByText("Packing list").closest("[data-slot=clipboard-paper]")!
    expect(paper).toHaveAttribute("data-stock", "paper")
    expect(paper).toHaveClass("ll-paper")
    expect(container.querySelector('[data-slot="paper-rules"]')).not.toBeNull()
  })

  it("the board is one drawn sheet on the root, once measured, and takes over from the plain fallback", () => {
    const { container } = render(<Board seed="c" />)
    const b = container.firstElementChild as HTMLElement
    expect(b.querySelector(":scope > svg[data-ink='sheet']")).not.toBeNull()
    expect(b).toHaveAttribute("data-ink-ready")
    expect(b.className).not.toContain("bg-kraft")
    expect(b.style.getPropertyValue("--ll-tilt")).toMatch(/deg$/)
    expectInkLayers(container, { min: 1, kinds: ["sheet", "prop"], absolute: false })
  })

  it("until it is measured it wears a plain board", () => {
    restore()
    restore = () => {}
    const { container } = render(<Board />)
    expect(container.firstElementChild).toHaveClass("bg-kraft", "shadow-card")
    expect(container.querySelector("svg[data-ink='sheet']")).toBeNull()
  })

  it("the clip is an intrinsic prop drawn over the paper: aria-hidden, no pointer events, flat in calm density", () => {
    const { container } = render(<Board />)
    const clip = container.querySelector('svg[data-slot="clipboard-clip"]') as SVGElement
    expect(clip).toHaveAttribute("aria-hidden", "true")
    expect(clip).toHaveAttribute("data-ink", "prop")
    expect(clip.getAttribute("class")).toContain("pointer-events-none")
    expect(clip.getAttribute("class")).toContain("calm:hidden")
    expect(clip.compareDocumentPosition(container.querySelector('[data-slot="clipboard-paper"]')!) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
  })

  it.each(["hardboard", "tomato", "teal", "sky"] as BoardTone[])("tone %s is its own board", (tone) => {
    const html = (t: BoardTone) => {
      const { container, unmount } = render(<Board tone={t} seed="t" />)
      const out = container.querySelector("svg[data-ink='sheet']")!.innerHTML
      unmount()
      return out
    }
    expect(html(tone)).toBe(html(tone))
    if (tone !== "hardboard") expect(html(tone)).toContain(`var(--ll-${tone})`)
    else expect(html(tone)).not.toBe(html("teal"))
  })

  it("the paper takes Paper props (stock, rules, tape ...) and any element", () => {
    const { container } = render(
      <Clipboard>
        <ClipboardPaper stock="graph" rules="graph" as="form" tape="corner" aria-label="Form" className="min-h-40" id="p1">
          x
        </ClipboardPaper>
      </Clipboard>,
    )
    const p = container.querySelector('[data-slot="clipboard-paper"]') as HTMLElement
    expect(p.tagName).toBe("FORM")
    expect(p).toHaveAttribute("data-stock", "graph")
    expect(p).toHaveClass("min-h-40")
    expect(p.querySelector('svg[data-slot="tape"]')).not.toBeNull()
  })

  it("the paper pads its margin side with a logical property and flips its printed rules in right-to-left", () => {
    const { container } = render(<Board />)
    const cls = (container.querySelector('[data-slot="clipboard-paper"]') as HTMLElement).className
    expect(cls).toMatch(/(^|\s)ps-14(\s|$)/)
    expect(cls).not.toMatch(/(^|\s)(pl|pr)-/)
    expect(cls).toContain("rtl:[&>[data-slot=paper-rules]]:-scale-x-100")
  })

  it("passes className, ref, style and props through; takes a tilt", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByTestId } = render(<Board ref={ref} className="max-w-sm" style={{ minHeight: 200 }} data-testid="b" id="x" tilt={-1} />)
    expect(ref.current).toBe(getByTestId("b"))
    expect(getByTestId("b")).toHaveClass("max-w-sm")
    expect(getByTestId("b").style.minHeight).toBe("200px")
    expect(getByTestId("b").style.getPropertyValue("--ll-tilt")).toBe("-1deg")
  })

  it("has no axe violations (with a form on the paper)", async () => {
    const { container } = renderUI(
      <Clipboard>
        <ClipboardPaper as="form" aria-label="Sign in sheet">
          <label>
            Name <input name="n" />
          </label>
        </ClipboardPaper>
      </Clipboard>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Board size={[420, 600]} seed="s" />)
    expectHydrates(<Board seed="h" tone="teal" />, "svg[data-ink='sheet']", [420, 600])
  })
})

describe("clipboard recipes", () => {
  it("the board is deterministic per seed, clean at every size, density, tier and tone", () => {
    const a = run(clipboardBoardRecipe, { tone: "hardboard" }, 420, 600).parts.rest!
    expect(a).toBe(run(clipboardBoardRecipe, { tone: "hardboard" }, 420, 600).parts.rest)
    expect(a).not.toBe(run(clipboardBoardRecipe, { tone: "hardboard" }, 420, 600, { seed: "x" }).parts.rest)
    for (const [w, h] of [[60, 80], [240, 320], [420, 600], [900, 1200]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const tone of ["hardboard", "tomato", "sky"] as const) {
            const f = run(clipboardBoardRecipe, { tone }, w, h, { density, tier })
            expect(f.layers).toEqual(["rest"])
            expectClean(f.parts.rest!)
          }
        }
      }
    }
    expect(nodes(a)).toBeLessThan(50)
    expect(a.length).toBeLessThan(12000)
  })

  it("the clip is a small deterministic prop of the width it is asked for", () => {
    const c = clipboardClip("k", { width: 104 })
    expect(c.svg).toBe(clipboardClip("k", { width: 104 }).svg)
    expect(c.svg).not.toBe(clipboardClip("other", { width: 104 }).svg)
    expect(c.w).toBe(104)
    expect(c.h).toBeCloseTo(104 * 0.42, 1)
    for (const tier of ["lo", "hi"] as const) expectClean(clipboardClip("k", { width: 60, tier }).svg)
    expect(c.svg.length).toBeLessThan(4000)
  })

  it("a colored plastic board is gone round with a felt tip (it would read as a clean vector otherwise); hardboard and calm density are not", () => {
    const felt = (params: { tone: BoardTone }, density: "comfortable" | "calm" = "comfortable") => run(clipboardBoardRecipe, params, 420, 600, { density }).parts.rest!
    expect(felt({ tone: "teal" })).toContain("ll-felt")
    expect(felt({ tone: "hardboard" })).not.toContain("ll-felt")
    expect(felt({ tone: "teal" }, "calm")).not.toContain("ll-felt")
    expect(felt({ tone: "teal" }).length).toBeLessThan(14000)
  })
})
