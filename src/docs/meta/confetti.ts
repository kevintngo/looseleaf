import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "confetti",
  title: "Confetti",
  category: "Interactive",
  description:
    "Paper confetti for the small victories. Strips, punched dots, stars, triangles, streamers and torn scraps, each a tiny drawing from the ink engine, thrown from a click, a state change or a function call. Nothing moves with reduced motion.",
  status: "new",
  parts: [
    {
      name: "ConfettiTrigger",
      description: "A button (or, with asChild, any element) that throws confetti from itself when clicked. It renders no layer of its own: the pieces fly in a click-through layer on the page.",
      props: [
        { name: "asChild", type: "boolean", description: "Wrap your own element (a Button) instead of rendering a <button>." },
        { name: "…ConfettiOptions", type: "count, spread, angle, velocity, gravity, drift, duration, colors, shapes, scalar, seed, origin, onDone", description: "See the options below. The origin defaults to the trigger." },
      ],
    },
    {
      name: "Confetti",
      description:
        "A decorative layer that fills its positioned parent and throws inside it: when `active` turns true, whenever `burstKey` changes, or from `apiRef.burst()`. Use it to keep a burst inside a card or a dialog.",
      props: [
        { name: "active", type: "boolean", description: "Throw a burst when it turns true (or is true on mount)." },
        { name: "burstKey", type: "number | string", description: "Throw again whenever it changes: bump a counter." },
        { name: "apiRef", type: "Ref<{ burst(options?) => () => void }>", description: "Imperative handle." },
        { name: "count", type: "number", default: "70", description: "Pieces, at most 400." },
        { name: "spread / angle", type: "number", default: "70 / 90", description: "The cone in degrees and its direction (90 up, 0 right, spread 360 for a ring)." },
        { name: "velocity / gravity / drift", type: "number", default: "1100 / 520 / 0", description: "Launch speed of the fastest piece (px/s), fall (px/s²) and wind (px/s²)." },
        { name: "duration", type: "number", default: "2600", description: "ms until the last piece has faded." },
        { name: "colors / shapes", type: "ConfettiColor[] / ConfettiKind[]", description: "Stationery accents (tomato … bubblegum) and shapes (strip, dot, star, triangle, curl, scrap)." },
        { name: "scalar", type: "number", default: "1", description: "Size multiplier." },
        { name: "seed", type: "number", description: "Same seed, same burst. Default: a counter, so every burst is different." },
        { name: "onDone", type: "() => void", description: "Called once when the last piece has landed, or when the burst was cleared. A Confetti layer forgets a burst the moment it is over." },
      ],
    },
  ],
  a11y: [
    "Confetti is decoration: the pieces are aria-hidden, never focusable, and click-through (pointer-events: none). Say what happened in words too (a toast, a status line): confetti alone tells a screen reader nothing.",
    "Reduced motion (the OS setting, data-motion=\"reduced\", or --ll-motion 0) throws nothing at all: no pieces, no layer.",
    "Pieces are removed as soon as they have faded, and the layer with them; a burst can be canceled with the function it returns, and unmounting a Confetti layer clears its pieces.",
    "Flight runs on the Web Animations API (off the main thread). Browsers without it simply show nothing.",
  ],
  usage: `import { ConfettiTrigger, confetti } from "@/components/ui/confetti"
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <ConfettiTrigger asChild>
      <Button>Celebrate</Button>
    </ConfettiTrigger>
  )
}

export function FromAHandler() {
  return <Button onClick={(event) => confetti({ origin: event.currentTarget, count: 120 })}>Celebrate</Button>
}`,
  related: ["sticker", "reveal", "boil", "tear-off"],
} satisfies ComponentDoc
