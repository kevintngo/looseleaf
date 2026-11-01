import { useDeferredValue, useMemo, useState, type CSSProperties } from "react"
import { CodeBlock, InlineCode, Prose, Section } from "@/docs/kit"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { GRAINS, MASK_VARIANTS } from "@/lib/ink/builder"
import type { PenName, Tier } from "@/lib/ink/types"
import { cn } from "@/lib/utils"
import { InkPicture } from "./_shared/ink-picture"
import { Demo, Panel, Related, SliderRow, SwitchRow, TableScroll, component, foundation, td, th } from "./_shared/kit"
import {
  LAB_DEFAULTS,
  LAYER_STORY,
  drawCrossing,
  drawEnds,
  drawHatch,
  drawHierarchy,
  drawLab,
  drawSample,
  explodeStroke,
  hasWeights,
  labCode,
  penRows,
  type Exploded,
  type ExplodedLayer,
  type LabParams,
  type PenRow,
} from "./_shared/pen-lab"

const ROWS = penRows()
const MAIN = ROWS.filter((r) => r.group === "felt" || r.group === "pencil" || r.group === "marker")
const ACCENT_MARKERS = ROWS.filter((r) => r.group === "accent-marker")
const ACCENT_FELTS = ROWS.filter((r) => r.group === "accent-felt")

const kb = (chars: number) => `${(chars / 1024).toFixed(1)} KB`

const HERO_PENS: PenName[] = ["ink.brush", "blue", "pencil", "terracotta", "hi"]

function SamePens() {
  const drawn = useMemo(() => HERO_PENS.map((p) => ({ name: p, drawn: drawSample(p, { w: 190, h: 56, tier: "hi", seed: "hero" }) })), [])
  return (
    <ul role="list" aria-label="One line, five pens" className="m-0 flex list-none flex-wrap justify-center gap-x-6 gap-y-2 p-0">
      {drawn.map(({ name, drawn: d }) => (
        <li key={name} className="min-w-0 text-center">
          <InkPicture drawn={d} label={`The same wave in ${name}`} />
          <code className="font-mono text-[13px]">{name}</code>
        </li>
      ))}
    </ul>
  )
}

function TierToggle({ tier, onChange }: { tier: Tier; onChange: (t: Tier) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span id="tier-label" className="text-[15px] font-bold">
        Tier
      </span>
      <ToggleGroup type="single" variant="outline" size="sm" spacing={1} className="flex-wrap" value={tier} onValueChange={(v) => v && onChange(v as Tier)} aria-labelledby="tier-label">
        <ToggleGroupItem value="lo">lo: what components run</ToggleGroupItem>
        <ToggleGroupItem value="hi">hi: hero art</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

function PenTable({ tier }: { tier: Tier }) {
  const drawn = useMemo(() => new Map(MAIN.map((r) => [r.name, drawSample(r.name, { tier })])), [tier])
  return (
    <TableScroll label="The pen table">
      <table className="w-full min-w-[42rem] border-collapse text-[15px]">
        <caption className="sr-only">Every named pen: a sample stroke, its kind, width, opacity, grain, color token and the size of its drawing</caption>
        <thead>
          <tr>
            <th scope="col" className={th}>Stroke</th>
            <th scope="col" className={th}>Pen</th>
            <th scope="col" className={th}>Kind</th>
            <th scope="col" className={th}>Width</th>
            <th scope="col" className={th}>Opacity</th>
            <th scope="col" className={th}>Grain</th>
            <th scope="col" className={th}>Color</th>
            <th scope="col" className={th}>Markup</th>
          </tr>
        </thead>
        <tbody>
          {MAIN.map((r) => {
            const d = drawn.get(r.name)!
            return (
              <tr key={r.name}>
                <td className={td}>
                  <InkPicture drawn={d} label={`${r.label}, a sample stroke`} />
                </td>
                <th scope="row" className={cn(td, "text-start")}>
                  <code className="font-mono text-[13.5px] font-medium">{r.name}</code>
                  <span className="block text-[14px] font-normal text-muted-foreground">{r.label}</span>
                </th>
                <td className={td}>{r.kind}</td>
                <td className={cn(td, "ll-num font-mono text-[13.5px] whitespace-nowrap")}>{r.width} px</td>
                <td className={cn(td, "ll-num font-mono text-[13.5px]")}>{r.alpha}</td>
                <td className={cn(td, "font-mono text-[13.5px]")}>{r.grain}</td>
                <td className={cn(td, "font-mono text-[13.5px]")}>{r.colour}</td>
                <td className={cn(td, "ll-num font-mono text-[13.5px] whitespace-nowrap")}>{kb(d.svg.length)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </TableScroll>
  )
}

function PenGrid({ label, rows, tier }: { label: string; rows: readonly PenRow[]; tier: Tier }) {
  const drawn = useMemo(() => rows.map((r) => [r, drawSample(r.name, { tier, w: 132, h: 36 })] as const), [rows, tier])
  return (
    <ul role="list" aria-label={label} className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-x-4 gap-y-3 p-0">
      {drawn.map(([r, d]) => (
        <li key={r.name} className="min-w-0">
          <InkPicture drawn={d} label={`${r.label}, a sample stroke`} />
          <code className="font-mono text-[13px]">{r.name}</code>
        </li>
      ))}
    </ul>
  )
}

const WEIGHT_PENS: PenName[] = ["ink", "blue", "pencil", "red"]

function Weights({ tier }: { tier: Tier }) {
  const drawn = useMemo(
    () =>
      WEIGHT_PENS.map((p) =>
        (["fine", "", "brush"] as const).map((w) => {
          const name = (w ? `${p}.${w}` : p) as PenName
          return { name, drawn: drawSample(name, { tier, w: 150, h: 38 }) }
        }),
      ),
    [tier],
  )
  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
      {["fine: detail", "regular: the pen", "brush: the main shapes"].map((h) => (
        <p key={h} className="font-script text-xl font-bold">
          {h}
        </p>
      ))}
      {drawn.flat().map((c) => (
        <div key={c.name} className="min-w-0">
          <InkPicture drawn={c.drawn} label={`${c.name} sample`} />
          <code className="font-mono text-[13px]">{c.name}</code>
        </div>
      ))}
    </div>
  )
}

function LayerSvg({ ex, layers, label, centre }: { ex: Exploded; layers: readonly ExplodedLayer[]; label: string; centre?: boolean }) {
  const pad = ex.pad
  return (
    <svg
      data-ink="illustration"
      role="img"
      aria-label={label}
      focusable="false"
      viewBox={`${-pad} ${-pad} ${ex.w + 2 * pad} ${ex.h + 2 * pad}`}
      width={ex.w + 2 * pad}
      height={ex.h + 2 * pad}
      className="pointer-events-none block h-auto max-w-full overflow-visible"
    >
      {centre ? (
        <g stroke="var(--ll-pencil-mark)" fill="var(--ll-paper)">
          <path d={ex.centre} fill="none" strokeWidth="1" strokeDasharray="3 4" strokeLinecap="round" />
          {ex.points.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r="2.6" strokeWidth="1.2" />
          ))}
        </g>
      ) : null}
      {layers.map((l, i) => (
        <path key={i} d={l.d} fill={l.fill} fillOpacity={l.opacity} fillRule={l.evenodd ? "evenodd" : undefined} />
      ))}
    </svg>
  )
}

const ANATOMY_PENS: { value: PenName; label: string }[] = [
  { value: "ink.brush", label: "Felt brush pen" },
  { value: "pencil", label: "Pencil" },
  { value: "terracotta", label: "Marker" },
]

function Anatomy() {
  const [pen, setPen] = useState<PenName>("ink.brush")
  const ex = useMemo(() => explodeStroke({ pen, seed: "anatomy", tier: "hi" }), [pen])
  const kinds = useMemo(() => {
    const map = new Map<string, ExplodedLayer[]>()
    for (const l of ex.layers) map.set(l.kind, [...(map.get(l.kind) ?? []), l])
    return [...map]
  }, [ex])
  const whole = useMemo(() => drawSample(pen, { w: ex.w, h: ex.h, tier: "hi", seed: "anatomy" }), [pen, ex.w, ex.h])
  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <p id="anatomy-pen" className="text-[15px] font-bold">
          Take a stroke apart
        </p>
        <ToggleGroup type="single" variant="outline" size="sm" spacing={1} className="flex-wrap" value={pen} onValueChange={(v) => v && setPen(v as PenName)} aria-labelledby="anatomy-pen">
          {ANATOMY_PENS.map((p) => (
            <ToggleGroupItem key={p.value} value={p.value}>
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2" aria-label="The layers of one stroke, in the order they are painted">
        <li className="min-w-0">
          <LayerSvg ex={ex} layers={[]} centre label="The center line the hand follows, dotted" />
          <p className="mt-1 text-[15px] leading-snug">
            <strong>The intention.</strong> A handful of points. Everything else is the hand deciding how to round them into a line.
          </p>
        </li>
        {kinds.map(([kind, layers]) => (
          <li key={kind} className="min-w-0" data-layer-kind={kind}>
            <LayerSvg ex={ex} layers={layers} centre label={`The ${kind} layer of the stroke`} />
            <p className="mt-1 text-[15px] leading-snug">
              <strong className="font-mono text-[14px]">{kind}</strong>
              {layers.length > 1 ? <span className="text-muted-foreground"> ×{layers.length}</span> : null}. {LAYER_STORY[kind] ?? ""}
            </p>
          </li>
        ))}
        <li className="min-w-0">
          <LayerSvg ex={ex} layers={ex.layers} label="All the layers of the stroke together" />
          <p className="mt-1 text-[15px] leading-snug">
            <strong>Together.</strong> The layers, painted in order. Flat color so far.
          </p>
        </li>
        <li className="min-w-0">
          <InkPicture drawn={whole} label="A stroke by the same pen with its grain laid over it, as it ships" />
          <p className="mt-1 text-[15px] leading-snug">
            <strong>As shipped.</strong> The layers are merged per material and one color-independent grain mask is laid over them (another take by the same pen).
          </p>
        </li>
      </ol>
    </div>
  )
}

const ENDS: { start: "pool" | "soft"; end: "pool" | "flick" | "soft"; title: string; note: string }[] = [
  { start: "pool", end: "flick", title: "Pool, then flick", note: "The felt tip lands and blots; the hand lifts off with a quick tapered flick. Most strokes end this way." },
  { start: "pool", end: "pool", title: "Pool, pool", note: "It stops dead and the ink gathers: a dot at each end, like a period." },
  { start: "soft", end: "soft", title: "Soft, soft", note: "A light touch both ways: a small blot, no flick. For small marks and tight rules." },
]

function Ends() {
  const drawn = useMemo(() => ENDS.map((e) => ({ ...e, drawn: drawEnds({ pen: "ink.brush", start: e.start, end: e.end, seed: "ends" }) })), [])
  return (
    <ul role="list" className="m-0 grid list-none gap-5 p-0 sm:grid-cols-3" aria-label="Three ways a stroke can start and end">
      {drawn.map((e) => (
        <li key={e.title} className="min-w-0">
          <InkPicture drawn={e.drawn} label={`${e.title}: a stroke that starts ${e.start} and ends ${e.end}`} />
          <p className="mt-1 text-[15px] leading-snug">
            <strong>{e.title}.</strong> {e.note}
          </p>
        </li>
      ))}
    </ul>
  )
}

function PenSelect({ value, onChange }: { value: PenName; onChange: (p: PenName) => void }) {
  const withWeights = (rows: readonly PenRow[]) =>
    rows.flatMap((r) => (hasWeights(r.name) ? [r.name, `${r.name}.fine`, `${r.name}.brush`] : [r.name])) as PenName[]
  const group = (title: string, names: readonly PenName[]) => (
    <NativeSelectOptGroup label={title}>
      {names.map((n) => (
        <NativeSelectOption key={n} value={n}>
          {n}
        </NativeSelectOption>
      ))}
    </NativeSelectOptGroup>
  )
  return (
    <div className="grid gap-1.5">
      <Label htmlFor="lab-pen" className="text-[15px] font-bold">
        Pen
      </Label>
      <NativeSelect id="lab-pen" value={value} onChange={(e) => onChange(e.target.value as PenName)} className="w-full">
        {group("Felt tips", withWeights(ROWS.filter((r) => r.group === "felt")))}
        {group("Pencils", withWeights(ROWS.filter((r) => r.group === "pencil")))}
        {group("Markers", ROWS.filter((r) => r.group === "marker" || r.group === "accent-marker").map((r) => r.name))}
        {group("Colored felt tips", ROWS.filter((r) => r.group === "accent-felt").map((r) => r.name))}
      </NativeSelect>
    </div>
  )
}

function Lab() {
  const [p, setP] = useState<LabParams>(LAB_DEFAULTS)
  const set = <K extends keyof LabParams>(key: K, value: LabParams[K]) => setP((prev) => ({ ...prev, [key]: value }))
  const deferred = useDeferredValue(p)
  const drawn = useMemo(() => drawLab(deferred), [deferred])
  return (
    <div className="grid gap-5">
      <Demo label="A line drawn live by the pen engine">
        <div className="flex justify-center py-2">
          <InkPicture drawn={drawn} label={`Two strokes in ${deferred.pen}, at speed ${deferred.speed} and wobble ${deferred.wobble}`} className="bg-paper/70" />
        </div>
      </Demo>
      <Panel title="Hold the pen differently">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <PenSelect value={p.pen} onChange={(v) => set("pen", v)} />
          <div className="grid content-start gap-1.5">
            <p id="lab-tier" className="text-[15px] font-bold">
              Tier
            </p>
            <ToggleGroup type="single" variant="outline" size="sm" value={p.tier} onValueChange={(v) => v && set("tier", v as Tier)} aria-labelledby="lab-tier">
              <ToggleGroupItem value="lo">lo</ToggleGroupItem>
              <ToggleGroupItem value="hi">hi</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <SliderRow label="Speed" value={p.speed} min={0.4} max={2.5} step={0.05} onChange={(v) => set("speed", v)} format={(v) => `${v.toFixed(2)}×`} hint="Faster is thinner and drier. Slower is juicier." />
          <SliderRow label="Wobble" value={p.wobble} min={0} max={2.5} step={0.05} onChange={(v) => set("wobble", v)} format={(v) => (v === 0 ? "ruler" : v.toFixed(2))} hint="How unsteady the hand is." />
          <SliderRow label="Width" value={p.width} min={0.4} max={2.5} step={0.05} onChange={(v) => set("width", v)} format={(v) => `${v.toFixed(2)}×`} />
          <SliderRow label="Pressure" value={p.pressure} min={-0.6} max={0.8} step={0.05} onChange={(v) => set("pressure", v)} format={(v) => (v === 0 ? "even" : v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))} hint="Leaning in, in the middle of the stroke." />
          <SliderRow label="Dry tooth" value={p.dry} min={0} max={3} step={0.1} onChange={(v) => set("dry", v)} format={(v) => (v === 0 ? "never" : `${v.toFixed(1)}×`)} hint="How often the paper's tooth makes the line skip." />
          <div className="grid content-start gap-3">
            <div className="grid gap-1.5">
              <p id="lab-start" className="text-[15px] font-bold">
                Start
              </p>
              <ToggleGroup type="single" variant="outline" size="sm" value={p.start} onValueChange={(v) => v && set("start", v as LabParams["start"])} aria-labelledby="lab-start">
                <ToggleGroupItem value="pool">pool</ToggleGroupItem>
                <ToggleGroupItem value="soft">soft</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid gap-1.5">
              <p id="lab-end" className="text-[15px] font-bold">
                End
              </p>
              <ToggleGroup type="single" variant="outline" size="sm" value={p.end} onValueChange={(v) => v && set("end", v as LabParams["end"])} aria-labelledby="lab-end">
                <ToggleGroupItem value="pool">pool</ToggleGroupItem>
                <ToggleGroupItem value="flick">flick</ToggleGroupItem>
                <ToggleGroupItem value="soft">soft</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={() => set("seed", p.seed + 1)}>
            A new hand (seed {p.seed})
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setP(LAB_DEFAULTS)}>
            Reset
          </Button>
        </div>
      </Panel>
      <CodeBlock lang="ts" title="The line above, as code" code={labCode(deferred)} />
    </div>
  )
}

function Hatches() {
  const drawn = useMemo(() => ([1, 2, 3] as const).map((t) => ({ t, d: drawHatch(t) })), [])
  return (
    <ul role="list" className="m-0 flex list-none flex-wrap gap-x-8 gap-y-3 p-0" aria-label="Pencil hatching in one, two and three tones">
      {drawn.map(({ t, d }) => (
        <li key={t}>
          <InkPicture drawn={d} label={`Hatching, ${t} ${t === 1 ? "tone" : "tones"}`} />
          <code className="font-mono text-[13px]">tones: {t}</code>
        </li>
      ))}
    </ul>
  )
}

function Crossing() {
  const [multiply, setMultiply] = useState(true)
  const drawn = useMemo(() => drawCrossing(), [])
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
      <div style={{ "--ll-blend": multiply ? "multiply" : "normal" } as CSSProperties} data-testid="crossing">
        <InkPicture drawn={drawn} label="A yellow highlighter swipe crossed by a blue marker stripe" className="bg-paper" />
      </div>
      <SwitchRow label="Multiply (Notebook)" checked={multiply} onChange={setMultiply} hint="Markers and highlighters blend with --ll-blend. Where two overlap the pigment doubles, as on paper. A dark theme sets it to normal." />
    </div>
  )
}

export default function PensPage() {
  const [tier, setTier] = useState<Tier>("lo")
  return (
    <>
      <Section id="ribbons" title="A stroke is a ribbon, not a line">
        <Prose>
          <p>
            A normal SVG stroke is one width from end to end, which is exactly what a hand does not do. Here a pen turns a handful of points into a <strong>filled polygon</strong> whose width
            follows a speed profile: it swells where the hand slows and on the down-stroke, thins on the up-stroke, blots where it lands, skips where the paper&apos;s tooth catches it and flicks as it
            leaves. There are no filters and no blur; the texture is one color-independent grain mask laid over the ribbons.
          </p>
          <p>
            Everything is seeded. The same seed draws the same stroke on the server and in the browser; a different seed is a different hand.
          </p>
        </Prose>
        <Demo label="The same line, drawn by five pens">
          <SamePens />
        </Demo>
      </Section>

      <Section id="pen-table" title="The pen table" description="Every named pen, drawn live by the engine as this page loaded. The last column is the honest cost: the size of the markup that one stroke puts in the DOM.">
        <TierToggle tier={tier} onChange={setTier} />
        <Demo label="Every named pen, one sample stroke each">
          <PenTable tier={tier} />
        </Demo>
        <Section id="weights" level={3} title="Fine, regular, brush" description="Two weight classes give a drawing hierarchy. The fine-liner does detail; the brush does the things that matter.">
          <Demo label="Four pens in the three weight classes">
            <Weights tier={tier} />
          </Demo>
        </Section>
        <Section id="accents" level={3} title="Colored pens" description="Every stationery accent has a marker (m_) and a felt tip (f_). They are for decoration: stickers, washi, chart fills.">
          <Demo label="Accent markers and felt tips">
            <div className="grid gap-5">
              <PenGrid label="Accent markers" rows={ACCENT_MARKERS} tier={tier} />
              <PenGrid label="Accent felt tips" rows={ACCENT_FELTS} tier={tier} />
            </div>
          </Demo>
        </Section>
      </Section>

      <Section id="anatomy" title="How a stroke is made" description="Pick a pen and take its stroke apart into the polygons the engine paints, bottom to top.">
        <Demo label="The layers of one stroke">
          <Anatomy />
        </Demo>
        <Section id="ends" level={3} title="Pooling and flick" description="The two ends of a stroke are separate decisions, seeded per stroke unless you set them. Here the same line takes three endings.">
          <Demo label="Three starts and ends of the same stroke">
            <Ends />
          </Demo>
        </Section>
      </Section>

      <Section id="lab" title="Draw with it" description="The same engine, with its dials in reach. Speed, wobble, width, pressure and the paper's tooth are options of one call; this page never touches an SVG stroke.">
        <Lab />
      </Section>

      <Section id="hierarchy" title="Two weights make a drawing" description="With one pen for everything a drawing is flat. Put the brush on the two shapes that matter and the fine-liner on the rest and it reads at a glance.">
        <Demo label="One weight for everything, and two weights">
          <div className="grid gap-6 sm:grid-cols-2">
            <figure className="m-0">
              <InkPicture drawn={drawHierarchy("flat")} label="A small note drawn with one pen for every line" />
              <figcaption className="mt-1 text-[14.5px] text-muted-foreground">One pen for every line.</figcaption>
            </figure>
            <figure className="m-0">
              <InkPicture drawn={drawHierarchy("layered")} label="The same note with a brush pen for the title and tick and a fine pencil for the rules" />
              <figcaption className="mt-1 text-[14.5px] text-muted-foreground">Brush for the title and the tick, fine pencil for the rules.</figcaption>
            </figure>
          </div>
        </Demo>
      </Section>

      <Section id="fills" title="Fills sit in register" description="A fill is its own layer, printed in register with its line: one solid color that reaches just under the outline, so a shape reads at a glance and nothing is left unfilled.">
        <Section id="hatching" level={3} title="Hatching" description="Pencil hatching is the pattern channel: destructive buttons, disabled fills and chart series use it so meaning never rides on hue alone.">
          <Demo label="Pencil hatching in one, two and three tones">
            <Hatches />
          </Demo>
        </Section>
      </Section>

      <Section id="materials" title="Materials and grain" description={`Each material has one grain mask: ${GRAINS.join(", ")}. Each has ${MASK_VARIANTS} phase variants, so two neighbors never share the same speckle.`}>
        <Demo label="A highlighter and a marker crossing, multiplied or not">
          <Crossing />
        </Demo>
        <Prose>
          <p>
            Grain is baked once as a mask and reused for any color, so a theme never rebakes a texture. Components do not call the pen themselves: they hand a <InlineCode>defineRecipe</InlineCode>{" "}
            function a box and a seed, and it calls shapes (<InlineCode>box</InlineCode>, <InlineCode>underline</InlineCode>, <InlineCode>bandFill</InlineCode>) that call the pen. The page above
            is the only place the raw pen is on show.
          </p>
        </Prose>
        <CodeBlock
          lang="ts"
          title="A recipe, the way a component draws"
          code={`import { bandFill } from "@/lib/ink/fills"
import { box } from "@/lib/ink/shapes"
import { roundRectPoly } from "@/lib/ink/geom"
import { defineRecipe } from "@/lib/ink/recipes"

export const chipRecipe = defineRecipe({
  id: "chip",
  layers: ["rest"],
  pad: 12,
  draw(ink, { w, h }) {
    ink.layer("rest", () => {
      ink.part("fill", () => bandFill(ink, roundRectPoly(2, 2, w - 4, h - 4, 4), "hi"))
      box(ink, 0, 0, w, h, { pen: "ink.fine", corner: 4 })
    })
  },
})`}
        />
      </Section>

      <Related
        items={[
          foundation("paper", "Paper", "What all this ink dries on."),
          foundation("motion", "Motion", "Draw-on, boil and soak: the pen in time."),
          foundation("density", "Density", "Calm: hairlines, no wobble, no offset."),
          component("underline", "Underline", "A pen line under real words."),
          component("highlight", "Highlight", "The highlighter as a component."),
          component("sketchpad", "Sketchpad", "Draw with these pens yourself."),
        ]}
      />
    </>
  )
}

