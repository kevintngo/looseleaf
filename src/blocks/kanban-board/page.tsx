"use client"

import * as React from "react"

import { Column } from "@/blocks/kanban-board/components/kanban-board-column"
import { COLUMNS, notes as sample, TEAM, type ColumnId, type Label, type Note } from "@/blocks/kanban-board/components/kanban-board-data"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Sticker } from "@/components/ui/sticker"

export default function KanbanBoard({ as: Root = "main" }: { as?: "main" | "div" } = {}) {
  const [notes, setNotes] = React.useState<Note[]>(sample)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [over, setOver] = React.useState<ColumnId | null>(null)
  const [message, setMessage] = React.useState("")
  const focus = React.useRef<{ id: string; via: "back" | "forward" | null } | null>(null)
  const board = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const target = focus.current
    if (!target) return
    focus.current = null
    const card = board.current?.querySelector<HTMLElement>(`[data-note-id="${CSS.escape(target.id)}"]`)
    const wanted = target.via ? card?.querySelector<HTMLElement>(`[data-move="${target.via}"]`) : null
    const any = card?.querySelector<HTMLElement>("[data-move]")
    ;(wanted ?? any)?.focus()
  }, [notes])

  const titleOf = (id: ColumnId) => COLUMNS.find((c) => c.id === id)?.title ?? id

  function move(id: string, to: ColumnId, via: "back" | "forward" | null) {
    const note = notes.find((n) => n.id === id)
    if (!note || note.column === to) return
    const count = notes.filter((n) => n.column === to).length + 1
    focus.current = { id, via }
    setNotes((all) => [...all.filter((n) => n.id !== id), { ...note, column: to }])
    setMessage(`Moved “${note.title}” to ${titleOf(to)}. ${titleOf(to)} has ${count} ${count === 1 ? "note" : "notes"}.`)
  }

  function add(column: ColumnId, title: string, label: Label) {
    const next = Math.max(0, ...notes.map((n) => Number(n.id.slice(1)) || 0)) + 1
    setNotes((all) => [...all, { id: `n${next}`, title, label, who: TEAM[0], column }])
    setMessage(`Added “${title}” to ${titleOf(column)}.`)
  }

  return (
    <Root className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-prose flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-script text-4xl leading-none font-bold sm:text-5xl">Launch week</h1>
            <Sticker name="rocket" size={64} seed="kanban-rocket" className="hidden shrink-0 sm:block" />
          </div>
          <p className="text-muted-foreground">Six days to the autumn drop. Move a note with its arrows, pick it up and drop it, or write a new one.</p>
        </div>
        <AvatarGroup aria-label="On this board" role="group" className="[&>*+*]:-ms-0.5">
          {TEAM.map((name) => (
            <Avatar key={name}>
              <AvatarFallback name={name} />
            </Avatar>
          ))}
        </AvatarGroup>
      </header>

      <div ref={board} className="grid items-start gap-4 md:grid-cols-3">
        {COLUMNS.map((c) => (
          <Column
            key={c.id}
            id={c.id}
            title={c.title}
            hint={c.hint}
            notes={notes.filter((n) => n.column === c.id)}
            dragging={dragging}
            over={over === c.id}
            onOver={(on) => setOver(on ? c.id : (o) => (o === c.id ? null : o))}
            onMove={move}
            onDragStart={(id, e) => {
              e.dataTransfer.setData("text/plain", id)
              e.dataTransfer.effectAllowed = "move"
              setDragging(id)
            }}
            onDragEnd={() => {
              setDragging(null)
              setOver(null)
            }}
            onDrop={(to, e) => {
              const id = e.dataTransfer.getData("text/plain") || dragging
              setDragging(null)
              if (id) move(id, to, null)
            }}
            onAdd={(title, label) => add(c.id, title, label)}
            onClear={
              c.id === "done"
                ? () => {
                    const n = notes.filter((x) => x.column === "done").length
                    setNotes((all) => all.filter((x) => x.column !== "done"))
                    setMessage(`Cleared ${n} done ${n === 1 ? "note" : "notes"}.`)
                  }
                : undefined
            }
          />
        ))}
      </div>
      <p role="status" aria-label="Board updates" className="sr-only">
        {message}
      </p>
    </Root>
  )
}
