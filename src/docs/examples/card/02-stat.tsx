import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "Stat cards",
  description: "Index cards for one number each. The figures are set in the script font with tabular numerals; the trend says up or down in words, not only in colour.",
  layout: "stack" as const,
}

const stats = [
  { label: "Pages written", value: "1,284", trend: "up 12% on last week", stock: "index-card", tone: "text-green" },
  { label: "Drafts open", value: "17", trend: "down 3 since Monday", stock: "index-card", tone: "text-red" },
  { label: "Words per day", value: "640", trend: "steady", stock: "slip", tone: "text-muted-foreground" },
] as const

export default function Example() {
  return (
    <div className="grid gap-6 p-2 sm:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.label} stock={s.stock} seed={s.label} className="gap-3 py-5">
          <CardHeader>
            <CardDescription>{s.label}</CardDescription>
            <CardTitle className="ll-num text-4xl">{s.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm ${s.tone}`}>{s.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
