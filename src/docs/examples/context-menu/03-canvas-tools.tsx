import * as React from "react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Icon } from "@/components/ui/icon"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Pen picker on a sticky note",
  description: "A composed use: right-click a sticky note to choose the pen it is written with. The menu is a second sticky, in another colour so it reads as its own note, taped down; the radio rows tick the choice.",
  layout: "center" as const,
  height: 400,
  stage: "desk" as const,
}

const PENS: Record<string, string> = { felt: "felt tip", pencil: "pencil", marker: "marker", highlighter: "highlighter" }

export default function Example() {
  const [pen, setPen] = React.useState("felt")
  const [lines, setLines] = React.useState(2)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Paper stock="sticky-yellow" seed="pen-note" tape="top" tabIndex={0} aria-label="Sticky note. Press the menu key for pens." className="w-64 p-5 pt-6">
          <p className="font-script text-2xl leading-tight">buy more ink!</p>
          <p className="mt-2 text-sm text-ink-soft">
            written with a {PENS[pen]} · {lines} line{lines === 1 ? "" : "s"}
          </p>
        </Paper>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56" stock="sticky-blue" tape="corner" seed="pen-menu">
        <ContextMenuLabel>Pen</ContextMenuLabel>
        <ContextMenuRadioGroup value={pen} onValueChange={setPen}>
          {Object.entries(PENS).map(([value, label]) => (
            <ContextMenuRadioItem key={value} value={value}>
              {label}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onSelect={() => setLines((n) => n + 1)}>
            <Icon name="plus" /> Add a line <ContextMenuShortcut>⌘↵</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled={lines < 2} onSelect={() => setLines((n) => Math.max(1, n - 1))}>
            <Icon name="minus" /> Remove a line
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
