import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InkProvider } from "@/lib/ink/react"
import { TABLE_TILE_W, svgUrl, tableTiles } from "@/lib/ink/recipes/table-ink"
import Invoices from "@/docs/examples/table/01-invoices"
import DataTable from "@/docs/examples/table/02-data-table"
import Sticky from "@/docs/examples/table/03-sticky-header"
import Team from "@/docs/examples/table/04-team"
import { axeCheck, renderUI } from "./helpers"

function Sample(props: React.ComponentProps<typeof Table>) {
  return (
    <Table {...props}>
      <TableCaption>Recent invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead className="text-end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV001</TableCell>
          <TableCell className="text-end">$250.00</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell>INV002</TableCell>
          <TableCell className="text-end">$150.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-end">$400.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

describe("Table structure", () => {
  it("has every upstream part with its data-slot and real table semantics", () => {
    const { container, getByRole, getAllByRole } = render(<Sample />)
    for (const slot of ["table-container", "table", "table-header", "table-body", "table-footer", "table-row", "table-head", "table-cell", "table-caption"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    expect(getByRole("table")).toHaveAccessibleName("Recent invoices")
    expect(getAllByRole("rowgroup")).toHaveLength(3)
    expect(getAllByRole("columnheader").map((c) => c.textContent)).toEqual(["Invoice", "Amount"])
    expect(getAllByRole("row")).toHaveLength(4)
    expect(getAllByRole("cell")).toHaveLength(6)
  })

  it("pads the scroll container by 12 px and pulls it back, so the ink bleed is not clipped and layout is unchanged", () => {
    const { container } = render(<Sample />)
    const c = container.querySelector("[data-slot=table-container]")!
    expect(c).toHaveClass("overflow-x-auto", "p-3", "-m-3", "w-[calc(100%+1.5rem)]")
    expect(c.querySelector("style")).toBeNull()
    expect(c.querySelector("table")).toHaveAttribute("data-slot", "table")
  })

  it("puts className on the table and containerClassName on the container", () => {
    const { container } = render(<Sample className="max-w-xl" containerClassName="max-h-72" />)
    expect(container.querySelector("table")).toHaveClass("max-w-xl", "w-full", "caption-bottom")
    expect(container.querySelector("[data-slot=table-container]")).toHaveClass("max-h-72")
  })

  it("marks a sticky header on the table so the header row can pin itself", () => {
    const { container } = render(<Sample sticky />)
    expect(container.querySelector("table")).toHaveAttribute("data-sticky")
    expect(container.querySelector("thead")!.className).toContain("sticky top-0")
    expect(render(<Sample />).container.querySelector("thead")!.className).not.toContain("sticky")
    expect(render(<Sample />).container.querySelector("table")).not.toHaveAttribute("data-sticky")
  })

  it("passes data-state=selected and aria-selected through to the row", () => {
    const { getAllByRole } = render(<Sample />)
    expect(getAllByRole("row")[2]).toHaveAttribute("data-state", "selected")
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow aria-selected="true">
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(within(container).getAllByRole("row")[0]).toHaveAttribute("aria-selected", "true")
  })

  it("draws nothing inside the table elements: a tr, tbody or table cannot host an svg", () => {
    const { container } = render(<Sample />)
    expect(container.querySelector("table svg, table [data-ink]")).toBeNull()
    expect(container.querySelector("[data-ink-host]")).toBeNull()
  })

  it("sets the head in the script font, calm in the hand font, and keeps upstream's checkbox cell rules", () => {
    const { getByRole } = render(<Sample />)
    const th = getByRole("columnheader", { name: "Invoice" })
    expect(th).toHaveClass("font-script", "text-start", "calm:font-hand")
    expect(th.className).toContain("[&:has([role=checkbox])]:pe-0")
    expect(th.className).toContain("[&>[role=checkbox]]:align-middle")
  })

  it("refuses to render a part outside a Table, with a message that says where it belongs", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    for (const [name, Part] of Object.entries({ TableRow, TableCell, TableHead, TableHeader, TableBody, TableFooter, TableCaption })) {
      expect(() => render(<Part />), name).toThrow(`<${name}> must be rendered inside <Table>.`)
    }
    errors.mockRestore()
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<Sample sticky />)
    await axeCheck(container)
  })
})

describe("the ruling sheet", () => {
  it("is hoisted once per document and carries the tiles as data URIs", () => {
    render(
      <>
        <Sample />
        <Sample />
      </>,
    )
    const sheets = document.head.querySelectorAll('style[data-href="ll-table"]')
    expect(sheets).toHaveLength(1)
    const css = sheets[0].textContent ?? ""
    expect(css).toContain("@layer components")
    expect(css).toContain('--ll-tbl-rule: url("data:image/svg+xml,')
    expect(css).toContain("--ll-tbl-head: url(")
    expect(css).toContain("--ll-tbl-cap-a: url(")
    expect(css).toContain("--ll-tbl-cap-b: url(")
    expect(css).toContain("forced-colors: active")
    expect(css).toContain('[data-density="calm"]')
  })

  it("prints rules with a mask on the pseudo-elements of the CELLS, never of the row, and not with svg", () => {
    render(<Sample />)
    const css = document.head.querySelector('style[data-href="ll-table"]')!.textContent!
    expect(css).toMatch(/\[data-slot="table-row"\] > :is\(td, th\)::after\s*{[^}]*mask-image: var\(--ll-tbl-img\)/)
    expect(css).toMatch(/\[data-slot="table-header"\] > \[data-slot="table-row"\] \{ --ll-tbl-img: var\(--ll-tbl-head\)/)
    expect(css).toMatch(/\[data-state="selected"\]/)
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it("never puts a pseudo-element on a <tr>: WebKit wraps it in an anonymous cell and does not contain it", () => {
    render(<Sample />)
    const css = document.head.querySelector('style[data-href="ll-table"]')!.textContent!
    expect(css).not.toMatch(/\[data-slot="table-row"\](?::[a-z-]+(?:\([^)]*\))?)*::(?:before|after)/)
    expect(css).not.toMatch(/\[data-slot="table-row"\] \{[^}]*position: relative/)
    expect(css).toMatch(/\[data-slot="table-row"\] > :is\(td, th\) \{ position: relative;/)
  })

  it("rounds a swipe off with a cap on the first and last cell of a row, mirrored for right-to-left", () => {
    render(<Sample />)
    const css = document.head.querySelector('style[data-href="ll-table"]')!.textContent!
    expect(css).toMatch(/:is\(td, th\):first-child::before \{[^}]*var\(--ll-tbl-cap-a\)/)
    expect(css).toMatch(/:is\(td, th\):last-child::before \{[^}]*var\(--ll-tbl-cap-b\)/)
    expect(css).toMatch(/:dir\(rtl\):first-child::before \{[^}]*var\(--ll-tbl-cap-b\)/)
  })
})

describe("table tiles", () => {
  const raw = (u: string) => decodeURIComponent(u.slice('url("data:image/svg+xml,'.length, -2))

  it("are deterministic and built once", () => {
    expect(tableTiles()).toBe(tableTiles())
    expect(tableTiles().rule).toBe(tableTiles().rule)
  })

  it("are color-free alpha masks: black fills only, no CSS variables, no hex", () => {
    for (const [name, url] of Object.entries(tableTiles())) {
      const svg = raw(url)
      expect(svg, name).toMatch(/^<svg xmlns='http:\/\/www\.w3\.org\/2000\/svg'/)
      expect(svg, name).not.toMatch(/var\(|#[0-9a-f]{3,}|rgb|hsl|mask=|filter/i)
      expect(svg, name).toContain("fill='black'")
      expect(svg, name).not.toMatch(/NaN|undefined|Infinity/)
    }
  })

  it("are as wide as the mask-size says and small enough to ship in a stylesheet", () => {
    const t = tableTiles()
    expect(raw(t.rule)).toContain(`width='${TABLE_TILE_W}'`)
    expect(raw(t.head)).toContain(`width='${TABLE_TILE_W}'`)
    expect(t.rule.length).toBeLessThan(12_000)
    expect(t.head.length).toBeLessThan(20_000)
    expect(t.capStart.length + t.capEnd.length).toBeLessThan(2_000)
  })

  it("svgUrl escapes what a stylesheet cannot carry", () => {
    const u = svgUrl("<svg fill='#000'>100%</svg>")
    expect(u).toBe('url("data:image/svg+xml,%3Csvg fill=\'%23000\'%3E100%25%3C/svg%3E")')
  })
})

describe("SSR and hydration", () => {
  it("renders the same markup twice", () => {
    expect(renderToString(<Sample />)).toBe(renderToString(<Sample />))
  })

  it("hydrates without warnings, bare and inside the provider", () => {
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      const ui = wrap(<Sample sticky />)
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

describe("examples", () => {
  it("Invoices renders the caption, the footer total and five rows", () => {
    const { getByRole, getAllByRole } = render(<Invoices />)
    expect(getByRole("table")).toHaveAccessibleName("A list of your recent invoices.")
    expect(getAllByRole("row")).toHaveLength(1 + 5 + 1)
    expect(within(getAllByRole("row").at(-1)!).getByText("$1,750.00")).toBeTruthy()
  })

  it("Sticky header pins the header of a scroll container", () => {
    const { container } = render(<Sticky />)
    expect(container.querySelector("table")).toHaveAttribute("data-sticky")
    expect(container.querySelector("[data-slot=table-container]")).toHaveClass("max-h-72")
    expect(container.querySelectorAll("tbody tr")).toHaveLength(24)
  })

  it("Team billing puts faces, a selected row, row buttons and a footer total in a card", async () => {
    const { container, getByRole, getAllByRole } = render(<Team />)
    expect(container.querySelectorAll("tbody tr")).toHaveLength(4)
    expect(container.querySelectorAll("tbody [data-slot=avatar]")).toHaveLength(4)
    expect(container.querySelectorAll("tbody tr[data-state=selected]")).toHaveLength(1)
    expect(getAllByRole("button", { name: /More for/ })).toHaveLength(4)
    expect(within(container.querySelector("tfoot")!).getByText("$74.00")).toBeTruthy()
    expect(getByRole("button", { name: /Add a seat/ })).toBeTruthy()
    await axeCheck(container)
  })

  describe("data table", () => {
    const names = (c: HTMLElement) => Array.from(c.querySelectorAll("tbody tr td:nth-child(2)")).map((td) => td.textContent)

    it("paginates five rows at a time", async () => {
      const { user, container, getByRole, getByText } = renderUI(<DataTable />)
      expect(names(container)).toHaveLength(5)
      expect(getByText(/page 1 of 3/)).toBeTruthy()
      expect(getByRole("button", { name: /Previous/ })).toBeDisabled()
      await user.click(getByRole("button", { name: /Next/ }))
      expect(getByText(/page 2 of 3/)).toBeTruthy()
      expect(names(container)[0]).toBe("Tomas Berg")
      await user.click(getByRole("button", { name: /Next/ }))
      expect(names(container)).toHaveLength(2)
      expect(getByRole("button", { name: /Next/ })).toBeDisabled()
    })

    it("sorts a column ascending, descending, then back to the source order, and says so with aria-sort", async () => {
      const { user, container, getByRole } = renderUI(<DataTable />)
      const head = getByRole("columnheader", { name: /Name/ })
      expect(head).toHaveAttribute("aria-sort", "none")
      const button = within(head).getByRole("button")
      await user.click(button)
      expect(head).toHaveAttribute("aria-sort", "ascending")
      expect(names(container)).toEqual(["Ada Lovelace", "Inès Moreau".replace("è", "e"), "Jo Okafor", "Kofi Mensah", "Lena Fischer"])
      await user.click(button)
      expect(head).toHaveAttribute("aria-sort", "descending")
      expect(names(container)[0]).toBe("Yuki Tanaka")
      await user.click(button)
      expect(head).toHaveAttribute("aria-sort", "none")
      expect(names(container)[0]).toBe("Ada Lovelace")
    })

    it("selects rows with the checkbox, lights the row and sets the header checkbox half ticked", async () => {
      const { user, container, getByRole } = renderUI(<DataTable />)
      const rows = () => Array.from(container.querySelectorAll("tbody tr"))
      expect(rows()[2]).toHaveAttribute("data-state", "selected")
      const header = getByRole("checkbox", { name: "Select all rows on this page" })
      expect(header).toHaveAttribute("aria-checked", "mixed")
      await user.click(getByRole("checkbox", { name: "Select Ada Lovelace" }))
      expect(rows()[0]).toHaveAttribute("data-state", "selected")
      await user.click(header)
      expect(rows().every((r) => r.getAttribute("data-state") === "selected")).toBe(true)
      expect(header).toHaveAttribute("aria-checked", "true")
      await user.click(header)
      expect(rows().some((r) => r.getAttribute("data-state") === "selected")).toBe(false)
      expect(header).toHaveAttribute("aria-checked", "false")
    })

    it("has no accessibility violations", async () => {
      const { container } = renderUI(<DataTable />)
      await axeCheck(container)
    })
  })
})
