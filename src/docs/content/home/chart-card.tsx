import { BarChart, ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const DATA = [
  { day: "Mon", signups: 42 },
  { day: "Tue", signups: 58 },
  { day: "Wed", signups: 35 },
  { day: "Thu", signups: 71 },
  { day: "Fri", signups: 64 },
  { day: "Sat", signups: 30 },
  { day: "Sun", signups: 22 },
]

const CONFIG = { signups: { label: "Signups", color: "var(--chart-3)" } } satisfies ChartConfig

export default function ChartCard() {
  return (
    <Card data-home="chart" fastener="clip" seed="home-chart" className="w-full gap-3 py-6">
      <CardHeader>
        <CardTitle>Signups</CardTitle>
        <CardDescription>This week. The record is circled.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CONFIG} className="aspect-auto h-56 w-full">
          <BarChart data={DATA} xKey="day" label="Signups per day this week" annotations={[{ at: "max", text: "launch day!", pen: "blue" }]} />
          <ChartTooltip />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
