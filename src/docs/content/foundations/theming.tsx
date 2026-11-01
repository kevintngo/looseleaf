import { useId, useMemo, useState } from "react"
import { useAnnounce } from "@/docs/core/announcer"
import { copyText } from "@/docs/core/hooks"
import { Callout, CodeBlock, InlineCode, Prose, Section } from "@/docs/kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { formatRatio } from "./_shared/colour-math"
import { CONTRAST, FOREST, KNOBS as KNOB_ROWS, PALETTE } from "./_shared/data.generated"
import { Demo, Panel, Related, SliderRow, TableScroll, Verdict, component, foundation, td, th } from "./_shared/kit"
import { ThemePreview } from "./_shared/theme-preview"
import {
  EMPTY_THEME,
  KNOBS,
  TOKEN_GROUPS,
  clearColour,
  colourOf,
  evaluatePairs,
  forestAfter,
  normaliseHex,
  problemsByToken,
  setColour,
  setKnob,
  setShade,
  shadeHex,
  themeCss,
  type LivePair,
  type ThemeState,
  type TokenSpec,
} from "./_shared/theme-model"

interface RowProps {
  spec: TokenSpec
  value: string
  changed: boolean
  failing: LivePair[]
  onChange: (hex: string) => void
  onReset?: () => void
  resetLabel?: string
}

function ColourRow({ spec, value, changed, failing, onChange, onReset, resetLabel }: RowProps) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? value
  const invalid = draft !== null && normaliseHex(draft) === null
  return (
    <li className="flex items-center gap-2.5 border-b border-line-soft py-1.5 last:border-b-0">
      <input
        type="color"
        aria-label={`${spec.label}: pick a colour`}
        value={value}
        onChange={(e) => {
          setDraft(null)
          onChange(e.target.value)
        }}
        className="size-8 shrink-0 cursor-pointer border-[1.5px] border-ink/60 bg-transparent p-0.5"
      />
      <div className="min-w-0 flex-1">
        <Label htmlFor={id} className="block text-[14.5px] leading-tight font-bold">
          {spec.label}
          {changed ? <span className="ms-1.5 font-type text-[12.5px] font-normal text-orange-text">edited</span> : null}
        </Label>
        <span className="block text-[14px] leading-snug text-pencil-text">{spec.note}</span>
      </div>
      {failing.length ? (
        <span className="font-type text-[13px] text-red" title={`Breaks: ${failing.map((p) => p.row.purpose).join("; ")}`} data-testid={`problems-${spec.token}`}>
          <span aria-hidden="true">!</span>
          <span className="sr-only">breaks {failing.length} contrast {failing.length === 1 ? "pair" : "pairs"}</span> {failing.length}
        </span>
      ) : null}
      <input
        id={id}
        type="text"
        inputMode="text"
        spellCheck={false}
        autoComplete="off"
        value={shown}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setDraft(e.target.value)
          const hex = normaliseHex(e.target.value)
          if (hex) onChange(hex)
        }}
        onBlur={() => setDraft(null)}
        className={cn("w-[5.75rem] shrink-0 border-0 border-b-[1.5px] border-dashed border-pencil-mark bg-transparent px-1 py-0.5 font-mono text-[13.5px] text-ink-you aria-invalid:border-red aria-invalid:text-red")}
      />
      {onReset ? (
        <button type="button" onClick={onReset} aria-label={`${resetLabel ?? "reset"} ${spec.label}`} className="inline-flex min-h-6 shrink-0 items-center px-1 text-[14px] text-ink-you underline underline-offset-2">
          {resetLabel ?? "reset"}
        </button>
      ) : null}
    </li>
  )
}

function PairTable({ pairs, label }: { pairs: readonly LivePair[]; label: string }) {
  return (
    <TableScroll label={label}>
      <table className="w-full min-w-[34rem] border-collapse text-[15px]">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th scope="col" className={th}>Sample</th>
            <th scope="col" className={th}>Ratio</th>
            <th scope="col" className={th}>Needs</th>
            <th scope="col" className={th}>Result</th>
            <th scope="col" className={th}>What it protects</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((p, i) => (
            <tr key={`${p.row.fg}|${p.row.bg}|${i}`}>
              <td className={td}>
                <span className="inline-block min-w-12 border border-ink/40 px-2 py-0.5 text-center font-bold" style={{ background: p.bgHex, color: p.fgHex }}>
                  Aa
                </span>
              </td>
              <td className={cn(td, "ll-num font-mono text-[13.5px] whitespace-nowrap")}>{formatRatio(p.ratio)}</td>
              <td className={cn(td, "ll-num font-mono text-[13.5px]")}>{p.row.min}</td>
              <td className={td}>{p.status === "ok" ? <Verdict kind="ok">ok</Verdict> : p.status === "warn" ? <Verdict kind="info">info</Verdict> : <Verdict kind="fail">fail</Verdict>}</td>
              <td className={cn(td, "min-w-52 text-[14.5px]")}>
                {p.row.purpose}
                <span className="mt-0.5 block font-mono text-[12px] text-pencil-text">{p.tokens.join(", ")}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  )
}

function ContrastPanel({ pairs }: { pairs: readonly LivePair[] }) {
  const failing = pairs.filter((p) => p.status === "fail")
  const info = pairs.filter((p) => p.status === "warn").length
  return (
    <div className="grid gap-3">
      <p role="status" className="font-script text-2xl leading-tight font-bold" data-testid="contrast-summary">
        {failing.length === 0 ? `All ${pairs.length} pairs hold.` : `${failing.length} of ${pairs.length} pairs fail.`}
        <span className="ms-3 font-hand text-[15px] font-normal text-muted-foreground">{info} carry a note.</span>
      </p>
      {pairs.length < CONTRAST.length ? (
        <p className="text-[14.5px] text-muted-foreground">
          {CONTRAST.length - pairs.length} of the build&apos;s {CONTRAST.length} pairs are not recomputed here: selected text on the highlighter swipe needs the browser to flatten a translucent colour.
        </p>
      ) : null}
      {failing.length ? <PairTable pairs={failing} label="Contrast pairs that fail in the edited theme" /> : <p className="text-[15px] text-muted-foreground">Nothing to fix. Try pushing the marker toward the paper.</p>}
      <details className="border-[1.5px] border-line-soft px-3 py-2">
        <summary className="cursor-pointer text-[15px] font-bold">Every pair ({pairs.length})</summary>
        <div className="mt-2">
          <PairTable pairs={pairs} label="Every contrast pair for the edited theme" />
        </div>
      </details>
    </div>
  )
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "my-theme"
}

function Editor({ state, setState }: { state: ThemeState; setState: (fn: (s: ThemeState) => ThemeState) => void }) {
  const announce = useAnnounce()
  const nameId = useId()
  const [name, setName] = useState("my-theme")
  const pairs = useMemo(() => evaluatePairs(state), [state])
  const problems = useMemo(() => problemsByToken(pairs), [pairs])
  const css = useMemo(() => themeCss(slug(name), state), [name, state])
  const changed = Object.keys(state.colours).length + KNOBS.filter((k) => state.knobs[k.token] !== EMPTY_THEME.knobs[k.token]).length
  return (
    <div className="grid gap-6" id="editor-body">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setState(() => EMPTY_THEME)}>
          Back to Notebook
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setState(() => forestAfter(FOREST.steps.length))}>
          Load the finished forest
        </Button>
        <span className="text-[14.5px] text-muted-foreground" role="status" data-testid="changed-count">
          {changed === 0 ? "Notebook, untouched." : `${changed} ${changed === 1 ? "value" : "values"} changed.`}
        </span>
      </div>

      <div className="@container">
        <div className="grid items-start gap-6 @2xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="min-w-0 @2xl:top-20 @2xl:[@media(min-height:52rem)]:sticky">
            <ThemePreview state={state} seed="edit" label="Live preview of the edited theme" />
          </div>
          <div className="grid min-w-0 gap-4">
            {TOKEN_GROUPS.map((g) => (
              <details key={g.id} open={g.essential} className="border-[1.5px] border-line-soft px-3 py-2">
                <summary className="cursor-pointer text-[16px] font-bold">
                  {g.title} <span className="font-normal text-muted-foreground">({g.tokens.length})</span>
                </summary>
                <ul role="list" aria-label={g.title} className="m-0 mt-1 list-none p-0">
                  {g.tokens.map((spec) => {
                    const isChart = spec.token === "--chart-1"
                    return (
                      <ColourRow
                        key={spec.token}
                        spec={spec}
                        value={colourOf(state, spec.token)}
                        changed={spec.token in state.colours}
                        failing={problems.get(spec.token) ?? []}
                        onChange={(hex) => setState((s) => setColour(s, spec.token, hex))}
                        onReset={spec.token in state.colours ? () => setState((s) => clearColour(s, spec.token)) : undefined}
                        resetLabel={isChart ? "follow marker" : "reset"}
                      />
                    )
                  })}
                  {g.id === "table" ? (
                    <ColourRow
                      spec={{ token: "--ll-shade", label: "Shadow colour", note: "umber in Notebook; the triplet behind every shadow" }}
                      value={shadeHex(state)}
                      changed={"--ll-shade" in state.colours}
                      failing={[]}
                      onChange={(hex) => setState((s) => setShade(s, hex))}
                      onReset={"--ll-shade" in state.colours ? () => setState((s) => clearColour(s, "--ll-shade")) : undefined}
                    />
                  ) : null}
                </ul>
              </details>
            ))}
            <Panel title="Recipe knobs">
              <div className="grid gap-4">
                {KNOBS.map((k) => (
                  <SliderRow
                    key={k.token}
                    label={k.label}
                    value={state.knobs[k.token] ?? EMPTY_THEME.knobs[k.token]!}
                    min={k.min}
                    max={k.max}
                    step={k.step}
                    onChange={(v) => setState((s) => setKnob(s, k.token, v))}
                    format={(v) => `${Number(v.toFixed(2))}${k.unit}`}
                    hint={k.note}
                  />
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>

      <Section id="contrast-live" level={3} title="Does it still read?" description="The same maths as the build's checker, run on your edits. Every pair the stylesheet's record can recompute from the palette is here.">
        <ContrastPanel pairs={pairs} />
      </Section>

      <Section id="theme-css" level={3} title="Your block">
        <div className="grid gap-3">
          <div className="grid max-w-sm gap-1.5">
            <Label htmlFor={nameId} className="text-[15px] font-bold">
              Theme name
            </Label>
            <Input id={nameId} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <CodeBlock lang="css" title="Only what you changed" code={css} />
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                announce((await copyText(css)) ? "Copied the theme block" : "Copying was blocked. Select the block above and copy it by hand")
              }}
            >
              Copy the block
            </Button>
          </div>
        </div>
      </Section>
    </div>
  )
}

const TOKEN_LABEL = new Map(TOKEN_GROUPS.flatMap((g) => g.tokens).map((t) => [t.token, t.label]))

function DeclChips({ decls }: { decls: Record<string, string> }) {
  return (
    <ul role="list" aria-label="What this step sets" className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0">
      {Object.entries(decls).map(([token, value]) => (
        <li key={token} className="inline-flex items-center gap-1.5 text-[14px]">
          {/^#/.test(value) ? <span aria-hidden="true" className="inline-block size-4 border border-ink/50" style={{ background: value }} /> : null}
          <span>{TOKEN_LABEL.get(token) ?? token}</span>
          <code className="font-mono text-[12.5px] text-pencil-text">{value}</code>
        </li>
      ))}
    </ul>
  )
}

function Walkthrough({ onShow }: { onShow: (count: number) => void }) {
  return (
    <ol className="m-0 grid list-none gap-7 p-0" aria-label="The steps from an empty slot to a finished theme">
      <li className="grid gap-2">
        <h3 className="m-0 font-script text-2xl leading-tight font-bold">1. Start from the slot</h3>
        <p className="max-w-2xl text-[16px] leading-snug">
          The stylesheet already has an empty <InlineCode>[data-theme=&quot;forest&quot;]</InlineCode> block waiting. Nothing is inside it yet, so the theme and Notebook are the same thing. Roles, shadows, gradients,
          syntax colours, selection and focus all recompute from whatever you put in there; you never touch a component.
        </p>
        <CodeBlock lang="css" title="looseleaf.css" code={`[data-theme="forest"] {\n}`} copy={false} />
      </li>
      {FOREST.steps.map((step, i) => (
        <li key={step.id} className="grid gap-2" data-testid={`step-${step.id}`}>
          <h3 className="m-0 font-script text-2xl leading-tight font-bold">
            {i + 2}. {step.title}
          </h3>
          <p className="max-w-2xl text-[16px] leading-snug">{step.note}</p>
          <DeclChips decls={step.decls} />
          <p className="text-[15px]" data-testid={`check-${step.id}`}>
            The checker now says:{" "}
            {step.check.fails.length === 0 ? (
              <strong className="text-green">all {step.check.pairs} pairs hold.</strong>
            ) : (
              <strong className="text-red">
                {step.check.fails.length} of {step.check.pairs} pairs fail.
              </strong>
            )}
          </p>
          {step.check.fails.length ? (
            <ul role="list" aria-label={`Pairs that fail after ${step.title}`} className="m-0 grid list-none gap-0.5 p-0 text-[14px]">
              {step.check.fails.slice(0, 4).map((f, j) => (
                <li key={j} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="ll-num font-mono text-[13px] text-red">{formatRatio(f.ratio)}</span>
                  <span className="text-muted-foreground">needs {f.min}:</span>
                  <span>{f.purpose}</span>
                </li>
              ))}
              {step.check.fails.length > 4 ? <li className="text-muted-foreground">…and {step.check.fails.length - 4} more.</li> : null}
            </ul>
          ) : null}
          <div>
            <Button variant="outline" size="sm" onClick={() => onShow(i + 1)} aria-label={`Show steps 1–${i + 2} in the editor (${step.title})`}>
              Show steps 1–{i + 2} in the editor
            </Button>
          </div>
        </li>
      ))}
      <li className="grid gap-2" data-testid="step-knobs">
        <h3 className="m-0 font-script text-2xl leading-tight font-bold">{FOREST.steps.length + 2}. The parts that are not CSS</h3>
        <p className="max-w-2xl text-[16px] leading-snug">
          Two of forest&apos;s choices are not colours. The hand is a little steadier (<InlineCode>--ll-wobble: {FOREST.knobs.wobble}</InlineCode>, which is a knob, so it lives in the block), and its sheets are
          deckled instead of cut. An edge profile is not a variable: it is a prop, so a theme sets it once in a wrapper (or in the recipe object it passes the provider) and nobody repeats it.
        </p>
        <CodeBlock
          lang="tsx"
          title="components/forest-paper.tsx"
          code={`import { Paper, type PaperProps } from "@/components/ui/paper"

export function ForestPaper({ edge = "${FOREST.knobs.edge}", ...props }: PaperProps) {
  return <Paper edge={edge} {...props} />
}`}
        />
      </li>
    </ol>
  )
}

const TIERS = [
  ["T0", "Palette", "surfaces, rules, stickies, inks, accents, tape, the shade triplet", ":root", "What a theme owns. Hex, one value per material."],
  ["T1", "Roles", "--background, --primary, --border ... plus paper roles (link, caret, placeholder, syntax)", ":root and [data-theme]", "Aliases of T0. Recomputed in every scope."],
  ["T2", "Recipe knobs", "wobble, pen weight, misregistration, tilt, shadow strength, blend", ":root, density blocks", "Numbers the drawing engine and the CSS read."],
  ["T3", "Geometry and motion", "spacing, hit size, easings, durations, z-scale", ":root, [data-motion]", "Durations collapse with --ll-motion."],
]

const OVERRIDE = [
  ["Always", "Every surface (desk, paper, shade, slip, card, graph, kraft, check, pad, photo), every ink (ink, soft, muted, blue, the pencils, red, green, orange-text, focus, link-hover), the shade triplet, and marker, highlighter and highlighter-deep."],
  ["Usually", "The rules (rule-blue, rule-red, pad-rule, check-rule and the two ledger inks), the sticky colours, the tape colours, and the eight stationery accents."],
  ["Sometimes", "The recipe knobs: wobble, pen weights, misregistration, shadow strength, blend, tilt. And the baked tiles, if the theme bakes others."],
  ["Never in CSS", "The shadcn roles, the shadow stacks, gradients, selection, syntax colours: they are derived. Fonts are compile-time; a theme with other typefaces ships its own font items."],
]

const RULES = [
  "Roles are declared where a re-scope can land. A property that holds var() is computed on the element that declares it, so the colour aliases are written on :root and on [data-theme], [data-ll-scope]. A check fails if the two drift.",
  "Translucent colours are color-mix(), never rgb triplets. The one triplet is --ll-shade, because shadows need an alpha.",
  "One multiplier for every shadow: --ll-shadow-k. A dark theme sets one number.",
  "One motion switch: --ll-motion multiplies every duration.",
  "Per-element inputs (--ll-tilt, --ll-stock, the jitter values) are never set on :root; a component writes them on its own element.",
]

function Anatomy() {
  return (
    <div className="grid gap-6">
      <TableScroll label="The four token tiers">
        <table className="w-full min-w-[36rem] border-collapse text-[15px]">
          <caption className="sr-only">The four tiers of tokens, what is in each and where it is declared</caption>
          <thead>
            <tr>
              <th scope="col" className={th}>Tier</th>
              <th scope="col" className={th}>Holds</th>
              <th scope="col" className={th}>Declared on</th>
              <th scope="col" className={th}>Rule</th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map(([tier, name, holds, on, rule]) => (
              <tr key={tier}>
                <th scope="row" className={cn(td, "text-start")}>
                  <span className="font-mono text-[13.5px]">{tier}</span> <span className="font-script text-lg">{name}</span>
                </th>
                <td className={cn(td, "text-[14.5px]")}>{holds}</td>
                <td className={cn(td, "font-mono text-[12.5px]")}>{on}</td>
                <td className={cn(td, "text-[14.5px]")}>{rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      <TableScroll label="What a theme overrides">
        <table className="w-full min-w-[30rem] border-collapse text-[15px]">
          <caption className="sr-only">What a theme always, usually, sometimes and never overrides</caption>
          <tbody>
            {OVERRIDE.map(([when, what]) => (
              <tr key={when}>
                <th scope="row" className={cn(td, "w-32 text-start font-script text-xl")}>{when}</th>
                <td className={cn(td, "text-[15px]")}>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      <Prose>
        <p>Five rules keep a theme &quot;a CSS block and nothing else&quot;:</p>
        <ol>
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </Prose>
    </div>
  )
}

const READ_BY = { css: "the stylesheet", code: "TypeScript (the provider, components)", "css+code": "the stylesheet and TypeScript", reserved: "nobody yet" } as const

function KnobTable() {
  return (
    <TableScroll label="Every recipe knob and who reads it">
      <table className="w-full min-w-[34rem] border-collapse text-[15px]">
        <caption className="sr-only">The recipe knobs, their Notebook value and what reads them</caption>
        <thead>
          <tr>
            <th scope="col" className={th}>Knob</th>
            <th scope="col" className={th}>Notebook</th>
            <th scope="col" className={th}>Read by</th>
            <th scope="col" className={th}>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {KNOB_ROWS.map((k) => (
            <tr key={k.token}>
              <th scope="row" className={cn(td, "text-start font-mono text-[13px] font-medium")}>{k.token}</th>
              <td className={cn(td, "ll-num font-mono text-[13px]")}>{k.value}</td>
              <td className={cn(td, "text-[14.5px]", k.readBy === "reserved" && "text-muted-foreground")}>{READ_BY[k.readBy]}</td>
              <td className={cn(td, "text-[14.5px]")}>{k.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  )
}

export default function ThemingPage() {
  const announce = useAnnounce()
  const [state, setState] = useState<ThemeState>(EMPTY_THEME)
  const forest = useMemo(() => forestAfter(FOREST.steps.length), [])
  const swatches = PALETTE.length
  const show = (count: number) => {
    setState(() => forestAfter(count))
    announce(`The editor now shows forest after step ${count + 1} of ${FOREST.steps.length + 1}`)
    document.getElementById("editor")?.scrollIntoView({ block: "start" })
  }
  return (
    <>
      <Section id="anatomy" title="A theme is tokens and a few knobs">
        <Prose>
          <p>
            Notebook is not special-cased anywhere. It is a palette of {swatches} colours, some numbers for the hand, and a stylesheet that derives everything else from them. A second theme is a block
            of CSS custom properties that overrides some of those, on <InlineCode>&lt;html&gt;</InlineCode> or on any subtree, next to a small recipe object for the choices that are not colours.
            No component is edited.
          </p>
        </Prose>
      </Section>

      <Section id="editor" title="Edit a theme live" description="Change any colour or knob and the page of real components below re-themes; the contrast table answers at once. Nothing you do here leaves the preview.">
        <Editor state={state} setState={setState} />
      </Section>

      <Section id="tiers" title="What a theme is made of" description="Four tiers of tokens. A theme edits the first, sometimes the third, and never has to touch the other two.">
        <Anatomy />
      </Section>

      <Section id="forest" title="A worked example: forest" description="We are not shipping a second theme. This is the process, run on the real checker, so you can do it for yours.">
        <Prose>
          <p>
            Forest is pale sage felt, warm cream paper, a kraft-coloured slip and petrol-teal ink. Each step below adds its declarations to a scratch copy of the stylesheet and runs the same
            contrast check the build runs. The results are not staged; the first one surprised us too.
          </p>
        </Prose>
        <Walkthrough onShow={show} />
        <Callout tone="tip" title="The lesson in step 6">
          <p>
            The marker does two jobs: it is a fill under an ink label (which wants it light) and, as <InlineCode>--chart-1</InlineCode>, a line on paper (which wants it dark). On Notebook&apos;s paper the
            two just fit; on forest&apos;s there is no single orange that does both. So the theme lightens the marker and gives the chart its own darker orange. Darkening the marker alone, which is what
            you might try first, makes the label worse.
          </p>
        </Callout>
        <Section id="forest-compare" level={3} title="Notebook and forest, side by side">
          <Demo label="The same page in Notebook and in the finished forest theme">
            <div className="@container">
              <div className="grid gap-6 @2xl:grid-cols-2">
                <div>
                  <p className="mb-2 font-script text-xl font-bold">Notebook</p>
                  <ThemePreview state={EMPTY_THEME} seed="notebook" label="The preview in Notebook" />
                </div>
                <div>
                  <p className="mb-2 font-script text-xl font-bold">Forest</p>
                  <ThemePreview state={forest} seed="forest" label="The preview in the finished forest theme" />
                </div>
              </div>
            </div>
          </Demo>
        </Section>
        <CodeBlock
          lang="css"
          title="The finished block"
          code={themeCss("forest", forest)}
        />
      </Section>

      <Section id="knobs" title="Recipe knobs" description="The numbers the drawing engine and the stylesheet read. Some are read by the drawing engine, some by CSS, and a few are declared and waiting; the table says which, from a scan of the source.">
        <KnobTable />
        <Prose>
          <p>
            The engine reads its knobs once per theme change: <InlineCode>wobble</InlineCode>, <InlineCode>misreg</InlineCode>, <InlineCode>bleed</InlineCode> and the pen width come from
            <InlineCode> getComputedStyle</InlineCode> on the provider&apos;s wrapper and again whenever <InlineCode>data-theme</InlineCode>, density, motion or direction changes. The first render
            (server and hydration) always uses Notebook&apos;s numbers, so hydration is exact and Notebook never redraws.
          </p>
          <p>
            A dark theme is a different material system, not a recolour: opaque pens (<InlineCode>--ll-blend: normal</InlineCode>), stronger shadows (<InlineCode>--ll-shadow-k</InlineCode> around 2.5)
            and a desk lighter than the paper. It is not started; the shadcn <InlineCode>.dark</InlineCode> class is not used by any Looseleaf token.
          </p>
        </Prose>
      </Section>

      <Section id="shipping" title="Shipping your own">
        <Prose>
          <ol>
            <li>Put the block after <InlineCode>looseleaf.css</InlineCode> (same specificity, later wins) or fill a slot in it. Every name must already exist in the base; a checker rejects a typo.</li>
            <li>
              Run the contrast record for your theme by name and fix what it lists. The scripts below live in the Looseleaf repository (<InlineCode>tools/</InlineCode>), not in what the registry installs; the editor above runs the same
              maths in the browser, so it works from anywhere.
            </li>
            <li>Render the palette sheet and look at it.</li>
            <li>Put <InlineCode>data-theme=&quot;forest&quot;</InlineCode> on <InlineCode>&lt;html&gt;</InlineCode>, or on a subtree. Density and motion are independent attributes.</li>
          </ol>
        </Prose>
        <CodeBlock
          lang="bash"
          title="Check a theme (from a checkout of the repository)"
          code={`node tools/lookdev/tokens.mjs --check                # names exist, role blocks agree
node tools/check-tokens.mjs --all                    # every contrast pair, in every theme scope
node tools/lookdev/palette.mjs --theme forest        # the swatch sheet, with the numbers`}
        />
        <CodeBlock
          lang="tsx"
          title="Using it"
          code={`<html data-theme="forest">…</html>

<section data-theme="forest">
  <InkProvider theme="forest" knobs={{ wobble: 0.8 }}>…</InkProvider>
</section>`}
        />
      </Section>

      <Related
        items={[
          foundation("colour", "Colour", "The palette a theme replaces, and its contrast record."),
          foundation("pens", "Pens", "What the wobble and width knobs do."),
          foundation("paper", "Paper", "The stocks and edges a theme can recut."),
          foundation("density", "Density", "The other axis: a theme and a density are independent."),
          component("card", "Card", "The component the preview is built around."),
        ]}
      />
    </>
  )
}
