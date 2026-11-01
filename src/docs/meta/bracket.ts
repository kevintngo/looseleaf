import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "bracket",
  title: "Bracket",
  category: "Marks",
  description:
    "A hand bracket down one side of a block: these paragraphs, this list, these three rows belong together. Square, curly or round, on either side, and it flips with the page direction.",
  status: "new",
  parts: [
    {
      name: "Bracket",
      description:
        "A <div> that wraps the block and draws the bracket in its own inline padding (`ps-7` / `pe-7`) as an aria-hidden svg. The content is untouched.",
      props: [
        { name: "kind", type: '"square" | "curly" | "round"', default: '"square"', description: "A square bracket, a curly brace, or a round parenthesis." },
        { name: "side", type: '"start" | "end"', default: '"start"', description: "Which side of the block. Logical: start is the right side in a right-to-left page." },
        { name: "tone", type: '"ink" | "blue" | "red" | "green" | "pencil" | "marker" | "orange"', default: '"ink"', description: "The pen." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, felt tip or brush." },
        { name: "inset", type: "number", default: "8", description: "How far the spine of the bracket is from the block's edge, px." },
        { name: "animate", type: "boolean", default: "false", description: "Draw the bracket on, top to bottom, the first time the block scrolls into view." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide it." },
        { name: "delay", type: "number", description: "Milliseconds before the drawing starts." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
  ],
  a11y: [
    "Decorative: the bracket is aria-hidden and pointer-events-none. If grouping matters to everyone, group in the markup as well (a list, a <section>, a fieldset).",
    "It lives in the block's padding, so text never runs under it; change the padding with className if you move the spine (`inset`).",
    "Windows high contrast hides the drawing like every overlay ink.",
  ],
  usage: `import { Bracket } from "@/components/ui/bracket"

export function Example() {
  return (
    <Bracket kind="curly" tone="blue">
      <p>These two paragraphs are one idea.</p>
      <p>The bracket says so.</p>
    </Bracket>
  )
}`,
  related: ["circled", "annotate", "squiggle", "callout"],
} satisfies ComponentDoc
