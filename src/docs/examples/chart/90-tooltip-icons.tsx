import { BarChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { activity, weekday } from "./_data"

export const meta = {
  title: "Tooltip: icons",
  description: "A config `icon` takes the place of the swatch in the tooltip (and in a legend, if there is one).",
  layout: "stack" as const,
  stage: "desk" as const,
}

const TimerIcon = () => <Icon name="timer" />
const WaveIcon = () => <Icon name="audio-waveform" />

const config = {
  running: { label: "Running", color: "var(--chart-1)", icon: TimerIcon },
  swimming: { label: "Swimming", color: "var(--chart-2)", icon: WaveIcon },
} satisfies ChartConfig

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Tooltip - Icons</CardTitle>
        <CardDescription>Tooltip with icons.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart data={activity} xKey="date" xFormatter={weekday} stacked showYAxis={false} label="Calories burned per session" />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} defaultIndex={1} />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
