import { AreaChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { visitorsShare, short, monthOfRow } from "./_data"

export const meta = {
  title: "Area: stacked to 100%",
  description: "Each month scaled to its own total, so the layers show shares. The rows are turned into percentages first (`visitorsShare` in `_data.ts`), then stacked with `yDomain={[0, 100]}`; the axis gets its % from `yFormatter`.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  other: { label: "Other", color: "var(--chart-3)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Area Chart - Stacked Expanded</CardTitle>
        <CardDescription>Share of the month's visitors, in percent</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart
            data={visitorsShare}
            xKey="month"
            xFormatter={short}
            series={["other", "mobile", "desktop"]}
            stacked
            yDomain={[0, 100]}
            yFormatter={(v) => `${v}%`}
            label="Share of visitors by device, per month"
          />
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
