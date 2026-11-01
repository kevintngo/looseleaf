import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Plain content",
  description:
    "shadcn's `hover-card-demo`, written the way the original is: HoverCardContent with a width and ordinary children (an avatar, a name, a sentence and a date), none of the polaroid parts. The window is still a small photo-stock sheet, and it still only opens for a pointer.",
  layout: "center" as const,
  height: 300,
}

export default function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between gap-4">
          <Avatar>
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">The React Framework – created and maintained by @vercel.</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="calendar" className="size-4" />
              Joined December 2021
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
