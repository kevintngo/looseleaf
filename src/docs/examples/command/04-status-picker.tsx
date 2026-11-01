import * as React from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Icon } from "@/components/ui/icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "A status picker in a popover",
  description: "The classic use: a Command inside a Popover. The popover is the paper (the palette's own slip switches itself off), the chosen status gets a tick, and picking one closes the slip.",
  layout: "center" as const,
  height: 380,
}

const STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "canceled", label: "Canceled" },
]

export default function Example() {
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState("todo")
  const current = STATUSES.find((s) => s.value === status)
  return (
    <div className="flex items-center gap-3 self-start">
      <span className="font-hand text-sm text-ink-muted">Status</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-36 justify-between" aria-label="Change status">
            {current?.label}
            <Icon name="chevrons-up-down" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0" align="start" aria-label="Status">
          <Command>
            <CommandInput placeholder="Change status..." />
            <CommandList>
              <CommandGroup>
                {STATUSES.map((s) => (
                  <CommandItem
                    key={s.value}
                    value={s.label}
                    onSelect={() => {
                      setStatus(s.value)
                      setOpen(false)
                    }}
                  >
                    <span>{s.label}</span>
                    {s.value === status && <Icon name="check" className="ms-auto text-ink-you" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
