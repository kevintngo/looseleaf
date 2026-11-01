import { LineChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { visitors, short, monthOfRow } from "./_data"

export const meta = {
  title: "Legend: a plain key",
  description: "`toggle={false}` makes the legend a plain key: swatches and words, no buttons. Use it where the chart should not change.",
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
        <CardTitle>Legend - Plain Key</CardTitle>
        <CardDescription>A legend that only names the series.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <LineChart data={visitors} xKey="month" xFormatter={short} showYAxis={false} label="Visitors per month, by device" />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={monthOfRow} />} />
          <ChartLegend toggle={false} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
