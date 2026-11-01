import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Receipt, ReceiptBarcode, ReceiptDivider, ReceiptFooter, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"
import { barcode, receiptCircleRecipe } from "@/lib/ink/recipes/receipt-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(288, 420)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Till(props: React.ComponentProps<typeof Receipt> & { circled?: boolean }) {
  const { circled, ...rest } = props
  return (
    <Receipt aria-label="Receipt" {...rest}>
      <ReceiptHeader>
        <span>Looseleaf Cafe</span>
        <span>25 sep 2026</span>
      </ReceiptHeader>
      <ReceiptLines>
        <ReceiptLine qty={1} price="4.50">
          oat latte
        </ReceiptLine>
        <ReceiptLine price="2.10">glue stick</ReceiptLine>
      </ReceiptLines>
      <ReceiptTotal circled={circled}>6.60</ReceiptTotal>
      <ReceiptDivider />
      <ReceiptBarcode value="0042 1187" />
      <ReceiptFooter>thank you</ReceiptFooter>
    </Receipt>
  )
}

describe("Receipt", () => {
  it("renders its parts with their data-slots, pinked at both ends on receipt stock", () => {
    const { container } = render(<Till />)
    for (const slot of ["receipt", "receipt-header", "receipt-lines", "receipt-line", "receipt-total", "receipt-divider", "receipt-barcode", "receipt-footer"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    const r = container.firstElementChild as HTMLElement
    expect(r).toHaveAttribute("data-stock", "receipt")
    expect(r).toHaveAttribute("data-edge", "zig")
    expect(r).toHaveClass("ll-paper", "font-type", "w-72")
    expect(container.querySelector('svg[data-ink="sheet"]')).not.toBeNull()
  })

  it("ends chooses the cut of both ends", () => {
    for (const ends of ["perf", "torn", "cut"] as const) {
      const { container, unmount } = render(<Till ends={ends} />)
      expect((container.firstElementChild as HTMLElement).getAttribute("data-edge")).toBe(ends)
      unmount()
    }
  })

  it("the lines are a description list: item as term, price as description, quantity before the item", () => {
    const { container, getByText } = render(<Till />)
    const dl = container.querySelector('[data-slot="receipt-lines"]')!
    expect(dl.tagName).toBe("DL")
    const first = dl.querySelector('[data-slot="receipt-line"]')!
    expect(first.querySelector("dt")).toHaveTextContent("1 x oat latte")
    expect(first.querySelector("dd")).toHaveTextContent("4.50")
    expect(first.querySelector("dd")).toHaveClass("ll-num")
    expect(getByText("glue stick").tagName).toBe("DT")
  })

  it("a long item name wraps instead of hiding behind an ellipsis, and the price stays on the first line", () => {
    const { container } = render(
      <Receipt>
        <ReceiptLines>
          <ReceiptLine price="12.00">An extremely long product name that a thermal printer would wrap onto a second line</ReceiptLine>
        </ReceiptLines>
      </Receipt>,
    )
    const dt = container.querySelector("dt")!
    expect(dt.className).not.toContain("truncate")
    expect(dt).toHaveClass("min-w-0", "flex-1", "wrap-anywhere")
    expect(container.querySelector('[data-slot="receipt-line"]')).toHaveClass("items-baseline")
  })

  it("the total is its own description list with a label and an amount", () => {
    const { container } = render(<Till />)
    const total = container.querySelector('[data-slot="receipt-total"]')!
    expect(total.tagName).toBe("DL")
    expect(total.querySelector("dt")).toHaveTextContent("TOTAL")
    expect(total.querySelector("dd")).toHaveTextContent("6.60")
    expect(container.querySelector('svg[data-ink="circle"]')).toBeNull()
  })

  it("circled draws a felt-tip loop round the amount, as the amount's own ink", () => {
    const { container } = render(<Till circled />)
    const dd = container.querySelector('[data-slot="receipt-total"] dd') as HTMLElement
    const svg = dd.querySelector(':scope > svg[data-ink="circle"]')!
    expect(svg).not.toBeNull()
    expect(dd).toHaveAttribute("data-ink-ready")
    expect(dd).toHaveClass("relative", "isolate")
    expectInkLayers(container, { min: 2, kinds: ["sheet", "circle"], absolute: true })
  })

  it("the barcode is an image named by its number, whose bars come from the number", () => {
    const { container, getByRole } = render(<Till />)
    const img = getByRole("img", { name: "Barcode 0042 1187" })
    const d = img.querySelector("path")!.getAttribute("d")
    expect(d).toBeTruthy()
    const again = render(<ReceiptBarcode value="0042 1187" />)
    expect(again.container.querySelector("path")!.getAttribute("d")).toBe(d)
    const other = render(<ReceiptBarcode value="9931 2204" />)
    expect(other.container.querySelector("path")!.getAttribute("d")).not.toBe(d)
    expect(container.querySelector("figcaption")).toHaveTextContent("0042 1187")
  })

  it("the divider is a separator", () => {
    const { getAllByRole } = render(<Till />)
    expect(getAllByRole("separator")).toHaveLength(1)
  })

  it("passes className, ref, style and props through", () => {
    const ref = React.createRef<HTMLElement>()
    const { getByTestId } = render(<Till ref={ref} className="w-80" data-testid="r" tape="top" />)
    expect(ref.current).toBe(getByTestId("r"))
    expect(getByTestId("r")).toHaveClass("w-80")
  })

  it("has no axe violations (plain, circled, torn)", async () => {
    const { container } = renderUI(
      <div>
        <Till />
        <Till circled ends="torn" />
      </div>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Till circled size={[288, 420]} seed="s" />)
    expectHydrates(<Till circled seed="h" />, '[data-slot="receipt-total"] svg[data-ink="circle"]', [288, 420])
  })
})

describe("receiptCircleRecipe", () => {
  it("is a loop round the box: deterministic, clean, at every size, density, tier and pen", () => {
    for (const pen of ["redfelt", "blue", "ink"] as const) {
      const a = run(receiptCircleRecipe, { pen }, 60, 24).parts.rest!
      expect(a).toBe(run(receiptCircleRecipe, { pen }, 60, 24).parts.rest)
    }
    for (const [w, h] of [[24, 12], [60, 24], [140, 40], [300, 20]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const f = run(receiptCircleRecipe, { pen: "redfelt" }, w, h, { density, tier })
          expect(f.layers).toEqual(["rest"])
          expectClean(f.parts.rest!)
          if (w <= 140) expect(f.parts.rest!.length).toBeLessThan(tier === "lo" ? 9000 : 16000)
        }
      }
    }
  })
})

describe("barcode", () => {
  it("is pure, fits its box, starts and ends with a guard bar and keeps the bars apart", () => {
    const a = barcode("0042 1187", 220, 44)
    expect(a).toEqual(barcode("0042 1187", 220, 44))
    expect(a.d).not.toBe(barcode("0042 1188", 220, 44).d)
    expect(a.d).not.toMatch(/NaN|undefined/)
    expect(a.bars.length).toBeGreaterThan(20)
    const last = a.bars[a.bars.length - 1]
    expect(last[0] + last[1]).toBeLessThan(221.5)
    expect(a.bars[0][0]).toBeGreaterThan(-1)
    for (let i = 1; i < a.bars.length; i++) expect(a.bars[i][0]).toBeGreaterThan(a.bars[i - 1][0] + a.bars[i - 1][1] - 0.5)
  })

  it("survives an empty or odd value", () => {
    expect(barcode("", 220, 44).d).toBeTruthy()
    expect(barcode("héllo wörld", 220, 44).d).not.toMatch(/NaN/)
  })
})
