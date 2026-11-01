import { AreaChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { desktopOnly, short } from "./_data"

export const meta = {
  title: "Area: step",
  description: "`curve=\"step\"` holds each value until the next category, like a ledger. A config `icon` replaces the swatch in the tooltip and the legend.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const ActivityIcon = () => <Icon name="chart-line" />

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)", icon: ActivityIcon },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Area Chart - Step</CardTitle>
        <CardDescription>Showing total visitors for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={desktopOnly} xKey="month" xFormatter={short} curve="step" showYAxis={false} label="Desktop visitors per month" />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
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
