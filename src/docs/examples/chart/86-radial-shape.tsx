import { RadialChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Radial: shape",
  description: "One ring on a three-quarter dial with its number in the middle: 1,260 visitors against a goal of 1,500. The hole is DOM text, so it can hold anything.",
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
        <CardTitle>Radial Chart - Shape</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square h-auto w-full max-w-[280px]">
          <RadialChart
            data={[{ browser: "safari", visitors: 1260 }]}
            nameKey="browser"
            valueKey="visitors"
            max={1500}
            endAngle={270}
            label="Safari visitors against a goal of 1,500"
            centerLabel={{ value: "1,260", label: "Visitors" }}
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
