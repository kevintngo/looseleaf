import { useDeferredValue, useId, useMemo, useState, type ReactNode } from "react"
import { Chip, EmptyState, Section } from "@/docs/kit"
import type { Family } from "./catalog"
import { Choice, ControlLabel, SearchField, Toolbar, ToolbarRow } from "./controls"
import { CopyStatus, ResultCount, RovingGroup, Tile, TileGrid, useCopyStatus } from "./gallery"
import { search, type Searchable } from "./search"

export interface ShelfEntry extends Searchable {
  family: string
}

export interface ArtShelfProps<E extends ShelfEntry> {
  slug: string
  noun: string
  entries: readonly E[]
  families: readonly Family[]
  searchPlaceholder: string
  controls?: ReactNode
  tile: { min: number; height: number; art: number | readonly [width: number, height: number] }
  renderArt: (entry: E) => ReactNode
  snippet: (entry: E) => string
  template: string
  onPress?: (entry: E) => void
  selectedId?: string | null
  grouped?: boolean
  chunk?: number
  noFamilyFilter?: boolean
  eager?: boolean
}

export function ArtShelf<E extends ShelfEntry>({
  slug,
  noun,
  entries,
  families,
  searchPlaceholder,
  controls,
  tile,
  renderArt,
  snippet,
  template,
  onPress,
  selectedId,
  grouped: groupedProp = true,
  chunk = 24,
  noFamilyFilter,
  eager = false,
}: ArtShelfProps<E>) {
  const hintId = useId()
  const [query, setQuery] = useState("")
  const [family, setFamily] = useState("all")
  const [selected, setSelected] = useState<string | null>(null)
  const { copied, message, copy } = useCopyStatus()
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(() => search(family === "all" ? entries : entries.filter((e) => e.family === family), deferredQuery.trim()), [entries, family, deferredQuery])
  const grouped = groupedProp && !deferredQuery.trim() && family === "all"
  const engaged = !!deferredQuery.trim() || family !== "all"
  const groups = useMemo(() => (grouped ? families.map((f) => ({ family: f, items: results.filter((e) => e.family === f.key) })).filter((g) => g.items.length) : []), [grouped, families, results])

  const press = (e: E) => {
    setSelected(e.id)
    onPress?.(e)
    void copy(e.id, snippet(e))
  }
  const active = selectedId ?? selected
  const [artW, artH] = typeof tile.art === "number" ? [tile.art, tile.art] : tile.art
  const renderTile = (e: E) => (
    <Tile key={e.id} id={e.id} name={e.id} selected={active === e.id} copied={copied === e.id} onPress={() => press(e)} style={{ minHeight: tile.height }}>
      <span className="flex items-center justify-center" style={{ width: artW, height: artH }} aria-hidden="true">
        {renderArt(e)}
      </span>
    </Tile>
  )
  const options = [{ value: "all", label: `All ${entries.length}` }, ...families.map((f) => ({ value: f.key, label: `${f.label} ${f.ids.length}` }))]

  return (
    <div data-slot={`${slug}-shelf`}>
      <Toolbar>
        <ToolbarRow>
          <SearchField label={`Search ${noun}`} value={query} onChange={setQuery} placeholder={searchPlaceholder} className="min-w-64 flex-1" />
          <ResultCount shown={results.length} total={entries.length} noun={noun} />
        </ToolbarRow>
        {noFamilyFilter ? null : (
          <div className="flex flex-col gap-1.5">
            <ControlLabel>Family</ControlLabel>
            <Choice label={`${slug} family`} value={family} onChange={setFamily} options={options} />
          </div>
        )}
        {controls}
        <p id={hintId} className="text-[15px] text-muted-foreground m-0">
          Press a tile to copy <code className="font-mono text-sm text-ink">{template}</code>. Arrow keys move between tiles.
        </p>
      </Toolbar>
      <CopyStatus message={message} />
      {results.length === 0 ? (
        <EmptyState title="Nothing matches">
          <p>Try a shorter word or an idea: the tags are searched too.</p>
        </EmptyState>
      ) : (
        <RovingGroup label={noun[0]!.toUpperCase() + noun.slice(1)} describedBy={hintId} ids={results.map((e) => e.id)}>
          {grouped ? (
            groups.map((g, gi) => (
              <Section key={g.family.key} id={`${slug}-${g.family.key}`} title={g.family.label} level={3} actions={<Chip tone="count">{g.items.length}</Chip>}>
                <TileGrid items={g.items} getId={(e) => e.id} renderTile={renderTile} minTile={tile.min} tileHeight={tile.height} chunk={chunk} eager={eager && gi === 0} />
              </Section>
            ))
          ) : (
            <TileGrid items={results} getId={(e) => e.id} renderTile={renderTile} minTile={tile.min} tileHeight={tile.height} chunk={chunk} eager={eager || engaged} />
          )}
        </RovingGroup>
      )}
    </div>
  )
}
