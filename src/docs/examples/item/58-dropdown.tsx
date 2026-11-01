import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "In a dropdown",
  description:
    "shadcn's `item-dropdown`: each menu row is an Item (`className=\"p-0\"` on the menu item, `p-2` on the Item), so a menu can show a face, a name and a line of detail. Arrow keys and typeahead still belong to the menu.",
  layout: "center" as const,
  height: 340,
}

const people = [
  {
    username: "shadcn",
    email: "shadcn@looseleaf.example",
  },
  {
    username: "maxleiter",
    email: "maxleiter@looseleaf.example",
  },
  {
    username: "evilrabbit",
    email: "evilrabbit@looseleaf.example",
  },
]

export default function Example() {
  return (
    <div className="flex min-h-64 w-full max-w-md flex-col items-center gap-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-fit">
            Select <Icon name="chevron-down" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72" align="end">
          {people.map((person) => (
            <DropdownMenuItem key={person.username} className="p-0">
              <Item size="sm" className="w-full p-2">
                <ItemMedia>
                  <Avatar className="size-8">
                    <AvatarFallback>{person.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-0.5">
                  <ItemTitle>{person.username}</ItemTitle>
                  <ItemDescription>{person.email}</ItemDescription>
                </ItemContent>
              </Item>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
