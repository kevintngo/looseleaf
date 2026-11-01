import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Demo",
  description:
    "Official `spinner-demo`: a muted row that reads \"Processing payment...\" with a spinner as its media and the amount at the end. The scribble is a hand-wound spiral whose line is drawn and undrawn round and round; with reduced motion it stands still, whole.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">Processing payment...</ItemTitle>
        </ItemContent>
        <ItemContent className="flex-none justify-end">
          <span className="text-sm tabular-nums">$100.00</span>
        </ItemContent>
      </Item>
    </div>
  )
}
