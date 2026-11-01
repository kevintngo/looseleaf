import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "scribble",
  title: "Scribble",
  category: "Marks",
  description:
    "Words scribbled out with tight back-and-forth strokes, like a note someone changed their mind about. A look, not a redaction: the text underneath stays in the DOM.",
  status: "new",
  parts: [
    {
      name: "Scribble",
      description: "A <span> (or your own element with asChild) that hosts a scribble per line, in front of the words.",
      props: [
        { name: "tone", type: '"ink" | "red" | "blue" | "green" | "pencil" | "marker" | "orange"', default: '"ink"', description: "The pen." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine scribbles are light and leave the words legible; regular and brush are dense." },
        { name: "animate", type: "boolean", default: "false", description: "Scribble it out the first time it scrolls into view." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide the scribble." },
        { name: "delay", type: "number", description: "Milliseconds to wait before scribbling." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
        { name: "asChild", type: "boolean", default: "false", description: "Render the scribble on your own child element." },
      ],
    },
  ],
  a11y: [
    "Never scribble out a secret: the text is still in the DOM, still selectable, still read by a screen reader. Remove sensitive text from the page instead.",
    "The drawing is aria-hidden and pointer-events-none. Before it exists, and in Windows high contrast, the browser's own line-through is shown.",
  ],
  usage: `import { Scribble } from "@/components/ui/scribble"

export function Example() {
  return (
    <p>
      The plan is <Scribble>very secret</Scribble> a surprise.
    </p>
  )
}`,
  related: ["strike", "highlight", "underline"],
} satisfies ComponentDoc
