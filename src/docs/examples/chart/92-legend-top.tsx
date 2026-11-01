import { BarChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { visitors, short, monthOfRow } from "./_data"

export const meta = {
  title: "Legend: on top",
  description: "Put `<ChartLegend verticalAlign=\"top\" />` before the chart and it sits above it, with its padding on the side that faces the drawing.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Legend - Top</CardTitle>
        <CardDescription>A legend above the chart.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <ChartLegend verticalAlign="top" />
          <BarChart data={visitors} xKey="month" xFormatter={short} showYAxis={false} label="Visitors per month, by device" />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={monthOfRow} />} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
