import { ChartContainer, ChartTooltip, ChartTooltipContent, Gauge, RadialChart, type ChartConfig } from "@/components/ui/chart"

export const meta = {
  title: "Radial bars and gauge",
  description: "Concentric arcs in pale tracks, one ring per row, and a dial with marker zones and a red felt needle. The gauge is a role=meter: assistive tech reads its value, minimum and maximum.",
  layout: "stack" as const,
}

const rings = [
  { name: "move", value: 78 },
  { name: "exercise", value: 52 },
  { name: "stand", value: 91 },
]

const config = {
  move: { label: "Move", color: "var(--chart-1)" },
  exercise: { label: "Exercise", color: "var(--chart-2)" },
  stand: { label: "Stand", color: "var(--chart-3)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <div className="mx-auto grid w-full max-w-3xl items-center gap-8 sm:grid-cols-2">
      <ChartContainer config={config} className="aspect-square h-auto w-full">
        <RadialChart data={rings} nameKey="name" valueKey="value" label="Daily rings" centerLabel={{ value: "78%", label: "of goal" }} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
      </ChartContainer>
      <Gauge value={68} label="Server load" zones={[{ to: 40, tone: "good" }, { to: 75, tone: "warn" }, { to: 100, tone: "bad" }]} valueFormatter={(v) => `${v}%`} />
    </div>
  )
}
