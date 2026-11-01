import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "tooltip",
  title: "Tooltip",
  category: "Overlays",
  description:
    "A sticky note stuck next to a control, with a felt-tip arrow pointing at it. It names an icon button or adds a hint, opens on hover and keyboard focus with a shared delay, and never hides anything a person needs to be able to read.",
  status: "stable",
  upstream: "tooltip",
  parts: [
    {
      name: "TooltipProvider",
      description: "Wrap the app or a region once. Its delays are shared by every tooltip inside, and after one has opened the next opens at once (`skipDelayDuration`). Renders no element.",
      props: [
        { name: "delayDuration", type: "number", default: "0", description: "Milliseconds of hover before a tooltip opens (upstream's default is 0; 300-700 is calmer for dense toolbars)." },
        { name: "skipDelayDuration", type: "number", default: "300", description: "How long after one closes the next opens with no delay." },
        { name: "disableHoverableContent", type: "boolean", default: "false", description: "Close as soon as the pointer leaves the trigger, without letting it travel onto the note." },
      ],
    },
    { name: "Tooltip", description: "The root (Radix Tooltip): `open`, `defaultOpen`, `onOpenChange`, and a per-tooltip `delayDuration`. It needs a `TooltipProvider` above it (once, at the app root, as in upstream's current source): without one Radix throws \"`Tooltip` must be used within `TooltipProvider`\"." },
    { name: "TooltipTrigger", description: "The control the note is about. Use `asChild` on a Button or a link." },
    {
      name: "TooltipContent",
      description: "The sticky note: a Paper that is also the tooltip content (a CSS sheet, so it costs no SVG). Radix places it (`side`, `align`, `sideOffset`) and turns the arrow to face the trigger.",
      props: [
        { name: "arrow", type: "boolean", default: "true", description: "The hand-drawn arrow between the note and the trigger." },
        { name: "stock", type: "StockName", default: '"sticky-yellow"', description: "What the note is made of: sticky-yellow, sticky-pink, sticky-blue, sticky-green, slip, index-card ..." },
        { name: "tilt", type: "boolean | number", default: "true", description: "Seeded tilt of the note (sticky stock turns up to 1.6 degrees); the text stays upright." },
        { name: "sideOffset", type: "number", default: "1", description: "Gap between the trigger and the note, on top of the arrow's height." },
        { name: "collisionPadding", type: "number | Partial<Record<Side, number>>", default: "8", description: "Room kept between the note and the viewport edge when it has to shift to fit (upstream's default is 0: a note at the edge of a toolbar touched the window)." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
  ],
  a11y: [
    "Radix Tooltip: the note has role=tooltip and the trigger gets `aria-describedby` while it is open; the text is announced as the trigger's description. It opens on hover and on keyboard focus, and Escape closes it.",
    "Tooltips never open on a touch tap (Radix ignores touch pointers) and are not focusable themselves: never put the only copy of a label, an instruction or an error in one. An icon button still needs an `aria-label`.",
    "A disabled button does not receive pointer or focus events, so it cannot show a tooltip: wrap it in a focusable element (see the example) if the reason it is disabled matters.",
    "The arrow is aria-hidden decoration. Note text is ink on sticky yellow (about 12:1). With reduced motion the note appears without the zoom; in `calm` density it is a flat, untilted note.",
    "Portalled content repeats the InkProvider's `data-density`, `data-motion` and `data-theme`.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Example() {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Add to library">
            <Icon name="plus" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add to library</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}`,
  related: ["popover", "hover-card", "button"],
} satisfies ComponentDoc
