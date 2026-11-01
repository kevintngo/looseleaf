import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "sticker-picker",
  title: "Sticker picker",
  category: "Forms",
  description:
    "A popover of stickers to choose from: a search field, category chips and a grid you walk with the arrow keys. Reach for it in a comment box, a reaction bar or a profile editor. The highlighted sticker peels its corner.",
  status: "new",
  upstream: "popover",
  parts: [
    {
      name: "StickerPicker",
      description: "A Popover (same open, defaultOpen, onOpenChange, modal) that also holds what the grid needs: the catalogue, the recent list and what happens on choosing.",
      props: [
        { name: "onSelect", type: "(sticker: StickerPickerItem) => void", description: "Called with { name, label, category, categoryLabel, tags } when one is chosen (Enter, or a tap)." },
        { name: "value", type: "string | null", description: "The sticker chosen elsewhere: it is marked in the grid (aria-selected, and a check)." },
        { name: "stickers", type: "(string | { name; label?; category?; tags? })[]", description: "Offer only these, in this order, under your own labels, categories and search words. Names that have not been drawn are skipped. Default: everything in the art library, grouped by the batch it was drawn in." },
        { name: "recent", type: "string[]", description: "Ids to show first under \"Recent\" (in the unfiltered view). Keep them in your own state." },
        { name: "closeOnSelect", type: "boolean", default: "true", description: "Close after choosing. Turn off to add several in a row." },
      ],
    },
    { name: "StickerPickerTrigger", description: "The PopoverTrigger: pass asChild and any button. To open it from somewhere else, put a PopoverAnchor (from @/components/ui/popover) inside the StickerPicker." },
    {
      name: "StickerPickerContent",
      description: "The slip that opens: search field, category chips, the grid, and a caption naming the highlighted sticker. Its body exists only while open, so the search starts fresh every time.",
      props: [
        { name: "columns", type: "number", default: "5", description: "Stickers per row (at least 1)." },
        { name: "size", type: "number", default: "44", description: "Drawn size of a sticker in the grid, px." },
        { name: "placeholder", type: "string", default: '"Search stickers"', description: "Placeholder of the search field." },
        { name: "align / side / …", type: "PopoverContent props", description: "Everything PopoverContent takes (stock, pin, tape, arrow, sideOffset)." },
      ],
    },
    { name: "useStickerPicker", description: "The picker's context (catalog, recent, value, choose) for building your own content." },
  ],
  a11y: [
    "The search field is a combobox (aria-expanded, aria-controls, aria-autocomplete=\"list\") and keeps focus; the grid is a listbox of options that the field points at with aria-activedescendant, grouped by category (role group, named by its heading).",
    "Arrow keys move the highlight: Left and Right one sticker, Up and Down one row (a row is `columns` wide; between categories the column is kept as far as it goes). Home and End go to the first and last while the field is empty. With text in the field, Left and Right move the caret until it reaches the end it is heading for. Enter chooses. Escape closes and returns focus to the trigger.",
    "Pressing a sticker with the mouse does not move the focus out of the search field, so with closeOnSelect off the arrow keys keep working between picks.",
    "Each option is named by its sticker (\"Rocket\"); the count of matches is announced politely as you type (\"12 stickers.\", \"No stickers found.\").",
    "The category chips are toggle buttons (aria-pressed) in their own tab stop; clicking one returns focus to the field. The row scrolls sideways on a narrow popover.",
    "The highlighted sticker is shown by a highlighter swipe behind it, a small turn and the peeled corner, not by colour alone. Windows high contrast keeps the stickers (intrinsic art).",
    "The empty state has a status line and Stubby with a magnifier.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { StickerPicker, StickerPickerContent, StickerPickerTrigger } from "@/components/ui/sticker-picker"

export function Example() {
  return (
    <StickerPicker onSelect={(sticker) => attach(sticker.name)}>
      <StickerPickerTrigger asChild>
        <Button variant="outline">Add sticker</Button>
      </StickerPickerTrigger>
      <StickerPickerContent />
    </StickerPicker>
  )
}`,
  related: ["popover", "sticker", "sticker-board", "sticker-sheet", "prompt-input"],
} satisfies ComponentDoc
