import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkline } from "@/components/ui/chart"
import { Icon } from "@/components/ui/icon"
import { change, formatDuration, formatNumber, signed, type Period } from "@/blocks/dashboard-analytics/components/dashboard-analytics-data"

type Stat = {
  id: string
  label: string
  value: string
  delta: number
  unit: string
  better: "up" | "down"
  data: number[]
  variant: "line" | "area" | "bar"
}

const SPARK_SLOT = [0, 1, 4, 3]

function statsOf(p: Period): Stat[] {
  return [
    { id: "visitors", label: "Visitors", value: formatNumber(p.visitors), delta: change(p.visitors, p.previousVisitors), unit: "%", better: "up", data: p.rows.map((r) => r[1]), variant: "line" },
    { id: "pageviews", label: "Pageviews", value: formatNumber(p.pageviews), delta: change(p.pageviews, p.previousPageviews), unit: "%", better: "up", data: p.rows.map((r) => r[2]), variant: "area" },
    {
      id: "bounce",
      label: "Bounce rate",
      value: `${p.bounce}%`,
      delta: Math.round((p.bounce - p.previousBounce) * 10) / 10,
      unit: " pts",
      better: "down",
      data: p.rows.map((r) => r[3] / 10),
      variant: "line",
    },
    { id: "session", label: "Time on site", value: formatDuration(p.session), delta: change(p.session, p.previousSession), unit: "%", better: "up", data: p.rows.map((r) => r[4]), variant: "bar" },
  ]
}

export function StatCards({ period }: { period: Period }) {
  return (
    <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statsOf(period).map((s, i) => {
        const good = s.better === "up" ? s.delta >= 0 : s.delta <= 0
        return (
          <Card key={s.id} className="@container/card gap-2 py-4" seed={`analytics-stat-${s.id}`}>
            <CardHeader className="gap-0.5">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums @[280px]/card:text-3xl">{s.value}</CardTitle>
              <CardAction className="pt-1">
                <Sparkline data={s.data} variant={s.variant} slot={SPARK_SLOT[i]} label={`${s.label}, one point per day`} />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-wrap gap-x-1.5 text-sm text-muted-foreground">
              <span className={good ? "inline-flex items-center gap-1 font-bold text-green" : "inline-flex items-center gap-1 font-bold text-red"}>
                <Icon name={s.delta >= 0 ? "arrow-up" : "arrow-down"} size={14} />
                {signed(s.delta, s.unit)}
                <span className="sr-only">{good ? ", better" : ", worse"}</span>
              </span>
              <span>on the {period.days} days before</span>
            </CardFooter>
          </Card>
        )
      })}
    </section>
  )
}
