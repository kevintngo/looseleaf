"use client"

import * as React from "react"

import { Annotate } from "@/components/ui/annotate"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Icon } from "@/components/ui/icon"
import { InputControl } from "@/components/ui/input"
import { Notebook, NotebookPage, NotebookTitle } from "@/components/ui/notebook"
import { Paper } from "@/components/ui/paper"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tally } from "@/components/ui/tally"
import { TextareaControl } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MARKS, toggleMark, wordCount, type MarkKind, type Note } from "@/blocks/notes-app/components/notes-app-data"
import { MARK_LOOK, NotesAppMarked } from "@/blocks/notes-app/components/notes-app-marked"
import { cn } from "@/lib/utils"

export type EditorMode = "page" | "write"

type Props = {
  note: Note
  notebookName: string
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  onChange: (patch: Partial<Pick<Note, "title" | "body" | "reads">>) => void
  onDelete: () => void
  onBack: () => void
  className?: string
}

const MARK_ORDER: MarkKind[] = ["highlight", "underline", "circle", "strike"]

export function NotesAppEditor({ note, notebookName, mode, onModeChange, onChange, onDelete, onBack, className }: Props) {
  const area = React.useRef<HTMLTextAreaElement>(null)
  const title = React.useRef<HTMLInputElement>(null)
  const restore = React.useRef<{ start: number; end: number } | null>(null)
  const [focusSoon, setFocusSoon] = React.useState(false)
  const hint = React.useId()

  React.useEffect(() => {
    if (mode === "write" && !note.title && !note.body) title.current?.focus()
  }, [])

  React.useLayoutEffect(() => {
    const el = area.current
    if (!el) return
    if (restore.current) {
      el.setSelectionRange(restore.current.start, restore.current.end)
      restore.current = null
    }
    if (focusSoon) {
      el.focus()
      setFocusSoon(false)
    }
  })

  const mark = (kind: MarkKind) => {
    if (mode !== "write") {
      onModeChange("write")
      setFocusSoon(true)
      return
    }
    const el = area.current
    if (!el) return
    const next = toggleMark(el.value, el.selectionStart, el.selectionEnd, kind)
    if (!next) {
      el.focus()
      return
    }
    restore.current = { start: next.start, end: next.end }
    onChange({ body: next.text })
    setFocusSoon(true)
  }

  return (
    <section aria-label="Editor" data-slot="notes-app-editor" tabIndex={-1} className={cn("flex min-h-0 flex-col gap-3 outline-none", className)}>
      <TooltipProvider delayDuration={300}>
        <Paper stock="slip" tilt={-0.2} seed="notes-toolbar" className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
          <Button variant="ghost" size="icon-sm" className="@4xl/notes:hidden" onClick={onBack} aria-label="Back to notes">
            <Icon name="arrow-left" className="rtl:-scale-x-100" />
          </Button>
          <ToggleGroup type="single" size="sm" variant="outline" value={mode} onValueChange={(v) => v && onModeChange(v as EditorMode)} aria-label="View">
            <ToggleGroupItem value="page">Page</ToggleGroupItem>
            <ToggleGroupItem value="write">Write</ToggleGroupItem>
          </ToggleGroup>
          <ButtonGroup aria-label="Marks">
            {MARK_ORDER.map((kind) => {
              const look = MARK_LOOK[kind]
              return (
                <Tooltip key={kind}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={MARKS[kind].label}
                      aria-describedby={hint}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => mark(kind)}
                    >
                      <Annotate type={look.type} color={look.color} kind={look.kind} seed={`tool-${kind}`} className="px-1">
                        Aa
                      </Annotate>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent seed={`tip-${kind}`}>{MARKS[kind].label}</TooltipContent>
                </Tooltip>
              )
            })}
          </ButtonGroup>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="ms-auto" aria-label="Tear this page out">
                <Icon name="trash" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent tone="danger" seed="tear-out">
              <AlertDialogHeader>
                <AlertDialogMedia tone="danger">
                  <Icon name="trash" />
                </AlertDialogMedia>
                <AlertDialogTitle>Tear this page out?</AlertDialogTitle>
                <AlertDialogDescription>“{note.title || "Untitled"}” goes in the bin with everything written on it.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onDelete}>
                  Tear it out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p id={hint} className="basis-full text-sm text-muted-foreground">
            Select some words in Write, then press a mark. Press it again to take it off.
          </p>
        </Paper>
      </TooltipProvider>

      <ScrollArea className="min-h-0 flex-1" bleed>
        <Notebook as="div" binding="spiral" pages={2} tilt={0.15} seed={`notes-page`} className="ms-3 min-h-[30rem]">
          <NotebookPage aria-label={note.title || "Untitled"}>
            <NotebookTitle>
              {mode === "write" ? (
                <InputControl
                  ref={title}
                  aria-label="Title"
                  placeholder="Untitled"
                  value={note.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  className="block h-7 w-full bg-transparent p-0 font-script text-[1.75rem] leading-7 font-bold text-ink-you outline-offset-2 placeholder:text-pencil-text focus-visible:outline-2 focus-visible:outline-focus"
                />
              ) : (
                note.title || "Untitled"
              )}
            </NotebookTitle>
            {mode === "write" ? (
              <TextareaControl
                ref={area}
                aria-label="Note"
                aria-describedby={hint}
                placeholder="Start writing on the first line."
                rows={10}
                value={note.body}
                onChange={(e) => onChange({ body: e.target.value })}
                className="block min-h-70 w-full resize-none p-0 text-[17px] leading-7 text-ink-you"
              />
            ) : (
              <div onDoubleClick={() => onModeChange("write")}>
                <NotesAppMarked body={note.body} seed={note.id} />
              </div>
            )}
            <div className="mt-7 flex h-7 items-center gap-3 text-sm text-muted-foreground">
              <span>times I have read it</span>
              <Tally count={note.reads} size="md" label={`Read ${note.reads} times`} seed={`${note.id}-reads`} />
              <Button size="xs" variant="ghost" onClick={() => onChange({ reads: note.reads + 1 })} aria-label="Count another read">
                +1
              </Button>
            </div>
            <p className="ll-num h-7 text-sm text-muted-foreground">
              {wordCount(note.body)} words · {notebookName}
            </p>
          </NotebookPage>
        </Notebook>
      </ScrollArea>
    </section>
  )
}
