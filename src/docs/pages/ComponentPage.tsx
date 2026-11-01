import type { ComponentEntry } from "../core/catalog"
import { useCatalog } from "../core/catalog-context"
import { categoryAnchor } from "../core/nav"
import { Link } from "../core/router"
import { paths } from "../core/router-core"
import { List } from "@/components/ui/typography"
import { AnchorHeading, ApiTable, Callout, Chip, CodeBlock, EmptyState, InlineCode, Page, Pager, Section, StatusChip, type TocItem } from "../kit"
import { ComponentActions } from "../widgets/ComponentActions"
import { ExampleViewer } from "../widgets/ExampleViewer"
import { InstallBox } from "../widgets/InstallBox"
import { NotFoundPage } from "./NotFoundPage"

export function ComponentPage({ slug }: { slug: string }) {
  const catalog = useCatalog()
  const entry = catalog.bySlug.get(slug)
  if (!entry) return <NotFoundPage what="component" missing={slug} />
  return <ComponentDocPage key={entry.slug} entry={entry} />
}

function ComponentDocPage({ entry }: { entry: ComponentEntry }) {
  const catalog = useCatalog()
  const { doc, examples } = entry
  const { prev, next } = catalog.neighbours(entry.slug)
  const [hero, ...more] = examples
  const related = (doc.related ?? []).filter((slug) => slug !== entry.slug)
  const a11y = doc.a11y ?? []

  const toc: TocItem[] = [
    ...(hero ? [{ id: "preview", label: "Preview" }] : []),
    { id: "installation", label: "Installation" },
    { id: "usage", label: "Usage" },
    ...(more.length > 0 || !hero ? [{ id: "examples", label: "Examples" }] : []),
    { id: "api", label: "API reference" },
    ...(a11y.length > 0 ? [{ id: "accessibility", label: "Accessibility" }] : []),
    ...(related.length > 0 ? [{ id: "related", label: "Related" }] : []),
  ]

  return (
    <Page
      kicker={<Link to={`${paths.components()}#${categoryAnchor(doc.category)}`}>{doc.category}</Link>}
      title={doc.title}
      description={doc.description}
      toc={toc}
      meta={
        <>
          <StatusChip status={doc.status} />
          {doc.upstream ? <Chip tone="outline">extends shadcn/ui {doc.upstream}</Chip> : null}
          <Chip tone="outline">
            {examples.length} {examples.length === 1 ? "example" : "examples"}
          </Chip>
          <span className="flex flex-wrap items-center gap-2 max-sm:w-full sm:ms-auto">
            <ComponentActions entry={entry} />
          </span>
        </>
      }
      footer={
        <Pager
          label="Previous and next component"
          prev={prev && { to: paths.components(prev.slug), title: prev.doc.title }}
          next={next && { to: paths.components(next.slug), title: next.doc.title }}
        />
      }
    >
      {hero ? (
        <Section id="preview" title="Preview">
          <ExampleViewer entry={hero} slug={entry.slug} headingLevel={3} />
        </Section>
      ) : null}

      <Section id="installation" title="Installation">
        <InstallBox key={entry.slug} entry={entry} />
      </Section>

      <Section id="usage" title="Usage">
        {doc.usage ? <CodeBlock code={doc.usage} lang="tsx" title={`${entry.slug}.tsx`} /> : <p className="dk-hint">No usage snippet yet.</p>}
      </Section>

      {more.length > 0 || !hero ? (
        <Section id="examples" title="Examples">
          {hero ? (
            <div className="flex flex-col gap-12">
              {more.map((example) => (
                <ExampleViewer key={example.path} entry={example} slug={entry.slug} headingLevel={3} lazy />
              ))}
            </div>
          ) : (
            <EmptyState title="No examples yet">
              <p>
                Add files to <InlineCode>src/docs/examples/{entry.slug}/</InlineCode>; they appear here on their own.
              </p>
            </EmptyState>
          )}
        </Section>
      ) : null}

      <Section id="api" title="API reference" description="Props listed here are in addition to those of the element each part renders.">
        {doc.parts.length === 0 ? (
          <p className="dk-hint">This component has no parts documented yet.</p>
        ) : (
          <div className="flex flex-col gap-10">
            {doc.parts.map((part) => (
              <div key={part.name} className="dk-part flex flex-col gap-3">
                <AnchorHeading id={`api-${part.name.toLowerCase()}`} level={3}>
                  {part.name}
                </AnchorHeading>
                {part.description ? <p className="dk-part-desc max-w-prose text-ink-soft">{part.description}</p> : null}
                {part.props && part.props.length > 0 ? (
                  <ApiTable props={part.props} caption={`${part.name} props`} />
                ) : (
                  <p className="dk-hint">No props of its own.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {a11y.length > 0 ? (
        <Section id="accessibility" title="Accessibility">
          <List className="my-0">
            {a11y.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </List>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section id="related" title="Related">
          <ul className="dk-inline-list flex flex-wrap gap-x-5 gap-y-2 font-bold" role="list">
            {related.map((slug) => {
              const target = catalog.bySlug.get(slug)
              return (
                <li key={slug}>
                  {target ? (
                    <Link to={paths.components(slug)}>{target.doc.title}</Link>
                  ) : (
                    <>
                      <span>{slug}</span> <span className="dk-hint">(not documented yet)</span>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </Section>
      ) : null}

      {catalog.warnings.length > 0 && import.meta.env.DEV ? (
        <Callout tone="warn" title="Docs tree problems (development only)">
          <List className="my-0">
            {catalog.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </List>
        </Callout>
      ) : null}
    </Page>
  )
}
