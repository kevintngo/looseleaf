import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "reveal",
  title: "Reveal",
  category: "Interactive",
  description:
    "Holds its children back until they scroll into view, then draws them on: a wipe along the line, wet ink drying, a sheet dropped on the desk, a stamp, a toss. Direct children can arrive one after another. Without script, and with reduced motion, everything is simply there.",
  status: "new",
  parts: [
    {
      name: "Reveal",
      description:
        "A wrapper element. It arms itself after mounting (the server sends everything visible), hides its content with opacity, and plays one of the theme's own keyframes when an IntersectionObserver says enough of it is on screen. It leaves data-state=\"hidden|visible\" on itself, so anything drawn inside can key on it with group-data-[state=visible]/reveal:…",
      props: [
        { name: "effect", type: '"wipe" | "soak" | "drop" | "pop" | "toss"', default: '"wipe"', description: "wipe draws it on along the line (ll-wipe), soak dries it like wet ink (ll-soak), drop lays a sheet down (ll-drop), pop stamps it (ll-pop), toss throws it in (ll-toss)." },
        { name: "from", type: '"start" | "end"', default: '"start"', description: "Which end a wipe starts from. The wipe follows the page direction by itself." },
        { name: "delay", type: "number", default: "0", description: "Seconds to wait once it is in view." },
        { name: "stagger", type: "number", description: "Seconds between direct children (the first 16): they arrive one after another instead of as one block." },
        { name: "threshold", type: "number", default: "0.25", description: "How much of it must be on screen, 0 to 1." },
        { name: "once", type: "boolean", default: "true", description: "Play once, or every time it scrolls back into view." },
        { name: "onReveal", type: "() => void", description: "Called each time it is revealed." },
        { name: "nib / nibColor", type: "boolean / PaintKey", default: "false / \"tomato\"", description: "A hand-drawn marker tip rides the leading edge of a wipe, as if it were writing the content (wipe without stagger only; a list, `as=\"ul\"` or `\"ol\"`, has nowhere to put the tip and ignores it). The content is wrapped in one block (a span on a p or a span)." },
        { name: "as", type: '"div" | "section" | "article" | "aside" | "figure" | "ul" | "ol" | "li" | "span" | "p"', default: '"div"', description: "The element to render." },
      ],
    },
  ],
  a11y: [
    "Hiding is opacity only: the content stays in the accessibility tree and in the tab order the whole time, so it is never withheld from assistive technology or from find-in-page.",
    "The server sends the content visible and unarmed; only after mounting (and only if motion is allowed and IntersectionObserver exists) does it hide and wait. Without script, in old browsers, and with reduced motion (the OS setting, data-motion=\"reduced\" or an InkProvider with motion=\"reduced\") nothing is ever hidden.",
    "Each effect uses one of the theme's --ll-dur-* tokens, so a reduced-motion context collapses the duration to zero.",
    "Do not wrap content people need at once (above the fold, error messages, focus targets). It is for things that arrive with a flourish as you read down a page.",
  ],
  usage: `import { Reveal } from "@/components/ui/reveal"

export function Example() {
  return (
    <Reveal effect="soak" stagger={0.15}>
      <h2>Three things</h2>
      <p>One.</p>
      <p>Two.</p>
    </Reveal>
  )
}`,
  related: ["boil", "typewriter", "marquee", "confetti"],
} satisfies ComponentDoc
