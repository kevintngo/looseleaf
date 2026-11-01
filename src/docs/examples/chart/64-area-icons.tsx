import { AreaChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { visitors, short, monthOfRow } from "./_data"

export const meta = {
  title: "Area: icons",
  description: "A config `icon` stands in for the swatch in the legend and the tooltip. Here they are the two hand-drawn trend arrows.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const TrendingDownIcon = () => <Icon name="trending-down" />
const TrendingUpIcon = () => <Icon name="trending-up" />

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)", icon: TrendingDownIcon },
  mobile: { label: "Mobile", color: "var(--chart-2)", icon: TrendingUpIcon },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Area Chart - Icons</CardTitle>
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
