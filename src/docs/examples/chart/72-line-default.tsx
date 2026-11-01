import { LineChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { desktopOnly, short } from "./_data"

export const meta = {
  title: "Line: default",
  description: "One felt-tip pull through the points, smoothed so it never overshoots a peak. `dots={false}` leaves the markers out; the hand-written note circles the dip. A paper clip holds the card.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md" fastener="clip">
      <CardHeader>
        <CardTitle>Line Chart</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <LineChart data={desktopOnly} xKey="month" xFormatter={short} dots={false} showYAxis={false} label="Desktop visitors per month" annotations={[{ at: "min", text: "quiet April", pen: "red" }]} />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
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
