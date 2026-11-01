import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"
import { InkProvider } from "@/lib/ink/react"
import { ITEM_FRAMES, itemCss } from "@/lib/ink/recipes/item-ink"
import { axeCheck, renderUI } from "./helpers"

const Row = (props: React.ComponentProps<typeof Item>) => (
  <Item {...props}>
    <ItemMedia variant="icon">
      <Icon name="bell" />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Notifications</ItemTitle>
      <ItemDescription>Choose what lands in your inbox.</ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button size="sm" variant="outline">
        Edit
      </Button>
    </ItemActions>
  </Item>
)

describe("Item structure", () => {
  it("keeps upstream's parts and slots", () => {
    const { container } = render(
      <Item>
        <ItemHeader>head</ItemHeader>
        <ItemMedia>m</ItemMedia>
        <ItemContent>
          <ItemTitle>t</ItemTitle>
          <ItemDescription>d</ItemDescription>
        </ItemContent>
        <ItemActions>a</ItemActions>
        <ItemFooter>foot</ItemFooter>
      </Item>
    )
    for (const slot of ["item", "item-header", "item-media", "item-content", "item-title", "item-description", "item-actions", "item-footer"]) {
      expect(container.querySelector(`[data-slot=${slot}]`), slot).toBeTruthy()
    }
    expect(container.querySelector("[data-slot=item-description]")?.tagName).toBe("P")
    const item = container.querySelector("[data-slot=item]") as HTMLElement
    expect(item.tagName).toBe("DIV")
    expect(item).toHaveAttribute("data-variant", "default")
    expect(item).toHaveAttribute("data-size", "default")
    expect(item).toHaveClass("group/item", "flex", "flex-wrap", "items-center")
    expect(item).toHaveClass("gap-4", "p-4")
  })

  it("variants and sizes set their data attributes and spacing", () => {
    const { container } = render(
      <div>
        <Item variant="outline" data-testid="o" />
        <Item variant="muted" size="sm" data-testid="m" />
      </div>
    )
    const o = container.querySelector("[data-testid=o]") as HTMLElement
    const m = container.querySelector("[data-testid=m]") as HTMLElement
    expect(o).toHaveAttribute("data-variant", "outline")
    expect(m).toHaveAttribute("data-variant", "muted")
    expect(m).toHaveAttribute("data-size", "sm")
    expect(m).toHaveClass("gap-2.5", "px-4", "py-3")
  })

  it("has no ink: not one svg for a list of a hundred rows, and one hoisted stylesheet", () => {
    const { container } = render(
      <ItemGroup ruled>
        {Array.from({ length: 100 }, (_, i) => (
          <Item key={i} variant={i % 2 ? "outline" : "muted"}>
            <ItemContent>
              <ItemTitle>Row {i}</ItemTitle>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    )
    expect(container.querySelectorAll("[data-slot=item]")).toHaveLength(100)
    expect(container.querySelectorAll("svg")).toHaveLength(0)
    expect(document.head.querySelectorAll('style[data-href="ll-item"]')).toHaveLength(1)
  })

  it("a link or button row lights up under the highlighter swipe; a plain row does not", () => {
    const { container } = render(
      <div>
        <Item />
      </div>
    )
    expect(container.querySelector("[data-slot=item]")).toHaveClass("[&:is(a,button)]:hover:ll-swipe")
  })

  it("draws each row with one of three hands, chosen from its seed", () => {
    const { container } = render(
      <div>
        {Array.from({ length: 30 }, (_, i) => (
          <Item key={i} seed={i} />
        ))}
      </div>
    )
    const frames = new Set(Array.from(container.querySelectorAll("[data-slot=item]")).map((e) => e.getAttribute("data-frame")))
    expect(frames.size).toBe(ITEM_FRAMES)
  })

  it("ItemMedia variants: an icon well and a photo that lies a little crooked", () => {
    const { container } = render(
      <div>
        <ItemMedia variant="icon" data-testid="i" />
        <ItemMedia variant="image" data-testid="p">
          <img alt="" src="data:," />
        </ItemMedia>
      </div>
    )
    const i = container.querySelector("[data-testid=i]") as HTMLElement
    const p = container.querySelector("[data-testid=p]") as HTMLElement
    expect(i).toHaveAttribute("data-variant", "icon")
    expect(i).toHaveClass("size-9")
    expect(i).toHaveAttribute("data-frame")
    expect(p).toHaveClass("size-10", "bg-photo", "group-odd/item:-rotate-1", "group-even/item:rotate-[.8deg]", "calm:rotate-0")
  })

  it("forwards className, ref-less props and style to the row", () => {
    const { container } = render(<Item id="r" className="mt-3" data-testid="row" style={{ opacity: 0.9 }} />)
    const r = container.querySelector("[data-slot=item]") as HTMLElement
    expect(r).toHaveAttribute("id", "r")
    expect(r).toHaveClass("mt-3")
    expect(r.style.opacity).toBe("0.9")
  })
})

describe("ItemGroup and the list semantics", () => {
  it("is role=list; its Items are list items; ItemSeparator is a decorative separator", () => {
    const { getByRole, getAllByRole, container } = render(
      <ItemGroup>
        <Row />
        <ItemSeparator />
        <Row />
      </ItemGroup>
    )
    expect(getByRole("list")).toHaveAttribute("data-slot", "item-group")
    expect(getAllByRole("listitem")).toHaveLength(2)
    const sep = container.querySelector("[data-slot=item-separator]") as HTMLElement
    expect(sep).toHaveAttribute("role", "none")
    expect(sep).toHaveAttribute("data-orientation", "horizontal")
  })

  it("an Item outside a group has no list role", () => {
    const { container } = render(<Row />)
    expect(container.querySelector("[data-slot=item]")).not.toHaveAttribute("role")
  })

  it("asChild rows in a group are wrapped in a list item and keep their own link", () => {
    const { getAllByRole, getByRole } = render(
      <ItemGroup>
        <Item asChild variant="outline">
          <a href="/pages">Pages</a>
        </Item>
        <Item asChild>
          <a href="/notes">Notes</a>
        </Item>
      </ItemGroup>
    )
    expect(getAllByRole("listitem")).toHaveLength(2)
    const a = getByRole("link", { name: "Pages" })
    expect(a).toHaveAttribute("data-slot", "item")
    expect(a).toHaveAttribute("data-variant", "outline")
    expect(a.parentElement).toHaveAttribute("role", "listitem")
    expect(a).toHaveAttribute("href", "/pages")
  })

  it("ruled groups say so for the stylesheet", () => {
    const { getByRole } = render(
      <ItemGroup ruled>
        <Item />
      </ItemGroup>
    )
    expect(getByRole("list")).toHaveAttribute("data-ruled")
  })

  it("a link row can be focused and pressed with the keyboard; a button row as well", async () => {
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(
      <ItemGroup>
        <Item asChild>
          <a href="#x">Docs</a>
        </Item>
        <Item asChild>
          <button type="button" onClick={onClick}>
            Press me
          </button>
        </Item>
      </ItemGroup>
    )
    await user.tab()
    expect(getByRole("link", { name: "Docs" })).toHaveFocus()
    await user.tab()
    await user.keyboard("{Enter}")
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(getByRole("link", { name: "Docs" })).toHaveClass("focus-visible:outline-2")
  })

  it("has no axe violations: a list of rows, separators, links, header and footer", async () => {
    const { container } = render(
      <div>
        <ItemGroup ruled>
          <Row />
          <ItemSeparator />
          <Item asChild variant="muted">
            <a href="/x">
              <ItemContent>
                <ItemTitle>Link row</ItemTitle>
              </ItemContent>
            </a>
          </Item>
          <Item variant="outline" size="sm">
            <ItemHeader>
              <ItemTitle>Header</ItemTitle>
            </ItemHeader>
            <ItemContent>
              <ItemDescription>Body</ItemDescription>
            </ItemContent>
            <ItemFooter>Footer</ItemFooter>
          </Item>
        </ItemGroup>
        <Row variant="outline" />
      </div>
    )
    await axeCheck(container)
  })
})

describe("item stylesheet", () => {
  const css = itemCss()

  it("is built once and has every frame of every tile as a data-URI alpha shape with no color of its own", () => {
    expect(itemCss()).toBe(css)
    for (const kind of ["eh", "ev", "ru"]) {
      for (let f = 0; f < ITEM_FRAMES; f++) {
        const m = new RegExp(`--ll-it-${kind}${f}:url\\("data:image/svg\\+xml,([^"]+)"\\)`).exec(css)
        expect(m, `${kind}${f}`).toBeTruthy()
        const svg = decodeURIComponent(m![1])
        expect(svg).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b|var\(--/i)
        expect(svg).toContain("currentColor")
      }
    }
  })

  it("draws the outline of an outlined row and of an icon well, the wash of a muted row, the rules of a ruled list", () => {
    expect(css).toContain("[data-slot=item][data-variant=outline]::before")
    expect(css).toContain("[data-slot=item-media][data-variant=icon]::before")
    expect(css).toContain("[data-slot=item][data-variant=muted]{")
    expect(css).toContain("[data-slot=item-group][data-ruled] [data-slot=item]::after")
    expect(css).toContain("border-radius:3px 8px 4px 9px/8px 3px 9px 4px")
    for (let f = 0; f < ITEM_FRAMES; f++) expect(css).toContain(`[data-slot=item][data-frame="${f}"]`)
  })

  it("uses the page's tokens only, steps aside in Windows high contrast, and is well-formed and small", () => {
    expect(css).toContain("var(--ll-pencil)")
    expect(css).toContain("var(--ll-rule-blue)")
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(css).toContain("@media (forced-colors:active)")
    expect((css.match(/\{/g) ?? []).length).toBe((css.match(/\}/g) ?? []).length)
    expect((css.match(/\(/g) ?? []).length).toBe((css.match(/\)/g) ?? []).length)
    expect(css.length).toBeLessThan(16 * 1024)
  })
})

describe("Item on the server and hydration", () => {
  it("renders rows and the stylesheet once, no svg, the same bytes twice", () => {
    const tree = () => (
      <ItemGroup ruled>
        <Row />
        <Row variant="outline" />
      </ItemGroup>
    )
    const html = renderToString(tree())
    expect(html.match(/data-slot="item"/g)).toHaveLength(2)
    const probe = document.createElement("div")
    probe.innerHTML = html
    expect(
      probe.querySelectorAll("[data-slot=item][data-ink-host], [data-slot=item-media][data-ink-host], [data-slot=item-group][data-ink-host]")
    ).toHaveLength(0)
    expect(html.match(/href="ll-item"/g)?.length ?? 0).toBeLessThanOrEqual(1)
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare and inside the provider)", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(
        <ItemGroup>
          <Row />
          <Item asChild>
            <a href="/x">Link</a>
          </Item>
        </ItemGroup>
      ) as React.ReactElement
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
      expect(container.querySelectorAll("[data-slot=item]").length).toBe(2)
      act(() => root?.unmount())
      container.remove()
    }
  })
})
