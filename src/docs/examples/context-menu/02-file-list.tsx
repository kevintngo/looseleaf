import * as React from "react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Icon } from "@/components/ui/icon"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "On a list row",
  description: "asChild makes each row its own region, so the menu knows which row you clicked. The chosen row is remembered below the list; rows are focusable, so the menu key works from the keyboard.",
  layout: "center" as const,
  height: 420,
  stage: "desk" as const,
}

const FILES = [
  ["Field notes.md", "file-text"],
  ["Garden log.md", "file-text"],
  ["Recipes", "folder"],
  ["Sketches", "folder"],
] as const

export default function Example() {
  const [picked, setPicked] = React.useState("Right-click a row.")

  return (
    <Paper stock="paper" seed="files" className="w-full max-w-sm p-4">
      <h3 className="font-script text-2xl leading-none font-semibold">Notebooks</h3>
      <ul className="mt-3 grid gap-0.5">
        {FILES.map(([name, icon]) => (
          <li key={name}>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div tabIndex={0} className="flex items-center gap-2.5 px-2 py-1.5 outline-hidden hover:ll-swipe focus-visible:ll-swipe">
                  <Icon name={icon} /> {name}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-52">
                <ContextMenuItem onSelect={() => setPicked(`Opened ${name}`)}>
                  <Icon name="folder-open" /> Open
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => setPicked(`Renamed ${name}`)}>
                  <Icon name="pencil" /> Rename <ContextMenuShortcut>F2</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => setPicked(`Copied ${name}`)}>
                  <Icon name="copy" /> Duplicate <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive" onSelect={() => setPicked(`Trashed ${name}`)}>
                  <Icon name="trash" /> Move to trash
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-dashed border-pencil-mark/60 pt-2 text-sm text-muted-foreground" aria-live="polite">
        {picked}
      </p>
    </Paper>
  )
}
