import { RadialChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Radial: text",
  description: "A full circle filled to 80%: 200 of 250. Text in the hole, and the tooltip says how much of the goal is done.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  safari: { label: "Safari", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Radial Chart - Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square h-auto w-full max-w-[280px]">
          <RadialChart
            data={[{ browser: "safari", visitors: 200 }]}
            nameKey="browser"
            valueKey="visitors"
            max={250}
            startAngle={0}
            endAngle={360}
            label="Safari visitors against a goal of 250"
            centerLabel={{ value: "200", label: "Visitors" }}
          />
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
