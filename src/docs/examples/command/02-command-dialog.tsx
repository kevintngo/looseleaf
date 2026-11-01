import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Icon } from "@/components/ui/icon"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

export const meta = {
  title: "In a dialog, on a napkin",
  description: "Press Ctrl + K (or Cmd + K) anywhere, or the button. The palette is set on a napkin with a pinked edge, over the dim; Escape puts it away and focus goes back to the button.",
  layout: "center" as const,
}

export default function Example() {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])
  const run = () => setOpen(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Icon name="search" />
        Search the notebook
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search the notebook" description="Jump to a page or run a command">
        <CommandInput placeholder="Jump to a page or run a command..." />
        <CommandList>
          <CommandEmpty>Nothing on that page.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={run}>
              <Icon name="file-text" />
              <span>Field notes</span>
            </CommandItem>
            <CommandItem onSelect={run}>
              <Icon name="book-open" />
              <span>Recipes</span>
            </CommandItem>
            <CommandItem onSelect={run}>
              <Icon name="folder" />
              <span>Garden log</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={run}>
              <Icon name="plus" />
              <span>New page</span>
              <CommandShortcut>Ctrl N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={run}>
              <Icon name="copy" />
              <span>Duplicate page</span>
              <CommandShortcut>Ctrl D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={run} disabled>
              <Icon name="trash" />
              <span>Empty the bin</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
