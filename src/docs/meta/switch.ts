import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "switch",
  title: "Switch",
  category: "Forms",
  description:
    "An on/off switch drawn as one clean felt pill: the terracotta marker fills the track when it is on, and a paper coin for a thumb slides across. Radix Switch underneath.",
  status: "stable",
  upstream: "switch",
  parts: [
    {
      name: "Switch",
      description:
        "Radix Switch.Root (a <button role=\"switch\">, plus Radix's hidden checkbox inside a form) with the track drawn behind it and the thumb (data-slot=\"switch-thumb\") inside. On, hover, focus and pressed follow the element's state in CSS, so a click never redraws anything.",
      props: [
        { name: "size", type: '"default" | "sm"', default: '"default"', description: "44 x 24 px or 36 x 20 px (calm density always uses the small one). The thumb and its travel follow the size through two custom properties." },
        { name: "checked", type: "boolean", description: "Controlled state." },
        { name: "defaultChecked", type: "boolean", description: "Initial state when uncontrolled." },
        { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called on click, Space and Enter." },
        { name: "disabled", type: "boolean", default: "false", description: "Dashed pencil track on a graphite wash. Not focusable, no hover." },
        { name: "aria-invalid", type: 'boolean | "true" | "false"', description: "true draws the outline in red pencil, and keeps it red on top of the fill when the switch is on." },
        { name: "name / value / required / form", type: "string | boolean", description: "Forwarded to Radix's hidden input: on submits \"on\" (or `value`), off submits nothing." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same track and coin. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    "role=\"switch\" with aria-checked true or false. Space and Enter toggle it, Tab focuses it (Radix). Label it with <Label htmlFor>, wrap it, or use aria-label.",
    "State is not carried by color alone: the thumb sits at the start when off and at the end when on, and the track fills when it is on.",
    "The hit area is 8 px larger than the track on every side (an ::after, so layout never moves). The track is 24 px tall at the default size, 20 px small with the enlarged hit area.",
    "A Label beside it is a peer: peer-disabled dims it, and hovering the row (a `group/field`) or the label right after it lights the switch's hover overlay.",
    "Keyboard focus draws a blue felt ring; the drawing is aria-hidden, pointer-events: none and never focusable. Windows high contrast replaces the ink by a real border, a Highlight fill when on and a solid thumb.",
    "Reduced motion (the OS setting or data-motion=\"reduced\") makes the thumb jump and the marker appear at once.",
    "Right-to-left: the thumb starts at the right and travels left (rtl: twins).",
  ],
  usage: `import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function Example() {
  return (
    <div className="flex items-center gap-3">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane mode</Label>
    </div>
  )
}`,
  related: ["checkbox", "toggle", "radio-group", "field", "label"],
} satisfies ComponentDoc
