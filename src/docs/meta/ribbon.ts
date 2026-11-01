import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "ribbon",
  title: "Ribbon",
  category: "Marks",
  description:
    "A ribbon label: a band of colored paper with words on it, folded ends and all. For a section heading, a New flag on a card, a price label or a call to action.",
  status: "new",
  parts: [
    {
      name: "Ribbon",
      description:
        "A span (or your own link or button, with asChild) with the ribbon drawn behind its words. The band is a marker fill that misses its felt-tip outline; a banner's tails are one shade darker and tucked under the band with a small fold. The host is as wide as its words need.",
      props: [
        { name: "variant", type: '"banner" | "swallow" | "flag"', default: '"banner"', description: "Folded swallow-tailed ends; a V notch at both ends; square at the start and notched at the end." },
        { name: "tone", type: '"marker" | "hi" | "tangerine" | "lemon" | "grass" | "teal" | "sky" | "bubblegum" | "paper"', default: '"marker"', description: "The paper. Tomato and grape are left out: ink on them is 3.95:1, large text only." },
        { name: "size", type: '"sm" | "default" | "lg"', default: '"default"', description: "Band height 26 / 34 / 46 px with 14 / 16 / 20 px type." },
        { name: "asChild", type: "boolean", default: "false", description: "Draw the ribbon on the child element (an a or a button). A ribbon with asChild, onClick or href lifts 1 px on hover and shows a drop-line." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed draws the same ribbon." },
        { name: "children", type: "ReactNode", description: "A few words on one line: the ribbon grows with them and never wraps, so keep it short on a narrow screen. A ribbon with onClick but no asChild is only a span: give a clickable one a link or a button." },
      ],
    },
  ],
  a11y: [
    "The words are real DOM text on a plain span; the drawing is aria-hidden, ignores the pointer and never affects layout.",
    "With asChild the ribbon is whatever you gave it: a link or a button, with its own role, keyboard behavior and name. Focus-visible draws a blue ring round the whole ribbon, tails included.",
    "Ink text on each offered tone is at least 4.5:1 (marker 4.6 on its drawn fill, lemon and highlighter 12+). Windows high contrast hides the drawing and gives the element a real outline.",
    "Hover lifts a link ribbon 1 px, draws a drop-line under it and underlines its words, so it is visible without hue. Reduced motion makes the lift instant. Calm density draws a hairline outline and a single-pass fill.",
  ],
  usage: `import { Ribbon } from "@/components/ui/ribbon"

export function Example() {
  return (
    <>
      <Ribbon size="lg">New arrivals</Ribbon>
      <Ribbon asChild variant="flag" tone="lemon">
        <a href="/sale">Sale ends Friday</a>
      </Ribbon>
    </>
  )
}`,
  related: ["badge", "seal", "label-tag", "bookmark", "tape"],
} satisfies ComponentDoc
