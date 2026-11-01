import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "annotate",
  title: "Annotate",
  category: "Marks",
  description:
    "One component for every mark, in the spirit of RoughNotation: put a highlight, an underline, a circle, a box, brackets, a strike, a cross-out or a scribble on real words, and draw it on when it scrolls into view.",
  status: "new",
  parts: [
    {
      name: "Annotate",
      description:
        "Renders the matching mark (Highlight, Underline, Circled, Strike or Scribble) for `type`, so every behavior of those applies: the words stay text, the drawing is aria-hidden and follows line breaks, and `animate` writes it on the first time it scrolls into view.",
      props: [
        { name: "type", type: '"highlight" | "underline" | "circle" | "box" | "brackets" | "strike-through" | "crossed-off" | "scribble"', required: true, description: "Which mark to put on the words." },
        { name: "color", type: "HighlightTone | MarkPen", description: "For highlight: yellow, pink, green, blue, orange, lilac or teal. For everything else: ink, blue, red, green, pencil, marker or orange." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, felt tip or brush pen (a highlighter is held light, regular or heavy)." },
        { name: "kind", type: '"single" | "double" | "wavy" | "scribble"', default: '"single"', description: "The line of an underline. Ignored by the other types." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide the mark. With animate, turning it on plays the draw-on again." },
        { name: "animate", type: "boolean", default: "false", description: "Hold the mark back and draw it on the first time the words scroll into view. Reduced motion just shows it." },
        { name: "delay", type: "number", description: "Milliseconds before the drawing starts." },
        { name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId(), so server and client draw the same marks." },
      ],
    },
  ],
  a11y: [
    "The words are ordinary text: selectable, copyable, found by search and read in order. Every drawing is aria-hidden and pointer-events-none.",
    "A mark that carries meaning (the right answer, a price that changed) needs the meaning in words as well; a drawing alone is not announced.",
    "Highlight is a <mark>, strike-through is an <s>. Before the drawing exists, without JavaScript, and in Windows high contrast, the browser's own decoration shows instead.",
    "Reduced motion (or data-motion=\"reduced\") zeroes the draw-on: marks simply appear.",
  ],
  usage: `import { Annotate } from "@/components/ui/annotate"

export function Example() {
  return (
    <p>
      Read <Annotate type="circle" color="red" animate>this</Annotate> twice, and{" "}
      <Annotate type="highlight" animate>underline nothing</Annotate>.
    </p>
  )
}`,
  related: ["highlight", "underline", "circled", "strike", "scribble", "callout", "arrow"],
} satisfies ComponentDoc
