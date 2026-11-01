import { useDeferredValue, useId, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { Mascot } from "@/components/ui/mascot"
import { Paper } from "@/components/ui/paper"
import { Switch } from "@/components/ui/switch"
import { resolveIconName } from "@/lib/ink/art/icons"
import { useAnchorHref } from "@/docs/core/router"
import { Chip, EmptyState, InlineCode, Section } from "@/docs/kit"
import { ICON_BY_ID, ICON_ENTRIES, ICON_FAMILIES, undrawnIcons, type IconEntry } from "./catalog"
import { Choice, ControlLabel, SearchField, SizeSlider, Toolbar, ToolbarRow } from "./controls"
import { CopyStatus, ResultCount, RovingGroup, Tile, TileGrid, useCopyStatus } from "./gallery"
import { search } from "./search"
import { iconSnippet, iconTierLabel, iconTierWord, importLine } from "./snippets"

const PRESET_SIZES = [12, 16, 20, 24, 32, 48, 64, 96] as const

type Tone = "ui" | "doodle"

const MICRO_COUNT = ICON_ENTRIES.filter((e) => e.micro).length
const EXTRA_COUNT = ICON_ENTRIES.filter((e) => e.hi).length

export function tierSentence(px: number): string {
  switch (iconTierWord(px)) {
    case "micro":
      return `Micro redraws: ${MICRO_COUNT} icons have one, the rest use the 16 px redraw.`
    case "small":
      return "The 16 px redraw: a heavier pen and fewer details."
    case "master":
      return "The 24 px master."
    default:
      return `The master, plus extra detail on the ${EXTRA_COUNT} icons that have it.`
  }
}

export function aliasHint(e: IconEntry, needle: string): string | undefined {
  if (!needle || e.id.includes(needle)) return undefined
  const alias = e.aliases.find((a) => a.includes(needle))
  return alias ? `also ${alias}` : undefined
}

export interface IconFilter {
  query: string
  family: string
  washOnly: boolean
}

export function filterIcons(entries: readonly IconEntry[], { query, family, washOnly }: IconFilter): IconEntry[] {
  let pool = family === "all" ? entries : entries.filter((e) => e.family === family)
  if (washOnly) pool = pool.filter((e) => e.accent)
  return search(pool, query.trim(), resolveIconName)
}

function IconDock({ id, size, tone, snippet, copied, onCopy }: { id: string | null; size: number; tone: Tone; snippet: string; copied: boolean; onCopy: () => void }) {
  const entry = id ? ICON_BY_ID.get(id) : undefined
  return (
    <Paper stock="slip" tilt={false} className="z-(--ll-z-sticky) mt-6 p-3 md:sticky md:bottom-3" data-dock="">
      {entry ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="grid size-28 shrink-0 place-items-center bg-graph text-ink shadow-hair" aria-hidden="true">
            <Icon name={entry.id} size={size} tone={tone} />
          </div>
          <div className="min-w-48 flex-1">
            <p className="m-0 font-script text-3xl leading-none text-ink">{entry.id}</p>
            <p className="text-[15px] text-muted-foreground mt-1 mb-2">
              {size} px: {iconTierLabel(entry.id, size)}
              {entry.aliases.length ? <> · also written {entry.aliases.map((a, i) => <span key={a}>{i ? ", " : ""}<InlineCode>{a}</InlineCode></span>)}</> : null}
            </p>
            <p className="m-0 flex flex-wrap items-center gap-1.5">
              {entry.micro ? <Chip tone="outline">micro redraw</Chip> : null}
              {entry.hi ? <Chip tone="outline">extra detail at 41 px</Chip> : null}
              {entry.accent ? <Chip tone="outline">wash: {entry.accent}</Chip> : null}
              {entry.rtl ? <Chip tone="outline">flips in RTL</Chip> : null}
            </p>
          </div>
          <div className="flex min-w-56 flex-col items-start gap-2">
            <code className="font-mono text-sm break-all text-ink">{snippet}</code>
            <code className="font-mono text-xs break-all text-pencil-text">{importLine("Icon")}</code>
            <Button size="sm" onClick={onCopy}>
              <Icon name={copied ? "check" : "copy"} />
              {copied ? "Copied" : "Copy JSX"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Mascot pose="point" size={48} />
          <p className="m-0 text-ink">
            Press an icon to copy its JSX. <span className="text-pencil-text">Arrow keys move between icons; Tab moves on.</span>
          </p>
        </div>
      )}
    </Paper>
  )
}

export function IconBrowser() {
  const hintId = useId()
  const [query, setQuery] = useState("")
  const [family, setFamily] = useState("all")
  const [tone, setTone] = useState<Tone>("ui")
  const [size, setSize] = useState(32)
  const [washOnly, setWashOnly] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const { copied, message, copy } = useCopyStatus()

  const deferredQuery = useDeferredValue(query)
  const deferredSize = useDeferredValue(size)
  const wash = tone === "doodle" && washOnly
  const filter = useMemo(() => ({ query: deferredQuery, family, washOnly: wash }), [deferredQuery, family, wash])
  const results = useMemo(() => filterIcons(ICON_ENTRIES, filter), [filter])
  const grouped = !filter.query.trim() && family === "all"
  const groups = useMemo(() => (grouped ? ICON_FAMILIES.map((f) => ({ family: f, items: results.filter((e) => e.family === f.key) })).filter((g) => g.items.length) : []), [grouped, results])

  const box = Math.max(deferredSize, 24)
  const tileHeight = box + 64
  const minTile = Math.max(112, box + 32)
  const snippetFor = (id: string) => iconSnippet(id, { size, tone })
  const press = (id: string) => {
    setSelected(id)
    void copy(id, snippetFor(id))
  }
  const needle = filter.query.trim().toLowerCase()
  const renderTile = (e: IconEntry) => (
    <Tile key={e.id} id={e.id} name={e.id} hint={aliasHint(e, needle)} selected={selected === e.id} copied={copied === e.id} onPress={() => press(e.id)} style={{ minHeight: tileHeight }}>
      <span className="flex items-center justify-center" style={{ width: box, height: box }} aria-hidden="true">
        <Icon name={e.id} size={deferredSize} tone={tone} />
      </span>
    </Tile>
  )

  const familyOptions = [{ value: "all", label: `All ${ICON_ENTRIES.length}` }, ...ICON_FAMILIES.map((f) => ({ value: f.key, label: `${f.label} ${f.ids.length}` }))]
  const undrawnHit = results.length === 0 && filter.query.trim() ? undrawnIcons().find((u) => resolveIconName(u.name) === resolveIconName(filter.query.trim())) : undefined

  return (
    <div data-slot="icon-browser">
      <Toolbar>
        <ToolbarRow>
          <SearchField label="Search icons" value={query} onChange={setQuery} placeholder="Search by name, alias or idea: arrow, Trash2, warning" className="min-w-64 flex-1" />
          <ResultCount shown={results.length} total={ICON_ENTRIES.length} noun="icons" />
        </ToolbarRow>
        <div className="flex flex-col gap-1.5">
          <ControlLabel>Family</ControlLabel>
          <Choice label="Family" value={family} onChange={setFamily} options={familyOptions} />
        </div>
        <ToolbarRow>
          <div className="flex flex-col gap-1.5">
            <ControlLabel>Tone</ControlLabel>
            <Choice
              label="Tone"
              value={tone}
              onChange={setTone}
              options={[
                { value: "ui", label: "ui: ink only" },
                { value: "doodle", label: "doodle: with color" },
              ]}
            />
          </div>
          <SizeSlider
            label="Size"
            value={size}
            onChange={setSize}
            min={12}
            max={96}
            readout={tierSentence(size)}
          />
        </ToolbarRow>
        <div className="flex flex-col gap-1.5">
          <ControlLabel>Jump to a size</ControlLabel>
          <Choice
            label="Jump to a size"
            value={String(PRESET_SIZES.find((s) => s === size) ?? "")}
            onChange={(v) => setSize(Number(v))}
            options={PRESET_SIZES.map((s) => ({ value: String(s), label: String(s), name: `${s} pixels` }))}
          />
        </div>
        {tone === "doodle" ? (
          <div className="flex items-center gap-3">
            <Switch id={`${hintId}-wash`} checked={washOnly} onCheckedChange={setWashOnly} />
            <Label htmlFor={`${hintId}-wash`}>Only icons that carry a color wash ({ICON_ENTRIES.filter((e) => e.accent).length})</Label>
          </div>
        ) : null}
      </Toolbar>

      <p id={hintId} className="sr-only">
        Each icon is a button: press it to copy its JSX. Arrow keys move between icons.
      </p>
      <CopyStatus message={message} />

      {results.length === 0 ? (
        <EmptyState title={undrawnHit ? `${undrawnHit.name} is not drawn yet` : "Nothing matches"}>
          {undrawnHit ? (
            <p>
              It is a lucide name, so it resolves, but until someone draws it <InlineCode>&lt;Icon name=&quot;{undrawnHit.name}&quot; /&gt;</InlineCode> shows a question-mark box.{" "}
              <UndrawnLink>See what is missing.</UndrawnLink>
            </p>
          ) : (
            <p>
              Try a shorter word, an idea (<InlineCode>warning</InlineCode>, <InlineCode>delete</InlineCode>) or a lucide name. <UndrawnLink>Not-drawn-yet list.</UndrawnLink>
            </p>
          )}
        </EmptyState>
      ) : (
        <RovingGroup label="Icons" describedBy={hintId} ids={results.map((e) => e.id)}>
          {grouped ? (
            groups.map((g, gi) => (
              <Section key={g.family.key} id={`family-${g.family.key}`} title={g.family.label} level={3} actions={<Chip tone="count">{g.items.length}</Chip>}>
                <TileGrid items={g.items} getId={(e) => e.id} renderTile={renderTile} minTile={minTile} tileHeight={tileHeight} eager={gi === 0} />
              </Section>
            ))
          ) : (
            <TileGrid items={results} getId={(e) => e.id} renderTile={renderTile} minTile={minTile} tileHeight={tileHeight} chunk={32} eager />
          )}
        </RovingGroup>
      )}

      <IconDock id={selected} size={size} tone={tone} snippet={selected ? snippetFor(selected) : ""} copied={!!selected && copied === selected} onCopy={() => selected && press(selected)} />
    </div>
  )
}

function UndrawnLink({ children }: { children: string }) {
  return <a href={useAnchorHref("undrawn")}>{children}</a>
}
