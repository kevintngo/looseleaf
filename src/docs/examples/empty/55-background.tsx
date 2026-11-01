import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Background",
  description: "shadcn's `empty-background`: a soft wash that fades from the muted tone into the paper. Any background utility goes on the root; it is a plain class, nothing is redrawn.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex h-80 w-full max-w-lg">
      <Empty className="h-full bg-linear-to-b from-muted/60 from-30% to-transparent">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon name="bell" />
          </EmptyMedia>
          <EmptyTitle>No Notifications</EmptyTitle>
          <EmptyDescription>You&apos;re all caught up. New notifications will appear here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm">
            <Icon name="rotate-cw" />
            Refresh
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
