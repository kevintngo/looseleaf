import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "arrow",
  title: "Arrow",
  category: "Marks",
  description:
    "A hand-drawn arrow that points where you tell it: one of eight directions inside its own box, or straight at another element on the page. Straight, curved, or with a loop-the-loop, five heads, and an optional label.",
  status: "new",
  parts: [
    {
      name: "Arrow",
      description:
        "A <span> that fills its box (`className` sizes it, default 80 x 40) with the drawing. Text inside becomes a label, real text placed outside the tail. The svg is aria-hidden and never takes a click.",
      props: [
        { name: "direction", type: '"right" | "left" | "up" | "down" | "up-right" | "up-left" | "down-right" | "down-left"', default: '"right"', description: "Which way it points, inside its own box." },
        { name: "curve", type: '"straight" | "curved" | "curl"', default: '"straight"', description: "A straight shaft, one lazy arc, or an arc with a loop-the-loop." },
        { name: "head", type: '"v" | "two" | "open" | "solid" | "none"', default: '"v"', description: "The arrowhead: two strokes joined, two loose strokes, an open V, a filled triangle, or none." },
        { name: "tone", type: '"ink" | "blue" | "red" | "green" | "pencil" | "marker" | "orange"', default: '"ink"', description: "The pen. Blue felt is the reserved \"you\" ink." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, felt tip or brush." },
        { name: "bend", type: '"up" | "down"', default: '"up"', description: "Which way a curved shaft bulges: toward the top (the left for a vertical arrow) or the bottom (the right)." },
        { name: "pointAt", type: "RefObject<Element> | Element | string", description: "Aim at another element (a ref, an element or a CSS selector). The arrow leaves the middle of its own box and stops `gap` px short of the target, wherever that is; it follows layout changes." },
        { name: "gap", type: "number", default: "6", description: "With pointAt, how far short of the target the head stops, px." },
        { name: "mirror", type: "boolean", default: "true", description: "Flip horizontal directions in a right-to-left page, so \"next\" keeps meaning onwards." },
        { name: "animate", type: "boolean", default: "false", description: "Draw the arrow on, shaft first, the first time it scrolls into view." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide it." },
        { name: "delay", type: "number", description: "Milliseconds before the drawing starts." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
  ],
  a11y: [
    "Decorative: the drawing is aria-hidden and pointer-events-none. If the arrow says something (\"start here\"), put it in text; a label given as children is real text.",
    "It never affects layout: the box is yours, the drawing may spill 14 px beyond it (or as far as the target with pointAt).",
    "Windows high contrast hides the drawing, like every overlay ink; the label stays.",
    "Reduced motion zeroes the draw-on.",
  ],
  usage: `import { Arrow } from "@/components/ui/arrow"

export function Example() {
  return (
    <div className="flex items-center">
      <span>Start here</span>
      <Arrow direction="right" curve="curved" tone="blue" />
    </div>
  )
}`,
  related: ["callout", "annotate", "circled", "bracket"],
} satisfies ComponentDoc
