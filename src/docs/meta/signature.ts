import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "signature",
  title: "Signature",
  category: "Marks",
  description:
    "A name signed in the script font with the pen's flourish under it: a swoosh with a loop that flicks up past the last letter. The name is ordinary text; the flourish is a drawing that can write itself on.",
  status: "new",
  parts: [
    {
      name: "Signature",
      description:
        "An inline-block <span> holding the name (in `data-slot=\"signature-name\"`) and the aria-hidden flourish. Size the name with `size` or any text class.",
      props: [
        { name: "flourish", type: '"swoosh" | "underline" | "none"', default: '"swoosh"', description: "The pen's tail: a swoosh with a loop and a crossing stroke, a flourished underline, or nothing." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "The name at 28, 44 or 64 px. Override with a text-* class." },
        { name: "tone", type: '"blue" | "ink" | "red" | "green" | "pencil" | "marker" | "orange"', default: '"blue"', description: "The pen of the flourish (and the color of the name for blue and ink)." },
        { name: "weight", type: '"fine" | "regular" | "brush"', default: '"regular"', description: "Fine-liner, felt tip or brush." },
        { name: "animate", type: "boolean", default: "false", description: "Sign it in the first time it scrolls into view: the name is written left to right, then the flourish." },
        { name: "show", type: "boolean", default: "true", description: "Show or hide the flourish (the name always stays)." },
        { name: "delay", type: "number", description: "Milliseconds before signing starts." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
  ],
  a11y: [
    "The name is real text in the page, read by a screen reader; the flourish is aria-hidden. A signature is not proof of anything: say who signed in text if it matters.",
    "The name text is not clipped by the flourish; the drawing spills 20 px beyond its box and never takes a click.",
    "Reduced motion zeroes the signing animation.",
  ],
  usage: `import { Signature } from "@/components/ui/signature"

export function Example() {
  return <Signature>Ada Lovelace</Signature>
}`,
  related: ["lettering", "handwritten", "quote", "underline"],
} satisfies ComponentDoc
