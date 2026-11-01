import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "Outline",
  description: "Official `toggle-group-outline`: `variant=\"outline\"` with `type=\"multiple\"`. The group draws one box around all its items, so the three read as a single control.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <ToggleGroup type="multiple" variant="outline" aria-label="Text formatting">
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
