import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, LineChart, type ChartConfig } from "@/components/ui/chart"

export const meta = {
  title: "Line chart",
  description: "A felt line per series, with a marker shape and a dash pattern for each so lines survive black-and-white print. The legend switches series off; the tooltip follows the pointer and the arrow keys.",
  layout: "stack" as const,
}

const visitors = [
  { month: "Jan", desktop: 186, mobile: 80, tablet: 40 },
  { month: "Feb", desktop: 305, mobile: 200, tablet: 66 },
  { month: "Mar", desktop: 237, mobile: 120, tablet: 90 },
  { month: "Apr", desktop: 73, mobile: 190, tablet: 84 },
  { month: "May", desktop: 209, mobile: 130, tablet: 72 },
  { month: "Jun", desktop: 214, mobile: 140, tablet: 110 },
]

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  tablet: { label: "Tablet", color: "var(--chart-3)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <ChartContainer config={config} className="mx-auto aspect-auto h-72 w-full max-w-xl">
      <LineChart data={visitors} xKey="month" label="Visitors by device, January to June" annotations={[{ at: "max", series: "desktop", text: "launch", pen: "red" }]} />
      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
      <ChartLegend />
    </ChartContainer>
  )
}
