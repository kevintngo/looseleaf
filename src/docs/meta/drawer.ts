import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "drawer",
  title: "Drawer",
  category: "Overlays",
  description:
    "A slip of paper you pull up from the bottom of the screen (or in from any edge), built on vaul. From the bottom it is torn off a pad along its top edge with a strip of tape as the grab tab; drag it, flick it away, or give it snap points.",
  status: "stable",
  upstream: "drawer",
  parts: [
    { name: "Drawer", description: "The root (vaul): `open`, `onOpenChange`, `direction`, `snapPoints`, `activeSnapPoint`, `setActiveSnapPoint`, `dismissible`, `shouldScaleBackground`, `autoFocus`, `modal`." },
    { name: "DrawerTrigger", description: "Opens it. Use `asChild` on a Button." },
    { name: "DrawerPortal", description: "Mounts the overlay and content in the body." },
    { name: "DrawerOverlay", description: "The lamp-lit dim behind the slip. Its opacity follows the drag." },
    {
      name: "DrawerContent",
      description: "The slip: a Paper that is also the vaul drawer. The drag transform vaul writes lands on the sheet, its shadow and the tape together.",
      props: [
        { name: "tapeKind", type: "TapeKind", default: '"kraft"', description: "The grab tab's tape (bottom drawers only): kraft, masking, clear or a washi pattern." },
        { name: "tapeColor", type: "Accent", description: "The print color of a washi tape." },
        { name: "stock", type: "StockName", default: '"slip"', description: "What the slip is made of." },
        { name: "edge", type: "EdgeSpec", default: '{ top: "torn" } from the bottom, "cut" otherwise', description: "How it is cut." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
    { name: "DrawerHeader", description: "Title and description; centered for top and bottom drawers." },
    { name: "DrawerFooter", description: "Buttons pushed to the bottom." },
    { name: "DrawerTitle", description: "The name of the drawer, in the script font. Required." },
    { name: "DrawerDescription", description: "What it is for; wired to `aria-describedby`." },
    { name: "DrawerClose", description: "Any element that closes it." },
  ],
  a11y: [
    "vaul builds on Radix Dialog: role=dialog named by DrawerTitle and described by DrawerDescription, Escape closes, the page behind is inert, and focus returns to the trigger.",
    "Focus moves onto the sheet itself when it opens, not onto the first control (vaul's own default leaves it on the trigger behind the dim, and a field would pop a phone keyboard up over the drawer): a screen reader announces the dialog and Tab starts inside it. Pass `autoFocus` on `Drawer` to jump to the first control instead.",
    "The drawer sits on the same level of the z-scale as dialogs and sheets (`--ll-z-overlay`), so one opened from a dialog stacks above it by open order. A click on a Sonner toast does not count as \"outside\" and does not dismiss it. On a phone with a home indicator the sheet pads its bottom by `env(safe-area-inset-bottom)`.",
    "Dragging is a pointer shortcut only: every drawer also closes with Escape, the Cancel/Close buttons you provide, or a tap on the dim.",
    "The tape is a decorative aria-hidden strip, not a control. With reduced motion the slip simply appears; in `calm` density it is a plain cut slip.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

export function Example() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          {/* content */}
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}`,
  related: ["sheet", "dialog", "popover", "tape"],
} satisfies ComponentDoc
