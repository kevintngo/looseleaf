import { BarChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export const meta = {
  title: "Tooltip content",
  description: "ChartTooltipContent keeps shadcn's props: indicator (dot, line, dashed), hideLabel, hideIndicator, labelFormatter and formatter. Or pass any element as content: it is cloned with active, payload and label. defaultIndex opens a tooltip on load.",
  layout: "stack" as const,
}

const rows = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
]

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <BarChart data={rows} xKey="month" xFormatter={(m) => String(m).slice(0, 3)} label="Indicator: line" />
        <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(l) => `In ${String(l)}`} />} defaultIndex={1} />
      </ChartContainer>
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <BarChart data={rows} xKey="month" xFormatter={(m) => String(m).slice(0, 3)} label="Formatter" />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(value, name) => (
                <span className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-script text-lg leading-none font-bold">{`${value} visits`}</span>
                </span>
              )}
            />
          }
          defaultIndex={2}
        />
      </ChartContainer>
    </div>
  )
}
