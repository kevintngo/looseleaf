"use client"

import * as React from "react"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Paper } from "@/components/ui/paper"
import { ALL, FEATURED, NOTEBOOKS, NOTES, type Note } from "@/blocks/notes-app/components/notes-app-data"
import { NotesAppEditor, type EditorMode } from "@/blocks/notes-app/components/notes-app-editor"
import { NotesAppNoteList } from "@/blocks/notes-app/components/notes-app-note-list"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  defaultNotes?: Note[]
  onNotesChange?: (notes: Note[]) => void
}

export default function NotesApp({ className, defaultNotes = NOTES, onNotesChange }: Props) {
  const [notes, setNotes] = React.useState<Note[]>(defaultNotes)
  const commit = (next: Note[]) => {
    setNotes(next)
    onNotesChange?.(next)
  }
  const [notebook, setNotebook] = React.useState(ALL)
  const [selectedId, setSelectedId] = React.useState<string | null>(defaultNotes.some((n) => n.id === FEATURED) ? FEATURED : (defaultNotes[0]?.id ?? null))
  const [mode, setMode] = React.useState<EditorMode>("page")
  const [view, setView] = React.useState<"list" | "editor">("list")
  const counter = React.useRef(0)
  const shelf = React.useRef<HTMLHeadingElement>(null)
  const [handBack, setHandBack] = React.useState(false)

  const note = notes.find((n) => n.id === selectedId)
  const notebookName = NOTEBOOKS.find((nb) => nb.id === note?.notebook)?.name ?? ""

  React.useEffect(() => {
    if (!handBack) return
    shelf.current?.focus()
    setHandBack(false)
  }, [handBack])

  const grid = React.useRef<HTMLDivElement>(null)
  const shown = React.useRef(view)
  React.useEffect(() => {
    if (shown.current === view) return
    shown.current = view
    if (handBack) return
    const gone = grid.current?.querySelector<HTMLElement>(view === "editor" ? "[data-slot=notes-app-list]" : "[data-slot=notes-app-editor]")
    if (!gone || getComputedStyle(gone).display !== "none") return
    const target = view === "editor" ? grid.current?.querySelector<HTMLElement>("[data-slot=notes-app-editor]") : (grid.current?.querySelector<HTMLElement>("[data-slot=notes-app-list] [aria-current=true]") ?? shelf.current)
    target?.focus()
  }, [view, handBack])

  const open = (id: string) => {
    setSelectedId(id)
    setMode("page")
    setView("editor")
  }

  const create = () => {
    const id = `page-${counter.current++}`
    const home = notebook === ALL ? "scraps" : notebook
    commit([{ id, notebook: home, title: "", body: "", updated: "just now", reads: 0 }, ...notes])
    setSelectedId(id)
    setMode("write")
    setView("editor")
  }

  const change = (patch: Partial<Pick<Note, "title" | "body" | "reads">>) =>
    commit(notes.map((n) => (n.id === selectedId ? { ...n, ...patch, updated: "just now" } : n)))

  const remove = () => {
    const rest = notes.filter((n) => n.id !== selectedId)
    commit(rest)
    setSelectedId(rest.find((n) => notebook === ALL || n.notebook === notebook)?.id ?? null)
    setMode("page")
    setView("list")
    setHandBack(true)
  }

  return (
    <div className="@container/notes w-full">
      <div
        ref={grid}
        data-slot="notes-app"
        data-view={view}
        className={cn(
          "group/notes grid h-[48rem] max-h-[100svh] min-h-[32rem] w-full grid-cols-1 grid-rows-[minmax(0,1fr)] gap-6 p-4 pt-10 @4xl/notes:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] @4xl/notes:p-6 @4xl/notes:pt-12",
          className
        )}
      >
        <NotesAppNoteList
          notes={notes}
          notebook={notebook}
          onNotebookChange={setNotebook}
          selectedId={selectedId}
          onSelect={open}
          onNew={create}
          headingRef={shelf}
          className="group-data-[view=editor]/notes:@max-4xl/notes:hidden"
        />
        {note ? (
          <NotesAppEditor
            key={note.id}
            note={note}
            notebookName={notebookName}
            mode={mode}
            onModeChange={setMode}
            onChange={change}
            onDelete={remove}
            onBack={() => setView("list")}
            className="group-data-[view=list]/notes:@max-4xl/notes:hidden"
          />
        ) : (
          <Paper as="section" stock="card" aria-label="Editor" className="grid place-items-center group-data-[view=list]/notes:@max-4xl/notes:hidden">
            <Empty seed="no-page">
              <EmptyHeader>
                <EmptyMedia pose="idle" size={104} />
                <EmptyTitle>Pick a page</EmptyTitle>
                <EmptyDescription>Open one from the shelf, or start a new page with the button up there.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </Paper>
        )}
      </div>
    </div>
  )
}
