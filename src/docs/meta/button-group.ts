import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "button-group",
  title: "Button Group",
  category: "Actions",
  description:
    "Buttons, fields and printed cells joined into one row (or column) that share their seams: the edge two neighbours have in common is drawn once, by the one before, or by a pencil separator you put between them.",
  status: "stable",
  upstream: "button-group",
  parts: [
    {
      name: "ButtonGroup",
      description:
        "A role=group flex row. It does not draw anything itself: every child (Button, Input, a Select trigger, ButtonGroupText) is its own hand-drawn host, and the group trims the drawing where they meet: a child that is not first loses its start edge, and one that sits before a ButtonGroupSeparator loses its end edge, so a seam is one stroke, not two. A focused child is never trimmed, so its ring stays whole.",
      props: [
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Vertical stacks the children and trims their top edges instead. Right-to-left layouts trim the other side.",
        },
        { name: "aria-label", type: "string", description: 'Name the group when the buttons do not explain themselves ("Range", "Text style").' },
      ],
    },
    {
      name: "ButtonGroupText",
      description:
        'A printed cell in the row ("https://", "@", "kg"): a paper-shade body under an ink box, real text in the hand font. Not a control: it has no hover or focus.',
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render your own element, e.g. a <label htmlFor>, with the cell's drawing inside it.",
        },
        { name: "seed", type: "string | number", description: "Pins the hand of this cell." },
      ],
    },
    {
      name: "ButtonGroupSeparator",
      description:
        "A Separator (pencil, vertical by default) that stretches to the group's height and takes the place of the two edges around it. Takes every Separator prop: variant, orientation, decorative.",
      props: [{ name: "orientation", type: '"horizontal" | "vertical"', default: '"vertical"', description: "Use horizontal in a vertical group." }],
    },
    {
      name: "buttonGroupVariants",
      description: "The cva function behind ButtonGroup, for laying out another container the same way.",
      props: [{ name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Same as ButtonGroup." }],
    },
  ],
  a11y: [
    "The group is role=group: give it an aria-label when the buttons alone do not say what they belong to. It adds no keyboard behaviour of its own; Tab visits each control in order (use ToggleGroup for one tab stop with arrow keys).",
    "A separator between buttons is decorative (role=none); the buttons keep their own names and states.",
    "A focused child is lifted above its neighbours and keeps its whole blue felt ring; in Windows high contrast the drawing is replaced by each control's real border.",
    "ButtonGroupText is plain text: give an input it labels a real label (use asChild with <label htmlFor>) or an aria-label.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"

export function Example() {
  return (
    <div className="flex flex-col gap-4">
      <ButtonGroup aria-label="Range">
        <Button variant="outline">Years</Button>
        <Button variant="outline">Months</Button>
        <Button variant="outline">Days</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="secondary">Copy</Button>
        <ButtonGroupSeparator />
        <Button variant="secondary">Paste</Button>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <Input aria-label="Host" placeholder="example.com" />
        <Button>Go</Button>
      </ButtonGroup>
    </div>
  )
}`,
  related: ["button", "toggle-group", "input-group", "separator", "dropdown-menu"],
} satisfies ComponentDoc
