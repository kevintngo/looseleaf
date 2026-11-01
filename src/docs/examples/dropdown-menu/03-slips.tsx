import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const meta = {
  title: "Other paper",
  description: "The slip is a Paper, so it can be cut from any stock and held down with tape. A sticky note with a taped corner for quick actions; the destructive row hatches when you reach it.",
  layout: "center" as const,
  height: 340,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <Icon name="sparkles" /> Quick actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" stock="sticky-yellow" tape="corner" tilt={0.8} seed="quick" align="start">
        <DropdownMenuItem>
          <Icon name="pencil" /> Rename <DropdownMenuShortcut>F2</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon name="copy" /> Duplicate <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon name="share" /> Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Icon name="trash" /> Delete <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
