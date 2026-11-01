import { useCatalog } from "../core/catalog-context"
import { addCommand } from "../core/install"
import { categoryAnchor } from "../core/nav"
import { FOUNDATIONS } from "../core/foundations"
import { paths } from "../core/router-core"
import { useSettings } from "../core/settings"
import { ButtonLink, Chip, CodeBlock, EmptyState, Page, Section, StatusChip, Tile, TileGrid } from "../kit"
import { ContentSlot, useHasContent } from "../widgets/ContentSlot"
import { Link } from "../core/router"

export function HomePage() {
  return <ContentSlot contentKey="home" fallback={<DefaultHome />} />
}

const PRINCIPLES = [
  { title: "Drop-in", text: "Same part names, props and data-slot values as shadcn/ui, on Radix. Swap a file, keep your JSX." },
  {
    title: "Drawn, not styled",
    text: "Lines have pressure, fills miss the outline a little, paper has tooth. Every stroke is seeded, so server and client draw the same thing.",
  },
  { title: "Practical", text: "Keyboard support, AA text, real focus rings, reduced motion, three densities. Charm is a dial you can turn down." },
] as const

function DefaultHome() {
  const catalog = useCatalog()
  const { packageManager } = useSettings()
  const hasArt = useHasContent("home-hero")
  const fresh = catalog.components.filter((c) => c.doc.status === "new")
  const showNew = fresh.length >= 3
  const featured = (showNew ? fresh : catalog.components).slice(0, 6)

  return (
    <Page
      kicker="shadcn/ui, drawn by hand"
      title="Looseleaf"
      description="A shadcn registry of real, accessible React components that look like paper, felt-tip, marker and tape. Same APIs as shadcn/ui, a notebook for a skin."
      meta={
        <>
          <ButtonLink to={paths.gettingStarted} variant="primary" size="lg">
            Get started
          </ButtonLink>
          <ButtonLink to={paths.components()} size="lg">
            Browse components
          </ButtonLink>
        </>
      }
    >
      {hasArt ? (
        <div className="dk-hero-art">
          <ContentSlot contentKey="home-hero" />
        </div>
      ) : null}

      <CodeBlock code={addCommand(packageManager, "looseleaf")} lang="bash" title="Everything, in one line" />

      <dl className="dk-stats grid grid-cols-3 gap-4 text-center">
        {[
          ["Components", catalog.components.length],
          ["Blocks", catalog.blocks.length],
          ["Foundations", FOUNDATIONS.length],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse items-center gap-1">
            <dt className="font-type text-xs text-ink-muted">{label}</dt>
            <dd className="ll-num font-script text-5xl leading-none font-bold text-ink-you">{value}</dd>
          </div>
        ))}
      </dl>

      <Section id="principles" title="What you get">
        <ul className="dk-principles grid gap-x-8 gap-y-5 sm:grid-cols-3" role="list">
          {PRINCIPLES.map((p) => (
            <li key={p.title}>
              <h3 className="font-script text-2xl leading-tight font-bold">{p.title}</h3>
              <p className="mt-1 text-[15px] leading-snug text-ink-soft">{p.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="components" title={showNew ? "New and noteworthy" : "Components"}>
        {catalog.components.length === 0 ? (
          <EmptyState title="The library is still being drawn">
            <p>
              Components appear here as their docs are written. Meanwhile, read <Link to={paths.gettingStarted}>how installation works</Link>.
            </p>
          </EmptyState>
        ) : (
          <>
            <TileGrid>
              {featured.map((c) => (
                <Tile key={c.slug} to={paths.components(c.slug)} title={c.doc.title} description={c.doc.description} meta={<StatusChip status={c.doc.status} plain />} />
              ))}
            </TileGrid>
            <ul className="dk-chips mt-2" role="list" aria-label="Categories">
              {catalog.groups.map((g) => (
                <li key={g.category}>
                  <Link to={`${paths.components()}#${categoryAnchor(g.category)}`} className="dk-chip-link">
                    {g.category}{" "}
                    <Chip tone="count" plain>
                      {g.items.length}
                    </Chip>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <Section id="foundations" title="Foundations" description="The ideas underneath: ink, paper, motion, density.">
        <TileGrid>
          {FOUNDATIONS.slice(0, 6).map((t) => (
            <Tile key={t.slug} to={paths.foundations(t.slug)} title={t.title} description={t.summary} />
          ))}
        </TileGrid>
      </Section>
    </Page>
  )
}
