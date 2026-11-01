import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "polaroid",
  title: "Polaroid",
  category: "Paper",
  description:
    "An instant photograph: a white frame with the thick foot, a recessed square window and a caption in script. Put a real image in the window, or let it draw a little scene in marker and felt tip. Tape it, pin it, clip it, pile it up.",
  status: "new",
  parts: [
    {
      name: "Polaroid",
      description: "A `figure` and a Paper (`photo` stock, no printed rules): 16 rem wide, padded 14 px on the sides and top with a taller foot. Photographs are turned more than paper, up to 1.5 degrees. It takes every Paper prop except `stock`, `rules` and `as`.",
      props: [{ name: "as", type: '"figure" | "div" | "article"', default: '"figure"', description: "The element; with `figure` the caption names the picture." }],
    },
    {
      name: "PolaroidImage",
      description: "The photo window: square, recessed with an inner shadow, clipping its content. An `img` inside fills it (`object-cover`).",
      props: [
        { name: "scene", type: '"hills" | "sea" | "house" | "night"', description: "Draw a scene in the window in marker and felt tip (14 KB or so each in the lo tier; use it for placeholders and empty states, not for a hundred thumbnails)." },
        { name: "date", type: "string", description: "A retro camera's date stamp in the corner (orange, glowing)." },
        { name: "develop", type: "boolean", default: "false", description: "The picture is milky when it appears and clears over half a second. Once per mount; instant with reduced motion." },
        { name: "label", type: "string", description: "Names a drawn scene (`role=\"img\"`). Without it the scene is decoration." },
        { name: "seed", type: "string | number", description: "Pins the hand of the drawing." },
      ],
    },
    { name: "PolaroidCaption", description: "A `figcaption` in the foot: script font at 26 px, centred, balanced, at least 3 rem high." },
  ],
  a11y: [
    "Give a real photograph its `alt` text as usual; the figure and figcaption name it for assistive technology. A drawn scene is decoration unless you pass `label`.",
    "The frame, window shadow, date stamp, veil, tape and fasteners are aria-hidden and pointer-events-none. The `date` stamp is decoration: if the date matters, say it in the caption or the alt text. Caption ink is 14:1 on the frame.",
    "The developing veil does not run with reduced motion or in calm density's flattened tilt; the picture is simply there.",
  ],
  usage: `import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"

<Polaroid tape="top">
  <PolaroidImage date="'25 8 09">
    <img src="/august.jpg" alt="A hill in August, with a tree" />
  </PolaroidImage>
  <PolaroidCaption>august, finally</PolaroidCaption>
</Polaroid>

<Polaroid fastener="pin"><PolaroidImage scene="sea" /><PolaroidCaption>the ferry home</PolaroidCaption></Polaroid>`,
  related: ["paper", "tape", "card", "sticker"],
} satisfies ComponentDoc
