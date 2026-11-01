import { Paper } from "@/components/ui/paper"
import { Tally } from "@/components/ui/tally"
import { useCatalog } from "../../core/catalog-context"
import { DeskSection } from "./section"

interface Stat {
  key: string
  value: string
  label: string
  strokes: number
  per: string
}

export function Stats() {
  const catalog = useCatalog()
  const components = catalog.components.length
  const stats: Stat[] = [
    { key: "components", value: String(components), label: "components", strokes: Math.floor(components / 10), per: "one stroke is ten" },
    { key: "art", value: "300+", label: "drawn things: icons, stickers, doodles, Stubby", strokes: 30, per: "one stroke is ten" },
    { key: "categories", value: String(catalog.groups.length), label: "categories, from buttons to charts", strokes: catalog.groups.length, per: "one stroke each" },
    { key: "tests", value: "6,500+", label: "tests, with axe on every page", strokes: 13, per: "one stroke is five hundred" },
  ]
  return (
    <DeskSection id="numbers" title="By the numbers">
      <Paper data-home="stats" stock="graph" tape="top" seed="home-stats" className="px-6 pt-9 pb-8 @xl:px-10">
        <dl className="grid gap-x-10 gap-y-9 @2xl:grid-cols-2">
          {stats.map((s) => (
            <div key={s.key} className="flex min-w-0 flex-col gap-1">
              <dt className="order-2 text-[15px] leading-snug text-ink-soft">{s.label}</dt>
              <dd className="order-1 m-0 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="ll-num font-script text-6xl leading-none font-bold text-ink">{s.value}</span>
                <span className="flex flex-col gap-0.5">
                  {s.strokes > 0 ? <Tally count={s.strokes} size="sm" label={`${s.strokes} strokes: ${s.per}`} /> : null}
                  <span className="font-type text-sm text-pencil-text">{s.per}</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Paper>
    </DeskSection>
  )
}
