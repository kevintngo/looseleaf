import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "dialog",
  title: "Dialog",
  category: "Overlays",
  description:
    "A modal window that is a sheet of paper dropped on the desk: it lands with a small tilt that settles, the page behind goes dim under a lamp, and the close button is a doodled x. Tape it, pin it, tear its edge; on a phone it becomes a sheet at the bottom of the screen.",
  status: "stable",
  upstream: "dialog",
  parts: [
    { name: "Dialog", description: "The root (Radix Dialog): `open`, `defaultOpen`, `onOpenChange`, `modal`." },
    { name: "DialogTrigger", description: "The button that opens it. Use `asChild` to make your own Button the trigger." },
    { name: "DialogPortal", description: "Where the overlay and content are mounted (the body). Used by `DialogContent`." },
    {
      name: "DialogOverlay",
      description: "The dim: a lamp-lit umber gradient, lighter in the middle. It is also the scroll container of the dialog, so a tall dialog scrolls under the lamp and the sheet's shadow and tape are never clipped.",
    },
    {
      name: "DialogContent",
      description: "The sheet itself: a Paper that is also the Radix dialog (role=dialog, focus trap, scroll lock, Escape, focus return). It takes every Radix Content prop and these Paper props.",
      props: [
        { name: "showCloseButton", type: "boolean", default: "true", description: "The doodled x in the top corner." },
        { name: "stock", type: "StockName", default: '"paper"', description: "What the sheet is made of: paper, card, slip, index-card, graph, kraft, sticky-* ..." },
        { name: "edge", type: "EdgeSpec", default: '"cut"', description: "Cut (pure CSS, no svg), torn, deckle, crimp, zig, perf, scallop, or one per side." },
        { name: "tilt", type: "boolean | number", default: "true", description: "The sheet turns by a small seeded angle; the text never does. Phones lay it flat." },
        { name: "tape", type: '"corner" | "top" | "both" | false', default: "false", description: "Tape strips across the top corners or edge." },
        { name: "tapeKind", type: "TapeKind", default: '"masking"', description: "masking, washi-dots, washi-stripes, washi-zigzag, washi-gingham, kraft, clear." },
        { name: "fastener", type: '"clip" | "pin" | "staple" | "binder-clip" | false', default: "false", description: "Hold the sheet with a drawn prop." },
        { name: "rules", type: "RuleName", default: '"none"', description: "Printed rules (ruled, graph, dots ...). Off by default: arbitrary content does not sit on ruled lines." },
        { name: "shadow", type: "SheetShadowKind | 'none'", description: "Which umber shadow the sheet casts. Default: its stock's." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed cuts, tilts and draws the same way." },
      ],
    },
    { name: "DialogHeader", description: "Title and description; centred on phones, left on larger screens." },
    { name: "DialogTitle", description: "The name of the dialog (script font, 27 px). Required by screen readers." },
    { name: "DialogDescription", description: "What it is for. Wired to `aria-describedby` by Radix." },
    { name: "DialogBody", description: "Looseleaf addition: the scrolling middle for long content (`max-h` 60dvh, `overflow-y-auto`). The sheet itself never scrolls. It is a tab stop with a drawn focus ring (`tabIndex={0}`, override it if the body holds focusable controls), because a scroll area with nothing focusable in it cannot be scrolled by keyboard." },
    {
      name: "DialogFooter",
      description: "Buttons, stacked on phones and right-aligned from `sm`.",
      props: [{ name: "showCloseButton", type: "boolean", default: "false", description: "Adds an outline Close button after the children." }],
    },
    { name: "DialogClose", description: "Any element that closes the dialog. Use `asChild` on a Button." },
  ],
  a11y: [
    "Radix Dialog: role=dialog with `aria-labelledby` (the title) and `aria-describedby` (the description); give every dialog both. Focus moves into the sheet, Tab and Shift+Tab cycle inside it, Escape closes it, and focus returns to the trigger.",
    "The page behind is inert while the dialog is open (pointer events off, aria-hidden on siblings) and scroll is locked.",
    "The close button is a real button named \"Close\"; the x is decorative ink. In Windows high contrast the ink hides and a plain × takes its place.",
    "The drop-in, the fade and the hover blot follow `--ll-motion`: with reduced motion the dialog simply appears. In `calm` density the sheet is flat, untilted and untaped.",
    "Portalled content repeats the InkProvider's `data-density`, `data-motion` and `data-theme`, so density and reduced motion work inside the dialog too.",
    "`modal={false}` works as in Radix: no dim (the sheet sits in a frame that lets clicks through), the page stays interactive and scroll is not locked. Clicking a Sonner toast never counts as \"outside\", so a toast action pressed over a dialog does not dismiss it. On a phone the bottom sheet pads its foot by `env(safe-area-inset-bottom)`, and the dim reserves its scrollbar gutter so the drop-in cannot make a classic scrollbar shove the sheet sideways.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent tape="both" className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        {/* form fields */}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}`,
  related: ["alert-dialog", "sheet", "drawer", "popover", "paper", "tape"],
} satisfies ComponentDoc
