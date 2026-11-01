import { BarChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { activity, weekday, dateOfRow } from "./_data"

export const meta = {
  title: "Tooltip: label formatter",
  description: "`labelFormatter` turns the label into something to read: 2024-07-16 becomes July 16, 2024. It receives the label and the tooltip rows, and each row carries its data, so the whole date can be read from there.",
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
        <CardTitle>Tooltip - Label Formatter</CardTitle>
        <CardDescription>Tooltip with label formatter.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart data={activity} xKey="date" xFormatter={weekday} stacked showYAxis={false} label="Calories burned per session" />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={dateOfRow} />} defaultIndex={1} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
