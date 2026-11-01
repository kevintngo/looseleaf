import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const meta = {
  title: "Row actions (composed)",
  description: "A real use: a list of notebooks, each row with an ellipsis button that opens its own menu. Choosing Rename or Move to trash changes the list, so you can see the handlers run.",
  layout: "center" as const,
  height: 430,
}

const START = ["Field notes", "Garden log", "Recipes", "Trip to Lisbon"]

export default function Example() {
  const [names, setNames] = React.useState(START)
  const [last, setLast] = React.useState("")

  return (
    <Card className="w-full max-w-sm" seed="rows">
      <CardHeader>
        <CardTitle>Notebooks</CardTitle>
        <CardDescription>{last || "Open a row's menu with its ellipsis."}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-1">
          {names.map((name) => (
            <li key={name} className="flex items-center justify-between gap-2 py-0.5">
              <span className="min-w-0 truncate">{name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`}>
                    <Icon name="ellipsis" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>{name}</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => setLast(`Opened ${name}`)}>
                    <Icon name="folder-open" /> Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setNames((n) => n.map((x) => (x === name ? `${x} (copy)` : x)))}>
                    <Icon name="pencil" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => setNames((n) => n.filter((x) => x !== name))}>
                    <Icon name="trash" /> Move to trash
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
