import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "napkin",
  title: "Napkin",
  category: "Paper",
  description:
    "A paper napkin to write on: tissue with a pinked edge and a pressed border, folded so it has creases (a valley with a shade on one side and a pale line on the other), optionally ringed by a coffee cup. Notes on it are set in the script font, as if in marker.",
  status: "new",
  parts: [
    {
      name: "Napkin",
      description: "A Paper on the `napkin` stock (crimped edge, embossed border, both drawn once it is measured) with the creases as a second layer of ink. 18 rem wide, at least 14 rem tall, padded 36 px so text sits inside the pressed border.",
      props: [
        { name: "fold", type: '"quarter" | "half" | "none"', default: '"quarter"', description: "A crease each way through the middle; one across; or unfolded." },
        { name: "stain", type: "boolean", default: "false", description: "A coffee ring (multiply-printed, faint)." },
        { name: "tape / fastener / tilt / seed / size / as", type: "Paper props", description: "As on any sheet. A napkin turns up to 1.2 degrees." },
      ],
    },
    { name: "NapkinTitle", description: "A script title, 32 px bold, leading none." },
    { name: "NapkinContent", description: "The note: script font at 24 px, growing to fill." },
    { name: "NapkinFooter", description: "Small ink-soft text at the foot." },
  ],
  a11y: [
    "A napkin is a plain `div`; use `as=\"article\"` with a label when it means more. The creases, the stain and the pressed border are aria-hidden decoration.",
    "Ink on the napkin is 14:1; the footer 9:1. The creases only shade the paper by a few percent, so they never cost contrast. The tilt is zero in calm density.",
  ],
  usage: `import { Napkin, NapkinContent, NapkinFooter, NapkinTitle } from "@/components/ui/napkin"

<Napkin fold="quarter" stain tape="top">
  <NapkinTitle>Specials</NapkinTitle>
  <NapkinContent>soup of the day, a very small pie</NapkinContent>
  <NapkinFooter>until six</NapkinFooter>
</Napkin>`,
  related: ["paper", "sticky-note", "index-card", "receipt"],
} satisfies ComponentDoc
