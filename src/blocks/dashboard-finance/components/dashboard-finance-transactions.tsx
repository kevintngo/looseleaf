"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { AddTransaction } from "@/blocks/dashboard-finance/components/dashboard-finance-add-dialog"
import { CATEGORY_ICON, money, shortDate, type Status, type Transaction } from "@/blocks/dashboard-finance/components/dashboard-finance-data"

type Show = "all" | "in" | "out"
type SortKey = "date" | "amount"

const STATUS: Record<Status, { label: string; variant: "outline" | "secondary" | "destructive"; icon: string; iconClass?: string }> = {
  cleared: { label: "Cleared", variant: "outline", icon: "circle-check", iconClass: "text-green" },
  pending: { label: "Pending", variant: "secondary", icon: "clock" },
  flagged: { label: "Flagged", variant: "destructive", icon: "triangle-alert" },
}

function SortHead({ label, k, sort, onSort, className }: { label: string; k: SortKey; sort: { key: SortKey; dir: "asc" | "desc" }; onSort: (k: SortKey) => void; className?: string }) {
  const active = sort.key === k
  return (
    <TableHead aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={className}>
      <Button variant="ghost" size="sm" className="-mx-2 font-script text-[19px] has-[>svg:not(.absolute)]:px-1.5 md:-mx-3 md:has-[>svg:not(.absolute)]:px-2.5" onClick={() => onSort(k)}>
        {label}
        <Icon name={active ? (sort.dir === "asc" ? "arrow-up" : "arrow-down") : "arrow-up-down"} size={14} />
      </Button>
    </TableHead>
  )
}

export function Transactions({
  list,
  monthName,
  addDate,
  onAdd,
  className,
}: {
  list: readonly Transaction[]
  monthName: string
  addDate: string
  onAdd: (t: Omit<Transaction, "id">) => void
  className?: string
}) {
  const [show, setShow] = React.useState<Show>("all")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "date", dir: "desc" })

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = list.filter(
      (t) => (show === "all" || (show === "in" ? t.cents > 0 : t.cents < 0)) && (!q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    )
    const sign = sort.dir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => sign * (sort.key === "date" ? a.date.localeCompare(b.date) || a.id - b.id : a.cents - b.cents))
  }, [list, show, query, sort])

  const onSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "date" ? "desc" : "asc" }))

  return (
    <Card className={cn("min-w-0 max-sm:[&_[data-slot=card-content]]:px-4 max-sm:[&_[data-slot=card-header]]:px-4", className)} seed="finance-transactions">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Transactions
        </CardTitle>
        <CardDescription>
          {rows.length} of {list.length} in {monthName}
        </CardDescription>
        <CardAction className="col-start-1 row-span-1 row-start-3 justify-self-start @md/card-header:col-start-2 @md/card-header:row-span-2 @md/card-header:row-start-1 @md/card-header:justify-self-end">
          <AddTransaction date={addDate} onAdd={onAdd} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup type="single" variant="outline" size="sm" value={show} onValueChange={(v) => v && setShow(v as Show)} aria-label="Show">
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="in">Money in</ToggleGroupItem>
            <ToggleGroupItem value="out">Money out</ToggleGroupItem>
          </ToggleGroup>
          <Input type="search" aria-label="Search transactions" placeholder="Search transactions" className="min-w-40 flex-1 sm:max-w-64" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Table aria-label={`Transactions in ${monthName}`} className="[&_td]:px-2 [&_th]:px-2 md:[&_td]:px-3 md:[&_th]:px-3">
          <TableCaption className="sr-only">Transactions in {monthName}, newest first unless you sort them otherwise</TableCaption>
          <TableHeader>
            <TableRow>
              <SortHead label="Date" k="date" sort={sort} onSort={onSort} />
              <TableHead>What</TableHead>
              <TableHead className="hidden lg:table-cell">Pot</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <SortHead label="Amount" k="amount" sort={sort} onSort={onSort} className="text-end" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((t) => {
                const s = STATUS[t.status]
                return (
                  <TableRow key={t.id}>
                    <TableCell className="ll-num">{shortDate(t.date)}</TableCell>
                    <TableCell className="max-w-40 whitespace-normal md:max-w-64 md:truncate">
                      {t.description}
                      <span className="block text-sm text-muted-foreground">
                        {t.account}
                        {t.status === "cleared" ? null : <span className={cn("md:hidden", t.status === "flagged" && "font-bold text-red")}> · {s.label.toLowerCase()}</span>}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <Icon name={CATEGORY_ICON[t.category]} size={14} />
                        {t.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={s.variant}>
                        <Icon name={s.icon} className={s.iconClass} />
                        {s.label}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("ll-num text-end font-bold", t.cents > 0 && "text-green")}>{money(t.cents, { sign: true })}</TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="h-auto">
                <TableCell colSpan={5}>
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia pose="search" size={72} />
                      <EmptyTitle>Nothing matches</EmptyTitle>
                      <EmptyDescription>Try another word, or show everything again.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
