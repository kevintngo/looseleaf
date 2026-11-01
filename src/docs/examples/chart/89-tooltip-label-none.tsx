import { BarChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { activity, weekday } from "./_data"

export const meta = {
  title: "Tooltip: no label",
  description: "`hideLabel` drops the category name, and `hideIndicator` the swatches: a bare list of values.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  running: { label: "Running", color: "var(--chart-1)" },
  swimming: { label: "Swimming", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Tooltip - No Label</CardTitle>
        <CardDescription>Tooltip with no label.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart data={activity} xKey="date" xFormatter={weekday} stacked showYAxis={false} label="Calories burned per session" />
          <ChartTooltip content={<ChartTooltipContent hideIndicator hideLabel />} defaultIndex={1} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
