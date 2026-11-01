import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "On every stock",
  description: "A card is a sheet of paper, so it takes any stock, edge and printed rules: graph paper, a dot grid, kraft, an index card with a torn top.",
  layout: "stack" as const,
}

const cards = [
  { stock: "graph", rules: "graph", title: "Graph", edge: "cut" },
  { stock: "dot-grid", rules: "dots", title: "Dot grid", edge: "cut" },
  { stock: "kraft", rules: "none", title: "Kraft", edge: "cut" },
  { stock: "index-card", rules: "none", title: "Torn index card", edge: { top: "torn" } },
] as const

export default function Example() {
  return (
    <div className="grid gap-7 p-2 sm:grid-cols-2">
      {cards.map((c) => (
        <Card key={c.title} stock={c.stock} rules={c.rules} edge={c.edge} seed={c.title} className="gap-2 py-5">
          <CardHeader>
            <CardTitle>{c.title}</CardTitle>
            <CardDescription>{c.stock}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">pencil, ink and a little tea</CardContent>
        </Card>
      ))}
    </div>
  )
}
