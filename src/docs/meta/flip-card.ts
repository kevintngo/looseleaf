import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "flip-card",
  title: "Flip card",
  category: "Interactive",
  description:
    "An index card with two sides. It turns over in 3D when you click it or press Space, lifting off the desk on the way; the side you cannot see is inert and hidden from assistive technology. For flashcards, reveals, and anything with a back.",
  status: "new",
  parts: [
    {
      name: "FlipCard",
      description:
        "The root: a perspective box holding the two faces in one grid cell (so it is as big as the bigger face) and, by default, a trigger button over the whole card. Size it with className (default h-48 w-72).",
      props: [
        { name: "flipped / defaultFlipped / onFlippedChange", type: "boolean / boolean / (flipped: boolean) => void", description: "Controlled or uncontrolled: true shows the back." },
        { name: "axis", type: '"y" | "x"', default: '"y"', description: "Turn like a page (y) or like a notepad (x)." },
        { name: "trigger", type: "boolean", default: "true", description: "Lay a button over the whole card. Turn it off when the faces hold links or buttons, and compose your own FlipCardTrigger." },
        { name: "label", type: "string", default: '"Flip card"', description: "Accessible name of the default trigger." },
      ],
    },
    { name: "FlipCardFront", description: "The side you see first: a Paper (index card by default). Takes every Paper prop.", props: [] },
    { name: "FlipCardBack", description: "The other side: a Paper (plain slip by default).", props: [] },
    {
      name: "FlipCardTrigger",
      description: "The button that turns the card, with aria-pressed. The default overlay carries a curled arrow in the corner that darkens on hover and a drawn focus ring round the card.",
      props: [
        { name: "asChild", type: "boolean", description: "Use your own element (a Button) as the trigger." },
        { name: "overlay", type: "boolean", default: "true", description: "Cover the whole card. Off: it is an ordinary button placed by you." },
        { name: "hint", type: "boolean", description: "The corner arrow; default on for the overlay." },
      ],
    },
  ],
  a11y: [
    "The trigger is a real <button> with aria-pressed (true while the back shows); Space and Enter turn the card. Give it a name that says what happens (\"Show the answer\").",
    "The hidden face is inert and aria-hidden, so Tab and screen readers only see the side that is showing.",
    "The default overlay covers the card, so faces should be static text. Faces with links or buttons: trigger={false} and a FlipCardTrigger placed beside them.",
    "The card has a fixed size (h-48 w-72 unless you pass another) and its faces do not scroll: size it (`className=\"h-64 w-96\"`) for the longer face, and keep answers short.",
    "Reduced motion: the card swaps sides without turning or lifting (durations collapse to zero).",
    "The corner arrow and the focus ring are drawn and aria-hidden; the focus ring is the same blue felt as every other control.",
  ],
  usage: `import { FlipCard, FlipCardBack, FlipCardFront } from "@/components/ui/flip-card"

export function Example() {
  return (
    <FlipCard label="Show the answer">
      <FlipCardFront>le chat</FlipCardFront>
      <FlipCardBack>the cat</FlipCardBack>
    </FlipCard>
  )
}`,
  related: ["paper", "card", "corkboard", "reveal"],
} satisfies ComponentDoc
