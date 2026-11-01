import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "highlight",
  title: "Highlight",
  category: "Marks",
  description:
    "A highlighter swipe behind real words. The phrase stays text you can select and copy; the swipe follows it line by line when it wraps, in yellow or any stationery colour, and can draw itself on as it scrolls into view.",
  status: "new",
  parts: [
    {
      name: "Highlight",
      description:
        "A <mark> (or your own element with asChild) that hosts the drawing. One aria-hidden swipe per line of the phrase, measured from the browser's own line boxes, so it starts and ends where the words do.",
      props: [
        { name: "tone", type: '"yellow" | "pink" | "green" | "blue" | "orange" | "lilac" | "teal"', default: '"yellow"', description: "The marker. Yellow is the highlighter; the rest are the stationery accents as translucent markers." },
        { name: "weight", type: '"light" | "regular" | "heavy"', default: '"regular"', description: "How fat the marker is held." },
        { name: "cover", type: '"full" | "under"', default: '"full"', description: "full covers the letters; under runs along the lower half of the line so the words stay clear above it." },
        { name: "animate", type: "boolean", default: "false", description: "Hold the swipe back and draw it on, left to right, the first time the phrase scrolls into view. Reduced motion just shows it." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide the swipe. With animate, turning it on plays the draw-on." },
        { name: "delay", type: "number", description: "Milliseconds to wait before the first line draws on; each further line follows a beat later." },
        { name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId(), so server and client draw the same swipe." },
        { name: "asChild", type: "boolean", default: "false", description: "Render the swipe on your own child element (a link, a strong)." },
      ],
    },
  ],
  a11y: [
    "The words are ordinary text: selectable, copyable, found by search, read in order. The swipe is aria-hidden and pointer-events-none, so it never takes a click or a selection.",
    "It is a <mark>, so assistive technology that announces highlighted text still does. Text on the swipe stays ink on a translucent tint (about 12:1 on the yellow).",
    "Before the first measure, without JavaScript and in Windows high contrast you get the browser's own <mark> background (system Mark colours in high contrast). With animate the swipe is only drawn once scripts run.",
    "Reduced motion (or data-motion=\"reduced\") zeroes the draw-on: the swipe simply appears.",
  ],
  usage: `import { Highlight } from "@/components/ui/highlight"

export function Example() {
  return (
    <p>
      The good bits get <Highlight>a swipe of yellow</Highlight> so I can find them again.
    </p>
  )
}`,
  related: ["underline", "circled", "annotate", "strike"],
} satisfies ComponentDoc
