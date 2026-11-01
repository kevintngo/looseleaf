import { LineChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { visitors, short, monthOfRow } from "./_data"

export const meta = {
  title: "Line: custom dots",
  description: "The marker shape is a config choice per series: circle, square, triangle, diamond, cross or plus. Here desktop is drawn with diamonds and mobile with squares, and the legend shows the same little line sample.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)", marker: "diamond" },
  mobile: { label: "Mobile", color: "var(--chart-2)", marker: "square" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Line Chart - Custom Dots</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <LineChart data={visitors} xKey="month" xFormatter={short} dots showYAxis={false} label="Visitors per month, by device" />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={monthOfRow} />} />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <Icon name="trending-up" size={16} />
        </div>
        <div className="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>
      </CardFooter>
    </Card>
  )
}
