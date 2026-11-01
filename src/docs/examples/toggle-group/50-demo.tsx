import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "Demo",
  description:
    "Official `toggle-group-demo`: three outline toggles, any number of them on (`type=\"multiple\"`). Joined outline items share one felt-tip box with a drawn seam between them. One label differs from the original, which calls the underline \"strikethrough\".",
  layout: "center" as const,
}

export default function Example() {
  return (
    <ToggleGroup variant="outline" type="multiple" aria-label="Text formatting">
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
