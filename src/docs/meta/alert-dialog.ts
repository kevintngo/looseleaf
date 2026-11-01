import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "alert-dialog",
  title: "Alert Dialog",
  category: "Overlays",
  description:
    "A dialog that asks one question and will not go away until it is answered: no close button, no dismissing by clicking outside, focus starts on the safe answer. For risky questions it can be taped with hazard strips and given a red patch behind its icon.",
  status: "stable",
  upstream: "alert-dialog",
  parts: [
    { name: "AlertDialog", description: "The root (Radix AlertDialog): `open`, `defaultOpen`, `onOpenChange`." },
    { name: "AlertDialogTrigger", description: "Opens it. Use `asChild` on a Button." },
    { name: "AlertDialogPortal", description: "Mounts the overlay and content in the body." },
    { name: "AlertDialogOverlay", description: "The lamp-lit dim. It scrolls the dialog if the screen is too short, so the sheet's shadow and tape are never clipped." },
    {
      name: "AlertDialogContent",
      description: "The sheet: a Paper that is also the alertdialog. It takes every Radix Content prop and these.",
      props: [
        { name: "size", type: '"default" | "sm"', default: '"default"', description: "`sm` is a narrow, centered sheet with the buttons in two equal columns." },
        { name: "tone", type: '"default" | "danger"', default: '"default"', description: "`danger` tapes red-and-white hazard strips across the top corners." },
        { name: "stock", type: "StockName", default: '"paper"', description: "What the sheet is made of." },
        { name: "edge", type: "EdgeSpec", default: '"cut"', description: "Cut (CSS, no svg), torn, deckle, ..." },
        { name: "tilt", type: "boolean | number", default: "true", description: "Small seeded tilt of the sheet; text stays upright; phones lay it flat." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
    { name: "AlertDialogHeader", description: "Title and description; with a media it becomes two columns on larger screens." },
    { name: "AlertDialogTitle", description: "The question, in the script font. Required." },
    { name: "AlertDialogDescription", description: "The consequence, in plain words. Required." },
    {
      name: "AlertDialogMedia",
      description: "The picture beside the question: put an Icon or a Sticker in it. It sits on a hand-drawn round patch.",
      props: [
        { name: "tone", type: '"default" | "danger" | "info"', default: '"default"', description: "The patch color: highlighter, red pencil wash, sky." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
    { name: "AlertDialogFooter", description: "The answers: stacked on phones, right-aligned from `sm`." },
    {
      name: "AlertDialogAction",
      description: "The confirming answer. A Button (asChild over Radix Action) that closes the dialog after its onClick.",
      props: [
        { name: "variant", type: "ButtonVariant", default: '"default"', description: "Any Button variant; use `destructive` for irreversible actions." },
        { name: "size", type: "ButtonSize", default: '"default"', description: "Any Button size." },
      ],
    },
    {
      name: "AlertDialogCancel",
      description: "The safe answer. A Button that closes the dialog; focus starts here.",
      props: [
        { name: "variant", type: "ButtonVariant", default: '"outline"', description: "Any Button variant." },
        { name: "size", type: "ButtonSize", default: '"default"', description: "Any Button size." },
      ],
    },
  ],
  a11y: [
    "Radix AlertDialog: role=alertdialog with `aria-labelledby` and `aria-describedby` (always provide a title and description). Focus is trapped, the page behind is inert, and Escape cancels.",
    "Focus starts on the Cancel button, so an accidental Enter does the safe thing. Clicking outside does not dismiss it.",
    "The hazard tape and the media patch are decoration; the meaning is in the words and in the destructive button (hatched, not only red).",
    "With reduced motion the sheet simply appears; in `calm` density it is flat and untaped.",
  ],
  usage: `import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete notebook</Button>
      </AlertDialogTrigger>
      <AlertDialogContent tone="danger">
        <AlertDialogHeader>
          <AlertDialogMedia tone="danger"><Icon name="trash" /></AlertDialogMedia>
          <AlertDialogTitle>Delete this notebook?</AlertDialogTitle>
          <AlertDialogDescription>All 48 pages will be gone for good.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}`,
  related: ["dialog", "button", "sheet", "sonner"],
} satisfies ComponentDoc
