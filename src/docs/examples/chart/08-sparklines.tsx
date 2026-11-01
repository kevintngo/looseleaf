import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkline } from "@/components/ui/chart"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Sparklines",
  description: "One felt pull and a red dot at the end, a shaded area, or a row of marker bars. A sparkline is a picture with a spoken summary; set interactive to make it a chart you can hover.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const tiles = [
  { title: "Visitors", value: "12,840", note: "up 12% on last week", up: true, data: [4, 6, 5, 8, 7, 11, 9, 12, 10, 15, 13, 17], variant: "line" as const },
  { title: "Revenue", value: "$4,320", note: "steady", up: true, data: [8, 7, 9, 8, 10, 9, 11, 10, 12, 11, 12, 13], variant: "area" as const },
  { title: "Signups", value: "318", note: "down 3 since Monday", up: false, data: [9, 12, 8, 10, 7, 9, 6, 8, 5, 7, 6, 4], variant: "bar" as const },
]

export default function Example() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      {tiles.map((t, i) => (
        <Card key={t.title} seed={`spark${i}`} className="gap-3 py-4">
          <CardHeader className="gap-1">
            <CardDescription>{t.title}</CardDescription>
            <CardTitle className="text-3xl">{t.value}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Sparkline className="h-10 w-full" data={t.data} variant={t.variant} label={`${t.title}, last twelve days`} slot={i === 2 ? 1 : 0} />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Icon name={t.up ? "arrow-up" : "arrow-down"} size={14} className={t.up ? "text-green" : "text-red"} />
              {t.note}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
