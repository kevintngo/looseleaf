import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { ICON_ALIASES, resolveIconName } from "@/lib/ink/art/icons"
import { Chip, InlineCode, Stage } from "@/docs/kit"
import { drawnShareOfUses, ICON_BY_ID, ICON_ENTRIES, undrawnIcons } from "./catalog"
import { Choice, ControlLabel, SearchField } from "./controls"
import { DEMAND_SAMPLE_FILES, ICON_DEMAND } from "./icon-demand"
import { iconTierLabel } from "./snippets"

const HERO = ["bell", "calendar", "settings", "search", "eye", "pencil", "heart", "star", "sun", "house", "mail", "camera", "gift", "sparkles"] as const

export function IconStrip() {
  return (
    <Stage layout="center" label="A few of the icons, with their color washes">
      <ul role="list" className="m-0 flex list-none flex-wrap items-center justify-center gap-x-7 gap-y-5 p-0 text-ink">
        {HERO.filter((id) => ICON_BY_ID.has(id)).map((id) => (
          <li key={id}>
            <Icon name={id} size={48} tone="doodle" />
          </li>
        ))}
      </ul>
    </Stage>
  )
}

const LADDER = [12, 16, 20, 24, 32, 48, 64, 96] as const
const SHOWCASE = ["trash", "bell", "settings", "search", "calendar", "eye"] as const
const ZOOM = 4

function Loupe({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative block shrink-0" style={{ width: 16 * ZOOM, height: 16 * ZOOM }}>
      <span className="absolute start-0 top-0 block origin-top-left" style={{ width: 16, height: 16, transform: `scale(${ZOOM})` }}>
        {children}
      </span>
    </span>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption className="text-center text-sm leading-tight text-pencil-text">{children}</figcaption>
}

export function ScaledVsRedrawn({ id }: { id: string }) {
  return (
    <div className="flex flex-wrap items-start gap-x-10 gap-y-6 text-ink" data-slot="scaled-vs-redrawn">
      <figure className="m-0 flex flex-col items-center gap-2">
        <Loupe>
          <span className="block origin-top-left" style={{ width: 24, height: 24, transform: `scale(${16 / 24})` }}>
            <Icon name={id} size={24} />
          </span>
        </Loupe>
        <Caption>
          the 24 px master, scaled to 16
          <br />
          (what most icon sets do)
        </Caption>
      </figure>
      <figure className="m-0 flex flex-col items-center gap-2">
        <Loupe>
          <Icon name={id} size={16} />
        </Loupe>
        <Caption>
          redrawn for 16 px
          <br />
          (heavier pen, less detail)
        </Caption>
      </figure>
      <figure className="m-0 flex flex-col items-center gap-2">
        <span className="flex items-center gap-4" style={{ height: 16 * ZOOM }}>
          <Icon name={id} size={24} style={{ transform: `scale(${16 / 24})`, transformOrigin: "center" }} />
          <Icon name={id} size={16} />
        </span>
        <Caption>
          both at their true size
          <br />
          (16 px on screen)
        </Caption>
      </figure>
    </div>
  )
}

export function SizeLadder({ id, tone }: { id: string; tone: "ui" | "doodle" }) {
  return (
    <ul role="list" className="m-0 flex list-none flex-wrap items-end gap-x-6 gap-y-5 p-0 text-ink" data-slot="size-ladder">
      {LADDER.map((px) => (
        <li key={px} className="flex flex-col items-center gap-2">
          <span className="flex items-end justify-center" style={{ height: 96 }}>
            <Icon name={id} size={px} tone={tone} />
          </span>
          <span className="font-type text-sm leading-none">{px}</span>
          <span className="max-w-24 text-center text-sm leading-tight text-pencil-text">{iconTierLabel(id, px)}</span>
        </li>
      ))}
    </ul>
  )
}

export function SizesLab() {
  const [id, setId] = useState<string>(SHOWCASE[0])
  const [tone, setTone] = useState<"ui" | "doodle">("ui")
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <ControlLabel>Icon</ControlLabel>
          <Choice
            label="Icon to show"
            value={id}
            onChange={setId}
            options={SHOWCASE.filter((s) => ICON_BY_ID.has(s)).map((s) => ({ value: s, label: <Icon name={s} size={20} />, name: s }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <ControlLabel>Tone</ControlLabel>
          <Choice
            label="Tone of the sizes"
            value={tone}
            onChange={setTone}
            options={[
              { value: "ui", label: "ui" },
              { value: "doodle", label: "doodle" },
            ]}
          />
        </div>
      </div>
      <SizeLadder id={id} tone={tone} />
      <ScaledVsRedrawn id={id} />
    </div>
  )
}

export function NameResolver() {
  const [name, setName] = useState("Trash2")
  const trimmed = name.trim()
  const id = trimmed ? resolveIconName(trimmed) : ""
  const drawn = !!id && ICON_BY_ID.has(id)
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4" data-slot="name-resolver">
      <div className="flex min-w-64 flex-1 flex-col gap-1.5">
        <ControlLabel>A lucide name</ControlLabel>
        <SearchField label="Icon name to resolve" value={name} onChange={setName} placeholder="Trash2, alert-triangle, MoreHorizontal, HomeIcon" />
      </div>
      <div className="flex min-h-16 min-w-64 flex-1 items-center gap-4 text-ink" role="status">
        {trimmed ? (
          <>
            <span className="grid size-16 shrink-0 place-items-center bg-graph shadow-hair" aria-hidden="true">
              <Icon name={trimmed} size={32} />
            </span>
            <p className="m-0">
              <InlineCode>{trimmed}</InlineCode> means <InlineCode>{id}</InlineCode>
              <br />
              <span className="text-pencil-text">{drawn ? "and it is drawn." : "which is not drawn yet, so it shows a question-mark box."}</span>
            </p>
          </>
        ) : (
          <p className="text-[15px] text-muted-foreground m-0">Type a name.</p>
        )}
      </div>
    </div>
  )
}

export function AliasTable() {
  const rows = useMemo(() => Object.entries(ICON_ALIASES).filter(([id]) => ICON_BY_ID.has(id)), [])
  return (
    <ul role="list" className="m-0 grid list-none gap-x-6 gap-y-2 p-0 text-ink [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]" data-slot="alias-table">
      {rows.map(([id, aliases]) => (
        <li key={id} className="flex items-center gap-3 py-1">
          <Icon name={id} size={24} />
          <span className="min-w-0 leading-tight">
            <InlineCode>{id}</InlineCode>
            <span className="block text-sm text-pencil-text [overflow-wrap:anywhere]">{aliases.join(", ")}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

const UNDRAWN_FIRST = 24

export function UndrawnList() {
  const [all, setAll] = useState(false)
  const list = useMemo(() => undrawnIcons(), [])
  const share = Math.round(drawnShareOfUses() * 100)
  const shown = all ? list : list.slice(0, UNDRAWN_FIRST)
  const sampleNames = ICON_DEMAND.length
  const sampleDrawn = ICON_DEMAND.filter(([n]) => ICON_BY_ID.has(resolveIconName(n))).length
  return (
    <div data-slot="undrawn-list">
      <p className="mt-0">
        The {ICON_ENTRIES.length} drawn icons cover <strong>{share} percent</strong> of the icon uses in shadcn/ui&apos;s own examples ({sampleDrawn} of the {sampleNames} different names in{" "}
        {DEMAND_SAMPLE_FILES} files). The names below are the rest, most used first. Until one is drawn, <InlineCode>&lt;Icon name=&quot;telescope&quot; /&gt;</InlineCode> draws a hand box with a question mark
        and sets <InlineCode>data-missing</InlineCode> on the svg, so a missing icon is easy to spot in a test.
      </p>
      <div className="my-4 flex flex-wrap items-center gap-6 text-ink">
        <figure className="m-0 flex flex-col items-center gap-1">
          <Icon name="telescope" size={48} />
          <figcaption className="text-sm text-pencil-text">what an undrawn name draws</figcaption>
        </figure>
      </div>
      <ul role="list" className="m-0 flex list-none flex-wrap gap-2 p-0">
        {shown.map((u) => (
          <li key={u.name}>
            <Chip tone="outline">
              {u.name}
              {u.uses ? (
                <>
                  <span aria-hidden="true" className="text-pencil-text">
                    {" "}
                    x{u.uses}
                  </span>
                  <span className="sr-only"> (used {u.uses} times)</span>
                </>
              ) : null}
            </Chip>
          </li>
        ))}
      </ul>
      {list.length > UNDRAWN_FIRST ? (
        <p className="mt-3">
          <Button variant="outline" size="sm" onClick={() => setAll((v) => !v)} aria-expanded={all}>
            {all ? "Show fewer" : `Show all ${list.length}`}
          </Button>
        </p>
      ) : null}
    </div>
  )
}
