import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "lettering",
  title: "Lettering",
  category: "Typography",
  description:
    "Display titles in the script font with a riso print look: ink with a second colour printed a hair off register. Pure CSS text-shadow, so the words are real text at any size. No gradients, no filters.",
  status: "new",
  parts: [
    {
      name: "Lettering",
      description: "A heading (any element with `as`) in the script role, bold, with `ll-riso`. The offset colour is a token (`--ll-riso`) set by `tone`; `calm` density and the misregistration knob bring it to zero.",
      props: [
        { name: "as", type: "React.ElementType", default: '"h2"', description: "The element: a heading level, or p / span for lettering that is not a heading." },
        { name: "size", type: '"sm" | "md" | "lg" | "xl" | "hero"', default: '"lg"', description: "30, 48, 60, 72 to 96 (responsive), and 72 to 128 px (responsive)." },
        { name: "tone", type: '"marker" | "tomato" | "tangerine" | "lemon" | "grass" | "teal" | "sky" | "grape" | "bubblegum"', default: '"marker"', description: "The second colour of the print." },
        { name: "duotone", type: "same as tone", description: "A third pass in another accent, printed to the other side." },
        { name: "wobble", type: "number", default: "0", description: "Per-word baseline jitter, 0 (typeset) to 2 (hurried). Words stay real, selectable text." },
        { name: "seed", type: "string | number", description: "Pins the hand of the wobble." },
      ],
    },
  ],
  a11y: [
    "A real heading (or the element you choose): headings keep their level and outline. The offset colour is decoration; the ink text has 14:1 contrast on paper.",
    "Use one Lettering as the page's h1 at most; for repeated display text prefer p or span.",
    "The riso offset is a text-shadow, so it scales with the text, follows the density knob (calm = none) and disappears in Windows high contrast.",
  ],
  usage: `import { Lettering } from "@/components/ui/lettering"

export function Example() {
  return (
    <Lettering as="h1" size="xl" tone="teal">
      Paper Club
    </Lettering>
  )
}`,
  related: ["typography", "signature", "handwritten", "quote"],
} satisfies ComponentDoc
