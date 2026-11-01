import { useCallback, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { CodeBlock, InlineCode, Prose, Section } from "@/docs/kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, resolveKnobs } from "@/lib/ink/recipes"
import { cn } from "@/lib/utils"
import { DENSITY } from "./_shared/data.generated"
import { Demo, Related, TableScroll, component, foundation, td, th } from "./_shared/kit"
import { measureTarget, type Size } from "./_shared/measure-target"

type Density = "comfortable" | "compact" | "calm"
const DENSITIES: readonly Density[] = ["comfortable", "compact", "calm"]

const ONE_LINER: Record<Density, string> = {
  comfortable: "The default. Full hand: wobble, taped and tilted sheets, solid fills. For marketing pages, onboarding, anything a thumb will touch.",
  compact: "The same hand in a smaller box. Hit sizes and control heights shrink, and the fill offset and the pen get a touch lighter. For app screens.",
  calm: "Hairline pencil, no wobble tricks, no jitter, no fill offset, flat sheets. For dense tables and long forms, where charm is a cost.",
}

const ROWS: { token: string; label: string; unit?: string; note: string }[] = [
  { token: "--ll-hit", label: "Hit size", unit: "px", note: "a token for your own controls (h-hit, size-hit); the library's controls set their own heights, see the table below. The floor, --ll-hit-min, is 24" },
  { token: "--ll-wobble", label: "Wobble", note: "how unsteady the hand is" },
  { token: "--ll-stroke-fine", label: "Pen weight", note: "scales every pen" },
  { token: "--ll-misreg-k", label: "Misregistration", note: "how far a fill misses its outline" },
  { token: "--ll-jitter-k", label: "Word jitter", note: "per-word baseline wander" },
  { token: "--ll-tilt-max", label: "Largest sheet tilt", note: "no sheet turns further" },
]

const clean = (v: string | undefined) => (v ?? "").replace(/px$/, "")

function Numbers() {
  return (
    <TableScroll label="What each density sets">
      <table className="w-full min-w-[32rem] border-collapse text-[15px]">
        <caption className="sr-only">The knobs each density sets, as read from the stylesheet</caption>
        <thead>
          <tr>
            <th scope="col" className={th}>Knob</th>
            {DENSITIES.map((d) => (
              <th key={d} scope="col" className={th}>{d}</th>
            ))}
            <th scope="col" className={th}>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.token}>
              <th scope="row" className={cn(td, "text-start")}>
                {r.label}
                <code className="block font-mono text-[12.5px] font-normal text-pencil-text">{r.token}</code>
              </th>
              {DENSITIES.map((d) => (
                <td key={d} className={cn(td, "ll-num font-mono text-[13.5px]")}>
                  {clean(DENSITY[d][r.token])}
                  {r.unit ?? ""}
                </td>
              ))}
              <td className={cn(td, "text-[14.5px]")}>{r.note}</td>
            </tr>
          ))}
          <tr>
            <th scope="row" className={cn(td, "text-start")}>
              Engine multipliers
              <code className="block font-mono text-[12.5px] font-normal text-pencil-text">resolveKnobs()</code>
            </th>
            {DENSITIES.map((d) => {
              const k = resolveKnobs(DEFAULT_KNOBS, d)
              return (
                <td key={d} className={cn(td, "ll-num font-mono text-[12.5px] leading-snug")}>
                  {d === "calm" ? "own calm flag" : `misreg ×${k.misreg}, width ×${k.width}`}
                </td>
              )
            })}
            <td className={cn(td, "text-[14.5px]")}>calm hands the engine its own switch: hairline, wobble ×0.3, no fill offset, low tier</td>
          </tr>
        </tbody>
      </table>
    </TableScroll>
  )
}

function SettingsCard({ density }: { density: Density }) {
  const id = useId()
  return (
    <InkProvider density={density} defs={false}>
      <Card seed={`density:${density}`} tape="corner" className="w-full gap-4 py-5" data-testid={`card-${density}`}>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>How you show up on the page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input id={`${id}-name`} defaultValue="Ada Lovelace" />
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox id={`${id}-weekly`} defaultChecked />
            <Label htmlFor={`${id}-weekly`}>The weekly page</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Switch id={`${id}-public`} defaultChecked />
            <Label htmlFor={`${id}-public`}>Public profile</Label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup type="single" variant="outline" size="sm" defaultValue="list" aria-label="Layout">
              <ToggleGroupItem value="list">List</ToggleGroupItem>
              <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
            </ToggleGroup>
            <Badge variant="secondary">3 drafts</Badge>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </InkProvider>
  )
}

function SideBySide() {
  return (
    <div className="@container">
      <ul role="list" className="m-0 grid list-none gap-x-6 gap-y-10 p-0 @md:grid-cols-2 @2xl:grid-cols-3">
        {DENSITIES.map((d) => (
          <li key={d} className="min-w-0">
            <p className="mb-3 font-script text-2xl leading-none font-bold">
              {d}{" "}
              <span className="ll-num font-mono text-[13px] font-normal text-pencil-text">hit {clean(DENSITY[d]["--ll-hit"])} px</span>
            </p>
            <SettingsCard density={d} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Box({ name, onMeasure, children }: { name: string; onMeasure: (name: string, size: Size) => void; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [grow, setGrow] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const size = measureTarget(el)
      setGrow(size.grow)
      onMeasure(name, size)
    }
    measure()
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [name, onMeasure])
  return (
    <span ref={ref} className="inline-flex outline-1 outline-dashed outline-ink-you/70" style={{ outlineOffset: grow }} data-hit={name}>
      {children}
    </span>
  )
}

function HitRow({ density }: { density: Density }) {
  const [sizes, setSizes] = useState<Record<string, Size>>({})
  const measure = useCallback((name: string, size: Size) => setSizes((s) => (s[name]?.w === size.w && s[name]?.h === size.h ? s : { ...s, [name]: size })), [])
  const label = (name: string) => (sizes[name] && sizes[name]!.h > 0 ? `${sizes[name]!.w} × ${sizes[name]!.h}` : "n/a")
  return (
    <InkProvider density={density} defs={false}>
      <div data-testid={`hits-${density}`}>
        <p className="mb-2 font-script text-xl leading-none font-bold">{density}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Box name="Button" onMeasure={measure}>
            <Button>Save</Button>
          </Box>
          <Box name="Icon button" onMeasure={measure}>
            <Button size="icon" variant="outline" aria-label={`Add (${density})`}>
              <Icon name="plus" />
            </Button>
          </Box>
          <Box name="Input" onMeasure={measure}>
            <Input aria-label={`Name (${density})`} defaultValue="Ada" className="w-28" />
          </Box>
          <Box name="Checkbox" onMeasure={measure}>
            <Checkbox aria-label={`Weekly (${density})`} defaultChecked />
          </Box>
          <Box name="Switch" onMeasure={measure}>
            <Switch aria-label={`Public (${density})`} defaultChecked />
          </Box>
        </div>
        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-ink-soft">
          {["Button", "Icon button", "Input", "Checkbox", "Switch"].map((n) => (
            <div key={n} className="flex gap-1.5">
              <dt>{n}</dt>
              <dd className="ll-num font-mono">{label(n)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </InkProvider>
  )
}

const CHANGES: [string, string, string, string][] = [
  ["Outline", "A felt-tip box that overshoots at the corners, sometimes with a ghost pencil line.", "The same, a touch finer (pen ×0.94).", "One hairline pencil loop. No stubs, no ghost line."],
  ["Fill", "One solid pass, in register.", "The same.", "The same, a shade lighter."],
  ["Hover", "Drop-lines, a slight turn of the drawing, the fill nudging further off.", "The same.", "A second inset hairline. Still visible without hue."],
  ["Focus", "A blue ring with corner ticks, 2.2 px, 4 px off.", "The same.", "The same. The ring is never toned down."],
  ["Word jitter", "Every word a hair off the baseline.", "Written lighter (×0.7).", "Off."],
  ["Sheets", "A seeded tilt up to 2°, torn or deckled edges, a full umber shadow.", "The same.", "Flat, a plain cut edge, a hairline shadow."],
  ["Tape, clips, pins", "Shown.", "Shown.", "Hidden."],
  ["Boil", "Runs on the things that are alive.", "Runs.", "Stands still."],
  ["Button height", "36 px", "32 px", "28 px"],
]

function Changes() {
  return (
    <TableScroll label="What each density does to the drawing">
      <table className="w-full min-w-[40rem] border-collapse text-[15px]">
        <caption className="sr-only">What changes in the drawing from comfortable to compact to calm</caption>
        <thead>
          <tr>
            <th scope="col" className={th}>Thing</th>
            {DENSITIES.map((d) => (
              <th key={d} scope="col" className={th}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CHANGES.map(([thing, a, b, c]) => (
            <tr key={thing}>
              <th scope="row" className={cn(td, "text-start font-bold")}>{thing}</th>
              <td className={cn(td, "text-[14.5px]")}>{a}</td>
              <td className={cn(td, "text-[14.5px]")}>{b}</td>
              <td className={cn(td, "text-[14.5px]")}>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  )
}

export default function DensityPage() {
  return (
    <>
      <Section id="dial" title="Charm is a dial">
        <Prose>
          <p>
            A wobbling pen is delightful on a sign-up button and exhausting on the four-hundredth row of a table. So the hand has three settings, and they are one attribute
            away: <InlineCode>data-density</InlineCode> on any element, or the <InlineCode>density</InlineCode> prop of the provider.
          </p>
          <ul>
            {DENSITIES.map((d) => (
              <li key={d}>
                <strong>{d}.</strong> {ONE_LINER[d]}
              </li>
            ))}
          </ul>
        </Prose>
      </Section>

      <Section id="side-by-side" title="The same card, three densities" description="One component, one seed for its hand, three providers. Look at the outlines, the fills, the tape at the corner, and how far the sheet leans.">
        <Demo label="An account card in comfortable, compact and calm density">
          <SideBySide />
        </Demo>
      </Section>

      <Section id="numbers" title="The numbers" description="Read from the stylesheet when this page was built. Compact is a smaller box, not a quieter hand; calm changes almost everything.">
        <Numbers />
      </Section>

      <Section id="hit-boxes" title="Hit boxes, measured" description="The dashed line is the real hit area, measured in your browser right now: the element's box, or the ::after that a checkbox or switch uses to grow its target. The drawing may be smaller than the target, never larger, and no target is under 24 px.">
        <Demo label="Five controls in each density, outlined at their real size">
          <div className="grid gap-6">
            {DENSITIES.map((d) => (
              <HitRow key={d} density={d} />
            ))}
          </div>
        </Demo>
      </Section>

      <Section id="what-changes" title="What actually changes">
        <Changes />
        <Prose>
          <p>
            Some things never change with density: labels stay at 14 px or more, text input at 16 px on touch, chart axes at 12 px, and every hit box at 24 px or more. Calm is quieter, not smaller
            print.
          </p>
        </Prose>
      </Section>

      <Section id="using" title="Choosing and setting it">
        <Prose>
          <ul>
            <li><strong>Comfortable</strong> for marketing, onboarding, empty states and anything that wants to be remembered.</li>
            <li><strong>Compact</strong> for the working screens of an app: lists, settings, dashboards.</li>
            <li><strong>Calm</strong> for admin tables, long forms and anything a person will stare at for an hour.</li>
          </ul>
          <p>Density nests. A calm table inside a comfortable page is one wrapper.</p>
        </Prose>
        <CodeBlock
          lang="tsx"
          title="Three ways to set it"
          code={`// the whole app (the provider also tells the drawing engine)
<InkProvider density="compact">…</InkProvider>

<section data-density="calm">…</section>

<Button className="compact:h-8 calm:h-7">Save</Button>`}
        />
      </Section>

      <Related
        items={[
          foundation("pens", "Pens", "The hand that calm quiets."),
          foundation("paper", "Paper", "Flat sheets and plain cuts."),
          foundation("motion", "Motion", "Why calm stops the boil."),
          foundation("theming", "Theming", "Density is a token block like any other."),
          component("table", "Table", "The component calm is for."),
        ]}
      />
    </>
  )
}
