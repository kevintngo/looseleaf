import * as React from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "Popover and Command, by hand",
  description:
    "The composable recipe behind the Combobox: a button with `role=\"combobox\"`, a Popover that opens to its side, and a Command inside it for the search and the rows. Reach for it when you want full control of the trigger; the Combobox component wraps the same parts and adds the form value.",
  layout: "center" as const,
  height: 340,
}

type Status = { value: string; label: string }

const STATUSES: Status[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "canceled", label: "Canceled" },
]

export default function Example() {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Status | null>(null)
  return (
    <div className="flex items-center gap-4 self-start">
      <p className="text-sm text-muted-foreground">Status</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} aria-label="Status" className="w-[150px] justify-start">
            {selected ? selected.label : "+ Set status"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0" side="right" align="start" aria-label="Set status">
          <Command>
            <CommandInput placeholder="Change status..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {STATUSES.map((s) => (
                  <CommandItem
                    key={s.value}
                    value={s.value}
                    onSelect={() => {
                      setSelected(s)
                      setOpen(false)
                    }}
                  >
                    {s.label}
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
