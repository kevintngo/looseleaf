import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "Basic and link",
  description:
    "shadcn's `item-demo`: an outlined row with a title, a description and a button, and a small row made a link with `asChild`, a verified badge in front and a chevron behind. The pencil outline is CSS, so a long list costs no svg.",
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
      <Item variant="outline" size="sm" asChild>
        <a href="#verified">
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
