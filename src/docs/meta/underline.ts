import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "underline",
  title: "Underline",
  category: "Marks",
  description:
    "A pen line under real words: single, double, wavy or scribbled, in felt, pencil or marker. It follows the phrase line by line when it wraps, and can draw itself on as it scrolls into view.",
  status: "new",
  parts: [
    {
      name: "Underline",
      description:
        "A <span> (or your own element with asChild) that hosts the drawing. One aria-hidden line per line of the phrase, measured from the browser's own line boxes.",
      props: [
        { name: "kind", type: '"single" | "double" | "wavy" | "scribble"', default: '"single"', description: "The line. Single rises to the right like a real one; double is two pulls; wavy is a squiggle; scribble is a fast zig-zag." },
        { name: "tone", type: '"ink" | "blue" | "red" | "green" | "pencil" | "marker" | "orange"', default: '"ink"', description: "The pen. Blue is the reserved \"you\" felt; red is for corrections." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, felt tip or brush pen. Text under 15 px takes the fine-liner by itself, and the pen grows with larger type." },
        { name: "animate", type: "boolean", default: "false", description: "Draw the line on, left to right, the first time the phrase scrolls into view. Reduced motion just shows it." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide the line. With animate, turning it on plays the draw-on." },
        { name: "delay", type: "number", description: "Milliseconds to wait before the first line draws on; each further line follows a beat later." },
        { name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId(), so server and client draw the same line." },
        { name: "asChild", type: "boolean", default: "false", description: "Render the line on your own child element (a link, a strong)." },
      ],
    },
  ],
  a11y: [
    "The words are ordinary text: selectable, copyable, found by search. The line is aria-hidden and pointer-events-none.",
    "Until the drawing exists (no JavaScript, first paint) and in Windows high contrast, the browser's own text-decoration underline is shown in the pen's color.",
    "Do not use it as the only sign of a link: put it on a real <a> with asChild (links keep their native focus ring) or keep the link's own underline.",
    "Reduced motion (or data-motion=\"reduced\") zeroes the draw-on.",
  ],
  usage: `import { Underline } from "@/components/ui/underline"

export function Example() {
  return (
    <p>
      Read <Underline tone="blue" kind="wavy">the small print</Underline> first.
    </p>
  )
}`,
  related: ["highlight", "circled", "strike", "annotate"],
} satisfies ComponentDoc
