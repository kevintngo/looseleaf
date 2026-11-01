import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const meta = {
  title: "Data table demo",
  description:
    "Official `data-table-demo`, rebuilt with plain React state and no TanStack: filter the emails, sort the Email column, hide columns from the Columns menu, tick rows (the header box goes half-ticked when only some of a page are), and page with Previous and Next. Chosen rows are a highlighter swipe. The original's five rows fit on one page, so this one has twelve at five a page. The bordered, rounded wrapper is left off: the table is already ruled by hand.",
  layout: "center" as const,
  height: 460,
}

type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

const data: Payment[] = [
  { id: "m5gr84i9", amount: 316, status: "success", email: "ken99@example.com" },
  { id: "3u1reuv4", amount: 242, status: "success", email: "Abe45@example.com" },
  { id: "derv1ws0", amount: 837, status: "processing", email: "Monserrat44@example.com" },
  { id: "5kma53ae", amount: 874, status: "success", email: "Silas22@example.com" },
  { id: "bhqecj4p", amount: 721, status: "failed", email: "carmella@example.com" },
  { id: "p0d9x2lq", amount: 129, status: "pending", email: "jo.okafor@example.com" },
  { id: "v7t3n8ws", amount: 458, status: "success", email: "mika.k@example.com" },
  { id: "c2h6y1rb", amount: 63, status: "failed", email: "sam.reyes@example.com" },
  { id: "k9f4a5ze", amount: 590, status: "processing", email: "priya@example.com" },
  { id: "x3m8u0dj", amount: 205, status: "success", email: "tomas.berg@example.com" },
  { id: "q1w7e5tn", amount: 912, status: "pending", email: "lena.f@example.com" },
  { id: "z6b2g4ho", amount: 377, status: "success", email: "omar@example.com" },
]

const PAGE_SIZE = 5
const HIDEABLE = ["status", "email", "amount"] as const
type ColumnId = (typeof HIDEABLE)[number]
type SortDirection = "asc" | "desc"

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export default function Example() {
  const [sorting, setSorting] = React.useState<SortDirection | null>(null)
  const [filter, setFilter] = React.useState("")
  const [visibility, setVisibility] = React.useState<Record<ColumnId, boolean>>({ status: true, email: true, amount: true })
  const [selection, setSelection] = React.useState<ReadonlySet<string>>(new Set())
  const [pageIndex, setPageIndex] = React.useState(0)

  const rows = React.useMemo(() => {
    const found = data.filter((p) => p.email.toLowerCase().includes(filter.toLowerCase()))
    if (!sorting) return found
    const sign = sorting === "asc" ? 1 : -1
    return [...found].sort((a, b) => a.email.localeCompare(b.email, "en", { sensitivity: "base" }) * sign)
  }, [filter, sorting])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const page = Math.min(pageIndex, pageCount - 1)
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const chosenOnPage = pageRows.filter((p) => selection.has(p.id)).length
  const chosenInFilter = rows.filter((p) => selection.has(p.id)).length
  const columnCount = 2 + HIDEABLE.filter((id) => visibility[id]).length

  const toggleRows = (ids: string[], on: boolean) =>
    setSelection((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (on) next.add(id)
        else next.delete(id)
      }
      return next
    })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          aria-label="Filter emails"
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value)
            setPageIndex(0)
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ms-auto">
              Columns <Icon name="chevron-down" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {HIDEABLE.map((id) => (
              <DropdownMenuCheckboxItem
                key={id}
                className="capitalize"
                checked={visibility[id]}
                onCheckedChange={(value) => setVisibility((prev) => ({ ...prev, [id]: !!value }))}
              >
                {id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={pageRows.length > 0 && chosenOnPage === pageRows.length ? true : chosenOnPage > 0 ? "indeterminate" : false}
                onCheckedChange={(value) =>
                  toggleRows(
                    pageRows.map((p) => p.id),
                    !!value
                  )
                }
                aria-label="Select all"
              />
            </TableHead>
            {visibility.status && <TableHead>Status</TableHead>}
            {visibility.email && (
              <TableHead aria-sort={sorting === "asc" ? "ascending" : sorting === "desc" ? "descending" : "none"}>
                <Button variant="ghost" className="-ms-3" onClick={() => setSorting((s) => (s === "asc" ? "desc" : "asc"))}>
                  Email
                  <Icon name="arrow-up-down" />
                </Button>
              </TableHead>
            )}
            {visibility.amount && <TableHead className="text-end">Amount</TableHead>}
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length ? (
            pageRows.map((payment) => (
              <TableRow key={payment.id} data-state={selection.has(payment.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selection.has(payment.id)}
                    onCheckedChange={(value) => toggleRows([payment.id], !!value)}
                    aria-label={`Select ${payment.email}`}
                  />
                </TableCell>
                {visibility.status && (
                  <TableCell>
                    <div className="capitalize">{payment.status}</div>
                  </TableCell>
                )}
                {visibility.email && (
                  <TableCell>
                    <div className="lowercase">{payment.email}</div>
                  </TableCell>
                )}
                {visibility.amount && (
                  <TableCell>
                    <div className="ll-num text-end font-medium">{dollars.format(payment.amount)}</div>
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <span className="sr-only">Open menu</span>
                        <Icon name="ellipsis" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => void navigator.clipboard?.writeText(payment.id)}>Copy payment ID</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View customer</DropdownMenuItem>
                      <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground" aria-live="polite">
          {chosenInFilter} of {rows.length} row(s) selected. Page {page + 1} of {pageCount}.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => setPageIndex(page - 1)} disabled={page === 0}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPageIndex(page + 1)} disabled={page >= pageCount - 1}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
