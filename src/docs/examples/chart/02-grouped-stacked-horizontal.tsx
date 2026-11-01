import * as React from "react"

import { BarChart, ChartContainer, ChartLegend, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "Grouped, stacked, sideways",
  description: "One dataset, four ways to lay it out. Each series keeps its colour and its pencil pattern (hatching, dots, cross-hatching), so the bars stay apart in greyscale. Negative values hang below the line.",
  layout: "stack" as const,
}

const rows = [
  { quarter: "Q1", income: 120, costs: -60, tax: -12 },
  { quarter: "Q2", income: 150, costs: -90, tax: -18 },
  { quarter: "Q3", income: 90, costs: -40, tax: -9 },
  { quarter: "Q4", income: 180, costs: -110, tax: -22 },
]

const config = {
  income: { label: "Income", color: "var(--chart-1)" },
  costs: { label: "Costs", color: "var(--chart-2)" },
  tax: { label: "Tax", color: "var(--chart-3)" },
} satisfies ChartConfig

const modes = ["grouped", "stacked", "sideways"] as const

export default function Example() {
  const [mode, setMode] = React.useState<(typeof modes)[number]>("grouped")
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <div className="flex gap-2" role="group" aria-label="Layout">
        {modes.map((m) => (
          <Button key={m} size="sm" variant={m === mode ? "default" : "outline"} aria-pressed={m === mode} onClick={() => setMode(m)}>
            {m}
          </Button>
        ))}
      </div>
      <ChartContainer config={config} className="aspect-auto h-72 w-full">
        <BarChart data={rows} xKey="quarter" stacked={mode === "stacked"} horizontal={mode === "sideways"} label="Income, costs and tax by quarter" />
        <ChartTooltip />
        <ChartLegend />
      </ChartContainer>
    </div>
  )
}
