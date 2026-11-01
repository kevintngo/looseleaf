import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "select",
  title: "Select",
  category: "Forms",
  description:
    "A drop-down field. The trigger is a pencil box with a tick before its chevron; the list is a slip of paper set down over or under it, where the row you are on gets the highlighter and the chosen row is bold with a blue tick. Radix Select underneath: typeahead, keyboard, form value, item-aligned or popper placement.",
  status: "stable",
  upstream: "select",
  parts: [
    { name: "Select", description: "The root (Radix Select): `value`, `defaultValue`, `onValueChange`, `open`, `onOpenChange`, `name`, `required`, `disabled`, `dir`." },
    { name: "SelectTrigger", description: "The field you press: a `<button role=\"combobox\">` with the Input's pencil box drawn behind it.", props: [
      { name: "size", type: '"default" | "sm"', default: '"default"', description: "36 px or 32 px tall (28 px in calm density)." },
      { name: "aria-invalid", type: 'boolean | "true" | "false"', description: "true draws the red pencil box with a wavy underline and a bang before the chevron." },
      { name: "disabled", type: "boolean", description: "Dashed pencil on a pale wash. Not focusable, no hover." },
      { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same box. Default: derived from useId()." },
    ] },
    { name: "SelectValue", description: "Shows the chosen item's text, or the `placeholder` (graphite) until there is a choice. The chosen value is blue felt, like typed text." },
    {
      name: "SelectContent",
      description: "The list: a Paper slip that is also the Radix listbox. A CSS sheet, no SVG. The viewport scrolls, not the paper, so the shadow and any tape stay whole. Every Radix Content prop passes through.",
      props: [
        { name: "position", type: '"item-aligned" | "popper"', default: '"item-aligned"', description: "`item-aligned` lays the chosen row over the value in the field (Radix's default); `popper` opens under (or over) it and matches its width." },
        { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment against the trigger in popper mode." },
        { name: "stock", type: "StockName", default: '"slip"', description: "What the list is cut from: slip, paper, kraft, sticky-* ..." },
        { name: "edge", type: "EdgeSpec", default: '"cut"', description: "Cut (pure CSS), torn, deckle ... A drawn edge is measured when the list opens." },
        { name: "tilt", type: "boolean | number", default: "true", description: "A small seeded tilt of the sheet; text stays upright." },
        { name: "tape", type: '"corner" | "top" | "both" | false', default: "false", description: "Strips of masking tape holding the slip." },
      ],
    },
    { name: "SelectGroup", description: "Groups items under a SelectLabel (role=group)." },
    { name: "SelectLabel", description: "A typewriter-set kicker above a group." },
    { name: "SelectItem", description: "One choice: `value`, `disabled`, `textValue`. Highlighted = highlighter swipe; chosen = bold with a blue tick that is written on as the list opens." },
    { name: "SelectSeparator", description: "A hand-drawn pencil rule between groups." },
    { name: "SelectScrollUpButton", description: "Chevron shown at the top edge of a scrolling list; hovering it scrolls." },
    { name: "SelectScrollDownButton", description: "Chevron shown at the bottom edge of a scrolling list." },
  ],
  a11y: [
    "The trigger is a role=combobox button with aria-expanded and aria-controls; the list is a role=listbox with role=option items (aria-selected on the chosen one). Radix handles everything else.",
    "Enter, Space, ArrowDown and ArrowUp open it. Arrow keys, Home and End move the highlight, letters jump by typeahead, Enter or Space chooses, Escape closes and puts focus back on the trigger.",
    "Give the trigger a name with a Label (`htmlFor` + `id`) or `aria-label`; SelectValue's text becomes its value.",
    "With `name` (or inside a form) Radix keeps a hidden native select in sync, so the value is in FormData and `required` blocks the submit.",
    "The drawing is aria-hidden and never takes the pointer. The highlight does not depend on hue alone: the row also sits on a highlighter shape and the chosen row is bold with a tick. In Windows high contrast the trigger gets a real border.",
    "Portalled content repeats the InkProvider's `data-density`, `data-motion` and `data-theme`, and sits above dialogs so a Select inside a Dialog works. Reduced motion shows the list without the slide and zoom.",
    "Right-to-left: the chevron cell, the divider tick and the bang move to the start of the field, and the tick of the chosen row follows.",
  ],
  usage: `import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Example() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="pen">Pen</Label>
      <Select defaultValue="felt">
        <SelectTrigger id="pen" className="w-[190px]">
          <SelectValue placeholder="Pick a pen" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="felt">Felt tip</SelectItem>
          <SelectItem value="pencil">Pencil</SelectItem>
          <SelectItem value="marker">Marker</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}`,
  related: ["native-select", "input", "field", "popover", "dropdown-menu"],
} satisfies ComponentDoc
