import type { ComponentDoc } from "../types"

export default {
  slug: "sticker",
  title: "Sticker",
  category: "Stickers & doodles",
  description:
    "Die-cut vinyl stickers: the art with a white border, a cut line, a soft shadow and, if you like, a peeled corner. Status badges (done, sale) are generated; the rest are drawn by hand.",
  status: "new",
  parts: [
    {
      name: "Sticker",
      description: "An intrinsic ink svg. The border is a fat round-join stroke of the silhouette, defined once and reused; the shadow is a CSS filter.",
      props: [
        { name: "name", type: "StickerName | string", required: true, description: "A sticker id (`done`, `sale`, `cursor-click`, `hand-point-right`...). Stamp ids render as flat stamps." },
        { name: "size", type: "number", default: "96", description: "Pixels of the art; the border is added around it. Below 80 the 64 px redraw, from 128 the extras." },
        { name: "peel", type: "boolean | number", default: "false", description: "Fold the lower-right corner over. `true` picks a size from the sticker; a number is the fold in px. Works for any silhouette." },
        { name: "rotate", type: 'number | "auto"', default: '"auto"', description: "Degrees, or a small seeded tilt that `density=\"calm\"` flattens." },
        { name: "border", type: "number", description: "White border width in px (default 7.5% of the size, 3.5 to 8)." },
        { name: "shadow", type: "boolean", default: "true", description: "The soft drop shadow (`ll-drop-sticker`, a CSS filter)." },
        { name: "seed", type: "string | number", description: "Another seed, another hand (and another auto tilt)." },
        { name: "label", type: "string", description: "Accessible name. Decorative (`aria-hidden`) without it." },
      ],
    },
  ],
  a11y: ["Decorative by default. A badge that carries meaning (Done, Sale) should sit next to real text or be given a `label`."],
  usage: `import { Sticker } from "@/components/ui/sticker"

export function Example() {
  return <Sticker name="done" size={96} peel />
}`,
  related: ["doodle", "stamp", "icon"],
} satisfies ComponentDoc
