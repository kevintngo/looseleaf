"use client"

import * as React from "react"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { REFERENCE_DAY, visitors } from "@/blocks/dashboard-01/components/dashboard-01-data"

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

const RANGES = [
  { value: "90d", label: "Last 3 months", days: 90 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "7d", label: "Last 7 days", days: 7 },
] as const

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatDay(iso: string): string {
  const [, month, day] = iso.split("-")
  return `${MONTHS[Number(month) - 1] ?? month} ${Number(day)}`
}

function cutoff(days: number): string {
  const d = new Date(`${REFERENCE_DAY}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [range, setRange] = React.useState<string>("90d")

  React.useEffect(() => {
    if (isMobile) setRange("7d")
  }, [isMobile])

  const days = RANGES.find((r) => r.value === range)?.days ?? 90
  const start = cutoff(days)
  const data = React.useMemo(() => visitors.filter((row) => row.date >= start), [start])
  const current = RANGES.find((r) => r.value === range)?.label ?? "Last 3 months"

  return (
    <Card className="@container/card [&>[data-slot=fastener]]:left-10 @[400px]/card:[&>[data-slot=fastener]]:left-1/2" fastener="pin" seed="s01-visitors">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Total visitors
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Total for the {current.toLowerCase()}</span>
          <span className="@[540px]/card:hidden">{current}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => v && setRange(v)}
            variant="outline"
            aria-label="Time range"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            {RANGES.map((r) => (
              <ToggleGroupItem key={r.value} value={r.value}>
                {r.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden" size="sm" aria-label="Time range">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart
            data={data}
            xKey="date"
            stacked
            xFormatter={(v) => formatDay(String(v))}
            label={`Visitors per day, ${current.toLowerCase()}`}
            annotations={[{ at: "max", text: "best day", series: "desktop" }]}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" labelFormatter={(v) => formatDay(String(v))} />} />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
