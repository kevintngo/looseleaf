import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const meta = {
  title: "Sticky header",
  description:
    "`sticky` pins the header row while the body scrolls under it; `containerClassName=\"max-h-72\"` gives the scroller its height. The header carries the paper color (`--ll-table-bg`) and its own double rule.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const rows = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  day: days[i % 5],
  page: `Notebook, p. ${12 + i * 3}`,
  words: 180 + ((i * 97) % 640),
}))

export default function Example() {
  return (
    <Card seed="sticky-table" className="mx-auto w-full max-w-lg">
      <CardContent>
        <Table sticky containerClassName="max-h-72">
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Page</TableHead>
              <TableHead className="text-end">Words</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.day}</TableCell>
                <TableCell>{r.page}</TableCell>
                <TableCell className="ll-num text-end">{r.words}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-sm text-muted-foreground">Twenty-four pages: scroll the list, the head stays put.</p>
      </CardContent>
    </Card>
  )
}
