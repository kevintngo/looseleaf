import type { ComponentDoc } from "../types"

export default {
  slug: "stamp",
  title: "Stamp",
  category: "Stickers & doodles",
  description:
    "A rubber stamp: solid ink pressed through a worn pad, double-rule border, typewriter capitals, a slight tilt and sometimes the ghost of a first impression. For APPROVED, PAID, DRAFT and friends.",
  status: "new",
  parts: [
    {
      name: "Stamp",
      description: "An intrinsic ink svg in one color of pad ink, drawn through the baked `stamp` wear mask.",
      props: [
        { name: "name", type: "string", description: "A preset from the sticker sheet: `stamp-approved`, `stamp-draft`, `stamp-paid`, `stamp-urgent`, `stamp-received`, `stamp-void`, `stamp-new`, `stamp-member`. Other props override it." },
        { name: "text", type: "string", description: "The main word (capitals are set for you)." },
        { name: "shape", type: '"rect" | "round" | "burst" | "void"', default: '"rect"', description: "Double-rule box, double ring with rim text, twelve-point seal, or big diagonal letters struck through." },
        { name: "ink", type: '"red" | "ink-you" | "green" | "ink"', default: '"red"', description: "Pad ink. Never a stationery accent." },
        { name: "sub", type: "string", description: "A smaller second line (a date, `issue`)." },
        { name: "ring", type: "string", description: "Text around the rim of a round stamp." },
        { name: "w / h / size", type: "number", description: "Box in px; `size` is the diameter of round and burst stamps." },
        { name: "tilt", type: "number", description: "Degrees; default a seeded -5 to 5." },
        { name: "ghost", type: "boolean", description: "A faint first impression under the main one." },
        { name: "dashed", type: "boolean", description: "Dashed inner rule instead of a solid one." },
        { name: "seed", type: "string | number", description: "Wear, wobble and the patches where the pad missed." },
        { name: "label", type: "string", description: "Accessible name (default: the stamp's text)." },
      ],
    },
  ],
  a11y: ["The svg is an image named by its text (`role=\"img\"`), so a stamped APPROVED is announced as \"Approved\"."],
  usage: `import { Stamp } from "@/components/ui/stamp"

export function Example() {
  return <Stamp name="stamp-approved" />
}`,
  related: ["sticker", "doodle"],
} satisfies ComponentDoc
