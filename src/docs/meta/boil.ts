import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "boil",
  title: "Boil",
  category: "Interactive",
  description:
    "Makes drawn things shiver the way hand-animated line drawings do. About six times a second it moves to the next of a few frames: doodles are redrawn by a new hand, and buttons, cards and fields inside wobble a little differently. It stands still when motion is reduced, off screen and in a hidden tab.",
  status: "new",
  parts: [
    {
      name: "Boil",
      description:
        "A wrapper (an inline-block span). Direct children that take a `seed` (Doodle, Sticker, Mascot, Icon, Tape, Button…) get a new seed each frame; every drawn thing anywhere inside feels the frame through the ink context (wobble, fill offset, bleed and pen width move a few percent). Frames repeat, so after one turn every drawing comes from the cache: the cost is DOM updates, not drawing.",
      props: [
        { name: "fps", type: "number", default: "6", description: "Redraws per second, 1 to 12." },
        { name: "frames", type: "number", default: "3", description: "How many different drawings it cycles through, 2 to 4." },
        { name: "strength", type: "number", default: "1", description: "How far each frame is from the resting drawing: 0 none, 2 restless." },
        { name: "active", type: "boolean", default: "true", description: "Turn it off without unmounting (frame 0, the resting drawing)." },
        { name: "reseed", type: "boolean", default: "true", description: "Give direct children a new seed each frame. Off: only the knobs move." },
        { name: "children", type: "ReactNode | ({ frame, seed }) => ReactNode", description: "A render prop gets the frame (0 to frames − 1) and `seed(base)`, for anything of your own that draws." },
      ],
    },
  ],
  a11y: [
    "Boil changes drawings, never content or layout: the shapes do not move, the lines shiver by a fraction of a pixel to a couple of pixels. Nothing is announced and nothing takes focus.",
    "Reduced motion (the OS setting, data-motion=\"reduced\", or an InkProvider with motion=\"reduced\") shows the resting drawing and runs no timer. The same happens while the tab is hidden and while the wrapper is scrolled out of view.",
    "WCAG 2.2.2: a boil that runs for more than five seconds is moving content. It stops for people who ask for reduced motion, but give everyone else a way out where it matters: bind `active` to a pause control or to a preference. Children keep their state, focus and drawn ink across frames (they are re-seeded, never remounted).",
    "Use it for a few live things (a mascot, a logo doodle, a call to action), not lists: every frame re-renders the children. The timer stops when the component unmounts.",
    "Hooks for your own drawings: useBoilFrame() and useBoilSeed(seed) return the frame and a frame-suffixed seed inside a Boil, and the plain seed outside one.",
  ],
  usage: `import { Boil } from "@/components/ui/boil"
import { Doodle } from "@/components/ui/doodle"

export function Example() {
  return (
    <Boil>
      <Doodle name="sun" size={96} />
    </Boil>
  )
}`,
  related: ["reveal", "doodle", "sticker", "mascot", "confetti"],
} satisfies ComponentDoc
