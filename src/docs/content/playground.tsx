import { useId, useState, type CSSProperties, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Desk } from "@/components/ui/desk"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InkProvider } from "@/lib/ink/react"
import { Link } from "../core/router"
import { paths } from "../core/router-core"
import { Callout, CodeBlock, InlineCode, Section, Stage } from "../kit"
import {
  DEFAULT_STATE,
  DENSITIES,
  LIVELY_DEGREES,
  TILT_MAX,
  TILTS,
  TIERS,
  isDefault,
  seedOf,
  snippets,
  type PlaygroundDensity,
  type PlaygroundState,
  type PlaygroundTier,
  type PlaygroundTilt,
} from "./home/playground-model"

const DENSITY_HINT: Record<PlaygroundDensity, string> = {
  comfortable: "Full ink, 40 px hit areas. The default.",
  compact: "The same drawings in 32 px rows, for tools.",
  calm: "Hairline pencil rules, no jitter, 28 px: a dense screen that stays quiet.",
}
const TIER_HINT: Record<PlaygroundTier, string> = {
  lo: "The interface tier: light, fast, fine at any size.",
  hi: "More strokes, richer fills. For hero art and screenshots.",
}
const TILT_HINT: Record<PlaygroundTilt, string> = {
  flat: "Sheets lie square. Text never tilts, in any setting.",
  natural: "Each sheet is turned a fraction of a degree, by its seed.",
  lively: "Turned up to four degrees, like a desk in a hurry.",
}

const ORDERS = [
  { id: "N-2041", who: "Ada Lovelace", status: "Paid", total: "$24.00" },
  { id: "N-2042", who: "Jo Okafor", status: "Pending", total: "$18.50" },
  { id: "N-2043", who: "Mika Kobayashi", status: "Paid", total: "$31.00" },
]

function Knob({ id, title, hint, children }: { id: string; title: string; hint: string; children: ReactNode }) {
  return (
    <div className="grid content-start gap-2">
      <p id={id} className="font-script text-2xl leading-none font-bold text-ink">
        {title}
      </p>
      {children}
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}

function Sample({ state }: { state: PlaygroundState }) {
  const seed = seedOf(state)
  const tiltOf = (i: number): boolean | number => (state.tilt === "flat" ? false : state.tilt === "lively" ? LIVELY_DEGREES[i % LIVELY_DEGREES.length] : true)
  return (
    <div style={{ "--ll-tilt-max": TILT_MAX[state.tilt] } as CSSProperties} className="grid items-start gap-10 @[62rem]:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
      <Card data-sample="order" seed={`${seed}:order`} tilt={tiltOf(0)} tape="top" className="w-full max-w-md @[62rem]:max-w-none">
        <CardHeader>
          <CardTitle>Order a notebook</CardTitle>
          <CardDescription>Ruled, dotted or blank. Ships in a week.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="pg-name">Name on the cover</FieldLabel>
              <Input id="pg-name" defaultValue="Ada Lovelace" autoComplete="off" />
            </Field>
            <Field>
              <FieldLabel htmlFor="pg-paper">Paper</FieldLabel>
              <Select defaultValue="ruled">
                <SelectTrigger id="pg-paper" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ruled">Ruled</SelectItem>
                  <SelectItem value="dots">Dotted</SelectItem>
                  <SelectItem value="blank">Blank</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal">
              <Switch id="pg-gift" />
              <FieldLabel htmlFor="pg-gift">Gift wrap it</FieldLabel>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button>Order</Button>
        </CardFooter>
      </Card>
      <Card data-sample="orders" seed={`${seed}:orders`} tilt={tiltOf(1)} fastener="clip" className="w-full">
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>Three this week.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ORDERS.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-bold">{o.id}</TableCell>
                  <TableCell>{o.who}</TableCell>
                  <TableCell>
                    <Badge variant={o.status === "Paid" ? "default" : "secondary"}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="ll-num text-end">{o.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PlaygroundBody() {
  const [state, setState] = useState<PlaygroundState>(DEFAULT_STATE)
  const ids = { density: useId(), tier: useId(), tilt: useId(), motion: useId() }
  const set = <K extends keyof PlaygroundState>(key: K, value: PlaygroundState[K]) => setState((s) => ({ ...s, [key]: value }))
  const code = snippets(state)
  const seed = seedOf(state)

  return (
    <div className="@container grid gap-10">
      <Stage layout="full" label="Knobs">
        <div className="grid gap-x-8 gap-y-6 p-5 @xl:grid-cols-2 @3xl:grid-cols-3">
          <Knob id={ids.density} title="Density" hint={DENSITY_HINT[state.density]}>
            <ToggleGroup type="single" variant="outline" value={state.density} onValueChange={(v) => v && set("density", v as PlaygroundDensity)} aria-labelledby={ids.density} className="flex-wrap">
              {DENSITIES.map((d) => (
                <ToggleGroupItem key={d} value={d}>
                  {d}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Knob>
          <Knob id={ids.tier} title="Tier" hint={TIER_HINT[state.tier]}>
            <ToggleGroup type="single" variant="outline" value={state.tier} onValueChange={(v) => v && set("tier", v as PlaygroundTier)} aria-labelledby={ids.tier}>
              {TIERS.map((t) => (
                <ToggleGroupItem key={t} value={t}>
                  {t}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Knob>
          <Knob id={ids.tilt} title="Tilt" hint={TILT_HINT[state.tilt]}>
            <ToggleGroup type="single" variant="outline" value={state.tilt} onValueChange={(v) => v && set("tilt", v as PlaygroundTilt)} aria-labelledby={ids.tilt}>
              {TILTS.map((t) => (
                <ToggleGroupItem key={t} value={t}>
                  {t}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Knob>
          <Knob id={ids.motion} title="Motion" hint={state.reduced ? "Reduced: no hover tilt, no draw-on, durations at zero." : "Follows the system setting."}>
            <div className="flex items-center gap-3">
              <Switch id="pg-motion" checked={state.reduced} onCheckedChange={(v) => set("reduced", v)} />
              <label htmlFor="pg-motion" className="font-hand text-[15px] font-bold">
                Reduce motion
              </label>
            </div>
          </Knob>
          <Knob id="pg-seed-title" title="Seed" hint="A new take is a new hand: every stroke on the sheets below is drawn again.">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => set("take", state.take + 1)}>
                <Icon name="shuffle" />
                Reroll
              </Button>
              <span className="font-mono text-sm text-ink-soft">
                seed <code>{seed}</code>
              </span>
            </div>
          </Knob>
          <div className="flex items-end">
            <Button variant="link" disabled={isDefault(state) && state.take === DEFAULT_STATE.take} onClick={() => setState(DEFAULT_STATE)}>
              Put everything back
            </Button>
          </div>
        </div>
      </Stage>

      <p role="status" className="dk-sr-only">
        Density {state.density}, tier {state.tier}, tilt {state.tilt}, motion {state.reduced ? "reduced" : "system"}, seed {seed}.
      </p>

      <Stage layout="full" label="Preview">
        <Desk seed="playground-desk" className="px-5 py-10 @2xl:px-10">
          <InkProvider key={state.take} tier={state.tier} density={state.density} motion={state.reduced ? "reduced" : "system"} defs={false}>
            <Sample state={state} />
          </InkProvider>
        </Desk>
      </Stage>

      <Section id="export" title="Your settings" description="Paste this where you mount the provider; leave out anything you did not change.">
        <CodeBlock code={code.provider} lang="tsx" title="providers.tsx" />
        {code.component ? <CodeBlock code={code.component} lang="tsx" title="on a sheet" copy={false} /> : null}
        {code.css ? <CodeBlock code={code.css} lang="css" title="index.css" /> : null}
        {code.attributes ? (
          <p className="dk-hint">
            Density and motion also work as attributes on any ancestor, usually the root: <InlineCode>{code.attributes}</InlineCode>
          </p>
        ) : null}
        <Callout tone="tip" title="Where do these go?">
          <p>
            Wrap the app once. The steps for Vite and Next.js are in <Link to={`${paths.gettingStarted}#provider`}>Getting started</Link>, and every prop is listed there. Tier and density change how a drawing is made; the seed and the
            tilt belong to one sheet, so they are props, not settings.
          </p>
        </Callout>
      </Section>
    </div>
  )
}
