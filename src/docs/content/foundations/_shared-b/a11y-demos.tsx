import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { Direction } from "radix-ui"
import { Boil } from "@/components/ui/boil"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Doodle } from "@/components/ui/doodle"
import { Handwritten } from "@/components/ui/handwritten"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mascot } from "@/components/ui/mascot"
import { Seal } from "@/components/ui/seal"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Stamp } from "@/components/ui/stamp"
import { Sticker } from "@/components/ui/sticker"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TypingIndicator } from "@/components/ui/typing-indicator"
import { InkProvider } from "@/lib/ink/react"
import { Chip, InlineCode, Stage } from "@/docs/kit"
import { CONTRAST_ROWS, type ContrastRow } from "./contrast-data.generated"
import { DataTable, Specimen } from "./layout"

export function KeyboardStrip() {
  const id = useId()
  return (
    <Stage layout="stack" label="Controls to try with the keyboard">
      <div className="flex w-full flex-col gap-5 text-ink">
        <p className="m-0 text-pencil-text">Click into the page, then press Tab. Each control takes one stop; the toggle group takes one stop for all three and the arrow keys move inside it.</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button variant="outline">Save</Button>
          <span className="flex items-center gap-2">
            <Checkbox id={`${id}-remember`} />
            <Label htmlFor={`${id}-remember`}>Remember me</Label>
          </span>
          <span className="flex items-center gap-2">
            <Switch id={`${id}-notify`} />
            <Label htmlFor={`${id}-notify`}>Notify me</Label>
          </span>
        </div>
        <ToggleGroup type="single" variant="outline" size="sm" defaultValue="center" aria-label="Alignment">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
        <Slider aria-label="Pencil pressure" defaultValue={[40]} className="max-w-sm" />
      </div>
    </Stage>
  )
}

const FORCED = { "data-focus-visible": true } as const

export function FocusSpecimens() {
  return (
    <Stage layout="center" label="The focus ring on four controls">
      <Specimen caption="default">
        <Button {...FORCED}>Save</Button>
      </Specimen>
      <Specimen caption="outline">
        <Button variant="outline" {...FORCED}>
          Cancel
        </Button>
      </Specimen>
      <Specimen caption="ghost">
        <Button variant="ghost" {...FORCED}>
          More
        </Button>
      </Specimen>
      <Specimen caption="destructive">
        <Button variant="destructive" {...FORCED}>
          Delete
        </Button>
      </Specimen>
      <Specimen caption="icon button">
        <Button size="icon" variant="outline" aria-label="Settings" {...FORCED}>
          <Icon name="settings" />
        </Button>
      </Specimen>
      <Specimen caption="toggle">
        <Toggle variant="outline" aria-label="Bold" {...FORCED}>
          <Icon name="bold" />
        </Toggle>
      </Specimen>
    </Stage>
  )
}

const HEADLINE: readonly string[] = [
  "card-foreground|card",
  "foreground|background",
  "--ll-ink-soft|--ll-paper",
  "muted-foreground|card",
  "muted-foreground|background",
  "--ll-ink-you|--ll-paper",
  "--ll-red|--ll-paper",
  "--ll-green|--ll-paper",
  "primary-foreground|primary",
  "destructive-foreground|destructive",
  "ring|card",
  "ring|background",
  "border|card",
  "--ll-ink|--ll-tomato",
]

const key = (r: ContrastRow) => `${r.fg}|${r.bg}`

export const HEADLINE_ROWS: readonly ContrastRow[] = HEADLINE.map((k) => CONTRAST_ROWS.find((r) => key(r) === k)).filter((r): r is ContrastRow => !!r)

export function gradeOf(ratio: number): string {
  if (ratio >= 7) return "AAA"
  if (ratio >= 4.5) return "AA"
  if (ratio >= 3) return "AA large text and marks"
  return "decorative only"
}

const ratioText = (r: number) => `${r.toFixed(2)} : 1`

function ContrastTable({ rows, label }: { rows: readonly ContrastRow[]; label: string }) {
  return (
    <DataTable label={label} minWidth="40rem">
      <thead>
        <tr>
          <th scope="col">Sample</th>
          <th scope="col">Pair</th>
          <th scope="col">Ratio</th>
          <th scope="col">Needs</th>
          <th scope="col">Verdict</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const known = r.level === "warn" && r.ratio < r.min
          return (
            <tr key={`${key(r)}|${r.purpose}`}>
              <td>
                <span className="inline-block min-w-14 px-3 py-1 text-center font-script text-2xl leading-none" style={{ color: r.fgHex, background: r.bgHex }} aria-hidden="true">
                  Aa
                </span>
              </td>
              <td>
                {r.purpose}
                <span className="block font-mono text-xs text-pencil-text">
                  {r.fg} on {r.bg}
                </span>
              </td>
              <td className="font-type whitespace-nowrap">{ratioText(r.ratio)}</td>
              <td className="font-type whitespace-nowrap">{ratioText(r.min)}</td>
              <td>{known ? <Chip tone="experimental">known limit</Chip> : gradeOf(r.ratio)}</td>
            </tr>
          )
        })}
      </tbody>
    </DataTable>
  )
}

export function ContrastSection() {
  const [all, setAll] = useState(false)
  const sections = [...new Set(CONTRAST_ROWS.map((r) => r.section))]
  return (
    <div data-slot="contrast">
      <ContrastTable rows={HEADLINE_ROWS} label="The contrast pairs people ask about" />
      <p className="mt-4">
        <Button variant="outline" size="sm" onClick={() => setAll((v) => !v)} aria-expanded={all} aria-controls="all-contrast">
          {all ? "Hide the full table" : `Show all ${CONTRAST_ROWS.length} pairs`}
        </Button>
      </p>
      {all ? (
        <div id="all-contrast" className="mt-4 flex flex-col gap-8">
          {sections.map((s) => (
            <div key={s}>
              <h3 className="m-0 mb-2 font-script text-2xl text-ink">{s}</h3>
              <ContrastTable rows={CONTRAST_ROWS.filter((r) => r.section === s)} label={s} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function MotionThings({ seed }: { seed: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-ink">
      <Spinner className="size-10" />
      <TypingIndicator label="Someone is typing" />
      <Boil>
        <Doodle name="sun" size={64} seed={seed} />
      </Boil>
    </div>
  )
}

export function MotionCompare() {
  return (
    <Stage layout="center" label="The same animations, with and without calm ink">
      <Specimen caption="follows your system setting" className="min-w-64 flex-1">
        <MotionThings seed="system" />
      </Specimen>
      <Specimen caption={<>inside <code>motion=&quot;reduced&quot;</code>: nothing moves, and nothing is left half drawn</>} className="min-w-64 flex-1">
        <InkProvider motion="reduced" defs={false}>
          <MotionThings seed="reduced" />
        </InkProvider>
      </Specimen>
    </Stage>
  )
}

function RtlPane({ dir, idPrefix }: { dir: "ltr" | "rtl"; idPrefix: string }) {
  return (
    <Direction.DirectionProvider dir={dir}>
      <div dir={dir} className="flex w-full min-w-56 flex-1 flex-col gap-4 text-ink">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline">
            <Icon name="arrow-left" />
            Back
          </Button>
          <Button>
            Next
            <Icon name="arrow-right" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Icon name="chevron-right" size={24} />
          <Icon name="panel-left" size={24} />
          <Icon name="undo-2" size={24} />
          <span className="text-sm text-pencil-text">direction glyphs turn around</span>
        </div>
        <Input placeholder="Search the notebook" aria-label={`Search (${dir})`} />
        <span className="flex items-center gap-2">
          <Checkbox id={`${idPrefix}-c`} defaultChecked />
          <Label htmlFor={`${idPrefix}-c`}>Remember me</Label>
        </span>
        <Slider aria-label={`Pencil pressure (${dir})`} defaultValue={[35]} dir={dir} />
      </div>
    </Direction.DirectionProvider>
  )
}

export function RtlCompare() {
  const id = useId()
  return (
    <Stage layout="center" label="Left to right and right to left, side by side">
      <RtlPane dir="ltr" idPrefix={`${id}-ltr`} />
      <RtlPane dir="rtl" idPrefix={`${id}-rtl`} />
    </Stage>
  )
}

const DENSITIES = [
  { density: "comfortable", hit: 36 },
  { density: "compact", hit: 32 },
  { density: "calm", hit: 28 },
] as const

export function TargetsDemo() {
  const [hits, setHits] = useState(true)
  const id = useId()
  return (
    <div data-slot="targets">
      <div className="mb-4 flex items-center gap-3">
        <Switch id={id} checked={hits} onCheckedChange={setHits} />
        <Label htmlFor={id}>Outline each button&apos;s real box</Label>
      </div>
      <Stage layout="center" label="Buttons at three densities">
        {DENSITIES.map(({ density, hit }) => (
          <Specimen key={density} caption={<>{density}: {hit} px tall</>} className="min-w-40 flex-1">
            <InkProvider density={density} defs={false}>
              <div className={hits ? "flex flex-wrap items-center justify-center gap-3 [&_button]:outline-1 [&_button]:outline-dashed [&_button]:outline-red" : "flex flex-wrap items-center justify-center gap-3"}>
                <Button variant="outline">Save</Button>
                <Button size="icon" variant="outline" aria-label={`Settings (${density})`}>
                  <Icon name="settings" />
                </Button>
              </div>
            </InkProvider>
          </Specimen>
        ))}
      </Stage>
    </div>
  )
}

const ATTRS = ["role", "aria-hidden", "aria-label", "focusable"] as const

function useProbe() {
  const ref = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState("")
  useEffect(() => {
    const svg = ref.current?.querySelector("svg")
    if (!svg) return
    setText(ATTRS.flatMap((a) => (svg.hasAttribute(a) ? [`${a}="${svg.getAttribute(a)}"`] : [])).join(" "))
  }, [])
  return { ref, text }
}

function ProbeRow({ code, children }: { code: string; children: ReactNode }) {
  const { ref, text } = useProbe()
  return (
    <tr data-probe="">
      <td>
        <span ref={ref} className="inline-flex min-h-8 items-center">
          {children}
        </span>
      </td>
      <td>
        <code className="font-mono text-sm break-all">{code}</code>
      </td>
      <td>
        <code className="font-mono text-sm break-all" data-attrs="">
          {text || "..."}
        </code>
      </td>
    </tr>
  )
}

export function ScreenReaderProbe() {
  return (
    <DataTable label="What the DOM says about each kind of drawing" minWidth="38rem">
      <thead>
        <tr>
          <th scope="col">Drawn</th>
          <th scope="col">You write</th>
          <th scope="col">The svg carries</th>
        </tr>
      </thead>
      <tbody>
        <ProbeRow code='<Icon name="trash" />'>
          <Icon name="trash" size={24} />
        </ProbeRow>
        <ProbeRow code='<Icon name="trash" label="Delete" />'>
          <Icon name="trash" size={24} label="Delete" />
        </ProbeRow>
        <ProbeRow code='<Doodle name="star" />'>
          <Doodle name="star" size={48} />
        </ProbeRow>
        <ProbeRow code='<Sticker name="rocket" />'>
          <Sticker name="rocket" size={48} />
        </ProbeRow>
        <ProbeRow code='<Sticker name="rocket" label="Launched" />'>
          <Sticker name="rocket" size={48} label="Launched" />
        </ProbeRow>
        <ProbeRow code='<Stamp name="stamp-approved" />'>
          <Stamp name="stamp-approved" />
        </ProbeRow>
        <ProbeRow code='<Seal text="BEST" size={48} />'>
          <Seal text="BEST" size={48} />
        </ProbeRow>
        <ProbeRow code='<Mascot pose="wave" />'>
          <Mascot pose="wave" size={48} />
        </ProbeRow>
      </tbody>
    </DataTable>
  )
}

const SENTENCE = "Ask Sam about the pond, and bring the big umbrella!"

export function JitterDemo() {
  const ref = useRef<HTMLElement>(null)
  const [plain, setPlain] = useState("")
  useEffect(() => {
    setPlain(ref.current?.textContent ?? "")
  }, [])
  return (
    <Stage layout="stack" label="Handwritten text">
      <div className="flex w-full flex-col gap-4 text-ink">
        <Handwritten as="p" className="m-0 font-script text-3xl" strength={2} ref={ref}>
          {SENTENCE}
        </Handwritten>
        <p className="m-0 text-pencil-text">
          <strong className="text-ink">textContent:</strong> <span data-plain="">{plain || "..."}</span>
        </p>
        <p className="m-0 text-pencil-text">
          <strong className="text-ink">strength=&#123;0&#125;:</strong> <InlineCode>&lt;Handwritten strength=&#123;0&#125;&gt;</InlineCode> renders the text with no spans at all.
        </p>
      </div>
    </Stage>
  )
}
