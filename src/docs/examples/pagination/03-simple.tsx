import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

export const meta = {
  title: "Simple pager",
  description: "Previous, a line of text, Next: for a feed or a list you page through. Sizes are Button sizes; here the arrows are square icon buttons with a label of their own, and a load-more link uses the large size.",
  layout: "center" as const,
}

export default function Example() {
  const [page, setPage] = React.useState(3)
  const total = 12
  const go = (n: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setPage(Math.min(total, Math.max(1, n)))
  }

  return (
    <div className="grid justify-items-center gap-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#prev" size="icon-sm" aria-label="Go to previous page" disabled={page === 1} onClick={go(page - 1)}>
              <Icon name="chevron-left" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <span className="px-3 font-script text-xl" aria-live="polite">
              page {page} of {total}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#next" size="icon-sm" aria-label="Go to next page" disabled={page === total} onClick={go(page + 1)}>
              <Icon name="chevron-right" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#older" size="sm" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#newer" size="sm" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#more" size="lg" className="px-8">
              Load more notes
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
