import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const meta = {
  title: "Table footer (composed)",
  description: "A real use: twenty-three notebooks, five to a page. The range under the table and the current number follow the page, and the links keep real hrefs for people who open them in a new tab.",
  layout: "center" as const,
  height: 440,
}

const SIZE = 5
const ROWS = Array.from({ length: 23 }, (_, i) => ({
  name: ["Field notes", "Garden log", "Recipes", "Trip to Lisbon", "Sketches", "Reading list", "Letters", "Budget"][i % 8] + (i >= 8 ? ` ${Math.floor(i / 8) + 1}` : ""),
  pages: 12 + ((i * 37) % 90),
}))
const PAGES = Math.ceil(ROWS.length / SIZE)

export default function Example() {
  const [page, setPage] = React.useState(1)
  const go = (n: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setPage(Math.min(PAGES, Math.max(1, n)))
  }
  const from = (page - 1) * SIZE
  const rows = ROWS.slice(from, from + SIZE)

  return (
    <div className="grid w-full max-w-md gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Notebook</TableHead>
            <TableHead className="text-end">Pages</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.name}>
              <TableCell>{r.name}</TableCell>
              <TableCell className="text-end ll-num">{r.pages}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {from + 1}–{from + rows.length} of {ROWS.length}
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href={`#p${page - 1}`} aria-label="Go to previous page" disabled={page === 1} onClick={go(page - 1)}>
                <Icon name="chevron-left" />
              </PaginationLink>
            </PaginationItem>
            {Array.from({ length: PAGES }, (_, i) => i + 1).map((n) => (
              <PaginationItem key={n}>
                <PaginationLink href={`#p${n}`} isActive={n === page} aria-label={`Page ${n}`} onClick={go(n)}>
                  {n}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationLink href={`#p${page + 1}`} aria-label="Go to next page" disabled={page === PAGES} onClick={go(page + 1)}>
                <Icon name="chevron-right" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
