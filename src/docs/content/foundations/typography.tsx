import { useState, type CSSProperties } from "react"
import { CodeBlock, InlineCode, Prose, Section } from "@/docs/kit"
import { Blockquote, H1, H2, H3, H4, InlineCode as CodeChip, Large, Lead, Muted, P, Small } from "@/components/ui/typography"
import { Handwritten } from "@/components/ui/handwritten"
import { Label } from "@/components/ui/label"
import { Paper } from "@/components/ui/paper"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InkProvider } from "@/lib/ink/react"
import { cn } from "@/lib/utils"
import { FONTS } from "./_shared/data.generated"
import { Demo, Panel, Related, SliderRow, SwitchRow, TableScroll, component, foundation, td, th } from "./_shared/kit"

type FaceId = "hand" | "script" | "type" | "mono"

interface Face {
  id: FaceId
  name: string
  cls: string
  token: string
  role: string
  weights: readonly number[]
  licence: string
  use: string
  never: string
  stock: "paper" | "index-card" | "receipt" | "graph"
}

const FACES: readonly Face[] = [
  {
    id: "hand",
    name: "Kevin Sans Hand",
    cls: "font-hand",
    token: "--font-hand",
    role: "UI text and prose",
    weights: [400, 700],
    licence: "MIT",
    use: "Labels, buttons, menus, body text. One even, monoline hand, set at 88 percent so a 17 px line sits in an interface like a text face.",
    never: "Anything below 14 px: the letters are wide and the strokes are thin.",
    stock: "paper",
  },
  {
    id: "script",
    name: "Kevin Sans Script",
    cls: "font-script",
    token: "--font-script",
    role: "Titles, notes and numbers",
    weights: [400, 700],
    licence: "MIT",
    use: "Page and card titles, margin notes, big figures. The same hand set at 75 percent, so a title keeps its line; size it up about a fifth where the hand would stand.",
    never: "Paragraphs. A title is lovely for a line and tiring for ten.",
    stock: "index-card",
  },
  {
    id: "type",
    name: "Kevin Sans Type",
    cls: "font-type",
    token: "--font-type",
    role: "Stamps, kickers and receipts",
    weights: [400, 700],
    licence: "MIT",
    use: "Kickers above a title, stamps, receipts, small labels in capitals. Upper case wants a little letter-spacing.",
    never: "Long runs of capitals: they are for a word or two.",
    stock: "receipt",
  },
  {
    id: "mono",
    name: "IBM Plex Mono",
    cls: "font-mono",
    token: "--font-mono",
    role: "Code, keys and values",
    weights: FONTS["ibm-plex-mono"] ?? [],
    licence: "SIL OFL 1.1",
    use: "Code, kbd, token names, anything that has to line up. The one face that is not handwriting, on purpose.",
    never: "Decoration. If it is not code or a value, it belongs to one of the other three.",
    stock: "graph",
  },
]

function FaceCard({ face }: { face: Face }) {
  return (
    <Paper as="li" stock={face.stock} seed={`face:${face.id}`} className="p-5">
      <p className="font-type text-[13px] text-pencil-text">{face.role}</p>
      <p className={cn(face.cls, "mt-1 text-5xl leading-none text-ink", face.id === "script" ? "font-bold" : "")}>
        {face.name}
      </p>
      <p className={cn(face.cls, "mt-3 text-[19px] leading-snug text-ink")}>Sphinx of black quartz, judge my vow.</p>
      <p className={cn(face.cls, "mt-1 text-[17px] leading-snug text-ink-soft")}>Aa Bb Cc Dd Ee Ff Gg 0123456789 &amp; ? !</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[14.5px] leading-snug">
        <dt className="text-pencil-text">Class</dt>
        <dd className="font-mono text-[13px]">{face.cls}</dd>
        <dt className="text-pencil-text">Token</dt>
        <dd className="font-mono text-[13px]">{face.token}</dd>
        <dt className="text-pencil-text">Weights</dt>
        <dd className="ll-num font-mono text-[13px]">{face.weights.join(", ")}</dd>
        <dt className="text-pencil-text">License</dt>
        <dd>{face.licence}</dd>
      </dl>
      <p className="mt-3 text-[15px] leading-snug">
        <strong>Reach for it:</strong> {face.use}
      </p>
      <p className="mt-1.5 text-[15px] leading-snug text-muted-foreground">
        <strong className="text-ink">Not for:</strong> {face.never}
      </p>
    </Paper>
  )
}

interface ScaleRow {
  id: string
  name: string
  spec: string
  sample: React.ReactNode
}

const SCALE: readonly ScaleRow[] = [
  { id: "h1", name: "H1", spec: "Script 48 / 1.02, bold, hand rule", sample: <H1 role="presentation" rule={false} seed="scale-h1">Notes on keeping a notebook</H1> },
  { id: "h2", name: "H2", spec: "Script 36 / 1.08, bold, hand rule", sample: <H2 role="presentation" rule={false} seed="scale-h2">What goes in the margin</H2> },
  { id: "h3", name: "H3", spec: "Script 30 / 1.25, bold", sample: <H3>A word from someone who knew</H3> },
  { id: "h4", name: "H4", spec: "Hand 20 / 1.375, bold", sample: <H4>Small headings are in the hand</H4> },
  { id: "lead", name: "Lead", spec: "Hand 20 / 1.55, muted", sample: <Lead>A notebook is a small argument you have with yourself.</Lead> },
  { id: "p", name: "P", spec: "Hand 17 / 1.7", sample: <P>Most of what I remember from a book is in the margins: an arrow, a question mark, a small argument with a dead author.</P> },
  { id: "large", name: "Large", spec: "Hand 18, bold", sample: <Large>Large is for the line that matters</Large> },
  { id: "small", name: "Small", spec: "Hand 14, bold", sample: <Small>Small print, still 14</Small> },
  { id: "muted", name: "Muted", spec: "Hand 14, muted ink", sample: <Muted>Dates, captions and the second line of a list.</Muted> },
  { id: "code", name: "InlineCode", spec: "Plex Mono .85em, paper-shade chip", sample: <span>Run <CodeChip>npm run notes</CodeChip> to see it.</span> },
  { id: "quote", name: "Blockquote", spec: "Script 24 / 1.35, marker rule", sample: <Blockquote className="mt-0">The best time to write it down was when it happened.</Blockquote> },
]

function Scale() {
  return (
    <Paper stock="paper" tilt={false} className="p-4 sm:p-6">
      <div>
        {SCALE.map((row) => (
          <div key={row.id} className="grid gap-x-6 gap-y-1 border-b border-line-soft py-4 last:border-b-0 sm:grid-cols-[11rem_1fr]">
            <div>
              <p className="font-mono text-sm font-medium">{row.name}</p>
              <p className="text-[14px] leading-snug text-pencil-text">{row.spec}</p>
            </div>
            <div className="min-w-0">{row.sample}</div>
          </div>
        ))}
      </div>
    </Paper>
  )
}

function InkRoom() {
  const [size, setSize] = useState(56)
  const [face, setFace] = useState<"hand" | "script">("script")
  const box = "inline-block overflow-hidden bg-hi/50 leading-tight whitespace-nowrap outline-1 outline-dashed outline-ink/60"
  const font: CSSProperties = { fontSize: size, fontFamily: face === "hand" ? "var(--font-hand)" : "var(--font-script)", fontWeight: 700 }
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SliderRow label="Zoom the type" value={size} min={17} max={96} onChange={setSize} format={(v) => `${v} px`} />
        <div className="grid gap-1.5">
          <p id="ink-room-face" className="text-[15px] font-bold">
            Face
          </p>
          <ToggleGroup type="single" variant="outline" size="sm" value={face} onValueChange={(v) => v && setFace(v as "hand" | "script")} aria-labelledby="ink-room-face">
            <ToggleGroupItem value="script">Script</ToggleGroupItem>
            <ToggleGroupItem value="hand">Hand</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <figure className="m-0 grid gap-2">
          <div className="min-h-24 overflow-x-auto py-3 ps-2">
            <span className={box} style={font} data-testid="ink-room-clipped">
              Lovely stuff
            </span>
          </div>
          <figcaption className="text-[14.5px] leading-snug text-muted-foreground">
            A clipped label, as it comes: the box is exactly as wide as the letters&apos; advance widths, so the last one loses its overhang.
          </figcaption>
        </figure>
        <figure className="m-0 grid gap-2">
          <div className="min-h-24 overflow-x-auto py-3 ps-2">
            <span className={cn(box, "ll-ink-room")} style={font} data-testid="ink-room-roomy">
              Lovely stuff
            </span>
          </div>
          <figcaption className="text-[14.5px] leading-snug text-muted-foreground">
            With <InlineCode>ll-ink-room</InlineCode>: 0.2 em of room at the end, given back with a negative margin, so the layout does not move.
          </figcaption>
        </figure>
      </div>
    </div>
  )
}

type Density = "comfortable" | "compact" | "calm"

function Jitter() {
  const [density, setDensity] = useState<Density>("comfortable")
  const [strength, setStrength] = useState(1)
  const [reduced, setReduced] = useState(false)
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SliderRow label="Strength" value={strength} min={0} max={2} step={0.1} onChange={setStrength} format={(v) => (v === 0 ? "off" : `${v.toFixed(1)}×`)} hint="The strength prop: 1 is the default hand, 2 a hurried one." />
        <div className="grid content-start gap-1.5">
          <p id="jitter-density" className="text-[15px] font-bold">
            Density around it
          </p>
          <ToggleGroup type="single" variant="outline" size="sm" spacing={1} className="flex-wrap" value={density} onValueChange={(v) => v && setDensity(v as Density)} aria-labelledby="jitter-density">
            <ToggleGroupItem value="comfortable">comfortable</ToggleGroupItem>
            <ToggleGroupItem value="compact">compact</ToggleGroupItem>
            <ToggleGroupItem value="calm">calm</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <SwitchRow label="Reduced motion" checked={reduced} onChange={setReduced} hint="Jitter is decoration, so a person who asked for less motion gets straight words." />
      <InkProvider density={density} motion={reduced ? "reduced" : "system"} defs={false}>
        <Paper stock="index-card" tilt={false} className="px-5 py-4">
          <Handwritten as="p" strength={strength} seed="jitter-demo" className="font-script text-3xl leading-snug text-ink" data-testid="jitter-text">
            ask sam about the pond, and bring the big umbrella!
          </Handwritten>
        </Paper>
      </InkProvider>
    </div>
  )
}

function Floors() {
  const sizes = [12, 13, 14, 15, 16, 17, 18]
  return (
    <div className="grid gap-5 @container">
      <div className="grid gap-5 @2xl:grid-cols-2">
        <Paper stock="paper" tilt={false} className="p-4">
          <p className="font-type text-[13px] text-pencil-text">Kevin Sans Hand, one size per line</p>
          <ul role="list" className="m-0 mt-2 grid list-none gap-1 p-0">
            {sizes.map((s) => (
              <li key={s} className={cn("font-hand text-ink", s < 14 && "text-pencil-text")} style={{ fontSize: s }}>
                {s} px — {s < 14 ? "too small for a label" : s === 14 ? "the floor for labels" : s === 16 ? "the floor for input text on touch" : "the quick brown fox"}
              </li>
            ))}
          </ul>
        </Paper>
        <Paper stock="paper" tilt={false} className="p-4">
          <p className="font-type text-[13px] text-pencil-text">Equal visual size</p>
          <div className="mt-2 grid gap-2 text-ink">
            <p className="font-hand text-[16px] leading-snug">Hand 16 px: the reference.</p>
            <p className="font-script text-[16px] leading-snug">Script 16 px: visibly smaller.</p>
            <p className="font-script text-[20px] leading-snug">Script 20 px: about the same as Hand 16.</p>
          </div>
          <p className="mt-3 text-[14.5px] leading-snug text-muted-foreground">The script role is set smaller (75 percent against 88). Size it up about a fifth (×1.2) when it stands where the hand would.</p>
        </Paper>
      </div>
      <TableScroll label="Type size floors">
        <table className="w-full min-w-[26rem] border-collapse text-[15px]">
          <caption className="sr-only">The smallest size each kind of text may use</caption>
          <thead>
            <tr>
              <th scope="col" className={th}>Text</th>
              <th scope="col" className={th}>Floor</th>
              <th scope="col" className={th}>Why</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Labels and buttons", "14 px", "Kevin Sans runs wide for its size, and its thin strokes disappear below this."],
              ["Input text on touch", "16 px", "Anything smaller makes iOS zoom the page when the field is focused."],
              ["Chart axes and ticks", "12 px", "A smaller size is allowed here, and only for numbers."],
              ["Code, token names and captions", "12 px", "Plex Mono has a large x-height and even strokes, so it holds up smaller than the hands. Never for a label or a button."],
              ["Hit targets", "24 px", "The DOM box, not the drawing. The drawing may be smaller than the target, never larger."],
            ].map(([text, floor, why]) => (
              <tr key={text}>
                <th scope="row" className={cn(td, "text-start font-bold")}>{text}</th>
                <td className={cn(td, "ll-num font-mono whitespace-nowrap")}>{floor}</td>
                <td className={td}>{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  )
}

const AMOUNTS = ["1,284.50", "640.00", "17.25", "1,111.11", "8.00"]

const COLUMNS = [
  { cls: "font-hand", label: "Hand", note: "equal: every figure is 0.74 em, so the decimal points line up" },
  { cls: "font-script font-bold", label: "Script bold", note: "equal too: bold figures share one width" },
  { cls: "font-type", label: "Type", note: "equal: ready for receipts" },
  { cls: "font-mono", label: "Plex Mono", note: "monospaced" },
] as const

function Numbers() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {COLUMNS.map((c) => (
        <Paper key={c.label} stock="receipt" tilt={false} className="px-5 py-5">
          <p className="font-type text-[13px] text-pencil-text">{c.label}</p>
          <ul role="list" className={cn("m-0 mt-2 grid list-none gap-0.5 p-0 text-3xl leading-tight text-ink ll-num", c.cls)}>
            {AMOUNTS.map((a) => (
              <li key={a} className="text-end">
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[14.5px] leading-snug text-muted-foreground">{c.note}</p>
        </Paper>
      ))}
    </div>
  )
}

const RISO = [
  { label: "marker", value: "var(--ll-marker)" },
  { label: "blue felt", value: "var(--ll-ink-you)" },
  { label: "red pencil", value: "var(--ll-red)" },
  { label: "teal", value: "var(--ll-teal)" },
]

function Riso() {
  return (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-4" role="group" aria-label="Four titles with a riso offset">
      {RISO.map((r) => (
        <div key={r.label}>
          <p className="ll-riso font-script text-6xl leading-none font-bold text-ink" style={{ "--ll-riso": r.value } as CSSProperties}>
            Looseleaf
          </p>
          <p className="mt-2 font-mono text-[13px] text-pencil-text">--ll-riso: {r.label}</p>
        </div>
      ))}
    </div>
  )
}

const WEIGHT_CLASS: Record<number, string> = { 400: "font-normal", 500: "font-medium", 600: "font-semibold", 700: "font-bold" }

function nearest(weights: readonly number[], want: number): number {
  return weights.reduce((best, w) => (Math.abs(w - want) < Math.abs(best - want) ? w : best), weights[0] ?? 400)
}

function Tester() {
  const [text, setText] = useState("Pencil, ink and a little tea.")
  const [faceId, setFaceId] = useState<FaceId>("script")
  const [size, setSize] = useState(40)
  const [weight, setWeight] = useState(700)
  const [leading, setLeading] = useState(1.25)
  const [tracking, setTracking] = useState(0)
  const [riso, setRiso] = useState(false)
  const [jitter, setJitter] = useState(false)
  const face = FACES.find((f) => f.id === faceId)!
  const w = nearest(face.weights, weight)

  const style: CSSProperties = {
    fontFamily: `var(${face.token})`,
    fontSize: size,
    fontWeight: w,
    lineHeight: leading,
    letterSpacing: `${tracking}em`,
  }
  const classes = [
    face.cls,
    `text-[${size}px]`,
    `leading-[${leading}]`,
    WEIGHT_CLASS[w] ?? `font-[${w}]`,
    tracking !== 0 ? `tracking-[${tracking}em]` : "",
    riso ? "ll-riso" : "",
    "text-ink",
  ].filter(Boolean)
  const Tag = jitter ? "Handwritten" : "p"
  const words = text.replace(/\n/g, " ")
  const child = /[{}<>]/.test(words) ? `{${JSON.stringify(words)}}` : words
  const code = `<${Tag}${jitter ? ' as="p"' : ""} className="${classes.join(" ")}">\n  ${child}\n</${Tag}>`

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 @container">
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="tester-text" className="text-[15px] font-bold">
              Your words
            </Label>
            <Textarea id="tester-text" value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={160} />
          </div>
          <div className="grid gap-1.5">
            <p id="tester-face" className="text-[15px] font-bold">
              Face
            </p>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={1}
              className="flex-wrap"
              value={faceId}
              onValueChange={(v) => {
                if (!v) return
                const next = FACES.find((f) => f.id === v)!
                setFaceId(v as FaceId)
                setWeight(nearest(next.weights, weight))
              }}
              aria-labelledby="tester-face"
            >
              {FACES.map((f) => (
                <ToggleGroupItem key={f.id} value={f.id}>
                  {f.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid gap-x-6 gap-y-4 @lg:grid-cols-2">
            <SliderRow label="Size" value={size} min={12} max={96} onChange={setSize} format={(v) => `${v} px`} />
            <SliderRow label="Line height" value={leading} min={1} max={2} step={0.05} onChange={setLeading} format={(v) => v.toFixed(2)} />
            <SliderRow label="Letter spacing" value={tracking} min={-0.05} max={0.2} step={0.01} onChange={setTracking} format={(v) => `${v.toFixed(2)} em`} />
            <div className="grid gap-1.5">
              <p id="tester-weight" className="text-[15px] font-bold">
                Weight
              </p>
              {face.weights.length > 1 ? (
                <ToggleGroup type="single" variant="outline" size="sm" value={String(w)} onValueChange={(v) => v && setWeight(Number(v))} aria-labelledby="tester-weight">
                  {face.weights.map((x) => (
                    <ToggleGroupItem key={x} value={String(x)}>
                      {x}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              ) : (
                <p className="text-[14.5px] text-muted-foreground">
                  {face.name} has one weight ({face.weights[0]}). A browser would smear a bold, so there is nothing to choose.
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <SwitchRow label="Riso offset" checked={riso} onChange={setRiso} />
            <SwitchRow label="Hand jitter" checked={jitter} onChange={setJitter} />
          </div>
        </div>
      </div>
      <Paper stock="paper" tilt={false} className="min-h-40 overflow-x-auto px-6 py-6">
        {jitter ? (
          <Handwritten as="p" seed="tester" style={style} className={cn("text-ink", riso && "ll-riso")} data-testid="tester-preview">
            {text || " "}
          </Handwritten>
        ) : (
          <p style={style} className={cn("text-ink", riso && "ll-riso")} data-testid="tester-preview">
            {text || " "}
          </p>
        )}
      </Paper>
      <CodeBlock lang="tsx" title="The same line in your code" code={code} />
    </div>
  )
}

export default function TypographyPage() {
  return (
    <>
      <Section id="faces" title="Four faces, one page" description="Three hands and one typewriter. Every word is real text on a real baseline: nothing on this page is an image of writing.">
        <ul role="list" aria-label="The four typefaces" className="m-0 grid list-none gap-6 p-1 md:grid-cols-2">
          {FACES.map((f) => (
            <FaceCard key={f.id} face={f} />
          ))}
        </ul>
        <Prose>
          <p>
            The fonts come from Fontsource, so nothing loads from a third-party server. The registry ships the same four families as font items; a site that installs Looseleaf gets them without
            touching a stylesheet.
          </p>
        </Prose>
      </Section>

      <Section id="scale" title="The scale" description="Eleven steps, all of them components in typography.tsx. Body text is 17 px in the hand; titles are in the script role, sized up to match.">
        <Demo label="The type scale, set in the real components">
          <Scale />
        </Demo>
        <Prose>
          <p>
            Headings balance their lines and paragraphs use <InlineCode>text-wrap: pretty</InlineCode>, both set once in the base layer. The h1 and h2 rules under a title are three different
            hand-drawn masks, chosen by seed, so two headings on a page never carry the same line.
          </p>
        </Prose>
      </Section>

      <Section id="pitfalls" title="Handwriting has manners" description="A hand font is not a neutral font with a wobble. Three things go wrong if you treat it like one.">
        <Section id="ink-room" level={3} title="Ink room" description="Handwriting overhangs its advance width by a pixel or three. Anything that clips text (a pill, an ellipsis, a tab) needs a little room at the end.">
          <Demo label="A clipped label with and without ink room">
            <InkRoom />
          </Demo>
        </Section>
        <Section id="jitter" level={3} title="Jitter" description="Every word sits a hair off the baseline by a seeded amount, like a line written quickly. It is for notes, captions and titles, never for long reading.">
          <Demo label="Per-word jitter under different densities">
            <Jitter />
          </Demo>
          <Prose>
            <p>
              The words stay ordinary inline text, so the line wraps, selects, copies and reads aloud as usual. Calm density and reduced motion both set <InlineCode>--ll-jitter-k</InlineCode> to
              zero and the words straighten.
            </p>
          </Prose>
        </Section>
        <Section id="sizes" level={3} title="Sizes and floors">
          <Demo label="Type size floors and equal visual size">
            <Floors />
          </Demo>
        </Section>
      </Section>

      <Section id="numbers" title="Numbers" description="Prices, tallies and stats have to line up. Which face you set them in decides whether they do.">
        <Demo label="The same column of amounts in four faces, right-aligned, each with ll-num">
          <Numbers />
        </Demo>
        <Prose>
          <p>
            <InlineCode>ll-num</InlineCode> asks the font for tabular, lining figures (<InlineCode>font-variant-numeric: tabular-nums lining-nums</InlineCode>). Kevin Sans
            does not need the features: its figures are drawn to one width, so columns of money line up in any role. Plex Mono is monospaced. Right-align a column, and keep the class on so a
            theme with a different face is covered.
          </p>
        </Prose>
      </Section>

      <Section id="riso" title="Riso titles" description="A display title can be printed slightly off register, as if a second color went through the press. It is one text-shadow, so the words stay text.">
        <Demo label="ll-riso in four colors">
          <Riso />
        </Demo>
        <Prose>
          <p>
            Set <InlineCode>--ll-riso</InlineCode> on a title or a whole section to change the second color. The offset is multiplied by the misregistration knob, so calm density prints it
            dead on.
          </p>
        </Prose>
      </Section>

      <Section id="tester" title="Try your own words" description="Set a line, then copy the classes. The preview uses inline styles (Tailwind cannot invent a class at runtime); the code below is what you would write.">
        <Panel>
          <Tester />
        </Panel>
      </Section>

      <Related
        items={[
          foundation("color", "Color", "Which ink each piece of text is written in."),
          foundation("density", "Density", "Where jitter and the wobble switch off."),
          foundation("motion", "Motion", "Soak, the way new text arrives."),
          component("typography", "Typography", "The components in the scale, with props."),
          component("handwritten", "Handwritten", "Per-word jitter as a component."),
        ]}
      />
    </>
  )
}
