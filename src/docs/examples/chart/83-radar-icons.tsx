import { RadarChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { visitors } from "./_data"

export const meta = {
  title: "Radar: icons",
  description: "A config `icon` stands in for the swatch in the legend and the tooltip.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const ArrowDownIcon = () => <Icon name="arrow-down" />
const ArrowUpIcon = () => <Icon name="arrow-up" />

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)", icon: ArrowDownIcon },
  mobile: { label: "Mobile", color: "var(--chart-2)", icon: ArrowUpIcon },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Radar Chart - Icons</CardTitle>
        <CardDescription>Showing total visitors for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-72 w-full">
          <RadarChart data={visitors} xKey="month" label="Visitors per month, by device" />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
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
