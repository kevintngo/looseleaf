import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "seal",
  title: "Seal",
  category: "Stickers & doodles",
  description:
    "Rosettes, scalloped seals, medals, ringed seals with rim lettering and wax seals, drawn like the stickers without the white edge. Use one as a verified mark beside a name, an award on a card, or the stamp of approval on a certificate.",
  status: "new",
  parts: [
    {
      name: "Seal",
      description:
        "Intrinsic art: an svg whose size is its `size`, complete in server markup, named by its words. Made by the badge generator plus a ringed seal and wax; the pens, the solid fills and the grain are the sticker library's.",
      props: [
        { name: "variant", type: '"scallop" | "starburst" | "rosette" | "medal" | "shield" | "plate" | "ticket" | "tag" | "ring" | "wax"', default: '"scallop"', description: "The shape. Rosette and medal hang a ribbon; ring letters its rim; wax is a blob of sealing wax with an impression." },
        { name: "text", type: "string", description: "The words in the middle: about 6 letters at 64 px, 10 at 96 (one or two initials on wax). Capitals are set for you." },
        { name: "sub", type: "string", description: "A smaller second line (from 96 px up; dropped in the small redraw). Leave it off a rosette or a medal: their ribbons hang across that line. A ticket is one line (it has no room for a second and ignores `sub`)." },
        { name: "mark", type: '"check" | "star"', description: "A hand-drawn glyph instead of the words. It holds at 16 px where letters do not, so it is what a verified badge should use." },
        { name: "tone", type: "PaintKey", default: '"bubblegum" (wax: "red")', description: "The colour: a stationery accent, or red, ink-you, green for wax. Ink on tomato and grape reaches 3.95:1: large text only." },
        { name: "ribbon", type: "PaintKey", default: '"tomato"', description: "Colour of the hanging ribbon of a rosette or a medal." },
        { name: "ring", type: "string", description: "Lettering all the way round the rim of a ring seal, repeated to close the circle (from 72 px up)." },
        { name: "deco", type: '"tick" | "star" | "sparkle" | "swoosh" | "percent"', description: "The generator's small decoration (from 96 px up)." },
        { name: "size", type: "number", default: "96", description: "Pixels across. Below 80 the small redraw is used." },
        { name: "tilt", type: 'number | "auto"', default: "0", description: "Degrees, or a small seeded tilt." },
        { name: "tier", type: '"lo" | "hi"', description: "Drawing quality: the provider's (lo) by default; hi for hero art costs about three times the markup." },
        { name: "shadow", type: "boolean", default: "true", description: "The soft drop shadow (a CSS filter)." },
        { name: "label / decorative", type: "string / boolean", description: 'Accessible name (default: the words, "Verified" for a check, "Award" for a star), or hide it when the text beside it says the same.' },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
  ],
  a11y: [
    "The svg is role=\"img\" named by its words; give `label` for the meaning (\"Identity verified\") and `decorative` when the surrounding text already says it.",
    "A drawn check or star reads at 16 px, but never carry a status by the seal alone: put the word in the DOM next to it or in `label`.",
    "Windows high contrast keeps the seal (intrinsic art).",
    "The ring lettering is decoration inside the image; the name is what a screen reader gets.",
  ],
  usage: `import { Seal } from "@/components/ui/seal"

export function Example() {
  return (
    <p className="flex items-center gap-1.5">
      Maya Chen <Seal mark="check" tone="sky" size={20} label="Verified" shadow={false} />
    </p>
  )
}`,
  related: ["sticker", "stamp", "badge", "ribbon", "avatar"],
} satisfies ComponentDoc
