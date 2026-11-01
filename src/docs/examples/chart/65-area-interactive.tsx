import * as React from "react"

import { AreaChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { daily, dayLabel, dayOfRow } from "./_data"

export const meta = {
  title: "Area: interactive",
  description: "A Select in the card header picks how much of the ninety-one days to draw. The chart redraws with its new data and stays quiet: the wipe-on plays once. Dates are cut from the row's own text, so nothing depends on a locale or a time zone.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const RANGES = { "90d": 91, "30d": 30, "7d": 7 } as const

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function Example() {
  const [range, setRange] = React.useState<keyof typeof RANGES>("90d")
  return (
    <Card className="mx-auto w-full max-w-md" fastener="pin">
      <CardHeader>
        <CardTitle>Area Chart - Interactive</CardTitle>
        <CardDescription>Showing total visitors for the last 3 months</CardDescription>
        <CardAction>
          <Select value={range} onValueChange={(v) => setRange(v as keyof typeof RANGES)}>
            <SelectTrigger size="sm" className="w-36" aria-label="Time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={daily.slice(-RANGES[range])} xKey="date" xFormatter={dayLabel} series={["mobile", "desktop"]} stacked label="Visitors per day" />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={dayOfRow} />} />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
