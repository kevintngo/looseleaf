import { BarChart, ChartContainer, ChartSwatch, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { activity, weekday } from "./_data"

export const meta = {
  title: "Tooltip: advanced",
  description: "A custom formatter that draws the swatch itself with `ChartSwatch` (the same chip the drawing uses) and adds a total row under the last series.",
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
        <CardTitle>Tooltip - Advanced</CardTitle>
        <CardDescription>Tooltip with custom formatter and total.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart data={activity} xKey="date" xFormatter={weekday} stacked showYAxis={false} label="Calories burned per session" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                className="w-[180px]"
                formatter={(value, name, item, index) => (
                  <>
                    <ChartSwatch palette={item.slot ?? 0} pattern={item.pattern} />
                    {name}
                    <div className="ms-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                      {value}
                      <span className="font-normal text-muted-foreground">kcal</span>
                    </div>
                    {index === 1 && (
                      <div className="mt-1.5 flex basis-full items-center border-t border-dashed pt-1.5 text-xs font-medium text-foreground">
                        Total
                        <div className="ms-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                          {Number(item.payload?.running) + Number(item.payload?.swimming)}
                          <span className="font-normal text-muted-foreground">kcal</span>
                        </div>
                      </div>
                    )}
                  </>
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
