import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "Group with separators",
  description: "shadcn's `item-group`: ItemGroup makes the rows a list and ItemSeparator draws the pencil line between them (the last row has none). Nothing here is an svg per row.",
  layout: "center" as const,
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
    <div className="flex w-full max-w-md flex-col gap-6">
      <ItemGroup>
        {people.map((person, index) => (
          <React.Fragment key={person.username}>
            <Item>
              <ItemMedia>
                <Avatar>
                  <AvatarFallback>{person.username.charAt(0)}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent className="gap-1">
                <ItemTitle>{person.username}</ItemTitle>
                <ItemDescription>{person.email}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label={`Add ${person.username}`}>
                  <Icon name="plus" />
                </Button>
              </ItemActions>
            </Item>
            {index !== people.length - 1 && <ItemSeparator />}
          </React.Fragment>
        ))}
      </ItemGroup>
    </div>
  )
}
