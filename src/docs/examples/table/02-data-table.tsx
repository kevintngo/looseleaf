import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@/components/ui/icon"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const meta = {
  title: "Data table",
  description:
    "Sorting, selection and pagination with plain React state and no extra dependency. A selected row is a highlighter swipe (`data-state=\"selected\"`), the sorted column says so with `aria-sort` and an arrow, and the header checkbox goes half-ticked when only some rows are chosen. Colored pencil text is 4.7:1 on paper but about 4:1 on the full swipe, so a chosen row writes its status in ink.",
  layout: "stack" as const,
}

type Person = { id: string; name: string; plan: "Solo" | "Team"; status: "Paid" | "Pending" | "Overdue"; amount: number }
type SortKey = "name" | "plan" | "status" | "amount"

const DATA: Person[] = [
  { id: "1", name: "Ada Lovelace", plan: "Team", status: "Paid", amount: 250 },
  { id: "2", name: "Jo Okafor", plan: "Solo", status: "Pending", amount: 49 },
  { id: "3", name: "Mika Kobayashi", plan: "Team", status: "Paid", amount: 250 },
  { id: "4", name: "Sam Reyes", plan: "Solo", status: "Overdue", amount: 49 },
  { id: "5", name: "Priya Nair", plan: "Team", status: "Paid", amount: 250 },
  { id: "6", name: "Tomas Berg", plan: "Solo", status: "Paid", amount: 49 },
  { id: "7", name: "Lena Fischer", plan: "Team", status: "Pending", amount: 250 },
  { id: "8", name: "Omar Haddad", plan: "Solo", status: "Paid", amount: 49 },
  { id: "9", name: "Yuki Tanaka", plan: "Team", status: "Overdue", amount: 250 },
  { id: "10", name: "Ines Moreau", plan: "Solo", status: "Paid", amount: 49 },
  { id: "11", name: "Kofi Mensah", plan: "Team", status: "Paid", amount: 250 },
  { id: "12", name: "Nora Lindqvist", plan: "Solo", status: "Pending", amount: 49 },
]

const PAGE = 5
const STATUS_TONE = { Paid: "text-green", Pending: "text-muted-foreground", Overdue: "text-red" } as const

function SortHead({ label, k, sort, onSort, end }: { label: string; k: SortKey; sort: { key: SortKey; dir: "asc" | "desc" } | null; onSort: (k: SortKey) => void; end?: boolean }) {
  const active = sort?.key === k
  return (
    <TableHead aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={end ? "text-end" : undefined}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className="-mx-2 inline-flex items-center gap-1 px-2 py-1 hover:ll-swipe focus-visible:ll-swipe"
      >
        {label}
        <Icon name={active ? (sort.dir === "asc" ? "arrow-up" : "arrow-down") : "chevrons-up-down"} size={16} className={active ? undefined : "opacity-45"} />
      </button>
    </TableHead>
  )
}

export default function Example() {
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null)
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set(["3"]))
  const [page, setPage] = React.useState(0)

  const rows = React.useMemo(() => {
    if (!sort) return DATA
    const sign = sort.dir === "asc" ? 1 : -1
    return [...DATA].sort((a, b) => {
      const x = a[sort.key], y = b[sort.key]
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sign
    })
  }, [sort])

  const pages = Math.ceil(rows.length / PAGE)
  const visible = rows.slice(page * PAGE, page * PAGE + PAGE)
  const chosen = visible.filter((r) => selected.has(r.id)).length

  const toggleSort = (key: SortKey) => setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null))
  const toggleAll = (on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      for (const r of visible) on ? next.add(r.id) : next.delete(r.id)
      return next
    })
  const toggleOne = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  return (
    <div className="w-full max-w-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="Select all rows on this page"
                checked={chosen === visible.length ? true : chosen > 0 ? "indeterminate" : false}
                onCheckedChange={(v) => toggleAll(v === true)}
              />
            </TableHead>
            <SortHead label="Name" k="name" sort={sort} onSort={toggleSort} />
            <SortHead label="Plan" k="plan" sort={sort} onSort={toggleSort} />
            <SortHead label="Status" k="status" sort={sort} onSort={toggleSort} />
            <SortHead label="Amount" k="amount" sort={sort} onSort={toggleSort} end />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((r) => (
            <TableRow key={r.id} data-state={selected.has(r.id) ? "selected" : undefined}>
              <TableCell>
                <Checkbox aria-label={`Select ${r.name}`} checked={selected.has(r.id)} onCheckedChange={(v) => toggleOne(r.id, v === true)} />
              </TableCell>
              <TableCell className="font-bold">{r.name}</TableCell>
              <TableCell>{r.plan}</TableCell>
              <TableCell className={`font-bold ${selected.has(r.id) ? "text-ink" : STATUS_TONE[r.status]}`}>{r.status}</TableCell>
              <TableCell className="ll-num text-end">${r.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-5 flex items-center justify-between gap-4 text-sm">
        <p className="text-muted-foreground" aria-live="polite">
          {selected.size} of {DATA.length} chosen · page {page + 1} of {pages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <Icon name="chevron-left" />
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
            <Icon name="chevron-right" />
          </Button>
        </div>
      </div>
    </div>
  )
}
