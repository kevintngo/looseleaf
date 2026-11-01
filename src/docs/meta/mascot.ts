import type { ComponentDoc } from "../types"

export default {
  slug: "mascot",
  title: "Mascot",
  category: "Stickers & doodles",
  description:
    "Stubby, the pencil stub who does the drawing. He waves in welcomes, thinks in empty search results, sleeps when nothing is happening. An original character drawn as a die-cut sticker: a chubby pencil stub with a face and nothing else (no arms, no legs, no clothes). His mood is his face, a small lean of the body and one doodle floating beside him.",
  status: "new",
  parts: [
    {
      name: "Mascot",
      description:
        "An intrinsic ink svg, one sticker body and a pose per state: white die-cut border and a soft shadow included, so `size` is the height of the whole sticker. Redrawn per size: under 28 px a face on a silhouette, under 56 the small redraw, then the master, and from 140 px a shine and a ferrule line. Weight of the svg (idle; the busiest pose is up to 1.6 times that): about 5 KB and 25 DOM nodes at 24 px, 12 KB and 27 nodes at 96, 18 KB and 30 nodes at 160 (every size is drawn with the engine's light `lo` tier; `tier=\"hi\"` is about 2 times that). Several big Stubbys on one busy page are cheaper drawn at 120 px and enlarged with CSS (`h-auto w-52`): the line just gets bolder.",
      props: [
        { name: "pose", type: "MascotPose | string", default: '"idle"', description: "`idle`, `wave`, `think`, `write`, `sketch`, `celebrate`, `oops`, `shrug`, `sleep`, `peek`, `point`, `carry`, `halt`, `search`, `unplug`. An unknown name draws nothing." },
        { name: "size", type: "number", default: "96", description: "Pixels tall, white die-cut border included (16 and up). Under 28 a face on a silhouette, under 56 the small redraw, up to 139 the master, from 140 the hero (a shine and a ferrule line)." },
        { name: "seed", type: "string | number", description: "Another seed, another hand." },
        { name: "label", type: "string", description: "Accessible name. Decorative (`aria-hidden`) without it." },
        { name: "frame", type: "number", description: "One drawing of a pose that is a flip book: `write` 1-3 (the lean deepens, the scribble grows), `wave` 1-3 (he rocks, the swishes move), `celebrate` 1-2 (up, and down again). Stack the frames and switch their opacity with `steps()` to animate him. A pose or number without that frame draws the still pose." },
        { name: "tier", type: '"lo" | "hi"', default: '"lo"', description: "The engine's drawing quality. `hi` is a finer felt edge for a poster-sized Stubby, at about 2 times the markup; you cannot see it at 160 px." },
        { name: "shadow", type: "boolean", default: "true", description: "The soft sticker shadow (the `ll-drop-sticker` class, a CSS filter). Turn it off where he sits on something that already casts one." },
      ],
    },
  ],
  a11y: ["Decorative by default; the surrounding text (\"Nothing here yet\") is what carries meaning."],
  usage: `import { Mascot } from "@/components/ui/mascot"

export function Example() {
  return <Mascot pose="wave" size={96} />
}`,
  related: ["doodle", "sticker"],
} satisfies ComponentDoc
