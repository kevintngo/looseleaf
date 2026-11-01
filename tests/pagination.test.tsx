import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(36, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

function Demo({ current = 2, onPage }: { current?: number; onPage?: (n: number) => void }) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#prev" disabled={current === 1} />
        </PaginationItem>
        {[1, 2, 3].map((n) => (
          <PaginationItem key={n}>
            <PaginationLink
              href={`#${n}`}
              isActive={n === current}
              onClick={(e) => {
                e.preventDefault()
                onPage?.(n)
              }}
            >
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

describe("Pagination", () => {
  it("is a navigation landmark labeled pagination, with a list of items (upstream's anatomy and slots)", () => {
    const { getByRole, container } = renderUI(<Demo />)
    const nav = getByRole("navigation", { name: "pagination" })
    expect(nav).toHaveAttribute("data-slot", "pagination")
    expect(nav.className).toContain("justify-center")
    const list = within(nav).getByRole("list")
    expect(list).toHaveAttribute("data-slot", "pagination-content")
    expect(container.querySelectorAll('[data-slot="pagination-item"]')).toHaveLength(6)
  })

  it("a page link is a drawn Button around your <a>: it keeps its href and its slot, and is the ink host", () => {
    const { getByRole } = renderUI(<Demo />)
    const one = getByRole("link", { name: "1" })
    expect(one.tagName).toBe("A")
    expect(one).toHaveAttribute("href", "#1")
    expect(one).toHaveAttribute("data-slot", "pagination-link")
    expect(one).toHaveAttribute("data-variant", "ghost")
    expect(one).toHaveAttribute("data-size", "icon")
    expect(one).toHaveAttribute("data-ink-host")
    expect(one).toHaveAttribute("data-ink-ready")
    expectInkLayers(one, { min: 1, kinds: ["button"], absolute: true, layers: ["rest", "hover"] })
    expect(one.querySelector(":scope > svg[data-ink=button]")!.parentElement).toBe(one)
  })

  it("the current page is a highlighter block with aria-current, the others carry neither", () => {
    const { getByRole } = renderUI(<Demo current={2} />)
    const two = getByRole("link", { name: "2" })
    expect(two).toHaveAttribute("aria-current", "page")
    expect(two).toHaveAttribute("data-active", "true")
    expect(two).toHaveAttribute("data-variant", "secondary")
    const one = getByRole("link", { name: "1" })
    expect(one).not.toHaveAttribute("aria-current")
    expect(one).not.toHaveAttribute("data-active", "true")
  })

  it("Previous and Next are labeled links with a drawn chevron, and their words hide on a phone", () => {
    const { getByRole } = renderUI(<Demo />)
    const prev = getByRole("link", { name: "Go to previous page" })
    const next = getByRole("link", { name: "Go to next page" })
    expect(prev).toHaveAttribute("data-size", "default")
    expect(prev.querySelector('svg[data-icon="chevron-left"]')).toBeTruthy()
    expect(next.querySelector('svg[data-icon="chevron-right"]')).toBeTruthy()
    expect(within(prev).getByText("Previous")).toHaveClass("hidden", "sm:block")
    expect(within(next).getByText("Next")).toHaveClass("hidden", "sm:block")
  })

  it("the ellipsis is hidden decoration that still says 'More pages' to nobody, with a drawn glyph", () => {
    const { container } = renderUI(<Demo />)
    const dots = container.querySelector('[data-slot="pagination-ellipsis"]')!
    expect(dots).toHaveAttribute("aria-hidden", "true")
    expect(dots.querySelector('svg[data-icon="ellipsis"]')).toBeTruthy()
    expect(dots).toHaveTextContent("More pages")
  })

  it("a disabled link is inert: aria-disabled, out of the tab order, drawn as the dashed alternative, its click swallowed", async () => {
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#prev" disabled onClick={onClick} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    const prev = getByRole("link", { name: "Go to previous page" })
    expect(prev).toHaveAttribute("aria-disabled", "true")
    expect(prev).toHaveAttribute("tabindex", "-1")
    expectInkLayers(prev, { onlyLayers: ["disabled"] })
    await user.click(prev)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("clicks and keyboard reach the page handlers", async () => {
    const onPage = vi.fn()
    const { getByRole, user } = renderUI(<Demo onPage={onPage} />)
    await user.click(getByRole("link", { name: "3" }))
    expect(onPage).toHaveBeenLastCalledWith(3)
    getByRole("link", { name: "1" }).focus()
    await user.keyboard("{Enter}")
    expect(onPage).toHaveBeenLastCalledWith(1)
    await user.tab()
    expect(getByRole("link", { name: "2" })).toHaveFocus()
  })

  it("size, className and other link props pass through", () => {
    const { getByRole } = renderUI(
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#x" size="lg" className="px-8" target="_blank" rel="noreferrer">
              Load more
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    const l = getByRole("link", { name: "Load more" })
    expect(l).toHaveAttribute("data-size", "lg")
    expect(l).toHaveAttribute("target", "_blank")
    expect(l).toHaveClass("px-8")
    expect(getByRole("navigation")).toHaveClass("mt-4")
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<Demo />)
    await axeCheck(container)
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = <Demo />
    const html = renderToString(tree)
    expect(renderToString(tree)).toBe(html)
    expect(html).toContain('aria-current="page"')
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
})
