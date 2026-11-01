import * as React from "react"

import { InkProvider } from "@/lib/ink/react"
import { AreaChart, BarChart, ChartContainer, ChartLegend, ChartTooltip, DonutChart, Sparkline, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "Dashboard",
  description: "A page of cards: stat tiles with sparklines, an area chart, a bar chart and a donut, drawn by hand. Press \"calm\" for the dense-screen version: hairline rules, no fill offset, no jitter, a busy page that stays quiet.",
  layout: "full" as const,
  height: 640,
  stage: "desk" as const,
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
const revenue = months.map((month, i) => ({ month, revenue: [18, 26, 22, 31, 29, 38][i] * 100, costs: [12, 15, 14, 18, 17, 21][i] * 100 }))
const signups = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({ day, signups: [42, 58, 35, 71, 64, 30, 22][i] }))
const plans = [
  { plan: "free", users: 640 },
  { plan: "pro", users: 310 },
  { plan: "team", users: 120 },
]

const revenueConfig = { revenue: { label: "Revenue", color: "var(--chart-1)" }, costs: { label: "Costs", color: "var(--chart-2)" } } satisfies ChartConfig
const signupConfig = { signups: { label: "Signups", color: "var(--chart-3)" } } satisfies ChartConfig
const planConfig = { free: { label: "Free", color: "var(--chart-2)" }, pro: { label: "Pro", color: "var(--chart-1)" }, team: { label: "Team", color: "var(--chart-4)" } } satisfies ChartConfig

const stats = [
  { label: "Revenue", value: "$3,800", delta: "+12%", data: [18, 26, 22, 31, 29, 38] },
  { label: "Active users", value: "1,070", delta: "+4%", data: [900, 940, 930, 990, 1010, 1070] },
  { label: "Churn", value: "2.1%", delta: "-0.3", data: [3.1, 2.8, 2.9, 2.5, 2.4, 2.1] },
]

export default function Example() {
  const [calm, setCalm] = React.useState(false)
  return (
    <InkProvider density={calm ? "calm" : "comfortable"}>
      <div className="p-4">
        <div className="mb-4 flex justify-end">
          <Button size="sm" variant={calm ? "default" : "outline"} aria-pressed={calm} onClick={() => setCalm((c) => !c)}>
            calm
          </Button>
        </div>
        <div className="grid w-full gap-4 lg:grid-cols-3">
          {stats.map((s, i) => (
            <Card key={s.label} className="gap-2 py-4" seed={`stat${i}`}>
              <CardHeader className="gap-0.5">
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-3xl">{s.value}</CardTitle>
                <CardAction>
                  <Sparkline className="w-20" data={s.data} variant="area" label={`${s.label}, last six months`} slot={i} />
                </CardAction>
              </CardHeader>
              <CardFooter className="gap-1 text-sm text-muted-foreground">
                <Icon name={s.delta.startsWith("-") ? "arrow-down" : "arrow-up"} size={14} className={s.delta.startsWith("-") && s.label !== "Churn" ? "text-red" : "text-green"} />
                {s.delta} on last month
              </CardFooter>
            </Card>
          ))}
          <Card className="lg:col-span-2" seed="rev">
            <CardHeader>
              <CardTitle>Revenue and costs</CardTitle>
              <CardDescription>Dollars per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueConfig} className="aspect-auto h-52 w-full">
                <AreaChart data={revenue} xKey="month" label="Revenue and costs per month" yFormatter={(v) => `$${v / 1000}k`} />
                <ChartTooltip />
                <ChartLegend />
              </ChartContainer>
            </CardContent>
          </Card>
          <Card seed="plans">
            <CardHeader>
              <CardTitle>Plans</CardTitle>
              <CardDescription>Users by plan</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={planConfig} className="aspect-auto h-52 w-full">
                <DonutChart data={plans} nameKey="plan" valueKey="users" label="Users by plan" showLabels={false} centerLabel={{ value: "1,070", label: "users" }} />
                <ChartTooltip />
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3" seed="signups">
            <CardHeader>
              <CardTitle>Signups this week</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={signupConfig} className="aspect-auto h-40 w-full">
                <BarChart data={signups} xKey="day" label="Signups per day" />
                <ChartTooltip />
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </InkProvider>
  )
}
