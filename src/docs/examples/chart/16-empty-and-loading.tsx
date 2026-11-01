import * as React from "react"

import { BarChart, ChartContainer, DonutChart, LineChart, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "Empty and loading",
  description: "A chart with nothing to draw sketches its axes and a wandering pencil line and says so; a loading chart pulses dashed ghost bars and is aria-busy. Neither is interactive, and both keep their name and a spoken summary.",
  layout: "stack" as const,
}

const rows = [
  { day: "Mon", n: 12 },
  { day: "Tue", n: 19 },
  { day: "Wed", n: 8 },
  { day: "Thu", n: 24 },
]

const config = { n: { label: "Orders", color: "var(--chart-1)" } } satisfies ChartConfig

export default function Example() {
  const [state, setState] = React.useState<"ready" | "loading" | "empty">("loading")
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex gap-2" role="group" aria-label="State">
        {(["loading", "empty", "ready"] as const).map((s) => (
          <Button key={s} size="sm" variant={s === state ? "default" : "outline"} aria-pressed={s === state} onClick={() => setState(s)}>
            {s}
          </Button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <ChartContainer config={config} className="aspect-auto h-48 w-full">
          <BarChart data={state === "empty" ? [] : rows} xKey="day" series={["n"]} loading={state === "loading"} emptyText="No orders yet" label="Orders" />
        </ChartContainer>
        <ChartContainer config={config} className="aspect-auto h-48 w-full">
          <LineChart data={state === "empty" ? [] : rows} xKey="day" series={["n"]} loading={state === "loading"} emptyText="Nothing to plot" label="Orders, as a line" />
        </ChartContainer>
        <ChartContainer config={{}} className="aspect-auto h-48 w-full">
          <DonutChart data={state === "empty" ? [] : rows} nameKey="day" valueKey="n" loading={state === "loading"} emptyText="No data" label="Orders by day" showLabels={false} />
        </ChartContainer>
      </div>
    </div>
  )
}
