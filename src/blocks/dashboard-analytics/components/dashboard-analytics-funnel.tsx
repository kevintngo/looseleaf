import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Circled } from "@/components/ui/circled"
import { FUNNEL, formatNumber, type Period } from "@/blocks/dashboard-analytics/components/dashboard-analytics-data"

const config = { people: { label: "People", color: "var(--chart-3)" } } satisfies ChartConfig

function biggestDrop() {
  let worst = { from: FUNNEL[0].step, to: FUNNEL[1].step, kept: 1 }
  for (let i = 1; i < FUNNEL.length; i++) {
    const kept = FUNNEL[i].share / FUNNEL[i - 1].share
    if (kept < worst.kept) worst = { from: FUNNEL[i - 1].step, to: FUNNEL[i].step, kept }
  }
  return worst
}

export function Funnel({ period, longName, className }: { period: Period; longName: string; className?: string }) {
  const data = FUNNEL.map((f) => ({ step: f.step, people: Math.round(period.visitors * f.share) }))
  const drop = biggestDrop()
  const last = FUNNEL[FUNNEL.length - 1]
  return (
    <Card className={cn("min-w-0", className)} seed="analytics-funnel">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          From hello to paid
        </CardTitle>
        <CardDescription>Everyone who visited in {longName}, step by step</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full lg:h-88">
          <BarChart data={data} xKey="step" horizontal showValues valueFormatter={formatNumber} label={`Shoppers at each step of the checkout, ${longName}`} />
          <ChartTooltip />
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <p>
          Most people slip away between <strong>{drop.from.toLowerCase()}</strong> and <strong>{drop.to.toLowerCase()}</strong>: only{" "}
          <Circled tone="red" className="mx-1.5">{Math.round(drop.kept * 100)}%</Circled> go on.
        </p>
        <p className="text-muted-foreground">{Math.round(last.share * 1000) / 10}% of visitors end up paying.</p>
      </CardFooter>
    </Card>
  )
}
