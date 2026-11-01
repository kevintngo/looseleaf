import { useDeferredValue, useId, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Doodle } from "@/components/ui/doodle"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"
import { Seal, sealMarkList, sealVariantList } from "@/components/ui/seal"
import { Stamp } from "@/components/ui/stamp"
import { Sticker } from "@/components/ui/sticker"
import { Switch } from "@/components/ui/switch"
import { Stage, cx } from "@/docs/kit"
import { ArtShelf } from "./art-shelf"
import { BADGE_ENTRIES, DOODLE_ENTRIES, DOODLE_FAMILIES, PEELABLE_ENTRIES, PEELABLE_FAMILIES, STAMP_ENTRIES } from "./catalog"
import { Choice, ControlLabel } from "./controls"
import { useCopyStatus, CopyStatus } from "./gallery"
import {
  customStampSnippet,
  doodleSnippet,
  doodleTierLabel,
  importLine,
  sealSnippet,
  stampSnippet,
  stickerSnippet,
  stickerTierLabel,
} from "./snippets"

const sizeOptions = (sizes: readonly number[]) => sizes.map((px) => ({ value: String(px), label: String(px), name: `${px} pixels` }))

function Setting({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <ControlLabel>{label}</ControlLabel>
      {children}
      {hint ? <p className="text-[15px] text-muted-foreground m-0">{hint}</p> : null}
    </div>
  )
}

export function ArtCluster() {
  return (
    <Stage layout="center" surface="desk" label="A sticker desk: line art on a sheet, stickers and a seal beside it">
      <Paper stock="graph" className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 p-6">
        <Doodle name="star" size={72} rotate={-8} />
        <Mascot pose="celebrate" size={96} />
        <Stamp name="stamp-approved" />
      </Paper>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
        <Sticker name="rocket" size={96} peel />
        <Sticker name="cupcake" size={96} />
        <Sticker name="fox" size={96} />
        <Seal variant="rosette" text="BEST" tone="lemon" />
      </div>
    </Stage>
  )
}

export function DoodleShelf() {
  const [size, setSize] = useState(96)
  const drawn = useDeferredValue(size)
  const art = Math.max(drawn, 48) + 8
  return (
    <ArtShelf
      slug="doodle"
      noun="doodles"
      entries={DOODLE_ENTRIES}
      families={DOODLE_FAMILIES}
      searchPlaceholder="Search doodles: star, arrow, flourish, cat"
      controls={
        <Setting label="Size" hint={`${size} px: ${doodleTierLabel(size)}. Below 72 px a doodle is redrawn with one identifying detail; from 120 px some gain extra detail.`}>
          <Choice label="Doodle size" value={String(size)} onChange={(v) => setSize(Number(v))} options={sizeOptions([48, 72, 96, 128])} />
        </Setting>
      }
      tile={{ min: Math.max(120, art + 24), height: art + 60, art }}
      eager
      renderArt={(e) => <Doodle name={e.id} size={drawn} />}
      snippet={(e) => doodleSnippet(e.id, { size })}
      template={doodleSnippet("name", { size })}
    />
  )
}

const TURNS = { auto: "auto", flat: 0, left: -10, right: 10 } as const
type Turn = keyof typeof TURNS

export function StickerShelf() {
  const [size, setSize] = useState(96)
  const [peel, setPeel] = useState(false)
  const [turn, setTurn] = useState<Turn>("auto")
  const drawn = useDeferredValue(size)
  const art = drawn + 24
  const rotate = TURNS[turn]
  const peelId = useId()
  return (
    <ArtShelf
      slug="sticker"
      noun="stickers"
      entries={PEELABLE_ENTRIES}
      families={PEELABLE_FAMILIES}
      searchPlaceholder="Search stickers: rocket, coffee, fox, done"
      controls={
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          <Setting label="Size" hint={`${size} px: ${stickerTierLabel(size)}`}>
            <Choice label="Sticker size" value={String(size)} onChange={(v) => setSize(Number(v))} options={sizeOptions([64, 96, 128])} />
          </Setting>
          <Setting label="Rotate" hint="auto: a small seeded tilt, flattened in calm density">
            <Choice
              label="Rotation"
              value={turn}
              onChange={setTurn}
              options={[
                { value: "auto", label: "auto" },
                { value: "flat", label: "flat" },
                { value: "left", label: "-10 deg", name: "minus ten degrees" },
                { value: "right", label: "10 deg", name: "ten degrees" },
              ]}
            />
          </Setting>
          <Setting label="Peel">
            <div className="flex min-h-9 items-center gap-3">
              <Switch id={peelId} checked={peel} onCheckedChange={setPeel} />
              <Label htmlFor={peelId}>Lift the corner</Label>
            </div>
          </Setting>
        </div>
      }
      tile={{ min: Math.max(136, art + 24), height: art + 64, art }}
      renderArt={(e) => <Sticker name={e.id} size={drawn} peel={peel} rotate={rotate} />}
      snippet={(e) => stickerSnippet(e.id, { size, peel, rotate })}
      template={stickerSnippet("name", { size, peel, rotate })}
      chunk={12}
    />
  )
}

const SHAPES = ["rect", "round", "burst", "void"] as const
const INKS = ["red", "ink-you", "green", "ink"] as const
type StampShape = (typeof SHAPES)[number]
type StampInk = (typeof INKS)[number]

function TextField({ label, value, onChange, maxLength, placeholder }: { label: string; value: string; onChange: (v: string) => void; maxLength: number; placeholder?: string }) {
  const id = useId()
  return (
    <div className="flex min-w-40 flex-1 flex-col gap-1.5">
      <label htmlFor={id}>
        <ControlLabel>{label}</ControlLabel>
      </label>
      <Input id={id} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} autoComplete="off" spellCheck={false} />
    </div>
  )
}

function SnippetBar({ snippet, importAs }: { snippet: string; importAs: Parameters<typeof importLine>[0] }) {
  const { copied, message, copy } = useCopyStatus()
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <code className="min-w-0 flex-1 font-mono text-sm break-all text-ink">{snippet}</code>
      <Button size="sm" onClick={() => void copy("lab", snippet)}>
        <Icon name={copied ? "check" : "copy"} />
        {copied ? "Copied" : "Copy JSX"}
      </Button>
      <code className="basis-full font-mono text-xs break-all text-pencil-text">{importLine(importAs)}</code>
      <CopyStatus message={message} />
    </div>
  )
}

export function StampShelf() {
  return (
    <ArtShelf
      slug="stamp"
      noun="stamps"
      entries={STAMP_ENTRIES}
      families={[]}
      grouped={false}
      noFamilyFilter
      searchPlaceholder="Search stamps: paid, urgent, void"
      tile={{ min: 210, height: 150, art: [190, 96] }}
      renderArt={(e) => <Stamp name={e.id} />}
      snippet={(e) => stampSnippet(e.id)}
      template={stampSnippet("name")}
    />
  )
}

export function StampLab() {
  const [text, setText] = useState("Approved")
  const [sub, setSub] = useState("")
  const [ring, setRing] = useState("PAID IN FULL * THANK YOU * MAR 2026")
  const [shape, setShape] = useState<StampShape>("rect")
  const [ink, setInk] = useState<StampInk>("green")
  const [tilt, setTilt] = useState<"-8" | "0" | "8">("-8")
  const [ghost, setGhost] = useState(false)
  const [dashed, setDashed] = useState(false)
  const ghostId = useId()
  const dashedId = useId()
  const t = text.trim()
  const snippet = customStampSnippet({ text: t, sub: sub.trim() || undefined, ring: ring.trim() || undefined, shape, ink, tilt: Number(tilt), ghost, dashed })
  return (
    <div data-slot="stamp-lab">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
        <div className="flex min-w-64 flex-1 flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <TextField label="Words" value={text} onChange={setText} maxLength={14} placeholder="Approved" />
            <TextField label="Small line" value={sub} onChange={setSub} maxLength={22} placeholder="* 03.14.26 *" />
          </div>
          {shape === "round" ? <TextField label="Around the rim" value={ring} onChange={setRing} maxLength={44} /> : null}
          <Setting label="Shape">
            <Choice label="Stamp shape" value={shape} onChange={setShape} options={SHAPES.map((s) => ({ value: s, label: s }))} />
          </Setting>
          <Setting label="Ink">
            <Choice label="Stamp ink" value={ink} onChange={setInk} options={INKS.map((s) => ({ value: s, label: s }))} />
          </Setting>
          <Setting label="Tilt">
            <Choice
              label="Stamp tilt"
              value={tilt}
              onChange={setTilt}
              options={[
                { value: "-8", label: "left", name: "tilted left" },
                { value: "0", label: "level" },
                { value: "8", label: "right", name: "tilted right" },
              ]}
            />
          </Setting>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-3">
              <Switch id={ghostId} checked={ghost} onCheckedChange={setGhost} />
              <Label htmlFor={ghostId}>Ghost of a first try</Label>
            </span>
            <span className="flex items-center gap-3">
              <Switch id={dashedId} checked={dashed} onCheckedChange={setDashed} />
              <Label htmlFor={dashedId}>Dashed inner rule</Label>
            </span>
          </div>
        </div>
        <Paper stock="paper" tilt={false} className="grid min-h-56 min-w-64 flex-1 place-items-center p-6" aria-live="polite">
          {t ? <Stamp text={t} sub={sub.trim() || undefined} ring={shape === "round" ? ring.trim() || undefined : undefined} shape={shape} ink={ink} tilt={Number(tilt)} ghost={ghost} dashed={dashed} /> : <p className="text-[15px] text-muted-foreground m-0">Type some words to stamp.</p>}
        </Paper>
      </div>
      <SnippetBar snippet={snippet} importAs="Stamp" />
    </div>
  )
}

export function BadgeShelf() {
  const [size, setSize] = useState(96)
  const drawn = useDeferredValue(size)
  const art = drawn + 24
  return (
    <ArtShelf
      slug="badge"
      noun="badges"
      entries={BADGE_ENTRIES}
      families={[]}
      grouped={false}
      noFamilyFilter
      searchPlaceholder="Search badges: new, winner, 100"
      controls={
        <Setting label="Size">
          <Choice label="Badge size" value={String(size)} onChange={(v) => setSize(Number(v))} options={sizeOptions([64, 96, 128])} />
        </Setting>
      }
      tile={{ min: Math.max(136, art + 24), height: art + 64, art }}
      renderArt={(e) => <Sticker name={e.id} size={drawn} />}
      snippet={(e) => stickerSnippet(e.id, { size })}
      template={stickerSnippet("name", { size })}
      chunk={16}
    />
  )
}

const TONES = ["tomato", "tangerine", "lemon", "grass", "teal", "sky", "grape", "bubblegum"] as const
type Tone = (typeof TONES)[number]
type Mark = "none" | (typeof sealMarkList)[number]

export function SealLab() {
  const [variant, setVariant] = useState<(typeof sealVariantList)[number]>("rosette")
  const [tone, setTone] = useState<Tone>("lemon")
  const [text, setText] = useState("BEST")
  const [mark, setMark] = useState<Mark>("none")
  const [size, setSize] = useState(96)
  const t = text.trim()
  const snippet = sealSnippet({ variant, text: mark === "none" ? t : undefined, mark: mark === "none" ? undefined : mark, tone, size })
  return (
    <div data-slot="seal-lab">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
        <div className="flex min-w-64 flex-1 flex-col gap-4">
          <Setting label="Shape">
            <Choice label="Seal shape" value={variant} onChange={setVariant} options={sealVariantList.map((v) => ({ value: v, label: v }))} />
          </Setting>
          <Setting label="Colour" hint="Ink on tomato and grape is 3.95 to 1: keep the words large, or pick another colour.">
            <Choice label="Seal colour" value={tone} onChange={setTone} options={TONES.map((v) => ({ value: v, label: v }))} />
          </Setting>
          <div className="flex flex-wrap items-end gap-4">
            <TextField label="Words" value={text} onChange={setText} maxLength={10} placeholder="BEST" />
            <Setting label="Or a hand-drawn mark">
              <Choice label="Seal mark" value={mark} onChange={setMark} options={[{ value: "none", label: "words" }, ...sealMarkList.map((m) => ({ value: m, label: m }))]} />
            </Setting>
          </div>
          <Setting label="Size" hint="Below 80 px the seal is redrawn smaller. A mark holds up at 16 px where letters do not.">
            <Choice label="Seal size" value={String(size)} onChange={(v) => setSize(Number(v))} options={sizeOptions([16, 32, 64, 96, 128])} />
          </Setting>
        </div>
        <Paper stock="paper" tilt={false} className={cx("grid min-h-56 min-w-64 flex-1 place-items-center p-6")}>
          <Seal variant={variant} tone={tone} size={size} text={mark === "none" ? t || undefined : undefined} mark={mark === "none" ? undefined : mark} />
        </Paper>
      </div>
      <SnippetBar snippet={snippet} importAs="Seal" />
    </div>
  )
}
