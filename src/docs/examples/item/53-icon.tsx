import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "Icon",
  description: "shadcn's `item-icon`: `ItemMedia variant=\"icon\"` sets a glyph in a square of its own at the start of the row.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Icon name="shield-alert" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Security Alert</ItemTitle>
          <ItemDescription>New login detected from unknown device.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Review
          </Button>
        </ItemActions>
      </Item>
    </div>
  )
}
