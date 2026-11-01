import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "tape",
  title: "Tape",
  category: "Paper",
  description:
    "A strip of masking, washi, kraft or cellophane tape, drawn: translucent, with slit lines along its edges, crinkles and torn or pinked ends. Stick it across a corner, use it as a label, or let Paper place it for you.",
  status: "new",
  parts: [
    {
      name: "Tape",
      description: "An intrinsic svg: its size is its `length` and `height`, so it is complete in server markup and needs no measuring. Position it with className (`absolute -top-3 left-6`).",
      props: [
        { name: "kind", type: '"masking" | "washi-dots" | "washi-stripes" | "washi-zigzag" | "washi-gingham" | "kraft" | "clear"', default: '"masking"', description: "Crepe masking tape; four printed washi patterns (dots, diagonal stripes, zigzag, gingham); gummed kraft with fiber streaks; nearly invisible cellophane." },
        { name: "length", type: "number", default: "72", description: "Along the strip, px." },
        { name: "height", type: "number", default: "22", description: "Across the strip, px." },
        { name: "angle", type: "number", description: "Degrees it lies at. Default: seeded within +-4. Clamped like a sheet's tilt (calm density lays every strip flat)." },
        { name: "ends", type: '"saw" | "torn" | "straight" | "scissor"', description: "How the strip ends. Default follows the kind: masking and kraft are torn with a sawtooth, washi is pinked, clear is straight." },
        { name: "color", type: "Accent", description: "Print color of a washi tape: tomato, tangerine, lemon, grass, teal, sky, grape or bubblegum." },
        { name: "seed", type: "string | number", description: "Pins the drawing: the same seed always draws the same strip." },
      ],
    },
  ],
  a11y: [
    "Tape is decoration: aria-hidden, focusable=false, pointer-events: none. Never put the only copy of information on it; a label written on tape is real text next to (not inside) the svg.",
    "Tape keeps its colors in Windows high contrast (it is an intrinsic ink kind).",
    "Its tilt collapses to zero in calm density.",
  ],
  usage: `import { Tape } from "@/components/ui/tape"

<div className="relative w-64 p-6">
  <Tape kind="washi-dots" className="absolute -top-3 left-6" />
  …content
</div>`,
  related: ["paper", "card", "sticker"],
} satisfies ComponentDoc
