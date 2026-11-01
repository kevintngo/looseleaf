import { ChartContainer, ChartLegend, ChartTooltip, ScatterChart, type ChartConfig } from "@/components/ui/chart"

export const meta = {
  title: "Scatter and bubbles",
  description: "Points on two number lines, each series with its own marker shape (circle, square, triangle). Give a size key and the points grow into bubbles. Long point clouds are thinned so the drawing stays light.",
  layout: "stack" as const,
}

const cloud = Array.from({ length: 36 }, (_, i) => {
  const x = 20 + i * 2.2 + ((i * 13) % 7)
  return { height: Math.round(x), cats: 30 + i * 1.1 + ((i * 29) % 19), dogs: 24 + i * 0.7 + ((i * 17) % 23), age: 2 + ((i * 5) % 14) }
})

const config = {
  cats: { label: "Cats", color: "var(--chart-1)" },
  dogs: { label: "Dogs", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function Example() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
      <ChartContainer config={config} className="aspect-auto h-64 w-full">
        <ScatterChart data={cloud} xKey="height" series={["cats", "dogs"]} xLabel="Height" label="Weight by height for cats and dogs" />
        <ChartTooltip />
        <ChartLegend />
      </ChartContainer>
      <ChartContainer config={{ cats: { label: "Cats", color: "var(--chart-3)" } }} className="aspect-auto h-64 w-full">
        <ScatterChart data={cloud} xKey="height" series={["cats"]} sizeKey="age" xLabel="Height" label="Weight by height, sized by age" />
        <ChartTooltip />
      </ChartContainer>
    </div>
  )
}
