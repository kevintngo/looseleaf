import { ChartContainer, ChartTooltip, Heatmap } from "@/components/ui/chart"

export const meta = {
  title: "Heat map",
  description: "A half year of days, each square coloured in a shade of one marker; or any grid of your own. Arrow keys walk it in two dimensions: left and right by week, up and down by day.",
  layout: "stack" as const,
}

const pages = Array.from({ length: 180 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 0, 1 + i))
  const wave = Math.sin(i / 9) + Math.sin(i / 3.3) + ((i * 7) % 5) / 2
  return { date: d.toISOString().slice(0, 10), value: wave > 0.6 ? Math.round(wave * 2) : 0 }
})

const hours = ["9am", "11am", "1pm", "3pm", "5pm"]
const week = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const busy = week.flatMap((day, r) => hours.map((h, c) => ({ day, hour: h, orders: ((r + 1) * (c + 2) * 3) % 17 })))

export default function Example() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <ChartContainer config={{}} className="aspect-[53/14] w-full">
        <Heatmap data={pages} unit="pages" label="Pages written per day" />
        <ChartTooltip />
      </ChartContainer>
      <ChartContainer config={{}} className="aspect-[16/10] w-full max-w-md">
        <Heatmap variant="grid" data={busy} rowKey="day" colKey="hour" valueKey="orders" unit="orders" slot={0} label="Orders by hour" rows={week} cols={hours} showLegend={false} />
        <ChartTooltip />
      </ChartContainer>
    </div>
  )
}
