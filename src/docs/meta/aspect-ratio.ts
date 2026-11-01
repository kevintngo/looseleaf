import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "aspect-ratio",
  title: "Aspect Ratio",
  category: "Layout",
  description:
    "A box that keeps its width-to-height ratio while its width changes. Exactly shadcn's; the hand-made part is what surrounds it: a photograph on a Polaroid, a print taped at its corners, a map pinned to the desk.",
  status: "stable",
  upstream: "aspect-ratio",
  parts: [
    {
      name: "AspectRatio",
      description:
        "A Radix AspectRatio: a relatively positioned wrapper with padding-bottom set from the ratio, and an absolutely positioned inner div (which receives className, data-slot and your children). It draws nothing: put an img with h-full w-full object-cover in it, or any content, and frame it with Paper and Tape.",
      props: [{ name: "ratio", type: "number", default: "1", description: "Width divided by height: 16 / 9, 4 / 3, 1." }],
    },
  ],
  a11y: [
    "Layout only: no role, no name, no keyboard behaviour. Give the image inside it real alt text, or an empty alt if it is decoration.",
    "The frames in the examples (a Polaroid's white border, tape, a pin) are decoration and hidden from assistive tech; the caption is real text.",
    "A ratio box has no minimum height, so it collapses to nothing in a container that has no width: give the parent one.",
  ],
  usage: `import { AspectRatio } from "@/components/ui/aspect-ratio"

export function Example() {
  return (
    <div className="w-72">
      <AspectRatio ratio={16 / 9}>
        <img src="/heron.jpg" alt="A heron on one leg" className="h-full w-full object-cover" />
      </AspectRatio>
    </div>
  )
}`,
  related: ["paper", "tape", "card", "carousel"],
} satisfies ComponentDoc
