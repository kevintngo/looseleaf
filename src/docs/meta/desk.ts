import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "desk",
  title: "Desk",
  category: "Paper",
  description:
    "The surface everything else lies on: sage bookcloth under a lamp (linen weave, mottling, a warm vignette), with an optional layer of objects behind your content: a coffee ring, a pencil, paper clips, a ruler, push-pins. Paper is only paper against something darker than itself.",
  status: "new",
  parts: [
    {
      name: "Desk",
      description: "A `div` with the `ll-desk` surface. It brings the two desk textures with it (a deduplicated `<style>` each, also in server markup), so it works without a provider.",
      props: [
        { name: "as", type: '"div" | "main" | "section" | "article"', default: '"div"', description: "The element." },
        { name: "objects", type: "DeskObject[] | boolean", default: "false", description: "Things lying on the blotter behind the content: `coffee`, `pencil`, `clips`, `ruler`, `pins`. `true` is all five. Hidden below the `sm` breakpoint and in calm density." },
        { name: "lamp", type: "number | boolean", default: "1", description: "Strength of the vignette: 0 (or false) removes it, 1 is the theme's own (a whisper of shade), above 1 darkens the corners quickly (2.5 is a dim room)." },
        { name: "seed", type: "string | number", description: "Pins the hand of the objects." },
      ],
    },
    {
      name: "DeskObjects",
      description: "The layer of objects on its own: absolutely positioned, aria-hidden, clipped to its container. Place it in any relative container; `Desk` mounts it for you.",
      props: [
        { name: "objects", type: "DeskObject[]", required: true, description: "Which objects to lay out." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
  ],
  a11y: [
    "The desk is a plain element (`div` by default); pass `as=\"main\"` with an `aria-label` if it is your main landmark. Its texture and objects are decoration: aria-hidden, pointer-events-none.",
    "Objects lie behind the content (z-index below every sheet) and are hidden on narrow screens and in calm density, so they never crowd a small or a quiet layout.",
    "Text set straight on the desk must be ink, ink-soft or muted (all at least 4.5:1 on the sage). Windows high contrast replaces the texture with the system canvas.",
  ],
  usage: `import { Desk } from "@/components/ui/desk"
import { Page, PageHeader, PageTitle } from "@/components/ui/page"

export function Example() {
  return (
    <Desk as="main" objects={["coffee", "pencil"]} className="min-h-screen px-6 py-12">
      <Page>
        <PageHeader><PageTitle>Monday</PageTitle></PageHeader>
      </Page>
    </Desk>
  )
}`,
  related: ["page", "paper", "card", "tape"],
} satisfies ComponentDoc
