import * as React from "react"

import { BarChart, ChartContainer, ChartLegend, ChartTooltip, LineChart, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "Color is not the only channel",
  description: "Every series carries a pencil pattern (hatching, dots, cross-hatching, rules, scribble) on its marks, and a marker shape and a dash pattern on its lines. Switch to grayscale to see the chart still reads; switch the patterns off (`patterns={false}`) to see what plain color would have left you.",
  layout: "stack" as const,
}

const rows = [
  { quarter: "Q1", north: 120, south: 90, east: 60, west: 40 },
  { quarter: "Q2", north: 150, south: 70, east: 80, west: 55 },
  { quarter: "Q3", north: 110, south: 100, east: 95, west: 30 },
  { quarter: "Q4", north: 180, south: 120, east: 70, west: 65 },
]

const config = {
  north: { label: "North", color: "var(--chart-1)" },
  south: { label: "South", color: "var(--chart-2)" },
  east: { label: "East", color: "var(--chart-3)" },
  west: { label: "West", color: "var(--chart-4)" },
} satisfies ChartConfig

export default function Example() {
  const [grey, setGrey] = React.useState(true)
  const [patterns, setPatterns] = React.useState(true)
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={grey ? "default" : "outline"} aria-pressed={grey} onClick={() => setGrey((g) => !g)}>
          grayscale
        </Button>
        <Button size="sm" variant={patterns ? "default" : "outline"} aria-pressed={patterns} onClick={() => setPatterns((p) => !p)}>
          patterns
        </Button>
      </div>
      <div className={`grid gap-6 sm:grid-cols-2 ${grey ? "grayscale" : ""}`}>
        <ChartContainer config={config} patterns={patterns ? "auto" : false} className="aspect-auto h-64 w-full">
          <BarChart data={rows} xKey="quarter" label="Sales by region, bars" showValues={false} />
          <ChartTooltip />
          <ChartLegend />
        </ChartContainer>
        <ChartContainer config={config} patterns={patterns ? "auto" : false} className="aspect-auto h-64 w-full">
          <LineChart data={rows} xKey="quarter" label="Sales by region, lines" dots />
          <ChartTooltip />
          <ChartLegend />
        </ChartContainer>
      </div>
    </div>
  )
}
