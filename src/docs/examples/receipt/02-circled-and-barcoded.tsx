import { Receipt, ReceiptBarcode, ReceiptFooter, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"

export const meta = {
  title: "Circled, barcoded, clipped",
  description: "The total circled in red felt tip, a barcode whose bars come from the number under it, and a paper clip to keep it with the invoice.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Receipt as="article" fastener="clip" fastenerTone="sky" seed="checked" aria-label="Receipt from The Stationer">
      <ReceiptHeader>
        <span>The Stationer</span>
        <span>25 sep 2026 09:41</span>
      </ReceiptHeader>
      <ReceiptLines>
        <ReceiptLine qty={3} price="9.00">
          washi tape
        </ReceiptLine>
        <ReceiptLine price="2.10">glue stick</ReceiptLine>
        <ReceiptLine qty={12} price="18.00">
          felt tips
        </ReceiptLine>
      </ReceiptLines>
      <ReceiptTotal circled>29.10</ReceiptTotal>
      <ReceiptBarcode value="0042 1187 0925" />
      <ReceiptFooter>keep for your records</ReceiptFooter>
    </Receipt>
  )
}
