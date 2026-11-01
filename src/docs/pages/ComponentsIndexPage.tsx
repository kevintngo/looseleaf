import { useMemo, useState } from "react"
import { useCatalog } from "../core/catalog-context"
import { categoryAnchor } from "../core/nav"
import { paths } from "../core/router-core"
import { buildSearchIndex, search } from "../core/search"
import type { ComponentEntry } from "../core/catalog"
import { Chip, EmptyState, InlineCode, Page, SearchInput, Section, StatusChip, Tile, TileGrid } from "../kit"
import { ContentSlot } from "../widgets/ContentSlot"

function ComponentTile({ entry }: { entry: ComponentEntry }) {
  return (
    <Tile
      to={paths.components(entry.slug)}
      title={entry.doc.title}
      description={entry.doc.description}
      meta={
        <>
          <StatusChip status={entry.doc.status} plain />
          {entry.doc.upstream ? (
            <Chip tone="outline" plain>
              shadcn: {entry.doc.upstream}
            </Chip>
          ) : null}
        </>
      }
    />
  )
}

export function ComponentsIndexPage() {
  const catalog = useCatalog()
  const [query, setQuery] = useState("")
  const index = useMemo(() => buildSearchIndex(catalog).filter((e) => e.kind === "component"), [catalog])
  const trimmed = query.trim()
  const matches = useMemo(() => {
    if (!trimmed) return []
    return search(index, trimmed, 200)
      .map((r) => catalog.bySlug.get(r.entry.id.replace(/^component:/, "")))
      .filter((c): c is ComponentEntry => Boolean(c))
  }, [catalog, index, trimmed])

  const empty = catalog.components.length === 0

  return (
    <Page
      kicker="Library"
      title="Components"
      description={
        empty
          ? "The library is still being drawn. Components appear here as their docs are written."
          : `${catalog.components.length} components in ${catalog.groups.length} categories, each with live examples, code and API tables.`
      }
      toc={empty || trimmed ? undefined : catalog.groups.map((g) => ({ id: categoryAnchor(g.category), label: g.category }))}
    >
      {empty ? (
        <EmptyState title="No components yet">
          <p>
            A component shows up when it has a <InlineCode>src/docs/meta/&lt;slug&gt;.ts</InlineCode> file. Its examples in{" "}
            <InlineCode>src/docs/examples/&lt;slug&gt;/</InlineCode> are picked up automatically.
          </p>
        </EmptyState>
      ) : (
        <ContentSlot
          contentKey="components-gallery"
          fallback={
            <>
              <SearchInput label="Filter components" placeholder="Filter components..." value={query} onChange={(e) => setQuery(e.target.value)} className="dk-filter max-w-md" />
              {trimmed ? (
                <div className="dk-results flex flex-col gap-4">
                  <p role="status" className="dk-hint">
                    {matches.length === 0 ? `No component matches "${trimmed}".` : `${matches.length} ${matches.length === 1 ? "match" : "matches"}`}
                  </p>
                  {matches.length > 0 ? (
                    <TileGrid>
                      {matches.map((entry) => (
                        <ComponentTile key={entry.slug} entry={entry} />
                      ))}
                    </TileGrid>
                  ) : null}
                </div>
              ) : (
                catalog.groups.map((group) => (
                  <Section
                    key={group.category}
                    id={categoryAnchor(group.category)}
                    title={group.category}
                    actions={<Chip tone="count" plain>{group.items.length}</Chip>}
                  >
                    <TileGrid>
                      {group.items.map((entry) => (
                        <ComponentTile key={entry.slug} entry={entry} />
                      ))}
                    </TileGrid>
                  </Section>
                ))
              )}
            </>
          }
        />
      )}
    </Page>
  )
}
