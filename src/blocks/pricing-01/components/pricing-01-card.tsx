import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Highlight } from "@/components/ui/highlight"
import { Icon } from "@/components/ui/icon"
import { Sticker } from "@/components/ui/sticker"
import { dollars, perMonth, type Period, type Tier } from "@/blocks/pricing-01/components/pricing-01-data"
import { cn } from "@/lib/utils"

export function Pricing01Card({ id, tier, period, chosen, onChoose }: { id: string; tier: Tier; period: Period; chosen: boolean; onChoose: () => void }) {
  const free = tier.monthly === 0
  const title = `${id}-title`
  return (
    <Card
      as="article"
      aria-labelledby={title}
      stock={tier.popular ? "card" : "paper"}
      tape="top"
      tapeKind={tier.tape}
      seed={`price-${tier.id}`}
      data-popular={tier.popular ? "" : undefined}
      className={cn("relative h-full", tier.popular && "@4xl/pricing:-my-4 @4xl/pricing:pt-10 @4xl/pricing:pb-10")}
    >
      {tier.popular ? <Sticker name="first-place" size={76} rotate={10} seed="popular" className="absolute -end-2 -top-9 z-10 @4xl/pricing:-end-5" /> : null}
      <CardHeader>
        <CardTitle id={title} role="heading" aria-level={3} className="text-3xl">
          {tier.popular ? <Highlight>{tier.name}</Highlight> : tier.name}
          {tier.popular ? (
            <Badge size="sm" className="ms-3 align-middle">
              Most popular
            </Badge>
          ) : null}
        </CardTitle>
        <CardDescription>{tier.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="grid flex-1 content-start gap-6">
        <div>
          <p className="flex items-baseline gap-2.5">
            <span className="ll-num font-script text-6xl leading-none font-bold">{dollars(perMonth(tier, period))}</span>
            <span className="text-muted-foreground">{free ? "forever" : "a month"}</span>
          </p>
          <p className="mt-1 h-5 text-sm text-muted-foreground">{free ? "No card needed" : period === "yearly" ? `billed ${dollars(tier.yearly)} once a year` : "billed monthly"}</p>
        </div>
        <ul className="grid gap-2.5" aria-label={`${tier.name} includes`}>
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Icon name="check" className="mt-1 text-green" weight={1.3} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" variant={tier.popular ? "default" : "outline"} aria-pressed={chosen} onClick={onChoose}>
          {chosen ? "Picked" : tier.cta}
          {chosen ? <Icon name="check" /> : null}
        </Button>
      </CardFooter>
    </Card>
  )
}
