import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Badge, badgeVariants } from "@/components/ui/badge"
import { Item, ItemContent, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox } from "./helpers"

const built = vi.hoisted(() => ({ n: 0 }))
vi.mock("@/lib/ink/recipes/pencil-tiles-ink", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/ink/recipes/pencil-tiles-ink")>()
  return {
    ...orig,
    edgeTile: (...a: Parameters<typeof orig.edgeTile>) => (built.n++, orig.edgeTile(...a)),
    hatchTile: (...a: Parameters<typeof orig.hatchTile>) => (built.n++, orig.hatchTile(...a)),
    circleTile: (...a: Parameters<typeof orig.circleTile>) => (built.n++, orig.circleTile(...a)),
  }
})

let restore = () => {}
beforeEach(() => {
  restore = mockBox(80, 36)
})
afterEach(() => restore())

const flat = (css: string) => css.replace(/url\("data:[^"]+"\)/g, "url(D)")
const inks = (root: ParentNode) => root.querySelectorAll("svg[data-ink]")

describe("skeleton and item stylesheets", () => {
  it("are built once, however many skeletons and rows render or re-render", () => {
    const rows = Array.from({ length: 60 }, (_, i) => i)
    const tree = (
      <div>
        {rows.map((i) => (
          <Skeleton key={`s${i}`} className="h-4 w-20" />
        ))}
        <ItemGroup>
          {rows.map((i) => (
            <Item key={`i${i}`}>
              <ItemContent>
                <ItemTitle>Row {i}</ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    )
    const { rerender } = render(tree)
    rerender(<div>{tree.props.children}</div>)
    expect(built.n).toBe(12 + 9)
  })

  it("sit in the components layer, so a utility on a skeleton or a row (absolute, bg-*, size-*) wins; the layer order is pinned first", async () => {
    const { skeletonCss } = await import("@/lib/ink/recipes/skeleton-ink")
    const { itemCss } = await import("@/lib/ink/recipes/item-ink")
    for (const css of [flat(skeletonCss()), flat(itemCss())]) {
      const head = "@layer theme,base,components,utilities;@layer components{"
      expect(css.startsWith(head)).toBe(true)
      let depth = 1
      let i = head.length
      for (; i < css.length && depth > 0; i++) depth += css[i] === "{" ? 1 : css[i] === "}" ? -1 : 0
      expect(css.slice(i).startsWith("@media (forced-colors:active){")).toBe(true)
      expect(css.slice(i).match(/@media/g)).toHaveLength(1)
      expect(css.slice(head.length, i)).not.toContain("forced-colors")
    }
  })

  it("does not clip the four outline strips of a skeleton at an inherited corner radius (rounded-xl); only the hatch follows it", async () => {
    const { skeletonCss } = await import("@/lib/ink/recipes/skeleton-ink")
    const css = flat(skeletonCss())
    const rule = (sel: string) => new RegExp(`(?:^|[{}])${sel.replace(/[[\]]/g, "\\$&")}\\{([^}]*)\\}`).exec(css)?.[1] ?? ""
    expect(rule("[data-slot=skeleton]::before")).not.toContain("border-radius")
    expect(rule("[data-slot=skeleton]::after")).toContain("border-radius:inherit")
    expect(rule("[data-slot=skeleton]::before,[data-slot=skeleton]::after")).not.toContain("border-radius")
  })
})

describe("ItemSeparator between hundreds of rows", () => {
  it("the default pencil line is a Radix separator drawn by the stylesheet: no svg, no ink host", () => {
    const { container } = render(
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>One</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemTitle>Two</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    )
    const sep = container.querySelector("[data-slot=item-separator]")!
    expect(sep).toHaveAttribute("role", "none")
    expect(sep).toHaveAttribute("data-orientation", "horizontal")
    expect(sep).toHaveAttribute("data-variant", "pencil")
    expect(sep).toHaveAttribute("data-frame")
    expect(sep).not.toHaveAttribute("data-ink-host")
    expect(inks(container)).toHaveLength(0)
  })

  it("200 rows with a separator between each still carry no ink", () => {
    const { container } = render(
      <ItemGroup>
        {Array.from({ length: 200 }, (_, i) => (
          <React.Fragment key={i}>
            <Item>
              <ItemContent>
                <ItemTitle>Row {i}</ItemTitle>
              </ItemContent>
            </Item>
            <ItemSeparator />
          </React.Fragment>
        ))}
      </ItemGroup>
    )
    expect(container.querySelectorAll("[data-slot=item-separator]")).toHaveLength(200)
    expect(inks(container)).toHaveLength(0)
  })

  it("decorative={false} is a real separator; another variant or a label is the drawn Separator", () => {
    const { container } = render(
      <div>
        <ItemSeparator decorative={false} aria-label="end of list" />
        <ItemSeparator variant="dashed" />
        <ItemSeparator>or</ItemSeparator>
      </div>
    )
    const seps = container.querySelectorAll("[data-slot=item-separator]")
    expect(seps[0]).toHaveAttribute("role", "separator")
    expect(seps[0]).not.toHaveAttribute("data-ink-host")
    expect(seps[1]).toHaveAttribute("data-ink-host")
    expect(seps[1]).toHaveAttribute("data-variant", "dashed")
    expect(seps[2]).toHaveAttribute("data-variant", "pencil")
    expect(seps[2]).toHaveTextContent("or")
  })

  it("renders the same bytes twice on the server and hydrates without warnings", () => {
    const ui = (
      <InkProvider>
        <ItemGroup>
          <Item>
            <ItemContent>
              <ItemTitle>One</ItemTitle>
            </ItemContent>
          </Item>
          <ItemSeparator />
          <ItemSeparator variant="wavy" />
          <Item>
            <ItemContent>
              <ItemTitle>Two</ItemTitle>
            </ItemContent>
          </Item>
        </ItemGroup>
      </InkProvider>
    )
    const html = renderToString(ui)
    expect(renderToString(ui)).toBe(html)
    const container = document.createElement("div")
    document.body.appendChild(container)
    container.innerHTML = html
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined
    act(() => {
      root = hydrateRoot(container, ui)
    })
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
    expect(container.querySelectorAll("[data-slot=item-separator]")).toHaveLength(2)
    act(() => root?.unmount())
    container.remove()
  })

  it("has no axe violations in a list", async () => {
    const { container } = render(
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>One</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemTitle>Two</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    )
    await axeCheck(container)
  })
})

describe("Item", () => {
  it("an Item nested inside a row is not a list item of the outer list", () => {
    const { container } = render(
      <ItemGroup>
        <Item data-testid="outer">
          <ItemContent>
            <Item data-testid="inner">
              <ItemTitle>inner</ItemTitle>
            </Item>
          </ItemContent>
        </Item>
      </ItemGroup>
    )
    expect(container.querySelector("[data-testid=outer]")).toHaveAttribute("role", "listitem")
    expect(container.querySelector("[data-testid=inner]")).not.toHaveAttribute("role")
  })

  it("ItemContent can shrink, so a long title cannot push the actions out of the row", () => {
    const { container } = render(
      <Item>
        <ItemContent>
          <ItemTitle>x</ItemTitle>
        </ItemContent>
      </Item>
    )
    expect(container.querySelector("[data-slot=item-content]")).toHaveClass("min-w-0", "flex-1")
  })
})

describe("Spinner", () => {
  it("a size that is not a number falls back to the default instead of drawing NaN", () => {
    for (const size of [NaN, Infinity, -Infinity]) {
      const { container, unmount } = render(<Spinner size={size} />)
      expect(container.innerHTML).not.toMatch(/NaN|Infinity|undefined/)
      unmount()
    }
    const { container } = render(<Spinner variant="write" size={NaN} />)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity|undefined/)
  })
})

describe("ToggleGroupItem", () => {
  const boxOf = (el: Element) => Array.from(el.querySelectorAll(":scope > svg[data-ink] > g[data-layer=rest] path")).length

  it("an item that asks for outline in a group with no variant draws a box of its own, not just a seam", () => {
    const { getAllByRole } = render(
      <ToggleGroup type="single" aria-label="x">
        <ToggleGroupItem value="a" variant="outline">
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b" variant="outline">
          B
        </ToggleGroupItem>
      </ToggleGroup>
    )
    for (const item of getAllByRole("radio")) {
      expect(item.querySelector("[data-part=seam]")).toBeNull()
      expect(boxOf(item)).toBeGreaterThanOrEqual(3)
    }
  })

  it("items of a group with variant outline and no spacing still share the group's box and draw only seams", () => {
    const { getAllByRole } = render(
      <ToggleGroup type="single" variant="outline" aria-label="x">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    )
    for (const item of getAllByRole("radio")) expect(item.querySelector("[data-part=seam]")).not.toBeNull()
  })
})

describe("Toggle aria-invalid", () => {
  const red = (el: Element, layer: string) => el.querySelector(`svg[data-ink] > g[data-layer=${layer}]`)?.innerHTML.includes("--ll-red") ?? false

  it.each(["default", "outline"] as const)("%s: the box is red pencil at rest and again over the body when on", (variant) => {
    const { getByRole, rerender } = render(
      <Toggle variant={variant} aria-label="agree" aria-invalid="true">
        Agree
      </Toggle>
    )
    const b = getByRole("button")
    expect(red(b, "rest")).toBe(true)
    expect(red(b, "checked")).toBe(true)
    rerender(
      <Toggle variant={variant} aria-label="agree">
        Agree
      </Toggle>
    )
    expect(red(getByRole("button"), "rest")).toBe(false)
    expect(red(getByRole("button"), "checked")).toBe(false)
  })

  it("a disabled toggle keeps its pale alternative", () => {
    const { getByRole } = render(
      <Toggle variant="outline" disabled aria-invalid="true">
        Agree
      </Toggle>
    )
    expect(red(getByRole("button"), "rest")).toBe(false)
  })

  it("an item of a separate group draws its red box too", () => {
    const { getByRole } = render(
      <ToggleGroup type="single" variant="outline" spacing={2} aria-label="x">
        <ToggleGroupItem value="a" aria-invalid="true">
          A
        </ToggleGroupItem>
      </ToggleGroup>
    )
    expect(red(getByRole("radio"), "rest")).toBe(true)
  })
})

describe("hit areas and calm density", () => {
  it("a link badge keeps a 24 px hit area in calm density (its drawn height is 20)", () => {
    const cls = badgeVariants({ size: "default" })
    expect(cls).toContain("calm:h-5")
    expect(cls).toContain("calm:[&:is(a,button)]:after:-inset-y-0.5")
    const { getByText } = render(
      <Badge asChild>
        <a href="#x">Docs</a>
      </Badge>
    )
    expect(getByText("Docs").className).toContain("calm:[&:is(a,button)]:after:absolute")
  })

  it("the calm keycap keeps its padding physical, like the rest of the cap (the thickness is drawn to the right whatever the direction)", () => {
    const { getByText } = render(<Kbd>K</Kbd>)
    const c = getByText("K").className
    expect(c).toContain("calm:pr-1")
    expect(c).not.toContain("calm:pe-1")
  })
})
