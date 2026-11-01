import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "tally",
  title: "Tally",
  category: "Marks",
  description:
    "A count as tally marks, 1 to 99: bundles of four struck through by a fifth. The number is the accessible name, the box is exactly as big as the marks, and it is drawn on the server.",
  status: "new",
  parts: [
    {
      name: "Tally",
      description:
        "A <span role=\"img\" aria-label=\"7\"> whose box is the marks' own footprint, so it sits in a line of text or a table cell without shifting anything.",
      props: [
        { name: "count", type: "number", required: true, description: "The number to show, clamped to 0..99 and rounded down." },
        { name: "size", type: '"sm" | "md" | "lg" | number', default: '"md"', description: "Height of the strokes: sm 14 px, md 22, lg 34, or a number of px." },
        { name: "tone", type: '"ink" | "blue" | "red" | "green" | "pencil" | "marker" | "orange"', default: '"ink"', description: "The pen." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, felt tip or brush." },
        { name: "label", type: "string", description: "The accessible name. Default: the number. Say what is counted: \"7 votes\"." },
        { name: "animate", type: "boolean", default: "false", description: "Wipe the marks on, left to right, the first time they scroll into view." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide them." },
        { name: "delay", type: "number", description: "Milliseconds before the drawing starts." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
  ],
  a11y: [
    "role=\"img\" with aria-label set to the number (or your label): a screen reader hears \"7\", not seven strokes. Add the counted thing in visible text nearby.",
    "The marks are the only place the number is shown as a drawing, so the svg is kept in Windows high contrast (as system colours).",
    "Right-to-left pages start the first bundle on the right.",
    "Reduced motion zeroes the wipe.",
  ],
  usage: `import { Tally } from "@/components/ui/tally"

export function Example() {
  return (
    <p>
      Votes for tea: <Tally count={12} label="12 votes for tea" />
    </p>
  )
}`,
  related: ["badge", "annotate", "asterisk"],
} satisfies ComponentDoc
