import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "toggle-group",
  title: "Toggle Group",
  category: "Actions",
  description:
    "A row of toggles that belong together: pick one (alignment) or several (bold, italic, underline). Joined outline items share one hand-drawn box with a pencil seam between them; the highlighter body marks what is on.",
  status: "stable",
  upstream: "toggle-group",
  parts: [
    {
      name: "ToggleGroup",
      description:
        "A Radix ToggleGroup (single: a radio group; multiple: a toolbar). With variant outline and spacing 0 the group is the ink host and draws the one box around every item; otherwise the items draw themselves. It passes variant, size, spacing and tone down to its items.",
      props: [
        {
          name: "type",
          type: '"single" | "multiple"',
          required: true,
          description: "single = at most one item is on (radio semantics); multiple = any number (aria-pressed buttons).",
        },
        { name: "variant", type: '"default" | "outline"', default: '"default"', description: "Same as Toggle." },
        { name: "size", type: '"default" | "sm" | "lg"', default: '"default"', description: "Same as Toggle." },
        {
          name: "aria-invalid",
          type: "boolean",
          description: "Marks the choice as wrong (a Form's `FormControl` sets it). The shared box of an outline group turns red pencil; separate toggles each draw a red box. An item's own `aria-invalid={false}` wins; a disabled group stays graphite. Put the group in a `Field` and it keeps the width of its buttons (a vertical Field stretches every other child).",
        },
        {
          name: "spacing",
          type: "number",
          default: "0",
          description: "Gap between items in the spacing scale (4 px units). 0 joins them: outline items share one box and the seams between them.",
        },
        { name: "tone", type: '"hi" | "marker"', default: '"hi"', description: "The colour of an item's body when it is on." },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          description: "Vertical stacks the items, stretches them to one width, and moves the roving focus to the up and down arrows.",
        },
        {
          name: "value / defaultValue / onValueChange",
          type: "Radix",
          description: "Controlled and uncontrolled state: a string for single, a string[] for multiple.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Disables every item; the joined box turns into a dashed pencil box." },
        { name: "seed", type: "string | number", description: "Pins the hand of the group's box." },
      ],
    },
    {
      name: "ToggleGroupItem",
      description:
        "A Radix ToggleGroup item: a toggle that reads variant and size from its group. In a joined group it draws only its seam (at the edge it shares with the item before it), its body and its focus ring.",
      props: [
        { name: "value", type: "string", required: true, description: "The item's value in the group." },
        {
          name: "variant / size",
          type: "as Toggle",
          description:
            "Used only when the group does not set them. An item that asks for outline in a group with no variant draws a box of its own (the group draws none); only a group with variant outline and spacing 0 shares one box.",
        },
        { name: "asChild", type: "boolean", default: "false", description: "Render your own element (Radix Slot)." },
        { name: "seed", type: "string | number", description: "Pins the hand of this item." },
      ],
    },
  ],
  a11y: [
    "Roving focus by Radix: the group is one tab stop, the arrow keys (left and right, or up and down when vertical) move between items and loop, Home and End jump to the ends, Space and Enter press.",
    "single is announced as a radio group with checked items; multiple as a toolbar of pressed buttons. Give the group an aria-label and every icon-only item its own.",
    "On is never told by hue alone: a filled body sits under the item, and (separate items) a solid box replaces the whisper box.",
    "The focus ring is drawn on the item and lifted above its neighbours; Windows high contrast falls back to real borders and the browser's focus ring.",
    "In right-to-left layouts the seams move to the other edge; the drawing is mirrored by the recipe, not by CSS.",
  ],
  usage: `import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function Example() {
  return (
    <ToggleGroup type="single" variant="outline" defaultValue="list" aria-label="View">
      <ToggleGroupItem value="list" aria-label="List">
        <Icon name="list" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Grid">
        <Icon name="layout-grid" />
      </ToggleGroupItem>
      <ToggleGroupItem value="menu" aria-label="Compact">
        <Icon name="menu" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}`,
  related: ["toggle", "button-group", "tabs", "radio-group"],
} satisfies ComponentDoc
