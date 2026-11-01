import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "marker",
  title: "Marker",
  category: "Chat",
  description:
    "The pencil line between two days of a conversation, the red one where you stopped reading, and the quiet note that someone joined. A separator, a border or a plain line of small print.",
  status: "new",
  upstream: "marker",
  parts: [
    {
      name: "Marker",
      description: "A flex row. `separator` pulls a pencil line on each side of the words; `border` pulls one under them; `default` is small print. The lines are aria-hidden drawings, so they never affect layout or the reading order.",
      props: [
        { name: "variant", type: '"default" | "separator" | "border"', default: '"default"', description: "Where the line goes." },
        { name: "tone", type: '"default" | "new"', default: '"default"', description: "`new` pulls the lines in red pencil, sets the words bold on a highlighter swipe and reddens a MarkerIcon: the unread marker." },
        { name: "rule", type: '"line" | "wavy"', default: '"line"', description: "How a `border` marker's line is drawn." },
        { name: "asChild", type: "boolean", default: "false", description: "Render your own element (a button that jumps to the first unread message, say)." },
        { name: "seed", type: "string | number", description: "Pins the hand of the lines." },
      ],
    },
    { name: "MarkerIcon", description: "A 16 px slot for an Icon (aria-hidden). Red inside a `tone=\"new\"` marker." },
    { name: "MarkerContent", description: "The words. In a separator they are set in the script font at 20 px, like a date written in the margin." },
  ],
  a11y: [
    "Markers are plain divs (as upstream). Inside a `role=\"log\"` transcript a separator is announced as its words: 'Today', 'New messages'.",
    "Nothing is conveyed by the drawing alone: the unread state is the words, and colour is backed by the asterisk and the highlighter swipe.",
    "Use `asChild` with a `button` to make 'New messages' a control; the drawn focus ring is the button's own.",
    "Difference from upstream: `markerVariants` gives the layout only. The lines of `separator` and `border` are drawn parts of `Marker` (a pseudo-element cannot hold a drawing), so applying the variants to your own element draws no line.",
    "Ink lines are 3:1 or more against paper; the words are muted text at 8.9:1 (ink on the highlighter swipe 12:1).",
  ],
  usage: `import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

export function Example() {
  return (
    <>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="separator" tone="new">
        <MarkerIcon><Icon name="asterisk" /></MarkerIcon>
        <MarkerContent>New messages</MarkerContent>
      </Marker>
    </>
  )
}`,
  related: ["message", "bubble", "message-scroller", "separator"],
} satisfies ComponentDoc
