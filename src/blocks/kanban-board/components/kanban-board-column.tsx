"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Paper } from "@/components/ui/paper"
import { Tally } from "@/components/ui/tally"
import { AddNote } from "@/blocks/kanban-board/components/kanban-board-add-note"
import { NoteCard } from "@/blocks/kanban-board/components/kanban-board-card"
import type { ColumnId, Label, Note } from "@/blocks/kanban-board/components/kanban-board-data"

export function Column({
  id,
  title,
  hint,
  notes,
  dragging,
  over,
  onOver,
  onMove,
  onDragStart,
  onDragEnd,
  onDrop,
  onAdd,
  onClear,
}: {
  id: ColumnId
  title: string
  hint: string
  notes: Note[]
  dragging: string | null
  over: boolean
  onOver: (over: boolean) => void
  onMove: (id: string, to: ColumnId, via: "back" | "forward") => void
  onDragStart: (id: string, e: React.DragEvent) => void
  onDragEnd: () => void
  onDrop: (to: ColumnId, e: React.DragEvent) => void
  onAdd: (title: string, label: Label) => void
  onClear?: () => void
}) {
  const headingId = React.useId()
  return (
    <section aria-labelledby={headingId} data-column={id} className="min-w-0">
      <Paper stock="graph" tilt={false} seed={`kanban-${id}`} className="flex h-full flex-col gap-3 p-4">
        <header className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 id={headingId} className="font-script text-[1.9rem] leading-none font-bold">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{hint}</p>
          </div>
          {onClear && notes.length ? (
            <Button variant="ghost" size="sm" onClick={onClear} aria-label={`Clear the ${notes.length} done ${notes.length === 1 ? "note" : "notes"}`}>
              Clear
            </Button>
          ) : null}
          <Tally count={notes.length} size="md" seed={`kanban-tally-${id}`} label={`${notes.length} ${notes.length === 1 ? "note" : "notes"}`} className="mt-1" />
        </header>
        <div
          data-over={over ? "true" : undefined}
          className="flex min-h-40 flex-1 flex-col gap-4 p-1 data-[over=true]:outline-2 data-[over=true]:outline-offset-2 data-[over=true]:outline-dashed data-[over=true]:outline-ink-you"
          onDragOver={(e) => {
            if (!dragging) return
            e.preventDefault()
            e.dataTransfer.dropEffect = "move"
            if (!over) onOver(true)
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            onOver(false)
            onDrop(id, e)
          }}
        >
          {notes.length ? (
            <ul role="list" className="flex flex-col gap-4">
              {notes.map((n) => (
                <li key={n.id}>
                  <NoteCard note={n} dragging={dragging === n.id} onMove={onMove} onDragStart={onDragStart} onDragEnd={onDragEnd} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Nothing here yet. Drop a note, or write a new one.</p>
          )}
        </div>
        <AddNote column={title} onAdd={onAdd} />
      </Paper>
    </section>
  )
}
