"use client"

import * as React from "react"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Callout } from "@/components/ui/callout"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"
import { Progress } from "@/components/ui/progress"
import { Stamp } from "@/components/ui/stamp"
import { Sticker } from "@/components/ui/sticker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tally } from "@/components/ui/tally"
import { cn } from "@/lib/utils"

const TASKS = [
  { id: "invoices", label: "Send the invoices", done: true },
  { id: "post", label: "Draft the launch post", done: true },
  { id: "review", label: "Review Ada’s pull request", done: false },
  { id: "offsite", label: "Book the offsite", done: false },
  { id: "plant", label: "Water the plant", done: false },
]

const WEEK = [
  { day: "Mon", value: 100 },
  { day: "Tue", value: 80 },
  { day: "Wed", value: 60 },
  { day: "Thu", value: 20 },
  { day: "Fri", value: 0 },
]

const people = ["Ada Lovelace", "Jo Okafor", "Sam Reyes"]

function LandingHero02Window({ className }: { className?: string }) {
  const [done, setDone] = React.useState(() => Object.fromEntries(TASKS.map((t) => [t.id, t.done])) as Record<string, boolean>)
  const count = Object.values(done).filter(Boolean).length
  const all = count === TASKS.length

  return (
    <div data-slot="landing-hero-window" className={className}>
      <div className="relative mx-auto w-full max-w-3xl">
        <Mascot pose="peek" size={112} className="pointer-events-none absolute end-12 bottom-[calc(100%-1.3rem)] [--ll-blend:normal]" />
        <Paper stock="paper" tilt={0.5} tape="both" tapeKind="washi-stripes" shadow="lift" seed="hero-window" className="relative z-(--ll-z-raised) px-5 pt-5 pb-6 @xl:px-8 @xl:pb-10">
          <div className="flex items-center justify-between gap-4">
            <p className="font-script text-2xl leading-none font-bold text-ink">
              penmark <span className="font-hand text-base font-normal text-ink-muted">/ week 39</span>
            </p>
            <AvatarGroup className="[--ll-avatar-group-ring:var(--ll-paper)] [&>*+*]:-ms-0.5">
              {people.map((name) => (
                <Avatar key={name}>
                  <AvatarFallback name={name} />
                </Avatar>
              ))}
            </AvatarGroup>
          </div>

          <Tabs defaultValue="today" className="mt-4 gap-4">
            <TabsList variant="line" aria-label="View">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This week</TabsTrigger>
            </TabsList>

            <TabsContent value="today">
              <h2 className="sr-only">Today</h2>
              <div className="relative @2xl:pe-52">
                <ul role="list" className="grid">
                  {TASKS.map((t) => (
                    <li key={t.id} className="flex h-11 items-center gap-3">
                      <Checkbox
                        id={`hero-task-${t.id}`}
                        checked={done[t.id]}
                        onCheckedChange={(v) => setDone((d) => ({ ...d, [t.id]: v === true }))}
                      />
                      <Label htmlFor={`hero-task-${t.id}`} className={cn("flex-1 text-[17px]", done[t.id] && "text-ink-muted line-through")}>
                        {t.label}
                      </Label>
                    </li>
                  ))}
                </ul>
                <div className="pointer-events-none absolute end-0 top-0 hidden w-48 @2xl:block">
                  <Callout direction="left" seed="note-a" className="absolute start-0 top-11">
                    done before lunch
                  </Callout>
                  <Callout direction="left" seed="note-b" className="absolute start-0 top-33">
                    ask Sam first
                  </Callout>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="min-w-40 flex-1">
                  <div className="mb-1.5 flex items-center gap-4">
                    <p className="text-[15px] text-ink-soft" role="status" aria-live="polite">
                      <span className="ll-num font-bold">{count}</span> of {TASKS.length} done
                    </p>
                    <Tally count={count} size="md" label={`${count} tasks done`} />
                  </div>
                  <Progress value={count} max={TASKS.length} aria-label="Tasks done today" aria-valuetext={`${count} of ${TASKS.length} done`} tone={all ? "green" : "marker"} />
                </div>
                {all ? <Stamp text="All done" ink="green" w={132} h={48} tilt={-6} className="animate-in zoom-in-[1.6] fade-in-0 duration-(--ll-dur-pop)" /> : null}
              </div>
            </TabsContent>

            <TabsContent value="week">
              <h2 className="sr-only">This week</h2>
              <ul role="list" className="grid gap-3 py-1">
                {WEEK.map((d) => (
                  <li key={d.day} className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3 text-base">
                    <span className="font-bold">{d.day}</span>
                    <Progress value={d.value} aria-label={`${d.day}: ${d.value}% done`} size="sm" />
                    <span className="ll-num text-end text-sm text-ink-muted">{d.value}%</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </Paper>
        <Sticker name="party-popper" size={88} rotate={-14} className="absolute -start-6 -bottom-14 z-(--ll-z-raised) hidden @xl:block" />
        <Sticker name="rating-five" size={80} rotate={9} className="absolute -end-4 -bottom-11 z-(--ll-z-raised) hidden @xl:block" />
      </div>
    </div>
  )
}

export { LandingHero02Window }
