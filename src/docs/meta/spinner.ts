import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "spinner",
  title: "Spinner",
  category: "Feedback",
  description:
    "A pencil that will not stop scribbling: a hand-wound spiral whose line is drawn and undrawn round and round, in the colour of the text around it. Still, and whole, when motion is reduced. Stubby can write instead, in three frames like a flip book.",
  status: "stable",
  upstream: "spinner",
  parts: [
    {
      name: "Spinner",
      description:
        "A role=status span (shadcn's is the svg itself, so its props are the span's) with an accessible name, wrapping an aria-hidden drawing. Size it with size-* like shadcn's (default size-4); the scribble is redrawn for the size, thinner and tighter when small. The line is a filled pen drawing hidden behind a mask whose stroke is dashed, and the dash slides round the line (Stubby is his own three drawings, shown one after the other); nothing is measured, so the whole thing renders on the server.",
      props: [
        {
          name: "variant",
          type: '"scribble" | "loops" | "write"',
          default: '"scribble"',
          description:
            "scribble = the spiral, for buttons and badges. loops = a line of cursive loops written on and off, four times as wide as it is tall, for a wide inline wait. write = Stubby, the pencil-stub mascot, in three frames flipped like a flip book while he writes: for a page or a panel that is loading.",
        },
        {
          name: "size",
          type: "number",
          description:
            "Pixels, if you would rather not use a size-* class: the side of a scribble, the height of the loops (their width is four times that), the height of Stubby. Default: the size-N in className, else 16 (Stubby: 64).",
        },
        {
          name: "aria-label",
          type: "string",
          default: '"Loading"',
          description: 'The accessible name. Say what is loading ("Saving your page") when the surrounding text does not.',
        },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same scribble. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    'Like shadcn\'s, it is role=status with aria-label="Loading": a polite live region that announces its name when it appears. Put a visible word next to it when you can ("Saving...").',
    "The drawing is aria-hidden. It uses the current text colour, so it is as visible as the text next to it (in a disabled button that is the disabled text colour).",
    "Reduced motion (the OS setting, or the in-app calm-ink setting) stops the slide and shows the whole scribble, standing still; Stubby holds his last frame, the finished scribble.",
    "In Windows high contrast the drawing is kept (it is art, not a border) and takes the system text colour.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function Example() {
  return (
    <div className="flex items-center gap-6">
      <Spinner />
      <Spinner className="size-8" aria-label="Fetching your notes" />
      <Button disabled>
        <Spinner />
        Saving
      </Button>
      <Spinner variant="loops" />
      <Spinner variant="write" />
    </div>
  )
}`,
  related: ["button", "skeleton", "progress", "mascot"],
} satisfies ComponentDoc
