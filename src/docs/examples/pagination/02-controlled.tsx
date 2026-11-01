import * as React from "react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export const meta = {
  title: "Controlled, with gaps",
  description: "Nine pages with the classic windowing: the first and last always show, the current page has a neighbour on each side, the rest fold into ellipses. Previous is inert on page 1 and Next on page 9; the links have real hrefs, so open in a new tab works.",
  layout: "center" as const,
}

const LAST = 9

function windowed(page: number): Array<number | "gap-l" | "gap-r"> {
  const out: Array<number | "gap-l" | "gap-r"> = []
  for (let p = 1; p <= LAST; p++) {
    if (p === 1 || p === LAST || Math.abs(p - page) <= 1) out.push(p)
    else if (p < page && out[out.length - 1] !== "gap-l") out.push("gap-l")
    else if (p > page && out[out.length - 1] !== "gap-r") out.push("gap-r")
  }
  return out
}

export default function Example() {
  const [page, setPage] = React.useState(5)
  const go = (n: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setPage(Math.min(LAST, Math.max(1, n)))
  }

  return (
    <div className="grid justify-items-center gap-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href={`#page-${page - 1}`} disabled={page === 1} onClick={go(page - 1)} />
          </PaginationItem>
          {windowed(page).map((p) => (
            <PaginationItem key={p}>
              {typeof p === "number" ? (
                <PaginationLink href={`#page-${p}`} isActive={p === page} aria-label={`Page ${p}`} onClick={go(p)}>
                  {p}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext href={`#page-${page + 1}`} disabled={page === LAST} onClick={go(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Page {page} of {LAST}
      </p>
    </div>
  )
}
