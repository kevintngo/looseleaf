import { AreaChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "Area chart",
  description: "The space under the line is washed with the series colour and shaded in pencil: hatching, dots, cross-hatching. Stacked areas add up; the tooltip lists every layer.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const traffic = [
  { month: "Jan", direct: 186, search: 80, social: 40 },
  { month: "Feb", direct: 305, search: 200, social: 66 },
  { month: "Mar", direct: 237, search: 120, social: 90 },
  { month: "Apr", direct: 73, search: 190, social: 84 },
  { month: "May", direct: 209, search: 130, social: 72 },
  { month: "Jun", direct: 214, search: 140, social: 110 },
]

const config = {
  direct: { label: "Direct", color: "var(--chart-1)" },
  search: { label: "Search", color: "var(--chart-2)" },
  social: { label: "Social", color: "var(--chart-3)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-xl" seed="area">
      <CardHeader>
        <CardTitle>Traffic by source</CardTitle>
        <CardDescription>Visits per month, stacked</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={traffic} xKey="month" stacked label="Visits by source, January to June" />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
