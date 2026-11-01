import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "hover-card",
  title: "Hover Card",
  category: "Overlays",
  description:
    "A small polaroid that appears when you rest the pointer on a link or move keyboard focus to it: photo stock with a thick lower margin for handwriting, a degree or two of tilt, and tape if you like. A preview for sighted pointer users, never the only home of anything.",
  status: "stable",
  upstream: "hover-card",
  parts: [
    { name: "HoverCard", description: "The root (Radix HoverCard): `openDelay` (700 ms), `closeDelay` (300 ms), `open`, `defaultOpen`, `onOpenChange`." },
    { name: "HoverCardTrigger", description: "The link or element that shows it on hover and on keyboard focus. Use `asChild` on an `<a>`." },
    {
      name: "HoverCardContent",
      description: "The polaroid: a Paper on photo stock that is also the Radix hover card content (a CSS sheet, no SVG). It takes every Radix Content prop and these.",
      props: [
        { name: "sideOffset", type: "number", default: "8", description: "Gap between the trigger and the card (upstream's default is 4: a polaroid needs room for its shadow and tape). The card is also capped to the viewport width." },
        { name: "collisionPadding", type: "number | Partial<Record<Side, number>>", default: "8", description: "Room kept between the card and the viewport edge when it has to shift to fit (upstream's default is 0)." },
        { name: "stock", type: "StockName", default: '"photo"', description: "What it is printed on." },
        { name: "tape", type: '"corner" | "top" | "both" | false', default: "false", description: "Tape across the top edge or corners." },
        { name: "edge", type: "EdgeSpec", default: '"cut"', description: "Cut (pure CSS), torn, deckle, ..." },
        { name: "tilt", type: "boolean | number", default: "true", description: "Seeded tilt of the sheet (photo stock turns up to 1.5 degrees); text stays upright." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
    { name: "HoverCardMedia", description: "Looseleaf addition: the picture window, a recess with a pencil frame shaded along its top and left. Put an image, a Doodle or a Sticker in it." },
    { name: "HoverCardCaption", description: "Looseleaf addition: handwriting on the wide lower margin (script font)." },
  ],
  a11y: [
    "Radix HoverCard opens on pointer hover and on keyboard focus of the trigger, closes on blur and on Escape, and lets the pointer travel from the trigger into the card. It is not announced to screen readers as a dialog: treat it as a preview of information that is also available by following the link.",
    "Touch: hover cards never open on a tap (Radix ignores touch pointers). The trigger must work on its own as a link; use a Popover when the content needs to be reachable on a phone.",
    "The recess frame and tape are aria-hidden decoration. Give the media an accessible name if it carries meaning.",
    "Portalled content repeats the InkProvider's `data-density`, `data-motion` and `data-theme`; with reduced motion it appears without the zoom.",
  ],
  usage: `import { HoverCard, HoverCardCaption, HoverCardContent, HoverCardMedia, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Doodle } from "@/components/ui/doodle"

export function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" asChild>
          <a href="https://kevintngo.github.io/looseleaf">@looseleaf</a>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent tape="top">
        <HoverCardMedia>
          <Doodle name="flower" size={88} />
        </HoverCardMedia>
        <HoverCardCaption>@looseleaf</HoverCardCaption>
        <p className="px-1 text-sm text-muted-foreground">shadcn/ui, drawn by hand.</p>
      </HoverCardContent>
    </HoverCard>
  )
}`,
  related: ["popover", "tooltip", "card", "paper"],
} satisfies ComponentDoc
