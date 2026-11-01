import * as React from "react"

import { BarChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { daily, dayLabel, thousands, dayOfRow } from "./_data"

export const meta = {
  title: "Bar: interactive",
  description: "Two big buttons total the columns and choose which one the chart draws. They are ordinary toggle buttons with `aria-pressed`; the chart takes the chosen key as its only series.",
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
    <Card className="mx-auto w-full max-w-md" tape="top">
      <CardHeader>
        <CardTitle>Bar Chart - Interactive</CardTitle>
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
          <BarChart data={daily} xKey="date" xFormatter={dayLabel} series={[active]} label={`${config[active].label} visitors per day`} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={dayOfRow} />} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
