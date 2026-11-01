import * as React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/ui/collapsible"

export const meta = {
  title: "Show more",
  description: "A composed card: the first three lines of a reading list are always there, the rest fold away behind a controlled trigger that says what it will do.",
  layout: "center" as const,
  height: 420,
}

const books = [
  "The Design of Everyday Things",
  "A Pattern Language",
  "Letters to a Young Poet",
  "Steal Like an Artist",
  "How to Do Nothing",
  "Bird by Bird",
  "The Elements of Typographic Style",
]

export default function Example() {
  const [open, setOpen] = React.useState(false)
  return (
    <Card seed="reading-list" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reading list</CardTitle>
        <CardDescription>{books.length} books, in the order I meant to read them.</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={open} onOpenChange={setOpen}>
          <ul className="grid gap-1.5 text-sm">
            {books.slice(0, 3).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <CollapsibleContent>
            <ul className="mt-1.5 grid gap-1.5 text-sm">
              {books.slice(3).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </CollapsibleContent>
          <CollapsibleTrigger asChild>
            <Button variant="link" size="sm" className="mt-3 px-0">
              {open ? "Show fewer" : `Show ${books.length - 3} more`}
              <CollapsibleIndicator />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
