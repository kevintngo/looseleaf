import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "squiggle",
  title: "Squiggle",
  category: "Marks",
  description:
    "A hand-drawn divider: a wave, a zig-zag, a row of loops, scallops, dashes or dots, drawn to fit whatever width or height you give it. Same semantics as a separator.",
  status: "new",
  upstream: "separator",
  parts: [
    {
      name: "Squiggle",
      description:
        "A <div> that fills its box with one drawn line along its long side. Full width and 16 px high by default; a vertical one is 16 px wide and as high as its container.",
      props: [
        { name: "kind", type: '"wavy" | "zigzag" | "loops" | "scallops" | "dashes" | "dots"', default: '"wavy"', description: "The pattern of the line." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Along the width or the height of the box." },
        { name: "decorative", type: "boolean", default: "true", description: "true: role=\"none\", hidden from assistive technology. false: a real separator with aria-orientation." },
        { name: "tone", type: '"ink" | "blue" | "red" | "green" | "pencil" | "marker" | "orange"', default: '"ink"', description: "The pen." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, felt tip or brush." },
        { name: "animate", type: "boolean", default: "false", description: "Draw the line on, along its length, the first time it scrolls into view." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide it." },
        { name: "delay", type: "number", description: "Milliseconds before the drawing starts." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
  ],
  a11y: [
    "Decorative by default (role=\"none\"), like Radix's Separator; pass decorative={false} to expose it as a separator (with aria-orientation) between sections that really are distinct.",
    "The drawing is aria-hidden and pointer-events-none; it is redrawn when the box is resized. Windows high contrast hides it (a decorative divider loses nothing).",
    "Cost grows with length: about 3 KB for 420 px in a single pull; keep very long dividers (over 1200 px) to `dots` or `dashes`.",
  ],
  usage: `import { Squiggle } from "@/components/ui/squiggle"

export function Example() {
  return (
    <div>
      <p>Before.</p>
      <Squiggle kind="loops" tone="blue" className="my-4" />
      <p>After.</p>
    </div>
  )
}`,
  related: ["separator", "underline", "bracket"],
} satisfies ComponentDoc
