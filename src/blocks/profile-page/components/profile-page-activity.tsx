"use client"

import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { Paper } from "@/components/ui/paper"
import { Tally } from "@/components/ui/tally"
import { FEED, WEEKS, type Entry, type Week } from "@/blocks/profile-page/components/profile-page-data"

function WeeklyTally({ weeks }: { weeks: Week[] }) {
  const titleId = React.useId()
  const best = Math.max(0, ...weeks.map((w) => w.pages))
  return (
    <Paper as="section" stock="slip" aria-labelledby={titleId} seed="weekly-tally" className="grid grid-rows-[auto_minmax(0,1fr)] gap-3 px-6 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 id={titleId} className="font-script text-3xl leading-none font-semibold">
          Pages, week by week
        </h3>
        <p className="text-sm text-muted-foreground">Best week: {best} pages</p>
      </div>
      <ol aria-label="Pages written each week" className="grid divide-y divide-rule-blue/60">
        {weeks.map((w, i) => {
          const now = i === weeks.length - 1
          return (
            <li key={w.label} className="grid min-h-9 grid-cols-[minmax(0,1fr)_3rem] items-center gap-x-3 gap-y-1 py-1.5 @md/profile:grid-cols-[8rem_minmax(0,1fr)_3rem] @md/profile:py-0">
              <span className="text-sm text-muted-foreground">{now ? "This week" : w.label}</span>
              <Tally
                count={w.pages}
                size="sm"
                tone={now ? "marker" : "ink"}
                label={`${w.pages} pages, ${w.label}`}
                seed={`week-${i}`}
                className="col-span-2 row-start-2 @md/profile:col-span-1 @md/profile:col-start-2 @md/profile:row-start-1"
              />
              <span className="ll-num col-start-2 row-start-1 text-end font-bold @md/profile:col-start-3">{w.pages}</span>
            </li>
          )
        })}
      </ol>
    </Paper>
  )
}

const DAYS: Entry["day"][] = ["Today", "Yesterday", "Last week"]

function Feed({ feed }: { feed: Entry[] }) {
  const titleId = React.useId()
  return (
    <Paper as="section" stock="paper" tilt={0.25} seed="profile-feed" aria-labelledby={titleId} className="grid content-start gap-2 px-6 py-5">
      <h3 id={titleId} className="font-script text-3xl leading-none font-semibold">
        Lately
      </h3>
      {DAYS.map((day) => (
        <div key={day} role="group" aria-label={day} className="grid">
          <Marker variant="separator">
            <MarkerContent>{day}</MarkerContent>
          </Marker>
          <ItemGroup>
            {feed.filter((e) => e.day === day).map((e) => (
              <Item key={e.id} size="sm">
                <ItemMedia variant="icon">
                  <Icon name={e.icon} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{e.title}</ItemTitle>
                  <ItemDescription>
                    {e.where} · <span className="ll-num">{e.time}</span>
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </div>
      ))}
    </Paper>
  )
}

export function ProfilePageActivity({ weeks = WEEKS, feed = FEED }: { weeks?: Week[]; feed?: Entry[] }) {
  return (
    <div className="grid gap-10 @4xl/profile:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <WeeklyTally weeks={weeks} />
      <Feed feed={feed} />
    </div>
  )
}
