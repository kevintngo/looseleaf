"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Paper } from "@/components/ui/paper"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ALL, NOTEBOOKS, stripMarks, type Note } from "@/blocks/notes-app/components/notes-app-data"
import { cn } from "@/lib/utils"

type Props = {
  notes: Note[]
  notebook: string
  onNotebookChange: (id: string) => void
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  headingRef?: React.Ref<HTMLHeadingElement>
  className?: string
}

const inNotebook = (notes: Note[], id: string) => (id === ALL ? notes : notes.filter((n) => n.notebook === id))
const nameOf = (id: string) => NOTEBOOKS.find((n) => n.id === id)?.name ?? id

function NoteCard({ note, selected, onSelect }: { note: Note; selected: boolean; onSelect: () => void }) {
  const title = note.title || "Untitled"
  return (
    <li>
      <IndexCard seed={note.id} flag={selected ? "lemon" : false} className="min-h-0 max-w-none px-4">
        <IndexCardHeader>
          <IndexCardTitle role="heading" aria-level={3} className="text-2xl @max-md/notes:text-[1.3rem]">
            {title}
          </IndexCardTitle>
        </IndexCardHeader>
        <IndexCardContent className="line-clamp-2 text-[15px]">{stripMarks(note.body).replace(/\s+/g, " ").trim() || "Nothing written yet."}</IndexCardContent>
        <IndexCardFooter>
          <span className="truncate">{nameOf(note.notebook)}</span>
          <span className="shrink-0">{note.updated}</span>
        </IndexCardFooter>
        <button
          type="button"
          aria-label={`Open ${title}`}
          aria-current={selected ? "true" : undefined}
          onClick={onSelect}
          className="absolute inset-0 z-10 cursor-pointer outline-offset-4 focus-visible:outline-2 focus-visible:outline-focus"
        />
      </IndexCard>
    </li>
  )
}

export function NotesAppNoteList({ notes, notebook, onNotebookChange, selectedId, onSelect, onNew, headingRef, className }: Props) {
  const heading = React.useId()
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()

  return (
    <Paper as="aside" stock="pad" rules="none" tilt={-0.3} fastener="binder-clip" seed="notes-shelf" aria-labelledby={heading} data-slot="notes-app-list" className={cn("flex min-h-0 flex-col gap-3 pt-6 pb-3", className)}>
      <div className="flex items-center justify-between gap-3 px-4">
        <h2 id={heading} ref={headingRef} tabIndex={-1} className="font-script text-[1.7rem] leading-none font-semibold outline-offset-4 focus-visible:outline-2 focus-visible:outline-focus">
          Notes
        </h2>
        <Button size="sm" onClick={onNew}>
          <Icon name="plus" />
          New page
        </Button>
      </div>
      <div className="px-4">
        <InputGroup>
          <InputGroupAddon>
            <Icon name="search" />
          </InputGroupAddon>
          <InputGroupInput type="search" placeholder="Search this notebook" aria-label="Search this notebook" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
      </div>

      <Tabs orientation="vertical" value={notebook} onValueChange={onNotebookChange} className="min-h-0 flex-1 gap-2 ps-3 pe-1">
        <TabsList aria-label="Notebooks" className="w-28 shrink-0">
          {NOTEBOOKS.map((nb) => (
            <TabsTrigger key={nb.id} value={nb.id} seed={`nb-${nb.id}`}>
              {nb.name}
              <span className="ll-num ms-auto text-xs font-normal">{inNotebook(notes, nb.id).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {NOTEBOOKS.map((nb) => {
          const rows = inNotebook(notes, nb.id).filter((n) => !q || `${n.title} ${stripMarks(n.body)}`.toLowerCase().includes(q))
          return (
            <TabsContent key={nb.id} value={nb.id} className="min-h-0 min-w-0">
              <ScrollArea className="h-full" bleed>
                {rows.length === 0 ? (
                  <Empty seed={`empty-${nb.id}`} className="p-2 md:p-4">
                    <EmptyHeader>
                      <EmptyMedia pose={q ? "search" : "sleep"} size={88} />
                      <EmptyTitle>{q ? "No page says that" : "Nothing here yet"}</EmptyTitle>
                      <EmptyDescription>{q ? `Try a shorter word than “${query.trim()}”.` : `${nb.name} is a clean page waiting for a first line.`}</EmptyDescription>
                    </EmptyHeader>
                    {q ? null : (
                      <EmptyContent>
                        <Button size="sm" onClick={onNew}>
                          Start a page
                        </Button>
                      </EmptyContent>
                    )}
                  </Empty>
                ) : (
                  <ul aria-label={`${nb.name} pages`} className="grid grid-cols-1 gap-4">
                    {rows.map((n) => (
                      <NoteCard key={n.id} note={n} selected={n.id === selectedId} onSelect={() => onSelect(n.id)} />
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>
          )
        })}
      </Tabs>
    </Paper>
  )
}
