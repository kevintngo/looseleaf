import type { ComponentDoc } from "../types"

export default {
  slug: "doodle",
  title: "Doodle",
  category: "Stickers & doodles",
  description:
    "Margin doodles: a star, a sun, a flower, a mushroom. Line-led, with one flat fill in register. Use them in the decoration layer, on empty states and in corners of cards.",
  status: "new",
  parts: [
    {
      name: "Doodle",
      description: "An intrinsic ink svg drawn from a skeleton at the size you ask for, redrawn (not scaled) below 72 px.",
      props: [
        { name: "name", type: "DoodleName | string", required: true, description: "A doodle id (`star`, `sun`, `flower`, `mushroom`...)." },
        { name: "size", type: "number", default: "96", description: "Pixels. Below 72 the 48 px redraw (silhouette and one detail, heavier line), from 72 the 96 px master, from 128 the hero tier." },
        { name: "accent", type: "Accent | \"hi\" | \"kraft\"", description: "Colour of the accent washes, for doodles that have them." },
        { name: "seed", type: "string | number", description: "Another seed, another hand." },
        { name: "rotate", type: "number", description: "Degrees. Corner flourishes are drawn for the top-left and turned by you." },
        { name: "flip", type: "boolean", description: "Mirror horizontally (CSS)." },
        { name: "label", type: "string", description: "Accessible name. Decorative (`aria-hidden`) without it." },
      ],
    },
  ],
  a11y: ["Decorative by default; give it a `label` only when it carries meaning that the surrounding text does not."],
  usage: `import { Doodle } from "@/components/ui/doodle"

export function Example() {
  return <Doodle name="sun" size={96} />
}`,
  related: ["sticker", "icon", "mascot"],
} satisfies ComponentDoc
