import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "radio-group",
  title: "Radio Group",
  category: "Forms",
  description:
    "Pick exactly one. Each choice is a hand-circled ring; picking it colors the dot in with a terracotta blot and writes a felt spiral into it. Radix Radio Group underneath: roving focus, arrow keys, form value, orientation and direction.",
  status: "stable",
  upstream: "radio-group",
  parts: [
    {
      name: "RadioGroup",
      description: "The root (Radix RadioGroup, role=radiogroup): a grid with a gap; `orientation=\"horizontal\"` lays it out as a wrapping row.",
      props: [
        { name: "value / defaultValue / onValueChange", type: "string / string / (value: string) => void", description: "Controlled or uncontrolled selection." },
        { name: "name / required / disabled / form", type: "string | boolean", description: "Forwarded to Radix's hidden native radios, so the value is in FormData and `required` blocks the submit. A form reset puts the group back to its `defaultValue`. `disabled` on the group draws every radio disabled." },
        { name: "aria-invalid", type: 'boolean | "true" | "false"', description: "On the group (where FormControl puts it) every radio is drawn in red pencil; a radio can still set its own aria-invalid." },
        { name: "orientation", type: '"horizontal" | "vertical"', description: "Arrow-key axis (and, here, the layout). Radix arrows work on both axes either way." },
        { name: "dir", type: '"ltr" | "rtl"', description: "Direction for the arrow keys." },
        { name: "loop", type: "boolean", default: "true", description: "Arrow keys wrap around." },
      ],
    },
    {
      name: "RadioGroupItem",
      description:
        "Radix RadioGroup.Item (a <button role=\"radio\">, plus a hidden input inside a form) with the ring drawn behind it. Size it with size-*: 16, 20 and 28 px are drawn and tested. The spiral is written with ll-draw when the state turns checked after a touch (instantly with reduced motion; never at load).",
      props: [
        { name: "value", type: "string", required: true, description: "The value the group takes when this radio is chosen." },
        { name: "disabled", type: "boolean", default: "false", description: "Dashed pencil ring on a graphite wash, graphite dot when chosen. Not focusable." },
        { name: "aria-invalid", type: 'boolean | "true" | "false"', description: "true draws the ring in red pencil, and keeps it red over the dot." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same ring and dot. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    "role=\"radiogroup\" with role=\"radio\" items and aria-checked. Tab enters the group at the chosen radio (or the first), arrow keys move AND choose, Space chooses the focused radio (Radix roving focus). Give the group a name with aria-label or aria-labelledby (a fieldset legend works too).",
    "Label each radio with <Label htmlFor>, wrap it, or use aria-label. A Label beside it is a peer: peer-disabled dims it, and hovering the row (a `group/field`) or the label right after the radio lights the ring's hover overlay.",
    "The hit area reaches 8 px past the ring on every side (an ::after, so layout never moves): 32 px for the 16 px ring.",
    "Keyboard focus draws a blue felt ring; the drawing is aria-hidden, pointer-events: none and never focusable. Windows high contrast replaces it by a real border and the Indicator shows a real dot.",
    "The chosen state is a filled dot, not only a color: a bold blot with a dark spiral. Reduced motion shows the finished dot at once.",
    "Right-to-left needs nothing: the ring is symmetric and every offset is logical. Pass `dir=\"rtl\"` to mirror the arrow keys.",
  ],
  usage: `import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function Example() {
  return (
    <RadioGroup defaultValue="comfortable" aria-label="Density">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
    </RadioGroup>
  )
}`,
  related: ["checkbox", "switch", "toggle-group", "field", "label"],
} satisfies ComponentDoc
