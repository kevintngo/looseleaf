import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "Small",
  description: "Official `toggle-group-sm`: `size=\"sm\"` with `type=\"single\"`, so turning one on turns the others off. Arrow keys move between items and the group is one tab stop.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <ToggleGroup type="single" size="sm" aria-label="Text formatting">
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
