import { AreaChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { visitors, short, monthOfRow } from "./_data"

export const meta = {
  title: "Area: legend",
  description: "`<ChartLegend />` lists the series with the very swatches the drawing uses. Every entry is a button: switch a series off and it is struck through and leaves the chart.",
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
        <CardTitle>Area Chart - Legend</CardTitle>
        <CardDescription>Showing total visitors for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={visitors} xKey="month" xFormatter={short} series={["mobile", "desktop"]} stacked showYAxis={false} label="Visitors per month, stacked" />
          <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={monthOfRow} />} />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <Icon name="trending-up" size={16} />
        </div>
        <div className="leading-none text-muted-foreground">January - June 2024</div>
      </CardFooter>
    </Card>
  )
}
