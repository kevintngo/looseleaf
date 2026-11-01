"use client"

import * as React from "react"
import { format, isSameMonth, startOfMonth } from "date-fns"
import type { DayButtonProps } from "react-day-picker"

import { ComingUp, DayCard, Dot } from "@/blocks/calendar-planner/components/calendar-planner-agenda"
import { dayKey, events as sample, kindOf, onDay, parseDay, TODAY, type EventKind, type PlannerEvent } from "@/blocks/calendar-planner/components/calendar-planner-data"
import { EventDialog } from "@/blocks/calendar-planner/components/calendar-planner-event-dialog"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Icon } from "@/components/ui/icon"
import { Fastener } from "@/components/ui/paper"
import { Sticker } from "@/components/ui/sticker"

const DotsContext = React.createContext<Record<string, EventKind[]>>({})

function PlannerDayButton(props: DayButtonProps) {
  const kinds = React.useContext(DotsContext)[props.day.isoDate] ?? []
  return (
    <CalendarDayButton {...props}>
      <span className="relative grid place-items-center">
        {props.children}
        {kinds.length ? (
          <span aria-hidden="true" className="absolute -bottom-1.5 flex gap-px">
            {kinds.slice(0, 3).map((k, i) => (
              <Dot key={i} kind={k} className="size-[5px] ring-0" />
            ))}
          </span>
        ) : null}
      </span>
    </CalendarDayButton>
  )
}

type Editing = { event?: PlannerEvent; date: string } | null

export default function CalendarPlanner({ as: Root = "main" }: { as?: "main" | "div" } = {}) {
  const [all, setAll] = React.useState<PlannerEvent[]>(sample)
  const [selected, setSelected] = React.useState(TODAY)
  const [month, setMonth] = React.useState<Date>(() => startOfMonth(parseDay(TODAY)))
  const [editing, setEditing] = React.useState<Editing>(null)
  const [message, setMessage] = React.useState("")
  const opener = React.useRef<HTMLElement | null>(null)
  const newButton = React.useRef<HTMLButtonElement>(null)

  const dots = React.useMemo(() => {
    const map: Record<string, EventKind[]> = {}
    for (const e of all) (map[e.date] ??= []).push(e.kind)
    return map
  }, [all])

  function open(next: NonNullable<Editing>) {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setEditing(next)
  }

  function show(iso: string) {
    setSelected(iso)
    const d = parseDay(iso)
    setMonth((m) => (isSameMonth(m, d) ? m : startOfMonth(d)))
  }

  function save(draft: Omit<PlannerEvent, "id">, id?: string) {
    if (id) setAll((list) => list.map((e) => (e.id === id ? { ...draft, id } : e)))
    else {
      const next = Math.max(0, ...all.map((e) => Number(e.id.slice(1)) || 0)) + 1
      setAll((list) => [...list, { ...draft, id: `e${next}` }])
    }
    show(draft.date)
    setMessage(`${id ? "Saved" : "Added"} “${draft.title}” on ${format(parseDay(draft.date), "EEEE d MMMM")}.`)
    setEditing(null)
  }

  function remove(event: PlannerEvent) {
    setAll((list) => list.filter((e) => e.id !== event.id))
    setMessage(`Deleted “${event.title}”.`)
    setEditing(null)
  }

  const count = onDay(all, selected).length
  return (
    <Root className="mx-auto flex w-full max-w-5xl flex-col gap-6 overflow-x-clip p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-type text-sm tracking-wide text-ink-muted">Planner</p>
            <h1 className="font-script text-4xl leading-none font-bold sm:text-5xl">{format(month, "MMMM yyyy")}</h1>
          </div>
          <Sticker name="acorn-pair" size={68} seed="planner-acorns" className="hidden shrink-0 sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelected(TODAY)
              setMonth(startOfMonth(parseDay(TODAY)))
            }}
          >
            Today
          </Button>
          <Button ref={newButton} onClick={() => open({ date: selected })}>
            <Icon name="calendar-plus" />
            New event
          </Button>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col gap-4">
          <DotsContext.Provider value={dots}>
            <div className="relative mx-auto w-fit max-lg:mt-8">
              <Fastener kind="clip" seed="planner-clip" className="pointer-events-none absolute -top-10 right-[3.125rem] z-(--ll-z-prop) calm:hidden" />
              <Calendar
                mode="single"
                required
                selected={parseDay(selected)}
                onSelect={(d) => d && show(dayKey(d))}
                month={month}
                onMonthChange={setMonth}
                today={parseDay(TODAY)}
                components={{ DayButton: PlannerDayButton }}
                labels={{
                  labelDayButton: (date, modifiers) => {
                    const n = dots[dayKey(date)]?.length ?? 0
                    const label = `${modifiers.today ? "Today, " : ""}${format(date, "EEEE, MMMM do, yyyy")}${modifiers.selected ? ", selected" : ""}`
                    return n ? `${label}, ${n} ${n === 1 ? "event" : "events"}` : label
                  },
                }}
                seed="planner-month"
                sheet={{ stock: "card", tilt: false }}
                className="max-[21rem]:[--cell:2.25rem]"
              />
            </div>
          </DotsContext.Provider>
          <ul role="list" className="mx-auto flex w-0 min-w-full flex-wrap justify-center gap-x-4 gap-y-1 px-2 text-sm text-muted-foreground lg:justify-start" aria-label="What the dots mean">
            {(["studio", "home", "friends", "trips", "errands"] as const).map((k) => (
              <li key={k} className="flex items-center gap-1.5">
                <Dot kind={k} />
                {kindOf(k).label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <DayCard day={selected} list={all} onOpen={(e) => open({ event: e, date: e.date })} />
          <ComingUp day={selected} list={all} onOpen={(e) => open({ event: e, date: e.date })} />
        </div>
      </div>

      <p role="status" aria-label="Planner updates" className="sr-only">
        {message || `${count} ${count === 1 ? "event" : "events"} on ${format(parseDay(selected), "EEEE d MMMM")}.`}
      </p>

      {editing ? (
        <EventDialog
          key={editing.event?.id ?? "new"}
          event={editing.event}
          date={editing.date}
          onSave={save}
          onDelete={remove}
          onClose={() => setEditing(null)}
          restoreFocus={() => (opener.current?.isConnected ? opener.current : newButton.current)?.focus()}
        />
      ) : null}
    </Root>
  )
}
