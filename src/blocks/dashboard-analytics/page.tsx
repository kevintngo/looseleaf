"use client"

import * as React from "react"

import { Funnel } from "@/blocks/dashboard-analytics/components/dashboard-analytics-funnel"
import { SourcesChart, TrafficChart } from "@/blocks/dashboard-analytics/components/dashboard-analytics-charts"
import { StatCards } from "@/blocks/dashboard-analytics/components/dashboard-analytics-stat-cards"
import { TopPages } from "@/blocks/dashboard-analytics/components/dashboard-analytics-top-pages"
import { LIVE, period as periodOf, RANGES, type Period, type RangeId } from "@/blocks/dashboard-analytics/components/dashboard-analytics-data"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Page as Sheet, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"
import { StickyNote, StickyNoteContent, StickyNoteTitle } from "@/components/ui/sticky-note"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

function downloadCsv(p: Period) {
  const lines = ["date,visitors,pageviews,bounce_percent,average_session_seconds", ...p.rows.map((r) => `${r[0]},${r[1]},${r[2]},${r[3] / 10},${r[4]}`)]
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `traffic-${p.days}-days.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function DashboardAnalytics({ as: Root = "main" }: { as?: "main" | "div" } = {}) {
  const [rangeId, setRangeId] = React.useState<RangeId>("30d")
  const range = RANGES.find((r) => r.id === rangeId) ?? RANGES[1]
  const period = React.useMemo(() => periodOf(range.days), [range.days])

  return (
    <Sheet as={Root} width="full" tilt={false} rules="none" seed="dashboard-analytics" className="gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-col gap-4">
          <PageHeader>
            <p className="font-type text-sm tracking-wide text-ink-muted">Marigold Paper Co.</p>
            <PageTitle seed="analytics-title">Traffic</PageTitle>
            <PageDescription>How people found the studio in {range.long}, and what they did once they got here.</PageDescription>
          </PageHeader>
          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup type="single" variant="outline" value={rangeId} onValueChange={(v) => v && setRangeId(v as RangeId)} aria-label="Date range">
              {RANGES.map((r) => (
                <ToggleGroupItem key={r.id} value={r.id}>
                  {r.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button variant="outline" onClick={() => downloadCsv(period)}>
              <Icon name="download" />
              Export CSV
            </Button>
          </div>
        </div>
        <StickyNote role="group" aria-label="Live now" fastener="pin" className="min-h-32 w-full sm:w-48" seed="analytics-live">
          <StickyNoteTitle>Live now</StickyNoteTitle>
          <StickyNoteContent>
            {LIVE.readers} people are reading {LIVE.page}.
          </StickyNoteContent>
        </StickyNote>
      </header>

      <StatCards period={period} />

      <div className="grid gap-4 lg:grid-cols-3">
        <TrafficChart period={period} longName={range.long} className="lg:col-span-2" />
        <SourcesChart period={period} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <TopPages period={period} className="lg:col-span-3" />
        <Funnel period={period} longName={range.long} className="lg:col-span-2" />
      </div>
    </Sheet>
  )
}
