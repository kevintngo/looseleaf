import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, RadarChart, type ChartConfig } from "@/components/ui/chart"

export const meta = {
  title: "Radar chart",
  description: "A pencil web with a washed and shaded shape per series. The spokes are the keyboard stops: arrow keys walk from axis to axis and the tooltip reads every series on that spoke.",
  layout: "stack" as const,
}

const skills = [
  { skill: "Speed", ada: 80, bo: 50 },
  { skill: "Power", ada: 60, bo: 85 },
  { skill: "Range", ada: 90, bo: 45 },
  { skill: "Craft", ada: 70, bo: 80 },
  { skill: "Wit", ada: 55, bo: 90 },
  { skill: "Luck", ada: 65, bo: 40 },
]

const config = {
  ada: { label: "Ada", color: "var(--chart-1)" },
  bo: { label: "Bo", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <ChartContainer config={config} className="mx-auto aspect-auto h-80 w-full max-w-md">
      <RadarChart data={skills} xKey="skill" max={100} label="Skills of Ada and Bo" />
      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
      <ChartLegend />
    </ChartContainer>
  )
}
