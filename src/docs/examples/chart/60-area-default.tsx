import { AreaChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { desktopOnly, short, monthOfRow } from "./_data"

export const meta = {
  title: "Area: default",
  description: "One series washed in marker and shaded in pencil, a felt line along the top. Hover or use the arrow keys: the tooltip's `indicator=\"line\"` gives it a bar instead of a chip, and a hand-drawn note points at the peak. The axis says Jan; `labelFormatter` reads the whole month from the row for the slip.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Area Chart</CardTitle>
        <CardDescription>Showing total visitors for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={desktopOnly} xKey="month" xFormatter={short} showYAxis={false} label="Desktop visitors per month" annotations={[{ at: "max", text: "peak!", pen: "blue" }]} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={monthOfRow} />} />
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
