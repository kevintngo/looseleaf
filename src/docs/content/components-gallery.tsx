import { useMemo, useState, type ReactNode } from "react"
import type { ComponentEntry } from "../core/catalog"
import { useCatalog } from "../core/catalog-context"
import { categoryAnchor } from "../core/nav"
import { Link, navigate, useAnchorHref } from "../core/router"
import { paths } from "../core/router-core"
import { buildSearchIndex, search } from "../core/search"
import { Button, Chip, EmptyState, InlineCode, SearchInput, Section, StatusChip } from "../kit"
import { THUMBS } from "./home/thumbs.generated"

const BASE = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`

const TAPE =
  "after:pointer-events-none after:absolute after:-top-2.5 after:left-1/2 after:h-5 after:w-14 after:-translate-x-1/2 after:-rotate-3 after:border-y after:border-tape-edge after:bg-[color-mix(in_srgb,var(--ll-kraft)_70%,transparent)] after:content-['']"

function Picture({ entry }: { entry: ComponentEntry }) {
  const thumb = THUMBS[entry.slug]
  const [failed, setFailed] = useState(false)
  return (
    <span className={`relative block bg-photo p-1.5 shadow-[0_1px_0_rgb(var(--ll-shade)/0.25),1px_2px_0_rgb(var(--ll-shade)/0.12)] ${TAPE}`}>
      <span className="block aspect-[16/10] overflow-hidden bg-graph">
        {thumb && !failed ? (
          <img
            src={`${BASE}thumbs/${thumb.file}`}
            width={thumb.w}
            height={thumb.h}
            loading="lazy"
            decoding="async"
            alt=""
            onError={() => setFailed(true)}
            className="size-full object-cover object-top transition-transform duration-(--ll-dur-sheet) ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span aria-hidden="true" className="grid size-full place-items-center font-script text-5xl font-bold text-ink-muted">
            {entry.doc.title.slice(0, 1)}
          </span>
        )}
      </span>
    </span>
  )
}

function GalleryTile({ entry }: { entry: ComponentEntry }) {
  return (
    <li className="min-w-0 [--tilt:-0.5deg] nth-[3n+2]:[--tilt:0.45deg] nth-[3n]:[--tilt:-0.15deg]">
      <Link to={paths.components(entry.slug)} className="group relative isolate flex h-full flex-col gap-3 p-3 pb-4 text-ink no-underline">
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rotate-(--tilt) border-[1.5px] border-pencil-mark bg-slip shadow-[2px_3px_0_rgb(var(--ll-shade)/0.16)] transition-[rotate,translate,box-shadow,background-color] duration-(--ll-dur-hover) ease-out [border-radius:3px_7px_4px_8px/8px_3px_7px_3px] group-hover:-translate-y-0.5 group-hover:rotate-0 group-hover:bg-[color-mix(in_oklab,var(--ll-hi)_16%,var(--ll-slip))] group-hover:shadow-[3px_6px_0_rgb(var(--ll-shade)/0.2)] group-focus-visible:rotate-0"
        />
        <Picture entry={entry} />
        <span className="font-script text-2xl leading-[1.1] font-bold">{entry.doc.title}</span>
        <span className="line-clamp-2 text-[15px] leading-snug text-ink-soft">{entry.doc.description}</span>
        <span className="mt-auto flex flex-wrap gap-1.5 pt-1 empty:hidden">
          <StatusChip status={entry.doc.status} plain />
          {entry.doc.upstream ? (
            <Chip tone="outline" plain>
              shadcn: {entry.doc.upstream}
            </Chip>
          ) : null}
        </span>
      </Link>
    </li>
  )
}

function Grid({ entries }: { entries: readonly ComponentEntry[] }) {
  return (
    <ul role="list" className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(15.5rem,100%),1fr))] gap-x-7 gap-y-9 p-0 pt-3">
      {entries.map((entry) => (
        <GalleryTile key={entry.slug} entry={entry} />
      ))}
    </ul>
  )
}

function Jump({ id, children }: { id: string; children: ReactNode }) {
  return (
    <a className="dk-chip-link" href={useAnchorHref(id)}>
      {children}
    </a>
  )
}

export default function ComponentsGallery() {
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

  if (catalog.components.length === 0) {
    return (
      <EmptyState title="No components yet">
        <p>
          A component shows up when it has a <InlineCode>src/docs/meta/&lt;slug&gt;.ts</InlineCode> file. Its picture comes from <InlineCode>node tools/make-thumbs.mjs</InlineCode>.
        </p>
      </EmptyState>
    )
  }

  const surprise = () => {
    const pick = catalog.components[Math.floor(Math.random() * catalog.components.length)]
    if (pick) navigate(paths.components(pick.slug))
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput label="Filter components" placeholder="Filter components..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-sm min-w-56 flex-1" />
        <Button onClick={surprise}>Surprise me</Button>
      </div>

      {trimmed ? (
        <div className="mt-6">
          <p role="status" className="dk-hint">
            {matches.length === 0 ? `No component matches "${trimmed}".` : `${matches.length} ${matches.length === 1 ? "match" : "matches"}`}
          </p>
          {matches.length > 0 ? <Grid entries={matches} /> : null}
        </div>
      ) : (
        <>
          <nav aria-label="Categories">
            <ul className="dk-chips" role="list">
              {catalog.groups.map((g) => (
                <li key={g.category}>
                  <Jump id={categoryAnchor(g.category)}>
                    {g.category} <Chip tone="count">{g.items.length}</Chip>
                  </Jump>
                </li>
              ))}
            </ul>
          </nav>
          {catalog.groups.map((group) => (
            <Section key={group.category} id={categoryAnchor(group.category)} title={group.category} actions={<Chip tone="count">{group.items.length}</Chip>}>
              <Grid entries={group.items} />
            </Section>
          ))}
        </>
      )}
    </>
  )
}
