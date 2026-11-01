import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "popover",
  title: "Popover",
  category: "Overlays",
  description:
    "A slip of paper set down next to its trigger. It can be held with a push-pin or a strip of tape, given a hand-drawn arrow to point at what it is about, and cut from any stock. Focus moves into it, Escape puts it away.",
  status: "stable",
  upstream: "popover",
  parts: [
    { name: "Popover", description: "The root (Radix Popover): `open`, `defaultOpen`, `onOpenChange`, `modal`." },
    { name: "PopoverTrigger", description: "Toggles it. Use `asChild` on a Button." },
    { name: "PopoverAnchor", description: "Position the popover from another element than the trigger." },
    {
      name: "PopoverContent",
      description: "The slip: a Paper that is also the Radix popover content (role=dialog, so give it a name with a title or `aria-label`). A CSS sheet, no SVG, unless a torn edge or the arrow is asked for. It takes every Radix Content prop (`side`, `align`, `sideOffset`, ...) and these.",
      props: [
        { name: "sideOffset", type: "number", default: "8", description: "Gap between the trigger and the slip (upstream's default is 4: a slip needs room for its shadow and pin). The slip is also capped to the viewport width." },
        { name: "collisionPadding", type: "number | Partial<Record<Side, number>>", default: "8", description: "Room kept between the slip and the viewport edge when it has to shift to fit (upstream's default is 0: a wide slip touched the window)." },
        { name: "pin", type: "boolean | Accent", default: "false", description: "A push-pin through the top edge: `true` for tomato, or a stationery color (sky, lemon, grass ...)." },
        { name: "arrow", type: "boolean", default: "false", description: "A felt-tip arrow between the slip and the trigger. Radix turns it to whichever side the popover opened on and adds its height to `sideOffset`." },
        { name: "tape", type: '"corner" | "top" | "both" | false', default: "false", description: "Strips of masking tape at the corners or the top edge." },
        { name: "stock", type: "StockName", default: '"slip"', description: "What it is made of: slip, paper, kraft, sticky-*, index-card ..." },
        { name: "edge", type: "EdgeSpec", default: '"cut"', description: "Cut (pure CSS), torn, deckle, ..." },
        { name: "tilt", type: "boolean | number", default: "true", description: "Small seeded tilt of the sheet; text stays upright." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
        { name: "data-slot", type: "string", default: '"popover-content"', description: "For a component built on the popover to rename the slip (a combobox list is `combobox-content` in shadcn). The Command and Calendar that lie on a popover's paper look for `popover-content`, so keep it unless yours brings its own rules." },
      ],
    },
    { name: "PopoverHeader", description: "Stacks a title and a description." },
    { name: "PopoverTitle", description: "A heading in the script font (a div, as upstream)." },
    { name: "PopoverDescription", description: "Muted explanatory text." },
  ],
  a11y: [
    "Radix Popover: the trigger has aria-expanded and aria-controls; the content is a role=dialog that needs an accessible name (PopoverTitle wired with `aria-labelledby`, or `aria-label`). Focus moves into it on open, Escape and an outside click close it, and focus returns to the trigger.",
    "A popover with no trigger (opened by a menu item or a shortcut, positioned by a `PopoverAnchor`) gives the focus back to whoever had it when it opened: Radix only knows the trigger and would drop the focus on the page. It does not when you clicked somewhere else, when the app has already moved the focus on, or when your `onCloseAutoFocus` prevents the default.",
    "Tab moves out of a non-modal popover into the page as usual; set `modal` on Popover to trap focus.",
    "The pin, tape and arrow are aria-hidden decoration with no pointer events.",
    "Touch: works with a tap like any button; nothing depends on hover.",
    "Portalled content repeats the InkProvider's `data-density`, `data-motion` and `data-theme`. With reduced motion it appears without the slide and zoom.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent pin className="w-80">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <Label htmlFor="width">Width</Label>
        <Input id="width" defaultValue="100%" />
      </PopoverContent>
    </Popover>
  )
}`,
  related: ["hover-card", "tooltip", "dialog", "select"],
} satisfies ComponentDoc
