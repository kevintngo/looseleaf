import * as React from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "Responsive: popover or drawer",
  description:
    "One list, two shells: a popover next to the button on a wide screen, a drawer from the bottom on a phone, where a small floating box is hard to hit. The media query is read with useSyncExternalStore, so the server renders the popover and a phone swaps after hydration.",
  layout: "center" as const,
  height: 360,
}

type Status = { value: string; label: string }

const STATUSES: Status[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "canceled", label: "Canceled" },
]

function useMediaQuery(query: string) {
  return React.useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", notify)
      return () => mq.removeEventListener("change", notify)
    },
    () => window.matchMedia(query).matches,
    () => true,
  )
}

function StatusList({ onPick }: { onPick: (status: Status) => void }) {
  return (
    <Command>
      <CommandInput placeholder="Filter status..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {STATUSES.map((s) => (
            <CommandItem key={s.value} value={s.value} onSelect={() => onPick(s)}>
              {s.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export default function Example() {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Status | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const pick = (s: Status) => {
    setSelected(s)
    setOpen(false)
  }
  const trigger = (
    <Button variant="outline" role="combobox" aria-expanded={open} aria-label="Status" className="w-[150px] justify-start">
      {selected ? selected.label : "+ Set status"}
    </Button>
  )

  if (isDesktop) {
    return (
      <div className="self-start">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start" aria-label="Set status">
            <StatusList onPick={pick} />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent seed="status">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Set status</DrawerTitle>
          <DrawerDescription>Choose a status for this task.</DrawerDescription>
        </DrawerHeader>
        <div className="mt-4 border-t border-dashed border-pencil-mark/60">
          <StatusList onPick={pick} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
