import * as React from "react"

import { LineChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { daily, dayLabel, thousands, dayOfRow } from "./_data"

export const meta = {
  title: "Line: interactive",
  description: "The same two-button header as the bar version; the chart draws the chosen key as a single line. Dates on the axis are cut from the row's text, with no locale or time zone involved.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const KEYS = ["desktop", "mobile"] as const
const totals = { desktop: daily.reduce((sum, d) => sum + d.desktop, 0), mobile: daily.reduce((sum, d) => sum + d.mobile, 0) }

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function Example() {
  const [active, setActive] = React.useState<(typeof KEYS)[number]>("desktop")
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Line Chart - Interactive</CardTitle>
        <CardDescription>Showing total visitors for the last 3 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {KEYS.map((key) => (
            <Button key={key} variant={active === key ? "default" : "outline"} aria-pressed={active === key} onClick={() => setActive(key)} className="h-auto flex-col items-start gap-1 py-2">
              <span className="text-xs">{config[key].label}</span>
              <span className="font-script text-2xl leading-none font-bold">{thousands(totals[key])}</span>
            </Button>
          ))}
        </div>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <LineChart data={daily} xKey="date" xFormatter={dayLabel} series={[active]} dots={false} label={`${config[active].label} visitors per day`} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={dayOfRow} />} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
