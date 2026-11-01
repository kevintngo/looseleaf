import * as React from "react"

import { ChartContainer, ChartLegend, ChartTooltip, LineChart, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "Legend and hidden series",
  description: "Every legend entry is a button with aria-pressed: switch a series off (struck through) and on again. A series keeps its colour, marker and dash while it is away. Control it from outside with hiddenSeries.",
  layout: "stack" as const,
}

const rows = [
  { month: "Jan", desktop: 186, mobile: 80, tablet: 40 },
  { month: "Feb", desktop: 305, mobile: 200, tablet: 66 },
  { month: "Mar", desktop: 237, mobile: 120, tablet: 90 },
  { month: "Apr", desktop: 73, mobile: 190, tablet: 84 },
  { month: "May", desktop: 209, mobile: 130, tablet: 72 },
  { month: "Jun", desktop: 214, mobile: 140, tablet: 110 },
]

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  tablet: { label: "Tablet", color: "var(--chart-3)" },
} satisfies ChartConfig

export default function Example() {
  const [hidden, setHidden] = React.useState<string[]>(["tablet"])
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setHidden([])}>
          all
        </Button>
        <Button size="sm" variant="outline" onClick={() => setHidden(["desktop", "tablet"])}>
          only mobile
        </Button>
        <Button size="sm" variant="outline" onClick={() => setHidden(["mobile", "tablet"])}>
          only desktop
        </Button>
      </div>
      <ChartContainer config={config} hiddenSeries={hidden} onHiddenSeriesChange={setHidden} className="aspect-auto h-64 w-full">
        <LineChart data={rows} xKey="month" label="Visitors by device" />
        <ChartTooltip />
        <ChartLegend />
      </ChartContainer>
    </div>
  )
}
