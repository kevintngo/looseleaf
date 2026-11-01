import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "callout",
  title: "Callout",
  category: "Marks",
  description:
    "A note in the margin: a few handwritten words and a hand arrow pointing at the thing they are about. It is an ordinary box, so put it where it belongs with a class: float it into the margin, absolutely position it, or drop it in a grid cell.",
  status: "new",
  parts: [
    {
      name: "Callout",
      description:
        "A <span role=\"note\"> with the words (written with a little per-word jitter) and an Arrow. `direction` is where the arrow POINTS, so a note on the right of a paragraph points left. The words sit on the arrow's tail side.",
      props: [
        { name: "direction", type: '"left" | "right" | "up" | "down" | "up-left" | "up-right" | "down-left" | "down-right"', default: '"left"', description: "Where the arrow points, so where the thing you are talking about is." },
        { name: "curve", type: '"straight" | "curved" | "curl"', default: '"curved"', description: "The shaft of the arrow." },
        { name: "head", type: '"v" | "two" | "open" | "solid" | "none"', default: '"v"', description: "The arrowhead." },
        { name: "tone", type: '"blue" | "ink" | "red" | "green" | "pencil" | "marker" | "orange"', default: '"blue"', description: "The pen of the arrow. Blue felt is the reserved \"you\" ink and the natural one for notes." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, felt tip or brush." },
        { name: "bend", type: '"up" | "down"', default: '"up"', description: "Which way a curved arrow bulges." },
        { name: "arrow", type: "boolean", default: "true", description: "Draw the arrow. Without it the callout is just handwritten words." },
        { name: "arrowClassName", type: "string", default: '"h-10 w-14"', description: "Sizes the arrow." },
        { name: "animate", type: "boolean", default: "false", description: "Write the note on when it first scrolls into view: the words fade in, the arrow draws itself." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide the note." },
        { name: "delay", type: "number", description: "Milliseconds before the note starts to appear." },
        { name: "seed", type: "string | number", description: "Pins the hand of the words and the arrow." },
      ],
    },
  ],
  a11y: [
    "role=\"note\": announced as a note. The words are real text; the arrow is aria-hidden.",
    "A margin note should add to the page, not carry it: keep the essential information in the main text.",
    "The margin pattern (`float-end clear-end -me-56 w-48`) needs room in the page's padding; below the md breakpoint hide it (`max-md:hidden`) or let it flow.",
    "Per-word jitter is switched off by calm density and reduced motion; the arrow draws on with the same rules as Arrow.",
  ],
  usage: `import { Callout } from "@/components/ui/callout"

export function Example() {
  return (
    <p className="pe-56">
      The good bits get a swipe of yellow.
      <Callout className="float-end clear-end -me-56 w-48">the best line</Callout>
    </p>
  )
}`,
  related: ["arrow", "annotate", "handwritten", "bracket"],
} satisfies ComponentDoc
