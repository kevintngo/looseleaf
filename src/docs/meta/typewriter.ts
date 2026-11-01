import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "typewriter",
  title: "Typewriter",
  category: "Typography",
  description:
    "Text that types itself in the typewriter face, with an inked caret. Keys land at uneven speeds and hold at commas and full stops; several phrases can go one under the other or be typed, held and backspaced in turn.",
  status: "new",
  parts: [
    {
      name: "Typewriter",
      description:
        "An inline element. The animation is aria-hidden; the whole text sits in the accessibility tree once, in a polite live region that only changes when you change `text`. Without JavaScript, or with reduced motion, the finished text is simply there.",
      props: [
        { name: "text", type: "string | string[]", required: true, description: "What to type. An array is several phrases." },
        { name: "mode", type: '"lines" | "cycle"', default: '"lines"', description: "lines: each phrase on its own line. cycle: type a phrase, hold it, backspace it, type the next (a loop or a rotating word)." },
        { name: "speed", type: "number", default: "22", description: "Characters per second, as an average: every key has its own delay." },
        { name: "delay / pause", type: "number", default: "300 / 1400", description: "ms before it starts, and ms to hold a finished phrase." },
        { name: "loop", type: "boolean", default: "false", description: "Start again from an empty page when done. The live region is switched off while it loops, so it is never read twice." },
        { name: "cursor", type: '"bar" | "block" | "underscore" | false', default: '"bar"', description: "The caret, drawn with the pen. Solid while typing, blinking when it rests (not blinking with reduced motion)." },
        { name: "reserve", type: "boolean", default: "false", description: "Keep the room of the finished text (the longest phrase of a cycle) from the first frame, so nothing around it moves while it types. The element becomes an `inline-block` (or the `display` your className sets) with an invisible copy of the finished text in flow and the typed text laid over it. Off, it is an inline element that grows as it types and can sit inside a sentence." },
        { name: "startOnView", type: "boolean", default: "true", description: "Wait until it is at least 40 % on screen." },
        { name: "onDone", type: "() => void", description: "Called when the last character is on the page (never when looping)." },
        { name: "seed", type: "string | number", description: "Pins the caret's hand and the jitter of the words." },
      ],
    },
  ],
  a11y: [
    "Screen readers get the whole text once, from a visually hidden polite live region; they never hear it letter by letter. The typed copy is aria-hidden. Changing `text` is announced once.",
    "In cycle mode and when looping the live region is off, so a rotating word is not announced on every turn; the phrases are all available as one sentence in reading order.",
    "Reduced motion (the OS setting, data-motion=\"reduced\", or an InkProvider with motion=\"reduced\"): no typing, no blinking; the finished text (the last phrase of a cycle) is shown.",
    "Without JavaScript the server has already sent the whole text in the page.",
    "Layout: by default the element grows as it types, so anything below it moves. Pass `reserve` to hold the room of the finished text from the first frame (an invisible copy in flow, aria-hidden, that no one can select), or give a block of several lines a `min-h-*`. It is made for a headline or a few short lines: every key press re-renders the words typed so far, so do not feed it pages of text.",
    "One key press is one character as a person sees it: an emoji, a flag or a letter with its accent is typed and erased whole, never in halves.",
    "Words sit up to a pixel off the baseline and a shade lighter, as plain inline text (a word with a layer of its own was cut at its advance by WebKit, which clipped the tail of a hand font's last glyph); calm density and reduced motion turn the jitter off through --ll-jitter-k.",
  ],
  usage: `import { Typewriter } from "@/components/ui/typewriter"

export function Example() {
  return <Typewriter text="Every screen, drawn by hand." className="text-3xl" />
}`,
  related: ["marquee", "reveal", "boil", "label"],
} satisfies ComponentDoc
