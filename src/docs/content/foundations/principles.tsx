import { useId, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Highlight } from "@/components/ui/highlight"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { Callout, InlineCode, Prose, Section, Stage } from "@/docs/kit"
import { DataTable, Specimen } from "./_shared-b/layout"
import { LAWS } from "./_shared-b/principles-specimens"

const ACCENTS = ["tomato", "tangerine", "lemon", "grass", "teal", "sky", "grape", "bubblegum"] as const
const ACCENT_BG: Record<(typeof ACCENTS)[number], string> = {
  tomato: "bg-tomato",
  tangerine: "bg-tangerine",
  lemon: "bg-lemon",
  grass: "bg-grass",
  teal: "bg-teal",
  sky: "bg-sky",
  grape: "bg-grape",
  bubblegum: "bg-bubblegum",
}

function InkRoles() {
  return (
    <DataTable label="What each pen means" minWidth="34rem">
      <thead>
        <tr>
          <th scope="col">On the desk</th>
          <th scope="col">It means</th>
          <th scope="col">In use</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Dark felt-tip</th>
          <td>The words and the outlines.</td>
          <td>
            <span className="text-ink">Buy more ink</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Blue felt</th>
          <td>You: links, typed text, anything you can act on, and the focus ring.</td>
          <td>
            <span className="font-bold text-ink-you">Forgot password?</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Graphite pencil</th>
          <td>Meta: captions, hints, secondary marks.</td>
          <td>
            <span className="text-pencil-text">edited two days ago</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Red pencil</th>
          <td>Correction and danger. It comes with a word, an icon or a hatch, never alone.</td>
          <td>
            <span className="text-red">Enter a valid email</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Green pencil</th>
          <td>All good.</td>
          <td>
            <span className="text-green">Saved</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Terracotta marker</th>
          <td>The one main action on a screen.</td>
          <td>
            <Button size="sm">Save</Button>
          </td>
        </tr>
        <tr>
          <th scope="row">Yellow highlighter</th>
          <td>Emphasis and selection.</td>
          <td>
            <Highlight>this one</Highlight>
          </td>
        </tr>
        <tr>
          <th scope="row">Stationery colors</th>
          <td>Decoration only: stickers, washi tape, badges, avatars, chart fills, stamps. Never text, never a control.</td>
          <td>
            <span className="flex flex-wrap gap-1.5" aria-hidden="true">
              {ACCENTS.map((a) => (
                <span key={a} className={`size-5 ${ACCENT_BG[a]}`} />
              ))}
            </span>
          </td>
        </tr>
      </tbody>
    </DataTable>
  )
}

const FORCED = {
  hover: { "data-hover": true },
  pressed: { "data-pressed": true },
  focus: { "data-focus-visible": true },
} as const

function StatesSpecimen() {
  return (
    <Stage layout="center" label="One button in five states">
      <Specimen caption="rest">
        <Button variant="outline">Send</Button>
      </Specimen>
      <Specimen caption="hover: the fill drifts and drop-lines appear">
        <Button variant="outline" {...FORCED.hover}>
          Send
        </Button>
      </Specimen>
      <Specimen caption="pressed: it clicks into register">
        <Button variant="outline" {...FORCED.pressed}>
          Send
        </Button>
      </Specimen>
      <Specimen caption="focus: a blue ring with corner ticks">
        <Button variant="outline" {...FORCED.focus}>
          Send
        </Button>
      </Specimen>
      <Specimen caption="disabled: dashed and pale">
        <Button variant="outline" disabled>
          Send
        </Button>
      </Specimen>
    </Stage>
  )
}

function PatternSpecimen() {
  return (
    <Stage layout="center" label="Danger is a pattern and a word, not only a color">
      <Specimen caption="a red pencil hatch, and the word">
        <Button variant="destructive">
          <Icon name="trash" />
          Delete
        </Button>
      </Specimen>
      <Specimen caption="the same on a badge">
        <Badge variant="destructive">Overdue</Badge>
      </Specimen>
    </Stage>
  )
}

function SeedSpecimen() {
  return (
    <Stage layout="center" label="Three buttons, two seeds">
      <Specimen caption='seed="ada"'>
        <Button variant="outline" seed="ada">
          Sign in
        </Button>
      </Specimen>
      <Specimen caption='seed="ada" again: the same hand'>
        <Button variant="outline" seed="ada">
          Sign in
        </Button>
      </Specimen>
      <Specimen caption='seed="bob"'>
        <Button variant="outline" seed="bob">
          Sign in
        </Button>
      </Specimen>
    </Stage>
  )
}

interface Principle {
  title: string
  body: string
  specimen?: () => ReactNode
}

const PRINCIPLES: readonly Principle[] = [
  {
    title: "Practical first",
    body: "Underneath the drawing it is shadcn/ui: the same parts, props, data-slots and Radix behavior, so a shadcn user can swap one of our files in without touching their JSX. Extras (tone, seed, tilt) are additions, never changes.",
  },
  {
    title: "Charm is a dial",
    body: "Comfortable, compact and calm are the same components at three settings. The real interface is calm; the fun lives in the decoration layer of stickers, tape and margin notes, which you can leave out.",
  },
  {
    title: "Drawn, never scaled",
    body: "A drawing that is made for 96 px is mud at 16. Icons, doodles, stickers and Stubby are redrawn for the small sizes, with a heavier pen and fewer details, instead of being shrunk.",
  },
  {
    title: "States are drawn, not just colored",
    body: "Hover, pressed, focus, disabled and invalid each change the drawing (an offset, a hatch, a ring, a dash), so none of them depends on seeing a hue.",
    specimen: () => <StatesSpecimen />,
  },
  {
    title: "Meaning never rides on color alone",
    body: "Destructive is a hatch and a word. A chart series has its own pencil pattern. Status icons differ by silhouette. A color-blind reader loses nothing.",
    specimen: () => <PatternSpecimen />,
  },
  {
    title: "Same seed, same hand",
    body: "Every random choice comes from a seeded generator, and the seed comes from useId() or a prop. The server and the browser draw the same thing, and a screenshot is stable.",
    specimen: () => <SeedSpecimen />,
  },
  {
    title: "Cost is a budget",
    body: "A drawn control is one svg of a dozen to forty elements and about 3 to 16 KB at the default tier (measured on an input, a button, a checkbox and a switch). Shadows are CSS, never a blur inside the drawing; there are no runtime filters; big surfaces use baked tiles. Rows of a long list are highlighter backgrounds, not drawings.",
  },
  {
    title: "Themes are tokens",
    body: "Every color, width and duration is a custom property. A second theme is a block of overrides, and no component is edited to get one.",
  },
]

function Checklist() {
  const id = useId()
  const items = LAWS.map((l) => ({ id: `${id}-${l.n}`, text: `${l.title}: ${l.rule}` }))
  return (
    <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0 text-ink">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <Checkbox id={item.id} className="mt-1" />
          <Label htmlFor={item.id} className="font-normal">
            {item.text}
          </Label>
        </li>
      ))}
    </ul>
  )
}

export default function PrinciplesBody() {
  return (
    <>
      <Section id="identity" title="A real notebook on a tidy desk" description="Cream paper, a dark felt-tip, a blue one for you, a pencil for the small print. Every color is a tool, and every tool has one job.">
        <InkRoles />
        <Prose>
          <p>
            The signature moves are solid fills inside a single pen line, soft rounded corners, paper that is taped, pinned or clipped, die-cut stickers, hand-circled words, tally marks and notes in the margin. They are the same few devices
            everywhere, which is what makes a page of unrelated components look like one person&apos;s notebook.
          </p>
        </Prose>
      </Section>

      <Section id="laws" title="The ten laws of the hand" description="The review checklist for every component. Each law has a specimen below, made of the library's own parts: this page is the test.">
        <ol role="list" className="m-0 flex list-none flex-col gap-10 p-0">
          {LAWS.map((law) => (
            <li key={law.n} id={`law-${law.n}`} className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-script text-4xl leading-none text-marker" aria-hidden="true">
                  {law.n}
                </span>
                <h3 className="m-0 font-script text-3xl leading-tight text-ink">
                  <span className="sr-only">Law {law.n}: </span>
                  {law.title}
                </h3>
                <span className="text-pencil-text">{law.rule}</span>
              </div>
              {law.specimen()}
              <p className="m-0 max-w-prose text-ink">{law.why}</p>
              <p className="m-0 text-pencil-text">
                <strong className="text-ink">You meet it in:</strong> {law.meet}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="principles" title="Design principles" description="The decisions the laws lead to, and the reasons behind the shape of the library.">
        <ol role="list" className="m-0 flex list-none flex-col gap-8 p-0">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="flex min-w-0 flex-col gap-3">
              <h3 className="m-0 font-script text-3xl leading-tight text-ink">
                <span className="text-marker" aria-hidden="true">
                  {i + 1}.{" "}
                </span>
                {p.title}
              </h3>
              <p className="m-0 max-w-prose text-ink">{p.body}</p>
              {p.specimen ? p.specimen() : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="checklist" title="Before you ship" description="Ten questions for a component or a screen. Ticking them here is only for you; nothing is saved.">
        <Checklist />
        <Callout tone="tip" title="When in doubt, lower the dial">
          <p>
            If a screen feels busy, do not remove the drawing: set <InlineCode>data-density=&quot;calm&quot;</InlineCode> on the region. Law ten is a promise that every component still works, and still looks like paper, with the charm turned down.
          </p>
        </Callout>
      </Section>
    </>
  )
}
