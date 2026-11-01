import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "input-group",
  title: "Input Group",
  category: "Forms",
  description:
    "One hand-drawn field around an icon, some text, a button and the control, so a search box or a URL field is a single box instead of three. The box takes the control's focus, invalid and disabled states, and grows with a textarea. The same parts as shadcn's Input Group.",
  status: "stable",
  upstream: "input-group",
  parts: [
    {
      name: "InputGroup",
      description:
        "The group: a `<div role=\"group\">` that is the ink host. It draws the Input's pencil box once (rest), a red one (invalid) and a dashed one (disabled) as additive layers that follow the control in CSS. The control must be a direct child for the theme's own selectors; a deeper control works through `has-[...]` classes. `data-disabled` and `data-invalid` on the group work by hand.",
      props: [{ name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same box. Default: derived from useId()." }],
    },
    {
      name: "InputGroupAddon",
      description: "Something beside or above/below the control. It is a role=group; clicking it focuses the control, except when the click lands on a button, link, select or another control inside it.",
      props: [{ name: "align", type: '"inline-start" | "inline-end" | "block-start" | "block-end"', default: '"inline-start"', description: "Where it sits. The block alignments stack it above or below the control and make the group grow taller." }],
    },
    {
      name: "InputGroupButton",
      description: "A Button for an addon: ghost by default. Put it inside an InputGroupAddon (a disabled button directly in the group would make the whole group look disabled).",
      props: [{ name: "size", type: '"xs" | "sm" | "icon-xs" | "icon-sm"', default: '"xs"', description: "24 px, 32 px, or the square versions. All Button variants work." }],
    },
    { name: "InputGroupText", description: "Muted text or an icon with text, for an addon (\"https://\", \"USD\")." },
    { name: "InputGroupInput", description: "The single-line control: the bare input of Input, with `data-slot=\"input-group-control\"`. Every input prop works." },
    { name: "InputGroupTextarea", description: "The multi-line control: the bare textarea of Textarea, with `data-slot=\"input-group-control\"`. It grows with its text." },
  ],
  a11y: [
    "The group is role=\"group\"; label the CONTROL (a Label with htmlFor, or aria-label), not the group. Addon icons are decorative; put meaningful text in an InputGroupText or give the button an aria-label.",
    "Focus stays on real controls: Tab goes through the control and the buttons in the DOM order, with the group's blue ring around the box when the control is focus-visible and each button's own ring when it is.",
    "State: `aria-invalid` on the control turns the box red and draws the wavy underline; `disabled` on the control (or `data-disabled=\"true\"` on the group) draws the dashed box. Neither depends on hue alone. Pair invalid with a message and aria-describedby.",
    "Windows high contrast replaces the ink by a real border on the group. The drawing is aria-hidden and pointer-events: none.",
    "Right-to-left: addons use logical padding and ordering (inline-start is the right side), the wavy underline mirrors, and nothing else needs a twin.",
  ],
  usage: `import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export function Example() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <Icon name="search" />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search the notebook" aria-label="Search" />
      <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
    </InputGroup>
  )
}`,
  related: ["input", "textarea", "button", "field", "select", "native-select"],
} satisfies ComponentDoc
