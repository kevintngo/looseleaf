import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "Disabled",
  description:
    "Official `toggle-group-disabled`: `disabled` on the group disables every item. The items are drawn as dashed pencil gray, and none of them can be focused or toggled.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <ToggleGroup type="multiple" disabled aria-label="Text formatting">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Icon name="bold" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Icon name="italic" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Icon name="underline" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
