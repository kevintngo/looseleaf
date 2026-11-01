"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { KINDS, type EventKind, type PlannerEvent } from "@/blocks/calendar-planner/components/calendar-planner-data"

type Draft = Omit<PlannerEvent, "id">
type Errors = Partial<Record<"title" | "date" | "end", string>>

export function EventDialog({
  event,
  date,
  onSave,
  onDelete,
  onClose,
  restoreFocus,
}: {
  event?: PlannerEvent
  date: string
  onSave: (e: Draft, id?: string) => void
  onDelete: (e: PlannerEvent) => void
  onClose: () => void
  restoreFocus: () => void
}) {
  const uid = React.useId()
  const id = (name: string) => `${uid}-${name}`
  const [draft, setDraft] = React.useState<Draft>(() => ({
    title: event?.title ?? "",
    date: event?.date ?? date,
    start: event?.start ?? "09:00",
    end: event?.end ?? "10:00",
    kind: event?.kind ?? "studio",
    notes: event?.notes ?? "",
  }))
  const [errors, setErrors] = React.useState<Errors>({})
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next: Errors = {}
    if (!draft.title.trim()) next.title = "Give the event a name."
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) next.date = "Pick a day."
    if (draft.end <= draft.start) next.end = "The end has to come after the start."
    setErrors(next)
    const first = next.title ? "title" : next.date ? "date" : next.end ? "end" : null
    if (first) {
      document.getElementById(id(first))?.focus()
      return
    }
    onSave({ ...draft, title: draft.title.trim() }, event?.id)
  }

  const bad = (key: keyof Errors) => (errors[key] ? { "aria-invalid": true as const, "aria-describedby": id(`${key}-error`) } : {})

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        tape="both"
        tapeKind="washi-dots"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          restoreFocus()
        }}
      >
        <DialogHeader>
          <DialogTitle>{event ? "Change the event" : "A new event"}</DialogTitle>
          <DialogDescription>{event ? "Rewrite it, or cross it out." : "Write it on the day so it does not slip."}</DialogDescription>
        </DialogHeader>
        <form id={id("form")} onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Field data-invalid={errors.title ? "true" : undefined}>
            <FieldLabel htmlFor={id("title")}>What is happening?</FieldLabel>
            <Input id={id("title")} value={draft.title} onChange={(e) => set("title", e.target.value)} {...bad("title")} />
            <FieldError id={id("title-error")}>{errors.title}</FieldError>
          </Field>
          <Field data-invalid={errors.date ? "true" : undefined}>
            <FieldLabel htmlFor={id("date")}>Which day?</FieldLabel>
            <Input id={id("date")} type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} {...bad("date")} />
            <FieldError id={id("date-error")}>{errors.date}</FieldError>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor={id("start")}>From</FieldLabel>
              <Input id={id("start")} type="time" value={draft.start} onChange={(e) => set("start", e.target.value)} />
            </Field>
            <Field data-invalid={errors.end ? "true" : undefined}>
              <FieldLabel htmlFor={id("end")}>To</FieldLabel>
              <Input id={id("end")} type="time" value={draft.end} onChange={(e) => set("end", e.target.value)} {...bad("end")} />
            </Field>
          </div>
          <FieldError id={id("end-error")}>{errors.end}</FieldError>
          <Field>
            <FieldLabel htmlFor={id("kind")}>What sort?</FieldLabel>
            <Select value={draft.kind} onValueChange={(v) => set("kind", v as EventKind)}>
              <SelectTrigger id={id("kind")} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={id("notes")}>Notes</FieldLabel>
            <Textarea id={id("notes")} value={draft.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
          </Field>
        </form>
        <DialogFooter>
          {event ? (
            <Button variant="destructive" className="sm:me-auto" onClick={() => onDelete(event)}>
              <Icon name="trash" />
              Delete
            </Button>
          ) : null}
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form={id("form")}>
            {event ? "Save changes" : "Add it"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
