import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "native-select",
  title: "Native Select",
  category: "Forms",
  description:
    "The browser's own <select> in a hand-drawn frame with a pencil chevron. You keep the platform's popup, mobile picker, typeahead and autofill, and a list of hundreds of options costs nothing. Reach for Select when you want the paper slip.",
  status: "stable",
  upstream: "native-select",
  parts: [
    {
      name: "NativeSelect",
      description:
        "A `<span data-slot=\"native-select-wrapper\">` (the drawn frame, the ink host) around the real `<select data-slot=\"native-select\">` and a chevron. `ref` and every prop go to the select; `className` and `style` go to the frame, except padding and control-only variants (`focus:`, `disabled:` ...).",
      props: [
        { name: "size", type: '"default" | "sm"', default: '"default"', description: "36 px or 32 px tall (28 px in calm density). Not the HTML `size` attribute; use `multiple` for a list box." },
        { name: "aria-invalid", type: 'boolean | "true" | "false"', description: "true draws the red pencil box, a wavy underline and a bang before the chevron." },
        { name: "disabled", type: "boolean", description: "Dashed pencil on a pale wash." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same box. Default: derived from useId()." },
      ],
    },
    { name: "NativeSelectOption", description: "A styled `<option>` (paper background, ink text where the browser allows)." },
    { name: "NativeSelectOptGroup", description: "A styled `<optgroup label>`." },
  ],
  a11y: [
    "It is a native select: role=combobox / listbox, the platform's keyboard (arrows, typeahead, Enter, Escape), its own mobile picker, autofill and form value. Nothing is re-implemented.",
    "Label it with a Label (`htmlFor` + `id`) or `aria-label`. A first option with an empty value reads as a placeholder (graphite text) when it is selected.",
    "The frame follows the select's own state: keyboard focus draws the blue ring, `aria-invalid` the red box, `disabled` the dashed one. The popup itself cannot be styled by any library; only its colors and font are asked for.",
    "The chevron is decorative (aria-hidden) and does not take the pointer, so the whole box opens the list. Windows high contrast replaces the ink by a real border.",
    "Right-to-left: the chevron cell, the divider tick and the bang are on the start side.",
  ],
  usage: `import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export function Example() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="country">Country</Label>
      <NativeSelect id="country" defaultValue="is" className="w-[220px]">
        <NativeSelectOption value="is">Iceland</NativeSelectOption>
        <NativeSelectOption value="pt">Portugal</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}`,
  related: ["select", "input", "field", "input-group"],
} satisfies ComponentDoc
