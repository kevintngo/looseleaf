import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Four icons",
  description: "shadcn's `empty-icon`: four bare empty states in a two-column grid, each an icon tile, a title and one line. No action, so the page just says what it is missing.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon name="inbox" />
          </EmptyMedia>
          <EmptyTitle>No messages</EmptyTitle>
          <EmptyDescription>Your inbox is empty. New messages will appear here.</EmptyDescription>
        </EmptyHeader>
      </Empty>

      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon name="star" />
          </EmptyMedia>
          <EmptyTitle>No favorites</EmptyTitle>
          <EmptyDescription>Items you mark as favorites will appear here.</EmptyDescription>
        </EmptyHeader>
      </Empty>

      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon name="heart" />
          </EmptyMedia>
          <EmptyTitle>No likes yet</EmptyTitle>
          <EmptyDescription>Content you like will be saved here for easy access.</EmptyDescription>
        </EmptyHeader>
      </Empty>

      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon name="bookmark" />
          </EmptyMedia>
          <EmptyTitle>No bookmarks</EmptyTitle>
          <EmptyDescription>Save interesting content by bookmarking it.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
