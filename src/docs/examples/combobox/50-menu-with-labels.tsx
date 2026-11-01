import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "A filter inside a menu",
  description:
    "The shadcn recipe for \"apply a label\": a row's action menu has a sub-menu, and the sub-menu holds a Command, so a long list of labels can be searched with the keyboard. The palette puts its own slip away inside a menu, because the menu is already the paper.",
  layout: "center" as const,
  height: 480,
}

const LABELS = ["feature", "bug", "enhancement", "documentation", "design", "question", "maintenance"]

export default function Example() {
  const [label, setLabel] = React.useState("feature")
  const [open, setOpen] = React.useState(false)
  return (
    <Paper stock="paper" seed="task-row" className="flex w-full max-w-lg items-center justify-between gap-3 self-start px-4 py-2">
      <p className="flex items-center gap-3 font-bold">
        <Badge>{label}</Badge>
        <span className="font-normal text-muted-foreground">Create a new project</span>
      </p>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Task actions">
            <Icon name="ellipsis" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" seed="task-actions">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>Assign to...</DropdownMenuItem>
            <DropdownMenuItem>Set due date...</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Apply label</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-0">
                <Command label="Labels">
                  <CommandInput placeholder="Filter label..." autoFocus />
                  <CommandList>
                    <CommandEmpty>No label found.</CommandEmpty>
                    <CommandGroup>
                      {LABELS.map((l) => (
                        <CommandItem
                          key={l}
                          value={l}
                          onSelect={() => {
                            setLabel(l)
                            setOpen(false)
                          }}
                        >
                          {l}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Paper>
  )
}
