import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "label",
  title: "Label",
  category: "Forms",
  description:
    "The words that go with a field, in the bold hand font, with an optional red pencil star for required fields. It fades with a disabled control and hands its click to it.",
  status: "stable",
  upstream: "label",
  parts: [
    {
      name: "Label",
      description:
        "Radix Label.Root (a real <label>). htmlFor or nesting associate it with a control; double-clicking its text does not select it. required draws a star after the text.",
      props: [
        { name: "required", type: "boolean", default: "false", description: "A red-pencil star after the text: three crossing strokes, drawn once per label. It is decorative (aria-hidden) and adds nothing to the accessible name: put required on the control so it is announced." },
        { name: "seed", type: "string | number", description: "Pins the hand of the star. Default: derived from useId()." },
        { name: "htmlFor", type: "string", description: "The id of the control." },
      ],
    },
  ],
  a11y: [
    "A native <label>: clicking it focuses or toggles its control; the control's accessible name is the label's text (the star is aria-hidden).",
    "Bold Kevin Sans at 15 px in ink on paper (14:1). Disabled controls dim their label: put peer on the control before the label (peer-disabled), on a drawn Input / Textarea frame (peer-has-[>input:disabled]), or wrap both in a group with data-disabled=\"true\".",
    "The star is intrinsic art: it stays visible in Windows high contrast and never takes focus.",
  ],
  usage: `import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="name" required>Your name</Label>
      <Input id="name" required />
    </div>
  )
}`,
  related: ["input", "textarea", "checkbox", "field"],
} satisfies ComponentDoc
