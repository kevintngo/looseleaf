import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, DonutChart, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { CATEGORIES, cashFlow, money, spentBy, type Transaction } from "@/blocks/dashboard-finance/components/dashboard-finance-data"

const flowConfig = {
  income: { label: "Money in", color: "var(--chart-3)" },
  spending: { label: "Money out", color: "var(--chart-1)" },
} satisfies ChartConfig

const dollars = (n: number) => money(Math.round(n) * 100).replace(/\.00$/, "")

export function CashFlow({ list, className }: { list: readonly Transaction[]; className?: string }) {
  const data = cashFlow(list)
  return (
    <Card className={cn("min-w-0", className)} seed="finance-flow">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          In and out
        </CardTitle>
        <CardDescription>Money in against money out, April to September</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={flowConfig} className="aspect-auto h-64 w-full">
          <BarChart
            data={data}
            xKey="month"
            label="Money in and money out per month, April to September"
            yFormatter={(v) => dollars(v)}
            valueFormatter={(v) => dollars(v)}
            annotations={[{ at: "min", series: "income", text: "a slow month" }]}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const slug = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, "-")

export function Spending({ list, month, monthName, className }: { list: readonly Transaction[]; month: string; monthName: string; className?: string }) {
  const spent = spentBy(list, month)
  const data = CATEGORIES.filter((c) => spent[c]).map((c) => ({ category: slug(c), cents: spent[c] }))
  const config = Object.fromEntries(CATEGORIES.filter((c) => spent[c]).map((c) => [slug(c), { label: c }])) satisfies ChartConfig
  const total = data.reduce((a, d) => a + d.cents, 0)
  return (
    <Card className={cn("min-w-0", className)} seed="finance-spending">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Where it went
        </CardTitle>
        <CardDescription>Money out in {monthName}, by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <DonutChart
            data={data}
            nameKey="category"
            valueKey="cents"
            label={`Money out in ${monthName}, by category`}
            showLabels={false}
            valueFormatter={(v) => money(v)}
            centerLabel={{ value: dollars(total / 100), label: "spent" }}
          />
          <ChartTooltip />
          <ChartLegend />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
