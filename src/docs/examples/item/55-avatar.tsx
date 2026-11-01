import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "Avatar",
  description:
    "shadcn's `item-avatar`: a single face with a round invite button, and a stack of faces (the first two hide below `sm`) beside an invite text button. Faces are initials on marker; the photographs of the original are left out.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemMedia>
          <Avatar className="size-10">
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Evil Rabbit</ItemTitle>
          <ItemDescription>Last seen 5 months ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="icon-sm" variant="outline" className="rounded-full" aria-label="Invite">
            <Icon name="plus" />
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemMedia>
          <div className="flex -space-x-1 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
            <Avatar className="hidden sm:flex">
              <AvatarFallback className="text-xs">CN</AvatarFallback>
            </Avatar>
            <Avatar className="hidden sm:flex">
              <AvatarFallback className="text-xs">LR</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="text-xs">ER</AvatarFallback>
            </Avatar>
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>No Team Members</ItemTitle>
          <ItemDescription>Invite your team to collaborate on this project.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Invite
          </Button>
        </ItemActions>
      </Item>
    </div>
  )
}
