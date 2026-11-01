"use client"

import { format } from "date-fns"

import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { cn } from "@/lib/utils"
import { after, clock, kindOf, onDay, parseDay, TODAY, type PlannerEvent } from "@/blocks/calendar-planner/components/calendar-planner-data"

export function Dot({ kind, className }: { kind: PlannerEvent["kind"]; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-2.5 shrink-0 rounded-full ring-1 ring-ink/40", kindOf(kind).dot, className)} />
}

const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]

const row = "flex h-[30px] w-full items-center gap-2 text-start leading-[30px] hover:ll-swipe focus-visible:ll-swipe"

export function DayCard({ day, list, onOpen, className }: { day: string; list: readonly PlannerEvent[]; onOpen: (e: PlannerEvent) => void; className?: string }) {
  const events = onDay(list, day)
  return (
    <IndexCard className={cn("max-w-none", className)} seed={`planner-day-${day}`} tilt={false}>
      <IndexCardHeader>
        <IndexCardTitle role="heading" aria-level={2}>
          {format(parseDay(day), "EEEE d MMMM")}
        </IndexCardTitle>
        {day === TODAY ? <span className="pb-0.5 font-type text-sm tracking-wide text-ink-muted">today</span> : null}
      </IndexCardHeader>
      <IndexCardContent>
        {events.length ? (
          <ul role="list">
            {events.map((e) => (
              <li key={e.id}>
                <button type="button" className={row} onClick={() => onOpen(e)}>
                  <span className="ll-num w-11 shrink-0 text-end text-ink-soft">{clock(e.start)}</span>
                  <Dot kind={e.kind} />
                  <span className="min-w-0 flex-1 truncate">{e.title}</span>
                  <span className="sr-only">, {clock(e.start)} to {clock(e.end)}, {kindOf(e.kind).label}. Open to change it.</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nothing planned. Leave it that way?</p>
        )}
      </IndexCardContent>
      <IndexCardFooter>
        <span>{events.length === 0 ? "a free day" : events.length === 1 ? "one thing" : `${NUMBER_WORDS[events.length] ?? events.length} things`}</span>
      </IndexCardFooter>
    </IndexCard>
  )
}

export function ComingUp({ day, list, onOpen, className }: { day: string; list: readonly PlannerEvent[]; onOpen: (e: PlannerEvent) => void; className?: string }) {
  const next = after(list, day)
  return (
    <IndexCard className={cn("max-w-none", className)} seed="planner-next" tilt={false} stack={2} flag="sky">
      <IndexCardHeader>
        <IndexCardTitle role="heading" aria-level={2}>
          Coming up
        </IndexCardTitle>
      </IndexCardHeader>
      <IndexCardContent>
        {next.length ? (
          <ul role="list">
            {next.map((e) => (
              <li key={e.id}>
                <button type="button" className={row} onClick={() => onOpen(e)}>
                  <span className="ll-num w-16 shrink-0 text-ink-soft">{format(parseDay(e.date), "EEE d")}</span>
                  <Dot kind={e.kind} />
                  <span className="min-w-0 flex-1 truncate">{e.title}</span>
                  <span className="sr-only">
                    , {format(parseDay(e.date), "EEEE d MMMM")}, {clock(e.start)}, {kindOf(e.kind).label}. Open to change it.
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nothing after this day yet.</p>
        )}
      </IndexCardContent>
    </IndexCard>
  )
}
