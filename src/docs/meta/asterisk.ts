import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "asterisk",
  title: "Asterisk",
  category: "Marks",
  description:
    "Hand-drawn footnote marks: an asterisk, a star, a dagger or a double dagger, in red pencil, sized like a superscript after the word they belong to. Give it a label and an href and it links to the footnote.",
  status: "new",
  parts: [
    {
      name: "Asterisk",
      description:
        "A <span> holding the drawn mark. Children come first and the mark follows them: <Asterisk>fine print</Asterisk>. The glyph is intrinsic art (kept in Windows high contrast) drawn once per seed.",
      props: [
        { name: "mark", type: '"asterisk" | "star" | "dagger" | "double-dagger"', default: '"asterisk"', description: "Which mark." },
        { name: "tone", type: '"red" | "ink" | "blue" | "pencil"', default: '"red"', description: "The pen color of the mark." },
        { name: "label", type: "string", description: "The accessible name (\"footnote 1\"). Without it the mark is decoration and hidden from assistive technology." },
        { name: "href", type: "string", description: "Turns the mark into a link to the footnote. Its accessible name is `label`, or \"footnote\"." },
        { name: "seed", type: "string | number", description: "Pins the hand of the strokes." },
      ],
    },
  ],
  a11y: [
    "Decorative by default (aria-hidden). With `label` it is role=\"img\" with that name; with `label` and `href` it is a real link (its hit area is 24 px or more).",
    "A footnote mark points at a footnote: keep the footnote in text, and link the two (`href=\"#fn1\"` here and an id on the note).",
    "Sized in em, so it follows the text it sits in. Kept in Windows high contrast as a drawn glyph.",
  ],
  usage: `import { Asterisk } from "@/components/ui/asterisk"

export function Example() {
  return (
    <p>
      Free shipping<Asterisk label="footnote 1" href="#fn1" />
    </p>
  )
}`,
  related: ["label", "annotate", "tally"],
} satisfies ComponentDoc
