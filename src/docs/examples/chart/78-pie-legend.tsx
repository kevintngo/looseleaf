import { PieChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { browsers } from "./_data"

export const meta = {
  title: "Pie: legend",
  description: "`<ChartLegend />` names the slices with the swatches the drawing uses, and each entry switches its slice off; the pie redraws from the rest.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const config = {
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Pie Chart - Legend</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square h-auto w-full max-w-[280px]">
          <PieChart data={browsers} nameKey="browser" valueKey="visitors" showLabels={false} label="Visitors by browser" />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
