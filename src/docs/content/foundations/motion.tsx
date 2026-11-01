import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { CodeBlock, InlineCode, Prose, Section } from "@/docs/kit"
import { Boil } from "@/components/ui/boil"
import { Button } from "@/components/ui/button"
import { Circled } from "@/components/ui/circled"
import { Doodle } from "@/components/ui/doodle"
import { Highlight } from "@/components/ui/highlight"
import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"
import { Underline } from "@/components/ui/underline"
import { InkProvider } from "@/lib/ink/react"
import { cn } from "@/lib/utils"
import { curvePath, curvePoint, progressAt, overshoot, type CurveBox } from "./_shared/easing"
import { DURATIONS, EASINGS } from "./_shared/data.generated"
import { Demo, Panel, Readout, Related, SliderRow, SwitchRow, TableScroll, component, foundation, td, th } from "./_shared/kit"

const DURATION_USE: Record<string, string> = {
  press: "A pressed control snapping into register.",
  hover: "The hover layer arriving and the fill nudging.",
  fade: "State layers (focus, invalid, disabled) fading in.",
  pop: "A chip or a mark stamped on.",
  sheet: "A sheet turning; the small drop of a dialog.",
  drop: "A sheet dropped onto the desk.",
  toss: "A toast thrown in from the corner.",
  soak: "New text drying like wet ink.",
  boil: "One step of a boiling line.",
  draw: "A stroke drawn on.",
}

function Durations() {
  const [on, setOn] = useState(false)
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => setOn((v) => !v)}>
          {on ? "Reset the bars" : "Run all ten at once"}
        </Button>
        <p className="text-[14.5px] text-muted-foreground">Every bar has the same length to cover; each takes its own token to do it.</p>
      </div>
      <TableScroll label="The ten duration tokens">
        <table className="w-full min-w-[34rem] border-collapse text-[15px]">
          <caption className="sr-only">Duration tokens, their length, a bar that takes that long to fill, and what each one is for</caption>
          <thead>
            <tr>
              <th scope="col" className={th}>Token</th>
              <th scope="col" className={th}>Time</th>
              <th scope="col" className={th}>Bar</th>
              <th scope="col" className={th}>For</th>
            </tr>
          </thead>
          <tbody>
            {DURATIONS.map((d) => (
              <tr key={d.token}>
                <th scope="row" className={cn(td, "text-start font-mono text-[13.5px] font-medium whitespace-nowrap")}>{d.token}</th>
                <td className={cn(td, "ll-num font-mono text-[13.5px] whitespace-nowrap")}>{d.ms} ms</td>
                <td className={cn(td, "w-40 min-w-32")}>
                  <div aria-hidden="true" className="h-3 border border-ink/50 bg-paper">
                    <div className="h-full bg-marker" style={{ width: on ? "100%" : "0%", transition: `width var(${d.token}) linear` }} />
                  </div>
                </td>
                <td className={td}>{DURATION_USE[d.name] ?? d.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  )
}

const BOX: CurveBox = { w: 116, h: 84, pad: 8, headroom: 0.25 }

function Curve({ name, css, bezier, t }: { name: string; css: string; bezier: readonly [number, number, number, number]; t: number }) {
  const p = curvePoint(bezier, t, BOX)
  const size = BOX.w + 2 * BOX.pad
  const height = BOX.h + 2 * BOX.pad
  const top = curvePoint(bezier, 0, BOX).y
  const one = curvePoint(bezier, 1, BOX).y
  return (
    <figure className="m-0 min-w-0">
      <svg role="img" aria-label={`The ${name} easing as a curve: time across, progress up`} viewBox={`0 0 ${size} ${height}`} width={size} height={height} className="block h-auto max-w-full overflow-visible">
        <line x1={BOX.pad} y1={one} x2={BOX.pad + BOX.w} y2={one} stroke="var(--ll-pencil-mark)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1={BOX.pad} y1={top} x2={BOX.pad + BOX.w} y2={one} stroke="var(--ll-pencil-mark)" strokeWidth="1" opacity="0.5" />
        <path d={curvePath(bezier, BOX)} fill="none" stroke="var(--ll-ink)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx={p.x} cy={p.y} r="5" fill="var(--ll-marker)" stroke="var(--ll-ink)" strokeWidth="1.5" />
      </svg>
      <figcaption className="mt-1 leading-snug">
        <span className="block font-mono text-[14px] font-medium">{name}</span>
        <span className="block font-mono text-[12px] text-pencil-text">{css}</span>
        <span className="ll-num block font-mono text-[12.5px] text-ink-soft">{progressAt(bezier, t).toFixed(2)} at {t.toFixed(2)}</span>
      </figcaption>
    </figure>
  )
}

function Easings() {
  const [t, setT] = useState(0.35)
  const [go, setGo] = useState(false)
  return (
    <div className="grid gap-6">
      <Panel>
        <SliderRow label="Time" value={t} min={0} max={1} step={0.01} onChange={setT} format={(v) => v.toFixed(2)} ticks={4} hint="Scrub. The dot is where the easing has got to; on settle, pop and dialog it goes past 1 and comes back." />
      </Panel>
      <Demo label="Five easings as curves, with a dot at the scrubbed time">
        <ul role="list" className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-4 gap-y-6 p-0" aria-label="The five easings">
          {EASINGS.map((e) => (
            <li key={e.name} className="min-w-0">
              <Curve name={e.name} css={e.css} bezier={e.bezier} t={t} />
              <p className="ll-num mt-0.5 text-[14px] text-muted-foreground">{overshoot(e.bezier) > 1.001 ? `overshoots to ${overshoot(e.bezier).toFixed(2)}` : "no overshoot"}</p>
            </li>
          ))}
        </ul>
      </Demo>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setGo((v) => !v)}>
            {go ? "Back to the start" : "Race them (0.6 s)"}
          </Button>
          <p className="text-[14.5px] text-muted-foreground">Same distance, same time (--ll-dur-draw), five easings.</p>
        </div>
        <Demo label="Five chips racing along five lanes, each with its own easing">
          <ul role="list" dir="ltr" className="m-0 grid list-none gap-1 p-0" aria-label="Easing lanes">
            {EASINGS.map((e) => (
              <li key={e.name} className="grid h-9 grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-3 border-b border-dashed border-pencil-mark/70">
                <span className="font-mono text-[13px] text-pencil-text">{e.name}</span>
                <span className="relative me-[15%] block h-full">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 size-6 border-[1.5px] border-ink bg-marker"
                    style={{ left: go ? "calc(100% - 1.5rem)" : "0%", transition: `left var(--ll-dur-draw) var(${e.token})` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </Demo>
      </div>
    </div>
  )
}

const EFFECTS = [
  { id: "soak", cls: "animate-soak", label: "soak" },
  { id: "pop", cls: "animate-pop", label: "pop" },
  { id: "drop", cls: "animate-drop", label: "drop" },
  { id: "sheet-drop", cls: "animate-sheet-drop", label: "sheet-drop" },
  { id: "toss", cls: "animate-toss", label: "toss" },
  { id: "wipe", cls: "animate-wipe", label: "wipe" },
] as const

function EffectSample({ id }: { id: (typeof EFFECTS)[number]["id"] }) {
  switch (id) {
    case "soak":
      return <span className="animate-soak font-script text-2xl font-bold">wet ink</span>
    case "pop":
      return <span className="animate-pop inline-block border-[1.5px] border-ink bg-hi px-3 py-0.5 font-type text-sm">STAMPED</span>
    case "drop":
      return <Paper stock="index-card" seed="fx-drop" size={[110, 64]} className="animate-drop h-16 w-[110px] p-2 text-[14px] leading-tight">dropped on the desk</Paper>
    case "sheet-drop":
      return <Paper stock="slip" seed="fx-sheet" size={[110, 64]} className="animate-sheet-drop h-16 w-[110px] p-2 text-[14px] leading-tight">a dialog sheet</Paper>
    case "toss":
      return <Paper stock="sticky-yellow" seed="fx-toss" size={[110, 64]} className="animate-toss h-16 w-[110px] p-2 text-[14px] leading-tight">toast, thrown</Paper>
    case "wipe":
      return <span className="animate-wipe inline-block bg-hi px-3 py-1 font-hand text-[15px] font-bold">a swipe of yellow</span>
  }
}

function useComputedNumber(ref: React.RefObject<HTMLElement | null>, prop: string, dep: unknown): string {
  const [value, setValue] = useState("")
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setValue(getComputedStyle(el).getPropertyValue(prop).trim())
  }, [ref, prop, dep])
  return value
}

function ReducedMotion({ reduced, onReduced }: { reduced: boolean; onReduced: (v: boolean) => void }) {
  const [round, setRound] = useState(0)
  const scope = useRef<HTMLDivElement>(null)
  const motion = useComputedNumber(scope, "--ll-motion", reduced)
  const jitter = useComputedNumber(scope, "--ll-jitter-k", reduced)
  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <SwitchRow label="Pretend the OS asked for less motion" checked={reduced} onChange={onReduced} hint="The same switch as at the top of the page. It puts data-motion=reduced on a wrapper, exactly as the site's settings button does for the whole page." />
          <Button variant="secondary" size="sm" onClick={() => setRound((r) => r + 1)}>
            Replay all six
          </Button>
        </div>
      </Panel>
      <div ref={scope} data-testid="motion-scope">
        <Demo label="Six one-shot effects and the readout of the switch">
          <ul role="list" className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] items-start gap-x-4 gap-y-6 p-0" aria-label="Six effects">
            {EFFECTS.map((e) => (
              <li key={e.id} className="min-w-0">
                <div key={`${e.id}:${round}`} className="flex min-h-20 items-center">
                  <EffectSample id={e.id} />
                </div>
                <p className="font-mono text-[12.5px] text-pencil-text">{e.cls}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-dashed border-pencil-mark/60 pt-3 text-[14.5px]">
            <dt className="font-mono text-[13px]">--ll-motion</dt>
            <dd>
              <Readout data-testid="motion-readout">{motion || "1"}</Readout>
            </dd>
            <dt className="font-mono text-[13px]">--ll-jitter-k</dt>
            <dd>
              <Readout data-testid="jitter-readout">{jitter || "1"}</Readout>
            </dd>
          </dl>
        </Demo>
      </div>
    </div>
  )
}

function DrawOn() {
  const [marked, setMarked] = useState(true)
  const [round, setRound] = useState(0)
  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <SwitchRow label="Marked up" checked={marked} onChange={setMarked} hint="Switch it off and on again: turning it on plays the draw-on." />
          <Button variant="secondary" size="sm" onClick={() => setRound((r) => r + 1)}>
            Redraw the stroke
          </Button>
        </div>
      </Panel>
      <Demo label="Marks that draw themselves on">
        <div className="grid gap-5">
          <p className="max-w-xl text-[19px] leading-[2]">
            The good bits get <Highlight animate show={marked} seed="d1">a swipe of yellow</Highlight>, the rules get{" "}
            <Underline animate show={marked} tone="blue" kind="wavy" seed="d2">
              a wavy blue line
            </Underline>
            , and the one thing you must not miss is <Circled animate show={marked} tone="red" seed="d3">circled</Circled>.
          </p>
          <div className="flex items-center gap-4">
            <svg key={round} role="img" aria-label="A hand-drawn stroke that draws itself on" viewBox="0 0 132 44" width={132} height={44} className="block overflow-visible">
              <path className="ll-draw" pathLength="1" d="M6 28 C 22 4, 38 44, 60 22 S 104 6, 126 24" fill="none" stroke="var(--ll-ink-you)" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
            <p className="text-[14.5px] text-muted-foreground">
              <InlineCode>ll-draw</InlineCode> on a path with <InlineCode>pathLength=&quot;1&quot;</InlineCode>: dash it, then pull the dash away.
            </p>
          </div>
        </div>
      </Demo>
    </div>
  )
}

function BoilDemo() {
  const [fps, setFps] = useState(6)
  const [frames, setFrames] = useState(3)
  const [strength, setStrength] = useState(1)
  const [active, setActive] = useState(true)
  return (
    <div className="grid gap-5">
      <Panel>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <SliderRow label="Redraws per second" value={fps} min={1} max={12} onChange={setFps} format={(v) => `${v} fps`} hint="Hand animation boils at about six." />
          <SliderRow label="Different drawings" value={frames} min={2} max={4} onChange={setFrames} format={(v) => `${v} frames`} />
          <SliderRow label="How restless" value={strength} min={0} max={2} step={0.1} onChange={setStrength} format={(v) => v.toFixed(1)} />
          <SwitchRow label="Boiling" checked={active} onChange={setActive} hint="Anything that moves for more than five seconds needs a way to stop it." className="content-start" />
        </div>
      </Panel>
      <Demo label="A doodle, a mascot and a button that boil">
        <div className="flex flex-wrap items-center justify-center gap-10 py-3">
          <Boil fps={fps} frames={frames} strength={strength} active={active} data-testid="boil">
            <Doodle name="sun" size={104} label="A boiling sun" />
          </Boil>
          <Boil fps={fps} frames={frames} strength={strength} active={active}>
            <Mascot pose="wave" size={104} label="Stubby the pencil stub, waving" />
          </Boil>
          <Boil fps={fps} frames={frames} strength={strength} active={active}>
            <Button>Save changes</Button>
          </Boil>
        </div>
      </Demo>
    </div>
  )
}

const STREAM =
  "The pen does not wait for the sentence to finish. Each new word lands dark and wet, and dries to ink in half a second. That is the whole trick behind streaming chat."
const WORDS = STREAM.split(" ")

function Soak() {
  const [count, setCount] = useState(0)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return
    if (count >= WORDS.length) {
      setRunning(false)
      return
    }
    const id = setTimeout(() => setCount((c) => c + 1), 130)
    return () => clearTimeout(id)
  }, [running, count])
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setCount(0)
            setRunning(true)
          }}
        >
          {count === 0 ? "Stream a sentence" : "Stream it again"}
        </Button>
      </div>
      <Paper stock="paper" tilt={false} className="min-h-32 px-6 py-5">
        <p className="max-w-xl font-script text-3xl leading-snug text-ink" aria-live="off" data-testid="soak-text">
          {WORDS.slice(0, count).map((w, i) => (
            <span key={i} className="animate-soak">
              {w}{" "}
            </span>
          ))}
        </p>
      </Paper>
    </div>
  )
}

function Layers() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 py-3">
      {(
        [
          ["at rest", {}],
          ["data-hover", { "data-hover": "" }],
          ["data-pressed", { "data-pressed": "" }],
          ["data-focus-visible", { "data-focus-visible": "" }],
        ] as const
      ).map(([label, attrs]) => (
        <div key={label} className="grid justify-items-center gap-2">
          <Button seed="layers" {...attrs}>
            Save changes
          </Button>
          <code className="font-mono text-[12.5px] text-pencil-text">{label}</code>
        </div>
      ))}
    </div>
  )
}

export default function MotionPage() {
  const [reduced, setReduced] = useState(false)
  return (
    <>
      <Section id="principles" title="Short, physical, and off when asked">
        <Prose>
          <p>
            Motion here is what paper and ink do: a marker snaps into register, a sheet drops on the desk and settles, wet ink dries. Three rules cover nearly everything:
          </p>
          <ul>
            <li><strong>Boil only on live things.</strong> A line that shivers says &quot;this is alive&quot;. Use it on a mascot or a call to action, never on a list.</li>
            <li><strong>Streaming prose soaks in.</strong> New words arrive dark and dry to ink.</li>
            <li><strong>Everything else settles.</strong> One overshoot, then still.</li>
          </ul>
          <p>
            Everything below runs live. If you would rather watch it with less motion, this switch does what the site&apos;s settings button does, for this page only.
          </p>
        </Prose>
        <Panel className="max-w-xl">
          <SwitchRow label="Less motion for this page" checked={reduced} onChange={setReduced} hint="Durations collapse to zero and the boiling stops. The rest of the page carries on." />
        </Panel>
      </Section>

      <InkProvider motion={reduced ? "reduced" : "system"} defs={false}>
        <Section id="durations" title="Durations" description="Components read their durations from ten tokens; none writes a literal number of milliseconds. Every token is multiplied by --ll-motion, which is what makes reduced motion a single switch.">
          <Demo label="Ten duration tokens, each with a bar that takes that long to fill">
            <Durations />
          </Demo>
        </Section>

        <Section id="easings" title="Easings" description="Five curves. Out and in are the browser's own. Settle, pop and dialog overshoot a little and come back, which is what makes a sheet feel like it has weight.">
          <Easings />
        </Section>

        <Section id="reduced" title="Reduced motion is one switch" description="The OS setting and the in-app one both set --ll-motion to 0 and --ll-jitter-k to 0. Every duration collapses, in nested scopes too.">
          <Prose>
            <p>
              Animations use <InlineCode>fill-mode: both</InlineCode>, so with the duration at zero they land on their last frame: nothing is left half-drawn, and nothing hides the content.
              Tailwind, tw-animate and Radix animate with their own durations, so the stylesheet also zeroes those.
            </p>
          </Prose>
          <ReducedMotion reduced={reduced} onReduced={setReduced} />
        </Section>

        <Section id="draw-on" title="Draw-on" description="Marks written on the page draw themselves on the first time they scroll into view, along the reading direction. With reduced motion they are simply there.">
          <DrawOn />
        </Section>

        <Section id="boil" title="Boil" description="Three redrawn frames, stepped about six times a second, on the few things that are alive. It stops for reduced motion, in calm density, in a hidden tab, and off screen.">
          <BoilDemo />
        </Section>

        <Section id="soak" title="Soak" description="The one animation meant for text. Only new words soak; text that was already there never replays.">
          <Soak />
        </Section>

        <Section id="layers" title="Interaction never redraws" description="Hover, press and focus are pre-drawn layers inside the same SVG. CSS shows them with opacity and small transforms; React does not re-render, and nothing is measured or redrawn.">
          <Demo label="One button, forced into its four states">
            <Layers />
          </Demo>
          <CodeBlock
            lang="tsx"
            title="Forcing a state, for docs and screenshots"
            code={`<Button data-hover>Save changes</Button>
<Button data-pressed>Save changes</Button>
<Button data-focus-visible>Save changes</Button>`}
          />
        </Section>
      </InkProvider>

      <Related
        items={[
          foundation("pens", "Pens", "The stroke that draw-on reveals."),
          foundation("density", "Density", "Calm stands the boil down."),
          foundation("accessibility", "Accessibility", "Motion and the rest of the checklist."),
          component("boil", "Boil", "Every prop and hook."),
          component("reveal", "Reveal", "Wipe, soak, drop, pop and toss on scroll."),
          component("typewriter", "Typewriter", "Text typed out with a cursor."),
        ]}
      />
    </>
  )
}
