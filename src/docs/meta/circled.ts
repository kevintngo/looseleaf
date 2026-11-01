import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "circled",
  title: "Circled",
  category: "Marks",
  description:
    "A hand loop around a word or phrase: a circle that overshoots where it started, a box, or a pair of square brackets. It can be written on as it scrolls into view.",
  status: "new",
  parts: [
    {
      name: "Circled",
      description: "A <span> (or your own element with asChild) that hosts ONE drawing for the whole phrase, in front of the words. For a phrase that wraps, prefer the box or the brackets.",
      props: [
        { name: "shape", type: '"circle" | "box" | "brackets"', default: '"circle"', description: "A loop that overshoots, a hand box, or square brackets on both sides." },
        { name: "tone", type: '"ink" | "blue" | "red" | "green" | "pencil" | "marker" | "orange"', default: '"ink"', description: "The pen. Red felt is the teacher's circle." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, felt tip or brush pen." },
        { name: "bleed", type: "number", default: "2", description: "How many px the mark stands off the writing, on every side (0 to 16). A loop already hugs one line of text, close enough to leave the words either side alone; raise it for a roomier ring, or for a mark that shares a line with a bigger neighbor." },
        { name: "animate", type: "boolean", default: "false", description: "Write the loop on, following the stroke, the first time it scrolls into view." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide the mark. With animate, turning it on plays the draw-on." },
        { name: "delay", type: "number", description: "Milliseconds to wait before drawing on." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
        { name: "asChild", type: "boolean", default: "false", description: "Render the mark on your own child element." },
      ],
    },
  ],
  a11y: [
    "The words are ordinary text; the loop is aria-hidden and pointer-events-none, so it never blocks a click on a link or button inside.",
    "If the circle carries meaning (the correct answer, the item to check) say so in text as well; a drawing alone is not announced.",
    "Until the drawing exists a thin outline shows; in Windows high contrast a real outline is shown instead of the drawing.",
  ],
  usage: `import { Circled } from "@/components/ui/circled"

export function Example() {
  return (
    <p>
      Please reply by <Circled tone="red">Friday</Circled>.
    </p>
  )
}`,
  related: ["annotate", "underline", "highlight", "arrow"],
} satisfies ComponentDoc
