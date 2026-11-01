import { BarChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { browsersActive } from "./_data"

export const meta = {
  title: "Bar: active",
  description: "One bar picked out: a highlighter swipe behind Firefox (`highlights`), and `defaultIndex` opens its tooltip before anyone touches the chart.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Bar Chart - Active</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart data={browsersActive} xKey="browser" showYAxis={false} highlights={[{ from: "firefox", to: "firefox" }]} label="Visitors by browser" />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} defaultIndex={2} />
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
