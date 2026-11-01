import * as React from "react"

import { DonutChart, ChartCenterLabel, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { monthSlices, thousands } from "./_data"

export const meta = {
  title: "Pie: interactive",
  description: "A Select in the header chooses the month whose slice is lit (`defaultIndex`); the number in the hole follows. `defaultIndex` is read when the chart mounts, so the chart is keyed on the month and draws itself again. Hovering any slice still takes over.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  january: { label: "January", color: "var(--chart-1)" },
  february: { label: "February", color: "var(--chart-2)" },
  march: { label: "March", color: "var(--chart-3)" },
  april: { label: "April", color: "var(--chart-4)" },
  may: { label: "May", color: "var(--chart-5)" },
} satisfies ChartConfig

export default function Example() {
  const [month, setMonth] = React.useState("january")
  const index = monthSlices.findIndex((s) => s.month === month)
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Pie Chart - Interactive</CardTitle>
        <CardDescription>January - May 2024, desktop visitors</CardDescription>
        <CardAction>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger size="sm" className="w-36" aria-label="Month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {monthSlices.map((s) => (
                <SelectItem key={s.month} value={s.month}>
                  {config[s.month as keyof typeof config].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer key={month} config={config} className="mx-auto aspect-square h-auto w-full max-w-[280px]">
          <DonutChart
            data={monthSlices}
            nameKey="month"
            valueKey="desktop"
            showLabels={false}
            label="Desktop visitors by month"
            centerLabel={({ active }) => {
              const shown = active ?? { value: monthSlices[index].desktop, name: String(config[month as keyof typeof config].label) }
              return <ChartCenterLabel value={thousands(shown.value)} label={shown.name} />
            }}
          />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} defaultIndex={index} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
