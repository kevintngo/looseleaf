import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Nested: pages and arrows",
  description:
    "Two groups inside one: five numbered buttons and a previous/next pair. The page you are on is a highlighter button (`aria-current=\"page\"`), the arrows stop at the ends, and the status line says where you are.",
  layout: "stack" as const,
}

const PAGES = [1, 2, 3, 4, 5]

export default function Example() {
  const [page, setPage] = React.useState(2)
  return (
    <div className="grid justify-items-start gap-4">
      <ButtonGroup aria-label="Pagination">
        <ButtonGroup>
          {PAGES.map((n) => (
            <Button key={n} variant={n === page ? "secondary" : "outline"} size="sm" aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`} onClick={() => setPage(n)}>
              {n}
            </Button>
          ))}
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="icon-sm" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <Icon name="arrow-left" />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Next page" disabled={page === PAGES.length} onClick={() => setPage(page + 1)}>
            <Icon name="arrow-right" />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
      <p role="status" className="text-sm text-muted-foreground">
        Page {page} of {PAGES.length}
      </p>
    </div>
  )
}
