import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "Sizes",
  description:
    "shadcn's `item-size` (its source is the same two rows as the demo): `default` gives a row 16 px of padding, `sm` trims it. Here the same content is set at both sizes, one under the other, so the difference is easy to see.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Basic Item</ItemTitle>
          <ItemDescription>A simple item with title and description.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Action
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline" size="sm">
        <ItemContent>
          <ItemTitle>Small Item</ItemTitle>
          <ItemDescription>The same row with less air around it.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Action
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline" size="sm" asChild>
        <a href="#verified-small">
          <ItemMedia>
            <Icon name="badge-check" className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Your profile has been verified.</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Icon name="chevron-right" className="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  )
}
