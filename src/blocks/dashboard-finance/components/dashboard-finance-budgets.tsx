import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Progress } from "@/components/ui/progress"
import { StickyNote, StickyNoteContent, StickyNoteTitle } from "@/components/ui/sticky-note"
import { cn } from "@/lib/utils"
import { BUDGETS, CATEGORY_ICON, money } from "@/blocks/dashboard-finance/components/dashboard-finance-data"

type Tone = "green" | "hi" | "marker"

function toneOf(spent: number, budget: number): Tone {
  if (spent > budget) return "marker"
  return spent / budget >= 0.85 ? "hi" : "green"
}

export function Budgets({ spent, monthName, className }: { spent: Record<string, number>; monthName: string; className?: string }) {
  return (
    <Card className={cn("min-w-0", className)} seed="finance-budgets">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Budgets
        </CardTitle>
        <CardDescription>What each pot has left in {monthName}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul role="list" className="flex flex-col gap-5">
          {BUDGETS.map((b, i) => {
            const used = spent[b.category] ?? 0
            const left = b.cents - used
            const over = left < 0
            return (
              <li key={b.category} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-2 font-bold">
                    <Icon name={CATEGORY_ICON[b.category]} />
                    {b.category}
                  </span>
                  <span className="ll-num text-sm text-muted-foreground">
                    {money(used)} of {money(b.cents)}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (used / b.cents) * 100)}
                  tone={toneOf(used, b.cents)}
                  seed={`finance-budget-${i}`}
                  aria-label={`${b.category}: ${money(used)} spent of ${money(b.cents)}`}
                />
                {over ? (
                  <p className="flex items-center gap-1.5 text-sm font-bold text-red">
                    <Icon name="triangle-alert" size={14} />
                    Over by {money(-left)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{left === 0 ? "All of it spent, exactly" : `${money(left)} left`}</p>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export function HeadsUp({ spent, className }: { spent: Record<string, number>; className?: string }) {
  const lines = BUDGETS.flatMap((b) => {
    const used = spent[b.category] ?? 0
    if (used > b.cents) return [`${b.category} is ${money(used - b.cents)} over.`]
    if (used === b.cents) return [`${b.category} is all spent.`]
    if (used / b.cents >= 0.85) return [`${b.category}: ${money(b.cents - used)} to go.`]
    return []
  })
  return (
    <StickyNote role="group" aria-label="Heads up" fastener="pin" seed="finance-headsup" className={cn("min-h-0 w-64 max-w-full self-center", className)}>
      <StickyNoteTitle>Heads up</StickyNoteTitle>
      <StickyNoteContent>
        {lines.length ? (
          <ul role="list" className="text-[1.15rem] leading-tight">
            {lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[1.15rem] leading-tight">Every pot has room this month.</p>
        )}
      </StickyNoteContent>
    </StickyNote>
  )
}
