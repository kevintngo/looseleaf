import { ChartCenterLabel, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, DonutChart, PieChart, type ChartConfig } from "@/components/ui/chart"

export const meta = {
  title: "Pie and donut",
  description: "Slices coloured in with a marker, separated by felt lines, each with its own pencil pattern. The donut's hole is DOM text: it shows the total, and the slice under the pointer or the arrow keys.",
  layout: "stack" as const,
}

const browsers = [
  { browser: "chrome", visitors: 275 },
  { browser: "safari", visitors: 200 },
  { browser: "firefox", visitors: 187 },
  { browser: "edge", visitors: 173 },
  { browser: "other", visitors: 90 },
]

const config = {
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
      <ChartContainer config={config} className="aspect-square h-auto w-full">
        <PieChart data={browsers} nameKey="browser" valueKey="visitors" label="Visitors by browser" />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend />
      </ChartContainer>
      <ChartContainer config={config} className="aspect-square h-auto w-full">
        <DonutChart
          data={browsers}
          nameKey="browser"
          valueKey="visitors"
          label="Visitors by browser, donut"
          centerLabel={({ total, active }) => <ChartCenterLabel value={active ? active.value : total} label={active ? active.name : "visitors"} />}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend />
      </ChartContainer>
    </div>
  )
}
