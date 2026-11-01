import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Folder, FolderContent, FolderTab, FolderTabs } from "@/components/ui/folder"
import { FOLDER_TAB, folderBodyRecipe, folderTabRecipe, tabPoints, type FolderTabParams } from "@/lib/ink/recipes/folder-ink"
import { makeRng } from "@/lib/ink/rng"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(96, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Files({ seed: _seed, ...props }: React.ComponentProps<typeof Folder> & { seed?: string }) {
  void _seed
  return (
    <Folder defaultValue="inbox" {...props}>
      <FolderTabs aria-label="Mail">
        <FolderTab value="inbox">Inbox</FolderTab>
        <FolderTab value="drafts">Drafts</FolderTab>
        <FolderTab value="sent" disabled>
          Sent
        </FolderTab>
        <FolderTab value="archive">Archive</FolderTab>
      </FolderTabs>
      <FolderContent value="inbox">Three letters</FolderContent>
      <FolderContent value="drafts">Two drafts</FolderContent>
      <FolderContent value="archive">Old mail</FolderContent>
    </Folder>
  )
}

describe("Folder", () => {
  it("is a real tab set: tablist, tabs, one tabpanel", () => {
    const { getByRole, getAllByRole } = render(<Files />)
    expect(getByRole("tablist", { name: "Mail" })).toHaveAttribute("data-slot", "folder-tabs")
    const tabs = getAllByRole("tab")
    expect(tabs.map((t) => t.textContent)).toEqual(["Inbox", "Drafts", "Sent", "Archive"])
    expect(tabs[0]).toHaveAttribute("aria-selected", "true")
    expect(tabs[0]).toHaveAttribute("data-state", "active")
    const panel = getByRole("tabpanel")
    expect(panel).toHaveTextContent("Three letters")
    expect(panel).toHaveAttribute("data-slot", "folder-content")
    expect(panel).toHaveAttribute("aria-labelledby", tabs[0].id)
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(1)
  })

  it("the body is a sheet of the folder's paper, square to the desk", () => {
    const { getByRole } = render(<Files />)
    const panel = getByRole("tabpanel")
    expect(panel).toHaveClass("ll-paper")
    expect(panel).toHaveAttribute("data-stock", "kraft")
    expect(panel.style.getPropertyValue("--ll-tilt")).toBe("")
  })

  it("the stock reaches every tab and the sheet", () => {
    const first = render(<Files stock="sticky-yellow" seed="s" />)
    expect(first.getByRole("tabpanel")).toHaveAttribute("data-stock", "sticky-yellow")
    const a = first.getAllByRole("tab")[0].querySelector("svg")!.innerHTML
    first.unmount()
    const second = render(<Files stock="paper" seed="s" />)
    const b = second.getAllByRole("tab")[0].querySelector("svg")!.innerHTML
    expect(a).not.toBe(b)
  })

  it("arrow keys, Home and End move between tabs and skip the disabled one; a tab opens on focus", async () => {
    const { user, getAllByRole, getByRole } = renderUI(<Files />)
    const tabs = getAllByRole("tab")
    tabs[0].focus()
    await user.keyboard("{ArrowRight}")
    expect(tabs[1]).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(tabs[3]).toHaveFocus()
    await user.keyboard("{Home}")
    expect(tabs[0]).toHaveFocus()
    await user.keyboard("{End}")
    expect(tabs[3]).toHaveFocus()
    expect(getByRole("tabpanel")).toHaveTextContent("Old mail")
  })

  it("clicking switches the panel; a disabled tab does nothing", async () => {
    const { user, getByRole, getAllByRole } = renderUI(<Files />)
    await user.click(getAllByRole("tab")[1])
    expect(getByRole("tabpanel")).toHaveTextContent("Two drafts")
    await user.click(getAllByRole("tab")[2])
    expect(getByRole("tabpanel")).toHaveTextContent("Two drafts")
    expect(getAllByRole("tab")[2]).toBeDisabled()
  })

  it("controlled: value decides, onValueChange is told", async () => {
    const onValueChange = vi.fn()
    const { user, getAllByRole, getByRole, rerender } = renderUI(<Files value="inbox" defaultValue={undefined} onValueChange={onValueChange} />)
    await user.click(getAllByRole("tab")[1])
    expect(onValueChange).toHaveBeenCalledWith("drafts")
    expect(getByRole("tabpanel")).toHaveTextContent("Three letters")
    rerender(<Files value="drafts" defaultValue={undefined} onValueChange={onValueChange} />)
    expect(getByRole("tabpanel")).toHaveTextContent("Two drafts")
  })

  it("each tab draws its own paper as its host's ink: the tab behind (rest), the one in front (checked), a wash on hover", () => {
    const { getAllByRole } = render(<Files />)
    const tab = getAllByRole("tab")[0]
    expect(tab.querySelector(":scope > svg[data-ink='folder-tab']")).not.toBeNull()
    expect(tab).toHaveAttribute("data-ink-ready")
    expect(Array.from(tab.querySelectorAll(":scope > [data-slot='paper-face']")).map((f) => f.getAttribute("data-layer"))).toEqual([null, "checked"])
    expect([...new Set(Array.from(tab.querySelectorAll(":scope > svg > g[data-layer]")).map((g) => g.getAttribute("data-layer")))]).toEqual(["rest", "checked", "hover"])
    expect(tab.querySelectorAll("svg pattern, svg image, svg mask, svg filter")).toHaveLength(0)
    const dis = getAllByRole("tab")[2]
    expect(Array.from(dis.querySelectorAll(":scope > svg > g[data-layer]")).map((g) => g.getAttribute("data-layer"))).toEqual(["disabled"])
    expect(dis.querySelector("[data-slot='paper-face']")).toBeNull()
    expectInkLayers(document.body, { min: 4, kinds: ["folder-tab", "folder"], absolute: true })
  })

  it("the open panel (a tab stop) keeps a visible focus ring, and the folder is always horizontal", () => {
    const { getByRole } = render(<Files {...({ orientation: "vertical" } as object)} />)
    const panel = getByRole("tabpanel")
    expect(panel.className).not.toContain("outline-none")
    expect(panel).toHaveAttribute("tabindex", "0")
    expect(getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal")
  })

  it("forced colors: the active tab fills with the system highlight and its text switches with it", () => {
    const { getAllByRole } = render(<Files />)
    expect(getAllByRole("tab")[0].className).toContain("data-[state=active]:[&>svg_[data-layer=hover]]:hidden")
    expect(getAllByRole("tab")[0].className).toContain("forced-colors:data-[state=active]:bg-[Highlight]")
    expect(getAllByRole("tab")[0].className).toContain("forced-colors:data-[state=active]:text-[HighlightText]")
  })

  it("tabs follow the density: 36 px comfortable, 32 compact, 28 calm (never under the 24 px hit minimum)", () => {
    const { getAllByRole } = render(<Files />)
    expect(getAllByRole("tab")[0]).toHaveClass("h-9", "compact:h-8", "calm:h-7")
  })

  it("the fold across the body is optional decoration", () => {
    const withCrease = render(<Files />)
    expect(withCrease.getByRole("tabpanel").querySelector("svg[data-ink='folder']")).not.toBeNull()
    withCrease.unmount()
    const without = render(
      <Folder defaultValue="a">
        <FolderTabs aria-label="x">
          <FolderTab value="a">A</FolderTab>
        </FolderTabs>
        <FolderContent value="a" crease={false}>
          body
        </FolderContent>
      </Folder>,
    )
    expect(without.getByRole("tabpanel").querySelector("svg[data-ink='folder']")).toBeNull()
  })

  it("passes className, ref and props through every part; Paper props reach the sheet", () => {
    const ref = React.createRef<HTMLElement>()
    const { getByTestId } = render(
      <Folder defaultValue="a" className="max-w-md" data-testid="f">
        <FolderTabs aria-label="x" className="ps-8" data-testid="l">
          <FolderTab value="a" className="px-8" data-testid="t">
            A
          </FolderTab>
        </FolderTabs>
        <FolderContent value="a" ref={ref} className="min-h-24" data-testid="c" tape="top" seed="s">
          body
        </FolderContent>
      </Folder>,
    )
    expect(getByTestId("f")).toHaveClass("max-w-md", "flex-col")
    expect(getByTestId("l")).toHaveClass("ps-8", "z-10")
    expect(getByTestId("t")).toHaveClass("px-8", "h-9")
    expect(ref.current).toBe(getByTestId("c"))
    expect(getByTestId("c")).toHaveClass("min-h-24")
    expect(getByTestId("c").querySelector('svg[data-slot="tape"]')).not.toBeNull()
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Files />)
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Files />)
    expectHydrates(<Files />, "svg[data-ink='folder-tab']", [96, 36])
  })
})

describe("folder recipes", () => {
  const p: FolderTabParams = { stock: "kraft", disabled: false }

  it("a tab has three layers; disabled has only the dashed ghost", () => {
    expect(run(folderTabRecipe, p, 96, 36).layers).toEqual(["rest", "checked", "hover"])
    expect(run(folderTabRecipe, p, 96, 36, { density: "calm" }).layers).toEqual(["rest", "checked"])
    expect(run(folderTabRecipe, { ...p, disabled: true }, 96, 36).layers).toEqual(["disabled"])
  })

  it("is deterministic per seed, differs across seeds, clean at every size, density, tier and stock", () => {
    const a = run(folderTabRecipe, p, 96, 36).parts.checked!
    expect(a).toBe(run(folderTabRecipe, p, 96, 36).parts.checked)
    expect(a).not.toBe(run(folderTabRecipe, p, 96, 36, { seed: "x" }).parts.checked)
    for (const [w, h] of [[30, 20], [96, 36], [200, 36], [80, 60]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [p, { stock: "paper" as const, disabled: false }, { stock: "kraft" as const, disabled: true }]) {
            expectClean(Object.values(run(folderTabRecipe, params, w, h, { density, tier }).parts).join(""))
          }
        }
      }
    }
  })

  it("the front tab runs down into the body and the ones behind stand lower", () => {
    const r = makeRng("t")
    const front = tabPoints(96, 36, 0, r, FOLDER_TAB.overlap)
    const behind = tabPoints(96, 36, FOLDER_TAB.lower, r)
    expect(Math.max(...front.map((q) => q[1]))).toBeCloseTo(36 + FOLDER_TAB.overlap, 0)
    expect(Math.min(...behind.map((q) => q[1]))).toBeGreaterThanOrEqual(FOLDER_TAB.lower - 0.5)
    expect(Math.min(...front.map((q) => q[1]))).toBeLessThan(1)
  })

  it("the body crease is a hairline; without it nothing is drawn", () => {
    expect(run(folderBodyRecipe, { crease: true }, 600, 300).layers).toEqual(["rest"])
    expect(run(folderBodyRecipe, { crease: false }, 600, 300).layers).toEqual([])
    expectClean(run(folderBodyRecipe, { crease: true }, 600, 300).parts.rest!)
  })

  it("stays a small drawing", () => {
    const f = run(folderTabRecipe, p, 96, 36).parts
    expect(nodes(f.checked!)).toBeLessThan(40)
    expect((f.rest ?? "").length + (f.checked ?? "").length).toBeLessThan(9000)
  })
})
