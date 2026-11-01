import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

const cards = [
  { label: "Total revenue", value: "$48,230", delta: "+12.5%", up: true, line: "A busy month, thank goodness", note: "Sales for the last six months" },
  { label: "New customers", value: "1,234", delta: "-20%", up: false, line: "A quiet stretch for sign-ups", note: "Worth a nudge in the newsletter" },
  { label: "Active accounts", value: "45,678", delta: "+12.5%", up: true, line: "People keep coming back", note: "Ahead of what we pencilled in" },
  { label: "Growth rate", value: "4.5%", delta: "+4.5%", up: true, line: "Slow and steady", note: "Right on the plan" },
]

export function SectionCards() {
  return (
    <section aria-label="Key numbers" className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((c, i) => (
        <Card key={c.label} className="@container/card" seed={`s01-card-${i}`}>
          <CardHeader>
            <CardDescription>{c.label}</CardDescription>
            <CardTitle className="text-3xl tabular-nums @[250px]/card:text-4xl">{c.value}</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Icon name={c.up ? "trending-up" : "trending-down"} />
                {c.delta}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="flex gap-2 font-bold">
              {c.line} <Icon name={c.up ? "trending-up" : "trending-down"} className="size-4" />
            </div>
            <div className="text-muted-foreground">{c.note}</div>
          </CardFooter>
        </Card>
      ))}
    </section>
  )
}
