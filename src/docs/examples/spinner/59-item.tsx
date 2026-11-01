import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Item",
  description:
    "Official `spinner-item`: an outlined row for a download, with the spinner as icon media, a title and sizes, a Cancel button that appears from the `sm` breakpoint up, and a progress bar in the footer. The bar carries an `aria-label`, which the original lacks.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Downloading...</ItemTitle>
          <ItemDescription>750 MB / 1000 MB</ItemDescription>
        </ItemContent>
        <ItemActions className="hidden sm:flex">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
        </ItemActions>
        <ItemFooter>
          <Progress value={75} aria-label="Download progress" />
        </ItemFooter>
      </Item>
    </div>
  )
}
