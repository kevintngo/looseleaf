import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "A mail toolbar (groups in a group)",
  description:
    "The shadcn demo: a ButtonGroup of ButtonGroups. A back button, two text buttons, and a Snooze button joined to a menu trigger whose slip has groups, a destructive row and a sub-menu with a radio choice. Groups put a gap between them; each keeps its own seams.",
  layout: "stack" as const,
  height: 500,
}

export default function Example() {
  const [label, setLabel] = React.useState("personal")
  return (
    <ButtonGroup aria-label="Message actions">
      <ButtonGroup className="hidden sm:flex">
        <Button variant="outline" size="icon" aria-label="Go back">
          <Icon name="arrow-left" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Snooze</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More options">
              <Icon name="ellipsis" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52" seed="mail-more">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon name="mail-check" />
                Mark as read
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="archive" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon name="clock" />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="calendar-plus" />
                Add to calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="list-filter" />
                Add to list
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Icon name="tag" />
                  Label as...
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={label} onValueChange={setLabel}>
                    <DropdownMenuRadioItem value="personal">Personal</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="work">Work</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="other">Other</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <Icon name="trash" />
                Trash
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  )
}
