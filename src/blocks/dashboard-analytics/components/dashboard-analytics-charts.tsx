import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, DonutChart, type ChartConfig } from "@/components/ui/chart"
import { formatDay, formatNumber, SOURCES, type Period } from "@/blocks/dashboard-analytics/components/dashboard-analytics-data"

const trafficConfig = {
  visitors: { label: "This period", color: "var(--chart-1)" },
  previous: { label: "Period before", color: "var(--chart-2)" },
} satisfies ChartConfig

export function TrafficChart({ period, longName, className }: { period: Period; longName: string; className?: string }) {
  const data = period.rows.map((r, i) => ({ day: r[0], visitors: r[1], previous: period.previous[i]?.[1] ?? null }))
  return (
    <Card className={cn("min-w-0", className)} seed="analytics-traffic" tape="top" tapeKind="washi-stripes">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Visitors, day by day
        </CardTitle>
        <CardDescription>Every day in {longName}, against the days just before</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trafficConfig} className="aspect-auto h-64 w-full">
          <AreaChart
            data={data}
            xKey="day"
            kinds={{ visitors: "area", previous: "line" }}
            xFormatter={(v) => formatDay(String(v))}
            label={`Visitors per day in ${longName}, compared with the period before`}
            annotations={[{ at: "max", text: "best day", series: "visitors" }]}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(v) => formatDay(String(v))} />} />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const sourceConfig = {
  search: { label: "Search", color: "var(--chart-1)" },
  direct: { label: "Direct", color: "var(--chart-2)" },
  social: { label: "Social", color: "var(--chart-3)" },
  referral: { label: "Referral", color: "var(--chart-4)" },
  email: { label: "Email", color: "var(--chart-5)" },
} satisfies ChartConfig

export function SourcesChart({ period, className }: { period: Period; className?: string }) {
  const data = SOURCES.map((s) => ({ source: s.source.toLowerCase(), visitors: Math.round(period.visitors * s.share) }))
  const total = data.reduce((a, d) => a + d.visitors, 0)
  return (
    <Card className={cn("min-w-0", className)} seed="analytics-sources">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Where they came from
        </CardTitle>
        <CardDescription>Visitors by the door they used</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={sourceConfig} className="aspect-auto h-64 w-full">
          <DonutChart data={data} nameKey="source" valueKey="visitors" label="Visitors by source" showLabels={false} centerLabel={{ value: formatNumber(total), label: "visitors" }} />
          <ChartTooltip />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
