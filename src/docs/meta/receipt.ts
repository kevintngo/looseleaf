import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "receipt",
  title: "Receipt",
  category: "Paper",
  description:
    "Thermal till paper: pinked (or perforated, or torn) at both ends, printed in the typewriter font, its lines a description list, its total circled in red felt tip by whoever checked it, ending in a barcode made from the number under it.",
  status: "new",
  parts: [
    {
      name: "Receipt",
      description: "A Paper on the `receipt` stock, a centered 18 rem column with the type font. It takes every Paper prop except `stock`, `rules` and `edge`.",
      props: [{ name: "ends", type: '"zig" | "perf" | "torn" | "cut" | "deckle" | "crimp" | "scallop"', default: '"zig"', description: "The cut of both ends: the tear bar's sawtooth, a perforation, torn, or plain." }],
    },
    { name: "ReceiptHeader", description: "The shop: its first child is the name in spaced capitals, the rest is address and date, centered." },
    { name: "ReceiptLines", description: "A `dl` between two dashed rules; put a `ReceiptLine` in it for each item." },
    {
      name: "ReceiptLine",
      description: "One item: a `div` holding a `dt` (the item; a long name wraps onto a second line, as a thermal printer would, and never hides behind an ellipsis) and a `dd` (the price, tabular figures, aligned to the end, on the first line).",
      props: [
        { name: "qty", type: "number", description: "How many, printed before the item as `2 x`." },
        { name: "price", type: "ReactNode", required: true, description: "The price." },
      ],
    },
    {
      name: "ReceiptTotal",
      description: "A `dl` of its own (label and amount, larger and bold).",
      props: [
        { name: "label", type: "ReactNode", default: '"TOTAL"', description: "The label." },
        { name: "circled", type: 'boolean | "red" | "blue" | "ink"', default: "false", description: "Circle the amount in felt tip. `true` is red. Calm density draws a hairline loop." },
        { name: "seed", type: "string | number", description: "Pins the hand of the loop." },
      ],
    },
    { name: "ReceiptDivider", description: "A dashed rule across the paper (`role=\"separator\"`)." },
    {
      name: "ReceiptBarcode",
      description: "Bars from `value` in a `figure` with the number printed under them. The same number always prints the same bars, on the server and in the browser.",
      props: [
        { name: "value", type: "string", required: true, description: "The number." },
        { name: "height", type: "number", default: "44", description: "Bar height in px." },
      ],
    },
    { name: "ReceiptFooter", description: "The thank-you line, muted, 12 px." },
  ],
  a11y: [
    "A receipt is a plain `div` by default, and a name on a `div` is ignored by screen readers: pass `as=\"article\"` (it is a self-contained document) together with `aria-label`, as the examples do.",
    "The lines are a real description list, so a screen reader hears each item with its price. The total is a list of its own, with the same structure.",
    "The barcode is `role=\"img\"` named `Barcode <number>`; the number is also printed as text. The circle round the total, the pinked ends, tape and clips are aria-hidden decoration: the amount is text either way.",
    "Ink on the receipt stock is 14:1; the footer is 8:1. The type font is set at 13 px on a 20 px line. Windows high contrast replaces the drawn ends with an outline.",
  ],
  usage: `import { Receipt, ReceiptBarcode, ReceiptFooter, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"

<Receipt as="article" aria-label="Receipt from Looseleaf Cafe">
  <ReceiptHeader><span>Looseleaf Cafe</span><span>25 sep 2026</span></ReceiptHeader>
  <ReceiptLines>
    <ReceiptLine qty={1} price="4.50">oat latte</ReceiptLine>
    <ReceiptLine qty={3} price="9.00">washi tape</ReceiptLine>
  </ReceiptLines>
  <ReceiptTotal circled>13.50</ReceiptTotal>
  <ReceiptBarcode value="0042 1187" />
  <ReceiptFooter>thank you - come again</ReceiptFooter>
</Receipt>`,
  related: ["paper", "ticket", "card", "stamp"],
} satisfies ComponentDoc
