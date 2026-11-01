import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "strike",
  title: "Strike",
  category: "Marks",
  description:
    "A red pencil through real words: one line, two lines, or a cross-out. The text stays readable and real underneath, so a price that was 49 can still be copied and read by a screen reader.",
  status: "new",
  parts: [
    {
      name: "Strike",
      description: "A <s> (or your own element with asChild) that hosts the drawing, in front of the words. One line per line of the phrase; a cross-out is one X over the whole phrase.",
      props: [
        { name: "kind", type: '"single" | "double" | "cross"', default: '"single"', description: "One line, two lines, or two long diagonals across the phrase." },
        { name: "tone", type: '"red" | "ink" | "blue" | "green" | "pencil" | "marker" | "orange"', default: '"red"', description: "The pen. Red is a waxy colored pencil." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, regular or brush." },
        { name: "animate", type: "boolean", default: "false", description: "Draw the line on the first time it scrolls into view." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide the line. With animate, turning it on plays the draw-on." },
        { name: "delay", type: "number", description: "Milliseconds to wait before drawing on." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
        { name: "asChild", type: "boolean", default: "false", description: "Render the line on your own child element." },
      ],
    },
  ],
  a11y: [
    "A real <s> element, which browsers and many screen readers treat as content that is no longer accurate. Say what changed in the surrounding text (\"was\", \"now\") rather than relying on the line alone.",
    "When the line is only decoration (a ticked-off task whose state a checkbox already announces) use `asChild` on a <span>, so the words are not marked as deleted for everyone, and `show` for the on and off states; with `show={false}` the native line-through is hidden too.",
    "The text underneath stays selectable and copyable; the drawing is aria-hidden and pointer-events-none.",
    "Before the drawing exists and in Windows high contrast the browser's own line-through is shown.",
  ],
  usage: `import { Strike } from "@/components/ui/strike"

export function Example() {
  return (
    <p>
      Was <Strike>$49</Strike>, now $29.
    </p>
  )
}`,
  related: ["scribble", "underline", "highlight", "annotate"],
} satisfies ComponentDoc
