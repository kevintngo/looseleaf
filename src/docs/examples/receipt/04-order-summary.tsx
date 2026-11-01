import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Receipt, ReceiptBarcode, ReceiptDivider, ReceiptFooter, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"

export const meta = {
  title: "An order summary",
  description: "A real checkout: quantities you can change, a total that follows, and the barcode of the order number. The receipt is ordinary DOM; only the ink is drawn.",
  layout: "center" as const,
  stage: "desk" as const,
}

const menu = [
  { name: "oat latte", price: 4.5 },
  { name: "almond croissant", price: 3.1 },
  { name: "washi tape", price: 3 },
]

export default function Example() {
  const [qty, setQty] = React.useState([1, 2, 0])
  const total = menu.reduce((sum, m, i) => sum + m.price * qty[i], 0)
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-12 gap-y-8">
      <Receipt as="article" seed="order" aria-label="Your order" aria-live="polite">
        <ReceiptHeader>
          <span>Your order</span>
          <span>no. 0042</span>
        </ReceiptHeader>
        <ReceiptLines>
          {menu.map((m, i) =>
            qty[i] ? (
              <ReceiptLine key={m.name} qty={qty[i]} price={(m.price * qty[i]).toFixed(2)}>
                {m.name}
              </ReceiptLine>
            ) : null,
          )}
        </ReceiptLines>
        <ReceiptTotal circled={total > 10}>{total.toFixed(2)}</ReceiptTotal>
        <ReceiptDivider />
        <ReceiptBarcode value="0042 1187" />
        <ReceiptFooter>circled when it is over ten</ReceiptFooter>
      </Receipt>
      <div className="flex flex-col gap-3 pt-6">
        {menu.map((m, i) => (
          <div key={m.name} className="flex items-center gap-3">
            <Button size="icon-sm" variant="outline" aria-label={`One less ${m.name}`} disabled={!qty[i]} onClick={() => setQty((q) => q.map((v, j) => (j === i ? v - 1 : v)))}>
              <Icon name="minus" />
            </Button>
            <span className="w-36 text-ink">{m.name}</span>
            <Button size="icon-sm" aria-label={`One more ${m.name}`} onClick={() => setQty((q) => q.map((v, j) => (j === i ? v + 1 : v)))}>
              <Icon name="plus" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
