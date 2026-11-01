import { useCatalog } from "../core/catalog-context"
import type { BlockEntry } from "../core/catalog"
import { addCommand } from "../core/install"
import { paths } from "../core/router-core"
import { Link } from "../core/router"
import { useSettings } from "../core/settings"
import { Callout, Chip, CodeBlock, EmptyState, InlineCode, Page, Pager, Section, Skeleton, Stage, Tabs, Tile, TileGrid } from "../kit"
import { CommandTabs } from "../widgets/CommandTabs"
import { ContentSlot } from "../widgets/ContentSlot"
import { PreviewFrame } from "../widgets/PreviewFrame"
import { useLoaded } from "../widgets/use-loaded"
import { NotFoundPage } from "./NotFoundPage"

export function BlocksIndexPage() {
  const catalog = useCatalog()
  return (
    <Page
      kicker="Library"
      title="Blocks"
      description="Whole pages composed from the components: sign in, dashboards and more. Install one and edit it; it is your code."
    >
      {catalog.blocks.length === 0 ? (
        <EmptyState title="No blocks yet">
          <p>
            A block appears here when it has files in <InlineCode>src/blocks/&lt;name&gt;/</InlineCode>. Add{" "}
            <InlineCode>src/docs/content/blocks/&lt;name&gt;.tsx</InlineCode> to show a live preview.
          </p>
        </EmptyState>
      ) : (
        <TileGrid>
          {catalog.blocks.map((b) => (
            <Tile
              key={b.slug}
              to={paths.blocks(b.slug)}
              title={b.title}
              description={b.description || undefined}
              meta={b.tags.map((t) => (
                <Chip key={t} tone="outline" plain>
                  {t}
                </Chip>
              ))}
            />
          ))}
        </TileGrid>
      )}
    </Page>
  )
}

export function BlockPage({ slug }: { slug: string }) {
  const catalog = useCatalog()
  const block = catalog.blockBySlug.get(slug)
  if (!block) return <NotFoundPage what="block" missing={slug} />
  return <BlockDocPage key={block.slug} block={block} />
}

function BlockDocPage({ block }: { block: BlockEntry }) {
  const catalog = useCatalog()
  const index = catalog.blocks.indexOf(block)
  const prev = catalog.blocks[index - 1]
  const next = catalog.blocks[index + 1]
  return (
    <Page
      kicker={<Link to={paths.blocks()}>Blocks</Link>}
      title={block.title}
      description={block.description || undefined}
      meta={block.tags.map((t) => (
        <Chip key={t} tone="outline">
          {t}
        </Chip>
      ))}
      toc={[
        { id: "preview", label: "Preview" },
        { id: "installation", label: "Installation" },
        { id: "files", label: "Files" },
      ]}
      footer={
        <Pager
          label="Previous and next block"
          prev={prev && { to: paths.blocks(prev.slug), title: prev.title }}
          next={next && { to: paths.blocks(next.slug), title: next.title }}
        />
      }
    >
      <Section id="preview" title="Preview">
        {block.contentKey ? (
          <PreviewFrame>
            <Stage layout="full" height={520} label={`${block.title} preview`} surface={block.surface}>
              <ContentSlot contentKey={block.contentKey} />
            </Stage>
          </PreviewFrame>
        ) : (
          <Callout tone="todo" title="No live preview yet">
            <p>
              Add <InlineCode>src/docs/content/blocks/{block.slug}.tsx</InlineCode> that default-exports the block to see it here.
            </p>
          </Callout>
        )}
      </Section>

      <Section id="installation" title="Installation">
        <BlockInstall block={block} />
      </Section>

      <Section id="files" title="Files">
        <BlockFiles block={block} />
      </Section>
    </Page>
  )
}

function BlockInstall({ block }: { block: BlockEntry }) {
  const { packageManager } = useSettings()
  return (
    <>
      <CommandTabs command={(pm) => addCommand(pm, block.slug)} />
      <p className="dk-hint">
        Installs under <InlineCode>components/blocks/{block.slug}/</InlineCode> together with the components it uses. Not registered yet? See{" "}
        <Link to={`${paths.gettingStarted}#registry`}>Getting started</Link>, or use <InlineCode>{addCommand(packageManager, block.slug, "url")}</InlineCode>.
      </p>
    </>
  )
}

function BlockFiles({ block }: { block: BlockEntry }) {
  if (block.files.length === 0) return <p className="dk-hint">No source files found in this build.</p>
  return (
    <Tabs
      label={`${block.title} files`}
      items={block.files.map((file) => ({
        id: file.path,
        label: file.path,
        content: () => <BlockFileSource block={block.slug} file={file} />,
      }))}
    />
  )
}

function BlockFileSource({ block, file }: { block: string; file: BlockEntry["files"][number] }) {
  const state = useLoaded(file.source)
  if (state.status === "loading") return <Skeleton height={120} label="Loading source" />
  if (state.status === "error") return <Callout tone="error">{state.error.message}</Callout>
  const lang = file.path.split(".").pop()
  return <CodeBlock code={state.value} lang={lang} title={`blocks/${block}/${file.path}`} lineNumbers maxHeight={560} />
}
