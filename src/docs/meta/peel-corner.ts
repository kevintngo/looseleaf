import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "peel-corner",
  title: "Peel corner",
  category: "Interactive",
  description:
    "A page whose corner curls back to show the sheet underneath. Hover the corner to lift it, drag it to peel along a diagonal crease, click or press Enter to open it. For a discount code, a hint, a secret, a P.S.",
  status: "new",
  parts: [
    {
      name: "PeelCorner",
      description:
        "The root: a positioned box that holds the page and the sheet under it, draws the turned-back flap (the back of the paper, with its stepped shadow on the sheet underneath) and puts a 56 px corner button over it. The flap is drawn once and scaled about the corner, so crease and shadow stay in proportion at every stage.",
      props: [
        { name: "peeled / defaultPeeled / onPeeledChange", type: "boolean", description: "Controlled or uncontrolled: true when the corner is open and the sheet underneath can be read." },
        { name: "size", type: "number", default: "120", description: "How big the turned-back corner is when open, px. A drag can go about a third further." },
        { name: "corner", type: '"bottom-right" | "bottom-left"', default: '"bottom-right"', description: "Which corner curls; the bottom left mirrors the flap, the clip and the underneath content." },
        { name: "back", type: "PaintKey", default: '"paper"', description: "The token the flap (the back of the page) is made of: \"kraft\" for a kraft page, \"sticky-yellow\" for a sticky note." },
        { name: "label", type: "string", default: '"Peel back the corner"', description: "Accessible name of the corner button." },
      ],
    },
    { name: "PeelCornerPage", description: "The page you see: a Paper (paper stock, no tilt) cut away along the crease with a clip-path that keeps 40 px of room for its own shadow. Takes every Paper prop.", props: [] },
    { name: "PeelCornerUnder", description: "The sheet underneath: as big as the page, behind it, kraft by default. Its content sits in the corner that peels. inert and aria-hidden until the corner is open, so its links and buttons cannot be reached early.", props: [] },
  ],
  a11y: [
    "The corner is a real <button> with aria-expanded and aria-controls (the sheet underneath). Enter and Space toggle it, a screen reader's activate works, and a drag is only an extra.",
    "What is underneath is inert and aria-hidden while the corner is closed, so it is neither focusable nor read early; once open it is ordinary content.",
    "The corner button is a 56 px square laid over the page's corner: keep links and buttons out of that square, or they cannot be reached with a pointer.",
    "Controlled: if the parent declines a change (`peeled` stays as it was), the corner eases back to what the prop says instead of staying half open.",
    "The hit area is 56 px, bigger than the curl. Dragging back toward the corner closes it; a short pull that never gets half way springs back; pointercancel springs back.",
    "Reduced motion: the corner jumps between rest, open and closed instead of easing. Calm density keeps the flap and the button and trims the flap's shadow to two steps.",
    "The flap and its shadow are drawn art, aria-hidden and click-through; the keyboard focus ring is drawn round the corner button.",
  ],
  usage: `import { PeelCorner, PeelCornerPage, PeelCornerUnder } from "@/components/ui/peel-corner"

export function Example() {
  return (
    <PeelCorner>
      <PeelCornerPage>Spring sale. Peek under the corner for a code.</PeelCornerPage>
      <PeelCornerUnder>SAVE10</PeelCornerUnder>
    </PeelCorner>
  )
}`,
  related: ["paper", "tear-off", "flip-card", "reveal"],
} satisfies ComponentDoc
