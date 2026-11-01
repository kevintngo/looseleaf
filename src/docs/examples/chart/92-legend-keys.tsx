import { BarChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { visitorsThree, short, monthOfRow } from "./_data"

export const meta = {
  title: "Legend: some of the series",
  description: "`keys` lists only these entries, in this order: the chart draws three series, the key names two of them, mobile first.",
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
        <CardTitle>Legend - Keys</CardTitle>
        <CardDescription>Only the series you name, in the order you name them.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart data={visitorsThree} xKey="month" xFormatter={short} showYAxis={false} label="Visitors per month, by device" />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={monthOfRow} />} />
          <ChartLegend keys={["mobile", "desktop"]} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
