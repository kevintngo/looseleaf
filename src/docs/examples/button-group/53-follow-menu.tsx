import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "A button with a menu (Follow)",
  description:
    "A split button the way social apps use it: the main action toggles (Follow / Following, with `aria-pressed`) and the chevron opens every other thing you can do with the conversation. The menu's last row is the destructive one.",
  layout: "stack" as const,
  height: 420,
}

export default function Example() {
  const [following, setFollowing] = React.useState(false)
  return (
    <ButtonGroup aria-label="Conversation">
      <Button variant="outline" aria-pressed={following} onClick={() => setFollowing(!following)}>
        {following ? "Following" : "Follow"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More conversation actions">
            <Icon name="chevron-down" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" seed="follow-menu">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Icon name="volume-off" />
              Mute conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="check" />
              Mark as read
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="flag" />
              Report conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="ban" />
              Block user
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="share" />
              Share conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="copy" />
              Copy conversation
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive">
              <Icon name="trash" />
              Delete conversation
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
