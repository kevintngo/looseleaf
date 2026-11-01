import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "quote",
  title: "Quote",
  category: "Marks",
  description:
    "A pull quote with big hand-drawn quotation marks and an attribution. A real figure, blockquote and figcaption, with marker or felt marks drawn in the gutters: an opening pair at the top, a closing pair at the bottom.",
  status: "new",
  parts: [
    {
      name: "Quote",
      description: "The <figure> that holds a quotation and its attribution.",
    },
    {
      name: "QuoteText",
      description:
        "The <blockquote> (accepts `cite`) and the ink host: the marks are drawn in its inline padding, which grows with `size`. The browser's own opening quotation mark stands in until the drawing exists.",
      props: [
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "The size of the quotation marks (24, 32 or 46 px) and the room they get." },
        { name: "tone", type: '"marker" | "ink" | "blue" | "red" | "green" | "pencil" | "orange"', default: '"marker"', description: "The pen of the marks. Marker is the terracotta felt." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "How heavy the strokes are." },
        { name: "rule", type: "boolean", default: "false", description: "A quiet pencil rule down the start edge between the pairs of marks." },
        { name: "animate", type: "boolean", default: "false", description: "Draw the marks on the first time the quotation scrolls into view." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide the marks." },
        { name: "delay", type: "number", description: "Milliseconds before the drawing starts." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
    {
      name: "QuoteAttribution",
      description: "The <figcaption>: who said it. An em dash is added before it by CSS.",
    },
  ],
  a11y: [
    "Real semantics: <figure> > <blockquote cite> + <figcaption>. Assistive technology announces a quotation and its source.",
    "The quotation marks are drawings (aria-hidden), not characters in the text, so they are not read aloud or copied with the words.",
    "The marks live in the blockquote's padding and never overlap the words; RTL mirrors the whole drawing.",
    "Reduced motion zeroes the draw-on.",
  ],
  usage: `import { Quote, QuoteAttribution, QuoteText } from "@/components/ui/quote"

export function Example() {
  return (
    <Quote>
      <QuoteText>The best time to write it down was when it happened.</QuoteText>
      <QuoteAttribution>Ada, in the margin of a book</QuoteAttribution>
    </Quote>
  )
}`,
  related: ["typography", "signature", "lettering", "handwritten"],
} satisfies ComponentDoc
