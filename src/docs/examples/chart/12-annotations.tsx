import * as React from "react"

import { BarChart, ChartContainer, ChartTooltip, LineChart, type ChartAnnotation, type ChartConfig, type ChartHighlight } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "Annotations and goal lines",
  description: "A note is a hand-drawn loop, an arrow and a line of script; a highlight marks a stretch of days with a highlighter, written after the chart appears. Point it at max, min, first, last, a category or an index; underline instead of circling; add a dashed goal line. Text is real DOM text and the note is part of the chart's spoken summary.",
  layout: "stack" as const,
}

const week = [
  { day: "Mon", sales: 12 },
  { day: "Tue", sales: 19 },
  { day: "Wed", sales: 8 },
  { day: "Thu", sales: 24 },
  { day: "Fri", sales: 16 },
  { day: "Sat", sales: 21 },
  { day: "Sun", sales: 14 },
]

const config = { sales: { label: "Sales", color: "var(--chart-1)" } } satisfies ChartConfig

const highlights: Record<string, ChartHighlight[]> = {
  "best day": [],
  "rainy day": [{ from: "Tue", to: "Wed", text: "storm" }],
  "both ends": [{ from: "Fri", to: "Sun", text: "weekend" }],
}

const notes: Record<string, ChartAnnotation[]> = {
  "best day": [{ at: "max", text: "best day!", pen: "blue" }],
  "rainy day": [{ at: "Wed", text: "rainy day", pen: "ink", shape: "underline", dx: 44, dy: -56 }],
  "both ends": [
    { at: "first", text: "slow start", pen: "red", shape: "loop" },
    { at: "last", text: "still going", pen: "green", shape: "loop" },
  ],
}

export default function Example() {
  const [which, setWhich] = React.useState("best day")
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Annotation">
        {Object.keys(notes).map((k) => (
          <Button key={k} size="sm" variant={k === which ? "default" : "outline"} aria-pressed={k === which} onClick={() => setWhich(k)}>
            {k}
          </Button>
        ))}
      </div>
      <ChartContainer config={config} className="aspect-auto h-64 w-full">
        <BarChart data={week} xKey="day" label="Sales per day" annotations={notes[which]} highlights={highlights[which]} references={[{ y: 18, label: "goal", pen: "red" }]} />
        <ChartTooltip />
      </ChartContainer>
      <ChartContainer config={config} className="aspect-auto h-48 w-full">
        <LineChart data={week} xKey="day" label="Sales per day, as a line" annotations={[{ at: "min", text: "dip", pen: "red", dx: -60, dy: -8 }, { at: "max", text: "peak", pen: "blue", dx: 60, dy: -8 }]} />
      </ChartContainer>
    </div>
  )
}
