import { BarChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { activity, weekday } from "./_data"

export const meta = {
  title: "Tooltip: formatter",
  description: "`formatter` replaces a whole row. It gets the value, the series name, the item and the row of data, and returns any markup, here a unit after the number.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  running: { label: "Running", color: "var(--chart-1)" },
  swimming: { label: "Swimming", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Tooltip - Formatter</CardTitle>
        <CardDescription>Tooltip with custom formatter.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart data={activity} xKey="date" xFormatter={weekday} stacked showYAxis={false} label="Calories burned per session" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => (
                  <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                    {name}
                    <div className="ms-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                      {value}
                      <span className="font-normal text-muted-foreground">kcal</span>
                    </div>
                  </div>
                )}
              />
            }
            defaultIndex={1}
          />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
