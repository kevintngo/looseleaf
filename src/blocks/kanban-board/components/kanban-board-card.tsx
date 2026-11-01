"use client"

import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { StickyNote, StickyNoteContent, StickyNoteFooter, StickyNoteTitle } from "@/components/ui/sticky-note"
import { cn } from "@/lib/utils"
import { COLUMNS, LABEL_COLOR, type ColumnId, type Note } from "@/blocks/kanban-board/components/kanban-board-data"

type Direction = "back" | "forward"

export function NoteCard({
  note,
  dragging,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  note: Note
  dragging: boolean
  onMove: (id: string, to: ColumnId, via: Direction) => void
  onDragStart: (id: string, e: React.DragEvent) => void
  onDragEnd: () => void
}) {
  const at = COLUMNS.findIndex((c) => c.id === note.column)
  const back = COLUMNS[at - 1]
  const forward = COLUMNS[at + 1]
  return (
    <StickyNote
      data-note-id={note.id}
      color={LABEL_COLOR[note.label]}
      done={note.column === "done" ? true : undefined}
      fastener={note.column === "doing" ? "pin" : false}
      seed={note.id}
      draggable
      onDragStart={(e: React.DragEvent) => onDragStart(note.id, e)}
      onDragEnd={onDragEnd}
      className={cn("min-h-0 w-full cursor-grab gap-2 px-4 pt-6 pb-3 active:cursor-grabbing", dragging && "opacity-50")}
    >
      <p className="font-type text-xs tracking-widest text-ink-soft uppercase">{note.label}</p>
      <StickyNoteContent>
        <StickyNoteTitle role="heading" aria-level={3} className="text-[1.5rem] leading-[1.05]">
          {note.title}
        </StickyNoteTitle>
        {note.detail ? <p className="mt-1 text-[1.15rem] leading-tight">{note.detail}</p> : null}
      </StickyNoteContent>
      <StickyNoteFooter className="flex items-center gap-2 pt-1">
        <Avatar size="sm" ring="none" aria-hidden="true">
          <AvatarFallback name={note.who} />
        </Avatar>
        <span className="min-w-0 flex-1 truncate">
          {note.who.split(" ")[0]}
          {note.due ? <span className="text-ink-soft"> · due {note.due}</span> : null}
        </span>
        <span className="flex shrink-0 items-center gap-0.5">
          {back ? (
            <Button variant="ghost" size="icon-sm" data-move="back" aria-label={`Move “${note.title}” to ${back.title}`} onClick={() => onMove(note.id, back.id, "back")}>
              <Icon name="arrow-left" />
            </Button>
          ) : null}
          {forward ? (
            <Button variant="ghost" size="icon-sm" data-move="forward" aria-label={`Move “${note.title}” to ${forward.title}`} onClick={() => onMove(note.id, forward.id, "forward")}>
              <Icon name="arrow-right" />
            </Button>
          ) : null}
        </span>
      </StickyNoteFooter>
    </StickyNote>
  )
}
