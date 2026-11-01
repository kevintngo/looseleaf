import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Notebook, NotebookCover, NotebookCoverLabel, NotebookPage, NotebookTitle, NotebookTurn } from "@/components/ui/notebook"
import { ruleGeometry } from "@/lib/ink/paper/stocks"
import { NOTEBOOK, SPINE, notebookCoverRecipe, notebookHoles, notebookRecipe, type NotebookParams } from "@/lib/ink/recipes/notebook-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(480, 600)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Book(props: React.ComponentProps<typeof Notebook>) {
  return (
    <Notebook aria-label="Field notes" {...props}>
      <NotebookPage value="mon">
        <NotebookTitle>Monday</NotebookTitle>
        <p>Rain on the window.</p>
      </NotebookPage>
      <NotebookPage value="tue">
        <NotebookTitle>Tuesday</NotebookTitle>
        <p>Three cups of tea.</p>
      </NotebookPage>
      <NotebookTurn to="tue">Next page</NotebookTurn>
    </Notebook>
  )
}

describe("Notebook", () => {
  it("renders its parts with their data-slots on a Paper with ruled lines", () => {
    const { container } = render(<Book />)
    for (const slot of ["notebook", "notebook-page", "notebook-title", "notebook-turn"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    const nb = container.firstElementChild as HTMLElement
    expect(nb).toHaveClass("ll-paper", "font-hand")
    expect(nb).toHaveAttribute("data-binding", "spiral")
    expect(nb).toHaveAttribute("data-side", "start")
    expect(nb).toHaveAttribute("data-stock", "paper")
    expect(container.querySelector('[data-slot="paper-rules"]')).not.toBeNull()
    expect(nb.className).toContain("rtl:[&>[data-slot=paper-rules]]:-scale-x-100")
  })

  it("the script title is lifted by the rule offset less about 3 px so its baseline stands on its rule (tunable with --ll-rule-offset)", () => {
    const { getByText } = render(<Book />)
    const title = getByText("Monday")
    expect(title).toHaveClass("relative", "leading-7", "top-[calc(2.8px-var(--ll-rule-offset,8px))]", "calm:top-[calc(0.8px-var(--ll-rule-offset,6px))]", "calm:leading-6")
    expect(title.className).toContain("group-data-[side=top]/notebook:leading-[30px]")
    expect(title.closest("[data-slot=notebook]")).toHaveClass("group/notebook")
  })

  it("keeps text on the 28 px rhythm: line height 7, room for the binding on the start side; a top-bound pad uses the 30 px pad rules", () => {
    const { container, rerender } = render(<Book />)
    const nb = container.firstElementChild as HTMLElement
    expect(nb).toHaveClass("ps-14", "pt-4", "leading-7", "calm:leading-6")
    expect(ruleGeometry("ruled").first).toBe(16 + 28)
    expect(ruleGeometry("ruled", { calm: true }).first).toBe(16 + 24)
    rerender(<Book side="top" />)
    expect(nb).toHaveClass("pt-10", "leading-[30px]", "ps-6")
    expect(ruleGeometry("pad").first).toBe(40)
    expect(nb).toHaveAttribute("data-side", "top")
    rerender(<Book rules="graph" />)
    expect(nb).toHaveAttribute("data-side", "start")
  })

  it("draws the binding as a second layer of ink on the root, once measured", () => {
    const { container } = render(<Book />)
    const nb = container.firstElementChild as HTMLElement
    const svg = container.querySelector('svg[data-ink="notebook"]')!
    expect(svg).not.toBeNull()
    expect(svg.parentElement).toBe(nb)
    expect(nb).toHaveAttribute("data-ink-host")
    expect(nb).toHaveAttribute("data-ink-ready")
    expect(nb.style.getPropertyValue("--ll-tilt-decor")).toBe(nb.style.getPropertyValue("--ll-tilt"))
    expectInkLayers(container, { min: 1, kinds: ["notebook"], absolute: true, layers: ["rest"] })
  })

  it("is bare when there is nothing to bind and nothing under it", () => {
    const { container } = render(<Book binding="none" pages={0} />)
    expect(container.querySelector('svg[data-ink="notebook"]')).toBeNull()
    expect(container.firstElementChild).not.toHaveAttribute("data-ink-host")
  })

  it("the pages under it are drawn without a binding", () => {
    const { container } = render(<Book binding="none" pages={3} />)
    expect(container.querySelector('svg[data-ink="notebook"]')).not.toBeNull()
  })

  it("each binding is its own drawing", () => {
    const html = (binding: "spiral" | "rings" | "stitched") => {
      const { container, unmount } = render(<Book binding={binding} seed="b" />)
      const out = container.querySelector('svg[data-ink="notebook"]')!.innerHTML
      unmount()
      return out
    }
    const [a, b, c] = [html("spiral"), html("rings"), html("stitched")]
    expect(new Set([a, b, c]).size).toBe(3)
  })

  it("passes stock, curl, tape, className, ref and props through", () => {
    const ref = React.createRef<HTMLElement>()
    const { container } = render(<Book ref={ref} stock="graph" curl tape="top" className="w-96" id="nb" as="section" />)
    const nb = container.firstElementChild as HTMLElement
    expect(ref.current).toBe(nb)
    expect(nb.tagName).toBe("SECTION")
    expect(nb).toHaveAttribute("data-stock", "graph")
    expect(nb).toHaveAttribute("data-edge", "curl")
    expect(nb).toHaveClass("w-96")
    expect(container.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(1)
  })
})

describe("turning pages", () => {
  it("shows one page at a time; a page without a value is always shown", async () => {
    const { user, getByRole, getByText, queryByText } = renderUI(
      <Notebook defaultValue="mon" aria-label="nb">
        <NotebookPage value="mon">Monday text</NotebookPage>
        <NotebookPage value="tue">Tuesday text</NotebookPage>
        <NotebookPage>Always</NotebookPage>
        <NotebookTurn to="tue" />
      </Notebook>,
    )
    expect(getByText("Monday text")).toBeVisible()
    expect(queryByText("Tuesday text")).not.toBeVisible()
    expect(getByText("Always")).toBeVisible()
    await user.click(getByRole("button", { name: "Turn the page" }))
    expect(queryByText("Monday text")).not.toBeVisible()
    expect(getByText("Tuesday text")).toBeVisible()
    expect(getByText("Tuesday text").closest("section")).toHaveAttribute("data-state", "active")
  })

  it("turns with the keyboard (Enter and Space) and the button is named", async () => {
    const { user, getByRole, getByText } = renderUI(<Book defaultValue="mon" />)
    const turn = getByRole("button", { name: "Next page" })
    expect(turn).toHaveAttribute("type", "button")
    turn.focus()
    await user.keyboard("{Enter}")
    expect(getByText("Three cups of tea.")).toBeVisible()
  })

  it("controlled: the value decides, onValueChange is told", async () => {
    const onValueChange = vi.fn()
    const { user, getByRole, getByText, rerender } = renderUI(<Book value="mon" onValueChange={onValueChange} />)
    await user.click(getByRole("button", { name: "Next page" }))
    expect(onValueChange).toHaveBeenCalledWith("tue")
    expect(getByText("Rain on the window.")).toBeVisible()
    rerender(<Book value="tue" onValueChange={onValueChange} />)
    expect(getByText("Three cups of tea.")).toBeVisible()
  })

  it("onClick runs first and can stop the turn; asChild puts the corner on your element", async () => {
    const { user, getByRole, getByText } = renderUI(
      <Notebook defaultValue="mon">
        <NotebookPage value="mon">one</NotebookPage>
        <NotebookPage value="tue">two</NotebookPage>
        <NotebookTurn to="tue" onClick={(e) => e.preventDefault()}>
          stay
        </NotebookTurn>
        <NotebookTurn to="tue" asChild>
          <a href="#next">go</a>
        </NotebookTurn>
      </Notebook>,
    )
    await user.click(getByRole("button", { name: "stay" }))
    expect(getByText("one")).toBeVisible()
    const link = getByRole("link", { name: "go" })
    expect(link).toHaveAttribute("data-slot", "notebook-turn")
    expect(link).not.toHaveAttribute("type")
  })

  it("a page that is turned to unfolds from the dog-ear, but only once the notebook has painted: the page open at load is just there", () => {
    const { container } = render(
      <Notebook defaultValue="mon">
        <NotebookPage value="mon">one</NotebookPage>
        <NotebookPage value="tue">two</NotebookPage>
      </Notebook>,
    )
    const pages = container.querySelectorAll('[data-slot="notebook-page"]')
    for (const p of pages) {
      expect(p.className).toContain("starting:[clip-path:polygon(100%_100%")
      expect(p.className).toContain("transition-[clip-path]")
    }
    const plain = render(<NotebookPage>always</NotebookPage>)
    expect(plain.container.firstElementChild!.className).not.toContain("clip-path")
  })

  it("outside a notebook a turn button is inert and pages are shown", () => {
    const { getByText, getByRole } = render(
      <>
        <NotebookPage value="x">alone</NotebookPage>
        <NotebookTurn to="y" />
      </>,
    )
    expect(getByText("alone")).toBeVisible()
    expect(getByRole("button")).toBeEnabled()
  })

  it("has no axe violations, with the dog-ear and a hidden page", async () => {
    const { container } = renderUI(<Book curl defaultValue="mon" />)
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    const html = expectSsrStable(<Book size={[480, 600]} seed="s" defaultValue="mon" />)
    expect(html).toContain('data-ink="notebook"')
    expectHydrates(<Book seed="h" defaultValue="mon" />, 'svg[data-ink="notebook"]', [480, 600])
  })
})

describe("notebookRecipe", () => {
  const p: NotebookParams = { binding: "spiral", side: "start", pages: 2, tone: "steel" }

  it("puts a hole about every 24 px along the edge, fewer rings, none without a binding", () => {
    const h = notebookHoles(600, "spiral")
    expect(h.length).toBe(24)
    expect(h[0]).toBe(NOTEBOOK.inset)
    expect(h[h.length - 1]).toBe(600 - NOTEBOOK.inset)
    const gaps = h.slice(1).map((y, i) => y - h[i])
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThan(0.001)
    expect(notebookHoles(600, "rings")).toHaveLength(3)
    expect(notebookHoles(300, "rings")).toHaveLength(2)
    expect(notebookHoles(120, "rings")).toHaveLength(1)
    expect(notebookHoles(600, "none")).toHaveLength(0)
    expect(notebookHoles(30, "stitched").length).toBeGreaterThanOrEqual(1)
  })

  it("is deterministic per seed, differs across seeds, clean at every size, density, tier, side and binding", () => {
    const a = run(notebookRecipe, p, 480, 600).parts.rest!
    expect(a).toBe(run(notebookRecipe, p, 480, 600).parts.rest)
    expect(a).not.toBe(run(notebookRecipe, p, 480, 600, { seed: "z" }).parts.rest)
    for (const [w, h] of [[60, 60], [320, 200], [480, 600], [1200, 900]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const binding of ["spiral", "rings", "stitched", "none"] as const) {
            for (const side of ["start", "top"] as const) {
              const f = run(notebookRecipe, { ...p, binding, side, tone: "tomato" }, w, h, { density, tier })
              expect(f.layers).toEqual(["rest"])
              expectClean(f.parts.rest!)
            }
          }
        }
      }
    }
  })

  it("mirrors for right-to-left and rotates onto the top edge", () => {
    expect(run(notebookRecipe, p, 480, 600, { dir: "rtl" }).parts.rest).toContain("scale(-1 1)")
    expect(run(notebookRecipe, p, 480, 600).parts.rest).not.toContain("scale(-1 1)")
    expect(run(notebookRecipe, { ...p, side: "top" }, 480, 600).parts.rest).toContain("rotate(90)")
  })

  it("lays the next sheet in the notch of a dog-eared corner, so the fold does not open onto the desk", () => {
    const plain = run(notebookRecipe, p, 480, 600).parts.rest!
    const eared = run(notebookRecipe, { ...p, curl: true }, 480, 600).parts.rest!
    expect(plain).not.toContain("M445 601H481V565z")
    expect(eared).toContain("M445 601H481V565z")
    expect(eared.length).toBeGreaterThan(plain.length)
    expect(run(notebookRecipe, { ...p, curl: true, pages: 0 }, 480, 600).parts.rest).not.toContain("M445 601H481V565z")
    expect(run(notebookRecipe, { ...p, curl: true }, 480, 600, { density: "calm" }).parts.rest).not.toContain("M445 601H481V565z")
  })

  it("stays inside a sane budget: a spiral is a wire per hole, pages are a few bands", () => {
    const f = run(notebookRecipe, p, 480, 600).parts.rest!
    expect(nodes(f)).toBeLessThan(400)
    expect(f.length).toBeLessThan(12000)
    const pages = run(notebookRecipe, { ...p, binding: "none" }, 480, 600).parts.rest!
    expect(nodes(pages)).toBeLessThan(40)
    expect(pages.length).toBeLessThan(4000)
  })
})

describe("NotebookCover", () => {
  it("is a closed notebook: one drawn sheet with a label on it", () => {
    const { container, getByText } = render(
      <NotebookCover tone="teal" seed="c">
        <NotebookCoverLabel>Recipes</NotebookCoverLabel>
      </NotebookCover>,
    )
    const c = container.firstElementChild as HTMLElement
    expect(c).toHaveAttribute("data-slot", "notebook-cover")
    expect(c).toHaveAttribute("data-tone", "teal")
    expect(c.querySelector(":scope > svg[data-ink='sheet']")).not.toBeNull()
    expect(c).toHaveAttribute("data-ink-ready")
    expect(c.style.getPropertyValue("--ll-tilt")).toMatch(/deg$/)
    const label = getByText("Recipes")
    const body = label.closest<HTMLElement>("[data-slot=notebook-cover-body]")
    expect(body).not.toBeNull()
    expect(body!.parentElement).toBe(c)
    expect(body).toHaveClass("absolute", "inset-0")
    expect(body).toHaveClass("ps-5", "pt-[3.25rem]", "pe-[calc(max(22px,15%)+6px)]")
    expect(label).toHaveAttribute("data-slot", "notebook-cover-label")
    expect(label).toHaveAttribute("data-stock", "index-card")
    expectInkLayers(container, { min: 1, kinds: ["sheet"], absolute: true })
  })

  it("until it is measured it wears a plain cover; tone, band and className reach the drawing and the element", () => {
    restore()
    restore = () => {}
    const plain = render(<NotebookCover />)
    expect(plain.container.firstElementChild).toHaveClass("bg-paper-shade", "shadow-card")
    plain.unmount()
    restore = mockBox(176, 240)
    const html = (p: Partial<React.ComponentProps<typeof NotebookCover>>) => {
      const { container, unmount } = render(<NotebookCover seed="x" {...p} />)
      const out = container.querySelector("svg")!.innerHTML
      unmount()
      return out
    }
    const base = html({})
    expect(html({ tone: "sky" })).not.toBe(base)
    expect(html({ band: false })).not.toBe(base)
    const { getByTestId } = render(<NotebookCover className="h-72 w-52" data-testid="nc" />)
    expect(getByTestId("nc")).toHaveClass("h-72", "w-52")
  })

  it("has no axe violations and hydrates cleanly", async () => {
    const { container } = renderUI(
      <NotebookCover role="group" aria-label="Recipes notebook">
        <NotebookCoverLabel>Recipes</NotebookCoverLabel>
      </NotebookCover>,
    )
    await axeCheck(container)
    expectSsrStable(<NotebookCover size={[176, 240]} seed="s" />)
    expectHydrates(<NotebookCover seed="h" />, "svg[data-ink='sheet']", [176, 240])
  })

  it("the recipe is clean at every size, density, tier and tone, mirrors for RTL, and stays small", () => {
    const p = { tone: "tomato" as const, band: true }
    const a = run(notebookCoverRecipe, p, 176, 240).parts.rest!
    expect(a).toBe(run(notebookCoverRecipe, p, 176, 240).parts.rest)
    expect(a).not.toBe(run(notebookCoverRecipe, p, 176, 240, { seed: "z" }).parts.rest)
    for (const [w, h] of [[40, 60], [176, 240], [400, 560]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const tone of ["tomato", "ink", "grape"] as const) expectClean(run(notebookCoverRecipe, { tone, band: false }, w, h, { density, tier }).parts.rest!)
        }
      }
    }
    expect(run(notebookCoverRecipe, p, 176, 240, { dir: "rtl" }).parts.rest).toContain("scale(-1 1)")
    expect(nodes(a)).toBeLessThan(40)
    expect(a.length).toBeLessThan(6000)
    expect(SPINE).toBeGreaterThan(8)
  })

  it("the cover is gone round with a felt tip so the smooth cloth does not read as a clean vector; calm density leaves it out", () => {
    const p = { tone: "tomato" as const, band: true }
    expect(run(notebookCoverRecipe, p, 176, 240).parts.rest).toContain("ll-felt")
    expect(run(notebookCoverRecipe, p, 176, 240, { density: "calm" }).parts.rest).not.toContain("ll-felt")
  })
})
