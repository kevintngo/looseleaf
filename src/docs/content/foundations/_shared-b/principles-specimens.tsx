import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Circled } from "@/components/ui/circled"
import { Doodle } from "@/components/ui/doodle"
import { Handwritten } from "@/components/ui/handwritten"
import { Highlight } from "@/components/ui/highlight"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Paper } from "@/components/ui/paper"
import { Tape } from "@/components/ui/tape"
import { InkProvider } from "@/lib/ink/react"
import { Stage } from "@/docs/kit"
import { Specimen } from "./layout"

export interface Law {
  n: number
  title: string
  rule: string
  why: string
  meet: string
  specimen: () => ReactNode
}

function Panel({ n, label, desk, children }: { n: number; label: string; desk?: boolean; children: ReactNode }) {
  return (
    <Stage layout="center" surface={desk ? "desk" : "paper"} label={`Law ${n}: ${label}`}>
      {children}
    </Stage>
  )
}

function UniformCheck() {
  return (
    <svg viewBox="0 0 24 24" width={96} height={96} aria-hidden="true" focusable="false" className="text-ink" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5 L9.5 18 L20 6" />
    </svg>
  )
}

const SEEDS = ["a", "b", "c", "d", "e", "f"] as const

function Ribbons() {
  return (
    <Panel n={1} label="lines are ribbons with pressure">
      <Specimen caption="a uniform svg stroke">
        <UniformCheck />
      </Specimen>
      <Specimen caption="a ribbon: it swells, thins and skips">
        <Icon name="check" size={96} />
      </Specimen>
      <Specimen caption="the same pen at 24 px, 16 px, 12 px">
        <span className="flex items-end gap-4 text-ink">
          <Icon name="pencil" size={24} />
          <Icon name="pencil" size={16} />
          <Icon name="pencil" size={12} />
        </span>
      </Specimen>
    </Panel>
  )
}

function Unclosed() {
  return (
    <Panel n={2} label="nothing closes">
      <Specimen caption="a circle that runs past its start">
        <p className="m-0 text-xl">
          Please reply by <Circled tone="red">Friday</Circled>.
        </p>
      </Specimen>
      <Specimen caption="a box whose corners cross">
        <Button variant="outline">Cancel</Button>
      </Specimen>
    </Panel>
  )
}

function Seeded() {
  return (
    <Panel n={3} label="no two things are identical">
      {SEEDS.map((seed) => (
        <Doodle key={seed} name="star" size={64} seed={seed} />
      ))}
      <p className="m-0 basis-full text-center text-sm text-pencil-text">six stars, six seeds. The same seed always draws the same star, on the server and in the browser.</p>
    </Panel>
  )
}

function Offset() {
  return (
    <Panel n={4} label="fills are a separate layer, in register">
      <Specimen caption="solid fill, clean line">
        <Button>Save</Button>
      </Specimen>
      <Specimen caption="colour inside the line">
        <Doodle name="heart" size={80} />
      </Specimen>
      <Specimen caption="a swipe behind the words">
        <p className="m-0 text-xl">
          the <Highlight>good bits</Highlight> get marked
        </p>
      </Specimen>
    </Panel>
  )
}

const STOCKS = ["paper", "card", "slip", "graph", "kraft"] as const

function Tooth() {
  return (
    <Panel desk n={5} label="paper has tooth and light from the upper left">
      {STOCKS.map((stock) => (
        <Specimen onDesk key={stock} caption={stock}>
          <Paper stock={stock} tilt={false} className="grid h-24 w-32 place-items-center text-ink">
            <span className="font-script text-2xl">Aa</span>
          </Paper>
        </Specimen>
      ))}
    </Panel>
  )
}

function Shadows() {
  return (
    <Panel desk n={6} label="shadows are warm and short">
      <Specimen onDesk caption="not this: cool, long, blurred">
        <div className="grid h-24 w-40 place-items-center bg-white text-ink shadow-[0_18px_40px_-8px_rgb(0_0_0/0.45)]">
          <span className="font-script text-2xl">a card</span>
        </div>
      </Specimen>
      <Specimen onDesk caption="this: umber, a hair of contact and a short lift">
        <Paper stock="card" tilt={false} className="grid h-24 w-40 place-items-center text-ink">
          <span className="font-script text-2xl">a card</span>
        </Paper>
      </Specimen>
    </Panel>
  )
}

function Tilt() {
  return (
    <Panel desk n={7} label="tilt paper, never text">
      <Specimen onDesk caption="the sheet turns 2 degrees, the most any sheet may; the words do not">
        <Paper stock="index-card" tilt={2} className="relative w-60 px-5 py-5 text-ink">
          <Tape kind="washi-dots" className="absolute -top-3 start-6" />
          <p className="m-0 font-script text-2xl leading-tight">Buy more ink</p>
          <p className="m-0 mt-1">Black, blue, and one red for corrections.</p>
        </Paper>
      </Specimen>
    </Panel>
  )
}

function Hand() {
  return (
    <Panel n={8} label="handwriting on real baselines, lightly jittered">
      <Specimen caption="Handwritten: every word a hair off the baseline" className="max-w-sm">
        <Handwritten as="p" strength={1.5} className="m-0 font-script text-3xl leading-snug">
          Ask Sam about the pond, and bring the big umbrella!
        </Handwritten>
      </Specimen>
      <Specimen caption="strength 0: the same words, level" className="max-w-sm">
        <Handwritten as="p" strength={0} className="m-0 font-script text-3xl leading-snug">
          Ask Sam about the pond, and bring the big umbrella!
        </Handwritten>
      </Specimen>
    </Panel>
  )
}

function Multiply() {
  return (
    <Panel n={9} label="colour is ink on paper, never a flat fill">
      <Specimen caption="not this: a flat rectangle hides the paper">
        <p className="m-0 text-xl">
          the <span className="bg-lemon px-1">good bits</span> get marked
        </p>
      </Specimen>
      <Specimen caption="this: a highlighter darkens what is under it">
        <p className="m-0 text-xl">
          the <Highlight>good bits</Highlight> get marked
        </p>
      </Specimen>
    </Panel>
  )
}

function Form({ id }: { id: string }) {
  return (
    <div className="flex w-64 flex-col gap-3 text-ink">
      <Label htmlFor={`${id}-name`}>Name</Label>
      <Input id={`${id}-name`} defaultValue="Ada" />
      <span className="flex items-center gap-2">
        <Checkbox id={`${id}-tick`} defaultChecked />
        <Label htmlFor={`${id}-tick`}>Send me the newsletter</Label>
      </span>
      <Button className="self-start">Sign</Button>
    </div>
  )
}

function Calm() {
  return (
    <Panel n={10} label="calm where it matters">
      <Specimen caption="comfortable: marker fills, wobble, a little tilt (the default)">
        <InkProvider density="comfortable" defs={false}>
          <Form id="law10-comfortable" />
        </InkProvider>
      </Specimen>
      <Specimen caption="calm: pencil hairlines, no jitter, no fill offset. For dense data and long forms">
        <InkProvider density="calm" defs={false}>
          <Form id="law10-calm" />
        </InkProvider>
      </Specimen>
    </Panel>
  )
}

export const LAWS: readonly Law[] = [
  {
    n: 1,
    title: "Lines are ribbons with pressure",
    rule: "Never a uniform stroke.",
    why: "A felt-tip swells on the down-stroke, thins where it lifts and skips where it runs dry. Every line in the library is a filled shape with a changing width, so a 16 px icon and a 400 px rule both look pulled by a hand.",
    meet: "Every icon, underline, rule and outline.",
    specimen: () => <Ribbons />,
  },
  {
    n: 2,
    title: "Nothing closes",
    rule: "Ends overshoot or fall short.",
    why: "People do not stop a pen on a point. A circle passes its start, a box's corners cross, a tick flicks out. Perfect joins are what make a drawing look digital.",
    meet: "Circled, Bracket, and the outline of every button and field.",
    specimen: () => <Unclosed />,
  },
  {
    n: 3,
    title: "No two things are identical",
    rule: "Seed everything.",
    why: "Repetition is the tell of a stamp. Every drawing is generated from a seed, so two buttons differ, and the same seed always draws the same thing: server and browser agree, and a screenshot is stable.",
    meet: "The seed prop on any drawn part; by default a seed from useId().",
    specimen: () => <Seeded />,
  },
  {
    n: 4,
    title: "Fills are a separate layer",
    rule: "Offset and imperfect.",
    why: "Marker is laid after the outline and misses it by a few pixels. Hover widens the miss; pressing snaps it into register. The gap between line and colour is what reads as ink on paper.",
    meet: "Button, Checkbox, Badge, Highlight and every filled doodle.",
    specimen: () => <Offset />,
  },
  {
    n: 5,
    title: "Paper has tooth",
    rule: "Light from the upper left.",
    why: "A sheet is a stock colour plus a baked relief tile lit from the top left, and one tile serves every colour. Nothing sits on a flat fill.",
    meet: "Paper and Card stocks, Desk, and the sticky notes.",
    specimen: () => <Tooth />,
  },
  {
    n: 6,
    title: "Shadows are warm umber and short",
    rule: "Never a long grey blur.",
    why: "A sheet on a desk casts a hair of contact shadow and a soft short one, in brown. Long blurred shadows say floating screen, not paper.",
    meet: "The shadow prop of Paper and the --shadow-* tokens.",
    specimen: () => <Shadows />,
  },
  {
    n: 7,
    title: "Tilt paper, never text",
    rule: "The sheet turns; the words stay level.",
    why: "A note stuck on a wall is never quite straight, but you read it straight. Only the sheet layer rotates, by a fraction of a degree, and density calm turns even that off.",
    meet: "Paper tilt and the ll-tilt utilities.",
    specimen: () => <Tilt />,
  },
  {
    n: 8,
    title: "Text is handwriting on real baselines",
    rule: "Real text, lightly jittered.",
    why: "Kevin Sans for the interface, the titles and the stamps, tuned for each: all of them real DOM text you can select and search. The jitter is a transform per word, and it stops in calm density and under reduced motion.",
    meet: "Handwritten, the font-hand, font-script and font-type tokens.",
    specimen: () => <Hand />,
  },
  {
    n: 9,
    title: "Colour is ink, pencil and marker",
    rule: "On paper, multiplied. Never a flat UI fill.",
    why: "Marker and highlighter darken the paper under them instead of covering it, so texture shows through. Saturated stationery colours are for the decoration layer only; the real interface stays calm.",
    meet: "The ll-multiply utility, --ll-blend, Highlight, and every marker fill.",
    specimen: () => <Multiply />,
  },
  {
    n: 10,
    title: "Calm where it matters",
    rule: "Charm is a dial, not a mandate.",
    why: "A long form or a table of numbers should not wobble. Density is one switch: comfortable, compact, or calm with hairline pencil rules, no jitter and no fill offset. Nothing else about a component changes.",
    meet: "data-density on any ancestor, or InkProvider density.",
    specimen: () => <Calm />,
  },
]
