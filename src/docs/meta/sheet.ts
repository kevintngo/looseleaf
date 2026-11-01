import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "sheet",
  title: "Sheet",
  category: "Overlays",
  description:
    "A notebook page that slides in from the edge of the screen. It is bound along the edge that faces the middle: spiral wire through punched holes, three binder holes, a perforated tear line, or torn out of a pad. Good for settings, filters, carts and mobile navigation.",
  status: "stable",
  upstream: "sheet",
  parts: [
    { name: "Sheet", description: "The root (Radix Dialog): `open`, `defaultOpen`, `onOpenChange`, `modal`." },
    { name: "SheetTrigger", description: "Opens it. Use `asChild` on a Button." },
    { name: "SheetClose", description: "Any element that closes it." },
    {
      name: "SheetContent",
      description: "The page: a Paper that is also the Radix dialog. Flush to its edge, never tilted, with its shadow cast toward the page underneath. It does not scroll itself (the shadow and coils would be clipped): put long content in a child with `overflow-y-auto`.",
      props: [
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"right"', description: "The edge it slides in from." },
        { name: "binding", type: '"spiral" | "holes" | "perf" | "torn" | "none"', default: '"spiral"', description: "How the inner edge is finished. `spiral`: wire coils through punched holes, crossing onto the dimmed page. `holes`: three binder holes with reinforcement rings. `perf`: a perforated tear line. `torn`: torn out of a pad. `none`: a plain cut edge." },
        { name: "showCloseButton", type: "boolean", default: "true", description: "The doodled x. It moves clear of the coils when they run along its corner." },
        { name: "stock", type: "StockName", default: '"paper"', description: "What the page is made of (paper, pad, graph, kraft, ...)." },
        { name: "rules", type: "RuleName", default: '"none"', description: "Printed rules (`ruled`, `graph`, `dots` ...). Off by default." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed draws the same coils and edge." },
      ],
    },
    { name: "SheetHeader", description: "Title and description, padded 16 px." },
    { name: "SheetFooter", description: "Buttons pushed to the bottom (`mt-auto`)." },
    { name: "SheetTitle", description: "The name of the sheet, in the script font. Required." },
    { name: "SheetDescription", description: "What it is for. Wired to `aria-describedby`." },
  ],
  a11y: [
    "Radix Dialog: role=dialog named by SheetTitle and described by SheetDescription. Focus moves in, Tab cycles inside, Escape closes, focus returns to the trigger; the page behind is inert and scroll is locked.",
    "A click on a Sonner toast does not count as \"outside\" and does not dismiss the sheet. In a right-to-left page the x steps in from the corner when the coils are on the physical left edge; the coils themselves are physical, like the `side` prop. A top or bottom page is capped at 85dvh: give tall content a `min-h-0 flex-1 overflow-y-auto` child.",
    "The coils, holes and torn or perforated edge are aria-hidden decoration with no pointer events; the close button is a real button named \"Close\" (a plain × in Windows high contrast).",
    "Slide and fade durations follow `--ll-motion`, so with reduced motion the page just appears. In `calm` density the coils are hidden and the page is a plain cut sheet.",
    "Side sheets are physical (`right` is the right edge) as upstream; pass `side=\"left\"` for right-to-left layouts.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open settings</Button>
      </SheetTrigger>
      <SheetContent side="right" binding="spiral">
        <SheetHeader>
          <SheetTitle>Notebook settings</SheetTitle>
          <SheetDescription>Change how this notebook looks and who can read it.</SheetDescription>
        </SheetHeader>
        {/* fields */}
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}`,
  related: ["dialog", "drawer", "popover", "paper"],
} satisfies ComponentDoc
