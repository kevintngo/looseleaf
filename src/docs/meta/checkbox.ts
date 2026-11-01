import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "checkbox",
  title: "Checkbox",
  category: "Forms",
  description:
    "A hand-drawn box you tick. Checking fills it with solid marker and writes a heavy felt tick over it, stroke by stroke; a dash means partly checked. Radix behaviour, keyboard and form support are untouched.",
  status: "stable",
  upstream: "checkbox",
  parts: [
    {
      name: "Checkbox",
      description:
        "Radix Checkbox.Root (a <button role=\"checkbox\">, plus Radix's hidden native input inside a form) with the drawing behind it. Size it with size-*: 16, 20 and 28 px are drawn and tested. The tick is written with ll-draw when the state turns checked or indeterminate (instantly with reduced motion).",
      props: [
        { name: "checked", type: 'boolean | "indeterminate"', description: "Controlled state. \"indeterminate\" draws the dash and reports aria-checked=\"mixed\"." },
        { name: "defaultChecked", type: "boolean", description: "Initial state when uncontrolled." },
        { name: "onCheckedChange", type: '(checked: boolean | "indeterminate") => void', description: "Called on click and Space." },
        { name: "disabled", type: "boolean", default: "false", description: "Dashed pencil box on a pale wash, graphite tick when on. Not focusable, no hover." },
        { name: "aria-invalid", type: 'boolean | "true" | "false"', description: "true draws the box in red pencil." },
        { name: "name / value / required / form", type: "string | boolean", description: "Forwarded to Radix's hidden input, so the value is in FormData (\"on\" unless you give value) and forms validate and reset." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same box and tick. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    "role=\"checkbox\" with aria-checked true, false or mixed; Space toggles, Tab focuses, Enter is left to the form (Radix).",
    "Label it with <Label htmlFor>, wrap it, or use aria-label. A Label next to it is a peer: peer-disabled dims it, and hovering the label (a Field row with group/field, or a label right after the box) lights the box's hover overlay.",
    "The hit area is 8 px larger than the box on every side (an ::after, so layout never moves): 28 px for the 16 px box.",
    "Keyboard focus draws a blue felt ring; the drawing is aria-hidden, pointer-events: none and never focusable. Windows high contrast replaces it by a real border.",
    "The tick is drawn on with a stroke reveal (0.3 s). Reduced motion (the OS setting or data-motion=\"reduced\") shows the finished mark at once.",
    "Right-to-left layouts need nothing: the box is symmetric and every offset is logical.",
  ],
  usage: `import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept the terms</Label>
    </div>
  )
}`,
  related: ["label", "radio-group", "switch", "toggle", "field"],
} satisfies ComponentDoc
