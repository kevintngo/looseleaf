import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "handwritten",
  title: "Handwritten",
  category: "Typography",
  description:
    "Text that looks written, not typeset: every word sits a hair off the baseline and a touch lighter, by a seeded amount. The words stay real inline text; code, links and forms inside are left exactly as typed.",
  status: "new",
  parts: [
    {
      name: "Handwritten",
      description:
        "Any element (`as`, a span by default) whose text nodes are split into word spans carrying `--jy` / `--jr` / `--jo`. The component turns them into a relative offset from the baseline and a lighter ink (the words stay plain inline text: a word of its own layer, rotated or faded, was clipped at its advance by WebKit, so a final d, l or ! lost its top); `--jr` is kept for stylesheets of your own. The same seed always writes the same line, on the server and in the browser.",
      props: [
        { name: "as", type: "React.ElementType", default: '"span"', description: "The element to render." },
        { name: "strength", type: "number", default: "1", description: "0 renders plain text (no spans, no utility class), 1 is the default hand, 2 a hurried one. Compact density writes it lighter." },
        { name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    "The text is unchanged: words are inline spans with real spaces between them, so it wraps, selects, copies and is read as ordinary text.",
    "Elements that must stay exact are skipped: code, pre, kbd, samp, var, links, buttons, inputs, media. Add data-handwritten=\"off\" to any element to opt it (and everything in it) out.",
    "A text-decoration on the element (underline, line-through) is passed on to every word. For a drawn line use Underline or Strike around the text instead: they follow the words when they wrap.",
    "Calm density and reduced motion switch the effect off in CSS (--ll-jitter-k = 0); compact writes it lighter. Never apply it to long reading text: it is for notes, captions, labels and titles.",
  ],
  usage: `import { Handwritten } from "@/components/ui/handwritten"

export function Example() {
  return (
    <Handwritten as="p" className="font-script text-2xl">
      ask sam about the pond, and bring the big umbrella!
    </Handwritten>
  )
}`,
  related: ["lettering", "callout", "signature", "typography"],
} satisfies ComponentDoc
