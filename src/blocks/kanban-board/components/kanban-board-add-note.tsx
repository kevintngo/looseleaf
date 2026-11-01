"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label as FieldLabel } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LABELS, type Label } from "@/blocks/kanban-board/components/kanban-board-data"

export function AddNote({ column, onAdd }: { column: string; onAdd: (title: string, label: Label) => void }) {
  const uid = React.useId()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [label, setLabel] = React.useState<Label>("Studio")
  const [error, setError] = React.useState(false)
  const opener = React.useRef<HTMLButtonElement>(null)
  const field = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) field.current?.focus()
  }, [open])

  const close = () => {
    setOpen(false)
    setTitle("")
    setError(false)
    requestAnimationFrame(() => opener.current?.focus())
  }

  if (!open) {
    return (
      <Button ref={opener} variant="ghost" className="w-full justify-start" onClick={() => setOpen(true)}>
        <Icon name="plus" />
        Add a note<span className="sr-only"> to {column}</span>
      </Button>
    )
  }

  return (
    <form
      className="flex flex-col gap-3 p-1"
      aria-label={`New note in ${column}`}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return setError(true)
        onAdd(title.trim(), label)
        close()
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !e.defaultPrevented) close()
      }}
    >
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={`${uid}-title`}>What needs doing?</FieldLabel>
        <Input
          ref={field}
          id={`${uid}-title`}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setError(false)
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${uid}-error` : undefined}
        />
        {error ? (
          <p id={`${uid}-error`} role="alert" className="text-sm text-destructive">
            Write a few words on the note first.
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={`${uid}-label`}>Which pad?</FieldLabel>
        <Select value={label} onValueChange={(v) => setLabel(v as Label)}>
          <SelectTrigger id={`${uid}-label`} size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LABELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Stick it up
        </Button>
      </div>
    </form>
  )
}
