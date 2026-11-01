"use client"

import * as React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Doodle } from "@/components/ui/doodle"
import { Paper } from "@/components/ui/paper"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Pricing01Card } from "@/blocks/pricing-01/components/pricing-01-card"
import { FAQ, TIERS, dollars, type Period, type Tier } from "@/blocks/pricing-01/components/pricing-01-data"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  defaultPeriod?: Period
  onChoose?: (tier: Tier, period: Period) => void
}

export default function Pricing01({ className, defaultPeriod = "monthly", onChoose }: Props) {
  const [period, setPeriod] = React.useState<Period>(defaultPeriod)
  const [chosen, setChosen] = React.useState<Tier["id"] | null>(null)
  const uid = React.useId()
  const yearlySaving = TIERS.find((t) => t.popular)!
  const saved = yearlySaving.monthly * 12 - yearlySaving.yearly

  return (
    <section aria-labelledby={`${uid}-title`} className={cn("@container/pricing mx-auto grid w-full max-w-6xl gap-12 px-4 py-12 sm:px-8", className)}>
      <header className="mx-auto grid max-w-2xl justify-items-center gap-4 text-center">
        <h2 id={`${uid}-title`} className="ll-riso font-script text-5xl leading-none font-bold text-balance @lg/pricing:text-6xl">
          Pick a desk that fits
        </h2>
        <p className="text-lg text-muted-foreground text-balance">Start free with one notebook. Pay when you need more paper, more people or the good highlighters. Cancel with one press.</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <ToggleGroup type="single" variant="outline" size="lg" value={period} onValueChange={(v) => v && setPeriod(v as Period)} aria-label="Billing period">
            <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
            <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
          </ToggleGroup>
          <span className="flex items-end gap-1 font-script text-2xl leading-none text-ink-soft">
            <Doodle name="arrow-swoop" size={48} className="-scale-x-100 rtl:scale-x-100" />
            two months free
          </span>
        </div>
      </header>

      <p role="status" className="sr-only">
        {period === "yearly" ? `Showing yearly prices. Studio saves you ${dollars(saved)} a year.` : "Showing monthly prices."}
      </p>

      <div className="mx-auto grid w-full max-w-md gap-12 pt-6 @4xl/pricing:max-w-none @4xl/pricing:grid-cols-3 @4xl/pricing:items-stretch @4xl/pricing:gap-8">
        {TIERS.map((t) => (
          <Pricing01Card
            key={t.id}
            id={`${uid}-${t.id}`}
            tier={t}
            period={period}
            chosen={chosen === t.id}
            onChoose={() => {
              setChosen(t.id)
              onChoose?.(t, period)
            }}
          />
        ))}
      </div>

      <Paper as="section" stock="slip" tilt={-0.3} seed="pricing-faq" aria-labelledby={`${uid}-faq`} className="mx-auto grid w-full max-w-2xl gap-4 px-6 py-6">
        <h3 id={`${uid}-faq`} className="font-script text-3xl leading-none font-semibold">
          Questions people ask
        </h3>
        <Accordion type="single" collapsible>
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`q${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Paper>
    </section>
  )
}
