import { FOUNDATIONS, FOUNDATION_BY_SLUG, type FoundationTopic } from "../core/foundations"
import { Link } from "../core/router"
import { paths } from "../core/router-core"
import { Callout, Page, Pager, Prose, Section, Tile, TileGrid } from "../kit"
import { ContentSlot } from "../widgets/ContentSlot"
import { NotFoundPage } from "./NotFoundPage"

export function FoundationsIndexPage() {
  return (
    <Page kicker="Foundations" title="Foundations" description="The ideas the components are built on. Each page is a short brief; the longer versions are drawn as they are written.">
      <TileGrid>
        {FOUNDATIONS.map((t) => (
          <Tile key={t.slug} to={paths.foundations(t.slug)} title={t.title} description={t.summary} />
        ))}
      </TileGrid>
    </Page>
  )
}

export function FoundationPage({ topic }: { topic: string }) {
  const entry = FOUNDATION_BY_SLUG.get(topic)
  if (!entry) return <NotFoundPage what="foundation" missing={topic} />
  const index = FOUNDATIONS.indexOf(entry)
  const prev = FOUNDATIONS[index - 1]
  const next = FOUNDATIONS[index + 1]

  return (
    <Page
      kicker={<Link to={paths.foundations()}>Foundations</Link>}
      title={entry.title}
      description={entry.summary}
      toc="auto"
      footer={
        <Pager
          label="Previous and next foundation"
          prev={prev && { to: paths.foundations(prev.slug), title: prev.title }}
          next={next && { to: paths.foundations(next.slug), title: next.title }}
        />
      }
    >
      <ContentSlot contentKey={`foundations/${entry.slug}`} fallback={<Placeholder topic={entry} />} />
    </Page>
  )
}

function Placeholder({ topic }: { topic: FoundationTopic }) {
  return (
    <>
      <Callout tone="todo" title="This page is still being drawn">
        <p>Here is the short version. The illustrated page replaces it when it is ready.</p>
      </Callout>

      <Section id="in-brief" title="In brief">
        <Prose>
          <ul>
            {topic.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </Prose>
      </Section>

      {topic.swatches ? (
        <Section id="swatches" title="Palette" description="Drawn live from the tokens in the loaded stylesheet.">
          <ul className="dk-swatches grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-4" role="list">
            {topic.swatches.map((s) => (
              <li key={s.token} className="dk-swatch flex flex-col gap-1">
                <span
                  className="dk-swatch-chip block h-14 shadow-[inset_0_0_0_1.5px_var(--ll-pencil-mark)] [border-radius:3px_8px_4px_9px/8px_3px_9px_4px]"
                  style={{ background: `var(${s.token})` }}
                  aria-hidden="true"
                />
                <span className="dk-swatch-label font-bold">{s.label}</span>
                <code className="dk-swatch-token font-mono text-[0.8125rem] text-ink-muted">{s.token}</code>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {topic.fonts ? (
        <Section id="faces" title="Faces">
          <ul className="dk-specimens flex flex-col gap-5" role="list">
            {topic.fonts.map((f) => (
              <li key={f.token} className="dk-specimen flex flex-col gap-1 border-b border-dashed border-pencil-mark/60 pb-4">
                <span className="dk-specimen-text text-3xl leading-tight" style={{ fontFamily: `var(${f.token})` }}>
                  Sphinx of black quartz, judge my vow
                </span>
                <span className="dk-specimen-meta text-[15px] text-ink-soft">
                  {f.label} <span className="dk-hint">{f.role}</span> <code className="font-mono text-[0.8125rem]">{f.token}</code>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {topic.see ? (
        <Section id="see-also" title="See also">
          <ul className="dk-inline-list flex flex-wrap gap-x-5 gap-y-2 font-bold" role="list">
            {topic.see.map((s) => (
              <li key={s.to}>
                <Link to={s.to}>{s.label}</Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  )
}
