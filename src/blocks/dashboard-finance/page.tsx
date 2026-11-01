"use client"

import * as React from "react"

import { Balances } from "@/blocks/dashboard-finance/components/dashboard-finance-balances"
import { Budgets, HeadsUp } from "@/blocks/dashboard-finance/components/dashboard-finance-budgets"
import { CashFlow, Spending } from "@/blocks/dashboard-finance/components/dashboard-finance-charts"
import { inMonth, MONTHS, spentBy, TODAY, transactions as sample, type Transaction } from "@/blocks/dashboard-finance/components/dashboard-finance-data"
import { Transactions } from "@/blocks/dashboard-finance/components/dashboard-finance-transactions"
import { Page as Sheet, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DashboardFinance({ as: Root = "main" }: { as?: "main" | "div" } = {}) {
  const [all, setAll] = React.useState<Transaction[]>(sample)
  const [monthId, setMonthId] = React.useState<string>(MONTHS[0].id)
  const month = MONTHS.find((m) => m.id === monthId) ?? MONTHS[0]
  const list = React.useMemo(() => inMonth(all, month.id), [all, month.id])
  const spent = React.useMemo(() => spentBy(all, month.id), [all, month.id])
  const addDate = month.id === TODAY.slice(0, 7) ? TODAY : `${month.id}-28`

  return (
    <div className="overflow-x-clip">
      <Sheet as={Root} width="full" holes="start" reinforced tilt={false} rules="none" seed="dashboard-finance" className="gap-6 py-6 pe-4 sm:py-8 sm:pe-6 lg:pe-8">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <PageHeader>
            <p className="font-type text-sm tracking-wide text-ink-muted">Household ledger</p>
            <PageTitle underline="double" seed="finance-title">
              {month.name}
            </PageTitle>
            <PageDescription>Money in, money out, and what is left in each pot.</PageDescription>
          </PageHeader>
          <Select value={monthId} onValueChange={setMonthId}>
            <SelectTrigger className="w-48" aria-label="Month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Balances />
          <CashFlow list={all} />
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Budgets spent={spent} monthName={month.name} />
          <div className="flex min-w-0 flex-col gap-6">
            <Spending list={all} month={month.id} monthName={month.name} />
            <HeadsUp spent={spent} />
          </div>
        </div>

        <Transactions
          list={list}
          monthName={month.name}
          addDate={addDate}
          onAdd={(t) => setAll((prev) => [{ ...t, id: Math.max(0, ...prev.map((x) => x.id)) + 1 }, ...prev])}
        />
      </Sheet>
    </div>
  )
}
