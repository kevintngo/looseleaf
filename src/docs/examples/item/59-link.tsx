import { Icon } from "@/components/ui/icon"
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "Links",
  description: "shadcn's `item-link`: `asChild` turns the row into an `<a>`. The row gets the highlighter swipe on hover and a focus outline; an external link carries `target=\"_blank\"` and `rel`.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item asChild>
        <a href="#docs">
          <ItemContent>
            <ItemTitle>Visit our documentation</ItemTitle>
            <ItemDescription>Learn how to get started with our components.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Icon name="chevron-right" className="size-4" />
          </ItemActions>
        </a>
      </Item>
      <Item variant="outline" asChild>
        <a href="https://kevintngo.github.io/looseleaf" target="_blank" rel="noopener noreferrer">
          <ItemContent>
            <ItemTitle>External resource</ItemTitle>
            <ItemDescription>Opens in a new tab with security attributes.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Icon name="external-link" className="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  )
}
