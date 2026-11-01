import * as React from "react"

import { AreaChart, ChartContainer, ChartTooltip, Sparkline, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "Streaming data",
  description: "New points arrive every second and the chart is drawn again, not reflowed: the hand stays the same, so the line seems to move by itself. The wipe-on animation plays once; a redraw is silent. Pause to read the tooltip.",
  layout: "stack" as const,
}

const config = { rps: { label: "Requests / s", color: "var(--chart-2)" } } satisfies ChartConfig

const sample = (t: number) => Math.round(120 + 50 * Math.sin(t / 5) + 22 * Math.sin(t / 1.7) + ((t * 37) % 9))

export default function Example() {
  const [tick, setTick] = React.useState(40)
  const [running, setRunning] = React.useState(true)
  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [running])
  const data = React.useMemo(() => Array.from({ length: 30 }, (_, i) => ({ t: `${tick - 29 + i}s`, rps: sample(tick - 29 + i) })), [tick])
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <div className="flex items-center gap-4">
        <Button size="sm" variant={running ? "outline" : "default"} onClick={() => setRunning((r) => !r)}>
          {running ? "pause" : "resume"}
        </Button>
        <span className="font-script text-2xl tabular-nums">{data[data.length - 1].rps}</span>
        <Sparkline data={data} dataKey="rps" label="Requests per second, last 30 seconds" className="h-8 w-24" />
      </div>
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <AreaChart data={data} xKey="t" curve="smooth" label="Requests per second" yDomain={[0, 240]} />
        <ChartTooltip />
      </ChartContainer>
    </div>
  )
}
