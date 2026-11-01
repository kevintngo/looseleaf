import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDuration, formatNumber, signed, TOP_PAGES, type Period } from "@/blocks/dashboard-analytics/components/dashboard-analytics-data"

export function TopPages({ period, className }: { period: Period; className?: string }) {
  return (
    <Card className={cn("min-w-0", className)} seed="analytics-pages">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Top pages
        </CardTitle>
        <CardDescription>What people read the most, and whether they liked it enough to stay</CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="[&_td]:px-2 [&_th]:px-2 sm:[&_td]:px-3 sm:[&_th]:px-3">
          <TableCaption className="sr-only">Top pages by views, with the change since the period before</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-end">Views</TableHead>
              <TableHead className="hidden text-end md:table-cell">Visitors</TableHead>
              <TableHead className="hidden text-end md:table-cell">Time</TableHead>
              <TableHead className="hidden text-end sm:table-cell">Bounce</TableHead>
              <TableHead className="text-end">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TOP_PAGES.map((p) => {
              const views = Math.round(period.pageviews * p.share)
              const up = p.trend >= 0
              return (
                <TableRow key={p.path}>
                  <TableCell className="max-w-32 whitespace-normal sm:max-w-56">
                    <span className="block font-bold">{p.title}</span>
                    <span className="block truncate font-mono text-xs text-muted-foreground">{p.path}</span>
                  </TableCell>
                  <TableCell className="ll-num text-end">{formatNumber(views)}</TableCell>
                  <TableCell className="ll-num hidden text-end md:table-cell">{formatNumber(views / 1.34)}</TableCell>
                  <TableCell className="ll-num hidden text-end md:table-cell">{formatDuration(p.time)}</TableCell>
                  <TableCell className="ll-num hidden text-end sm:table-cell">{p.bounce}%</TableCell>
                  <TableCell className="text-end">
                    <span className={up ? "inline-flex items-center gap-1 font-bold text-green" : "inline-flex items-center gap-1 font-bold text-red"}>
                      <Icon name={up ? "arrow-up" : "arrow-down"} size={14} />
                      <span className="ll-num">{signed(p.trend)}</span>
                      <span className="sr-only">{up ? ", up" : ", down"}</span>
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
