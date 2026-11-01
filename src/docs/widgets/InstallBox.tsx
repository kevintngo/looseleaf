import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ComponentEntry } from "../core/catalog"
import { useCatalog } from "../core/catalog-context"
import { addCommand, inferDependencies, packagesCommand, registryInfo, type InferredDeps } from "../core/install"
import { Link } from "../core/router"
import { paths } from "../core/router-core"
import { useSettings } from "../core/settings"
import { Chip, CodeBlock, InlineCode, Tabs } from "../kit"
import { CommandTabs } from "./CommandTabs"
import { useLoaded } from "./use-loaded"

export interface InstallInfo extends InferredDeps {
  files: string[]
  source: "registry" | "source" | "none"
}

const NONE: InstallInfo = { dependencies: [], registryDependencies: [], files: [], source: "none" }

export function useInstallInfo(entry: ComponentEntry): { info: InstallInfo; source: string | null; loading: boolean } {
  const catalog = useCatalog()
  const registry = useLoaded(catalog.registry)
  const ui = useLoaded(entry.uiSource)
  const registryReady = catalog.registry === null || registry.status !== "loading"
  const uiReady = entry.uiSource === null || ui.status !== "loading"

  return useMemo(() => {
    const source = ui.status === "ready" ? ui.value : null
    const fromRegistry = registry.status === "ready" ? registryInfo(registry.value, entry.slug) : null
    let info: InstallInfo = NONE
    if (fromRegistry) info = { ...fromRegistry, source: "registry" }
    else if (source) info = { ...inferDependencies(source), files: entry.uiPath ? [entry.uiPath] : [], source: "source" }
    return { info, source, loading: !(registryReady && uiReady) }
  }, [entry, registry, ui, registryReady, uiReady])
}

const HINT = "my-2 text-[15px] text-muted-foreground"

export function InstallBox({ entry }: { entry: ComponentEntry }) {
  const { packageManager } = useSettings()
  const { info, source, loading } = useInstallInfo(entry)
  const catalog = useCatalog()
  const slug = entry.slug

  const dependsOn = info.registryDependencies.filter((name) => name !== "looseleaf-theme")

  return (
    <div className="dk-install min-w-0">
      <Tabs
        label="Installation method"
        items={[
          {
            id: "cli",
            label: "CLI",
            content: () => (
              <div className="dk-install-panel flex flex-col gap-2 pt-3">
                <CommandTabs command={(pm) => addCommand(pm, slug)} />
                <p className={HINT}>
                  Needs the <InlineCode>@looseleaf</InlineCode> registry added once; see <Link to={`${paths.gettingStarted}#registry`}>Getting started</Link>. Without it, use{" "}
                  <InlineCode>{addCommand(packageManager, slug, "url")}</InlineCode>.
                </p>
                <InstallSummary info={info} dependsOn={dependsOn} loading={loading} />
              </div>
            ),
          },
          {
            id: "manual",
            label: "Manual",
            content: () => (
              <ol className="dk-steps flex list-decimal flex-col gap-5 ps-7 pt-3 marker:font-script marker:text-2xl marker:font-bold marker:text-marker">
                <li className="ps-1">
                  <p>Install the packages this component imports.</p>
                  {info.dependencies.length > 0 ? (
                    <CodeBlock code={packagesCommand(packageManager, info.dependencies)} lang="bash" title="Terminal" />
                  ) : (
                    <p className={HINT}>{loading ? "Reading imports…" : "Nothing beyond React and the utilities below."}</p>
                  )}
                </li>
                <li className="ps-1">
                  <p>
                    Copy <InlineCode>cn()</InlineCode> into <InlineCode>lib/utils.ts</InlineCode> if you skipped <InlineCode>shadcn init</InlineCode>, and add the theme, fonts and ink
                    engine from <Link to={`${paths.gettingStarted}#manual`}>Getting started</Link>.
                  </p>
                </li>
                {dependsOn.length > 0 ? (
                  <li className="ps-1">
                    <p>Add the Looseleaf items it builds on:</p>
                    <ul className="dk-inline-list mt-2 flex flex-wrap gap-x-4 gap-y-1" role="list">
                      {dependsOn.map((name) => (
                        <li key={name}>{catalog.bySlug.has(name) ? <Link to={paths.components(name)}>{name}</Link> : <InlineCode>{name}</InlineCode>}</li>
                      ))}
                    </ul>
                  </li>
                ) : null}
                <li className="ps-1">
                  <p>
                    Copy the source into <InlineCode>components/ui/{slug}.tsx</InlineCode> and update the import paths to match your aliases.
                  </p>
                  {source ? (
                    <Collapsible className="mt-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="link" size="sm" className="px-0">
                          <CollapsibleIndicator size={14} />
                          Show {slug}.tsx
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CodeBlock code={source} lang="tsx" title={`components/ui/${slug}.tsx`} maxHeight={520} />
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <p className={HINT}>{loading ? "Loading the source…" : "The source file is not part of this build."}</p>
                  )}
                </li>
              </ol>
            ),
          },
        ]}
      />
    </div>
  )
}

function InstallSummary({ info, dependsOn, loading }: { info: InstallInfo; dependsOn: string[]; loading: boolean }) {
  if (loading) return <p className={HINT}>Reading what this installs…</p>
  if (info.source === "none") return null
  return (
    <dl className="dk-summary mt-1 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2">
      {info.files.length > 0 ? (
        <>
          <dt className="font-type text-xs text-ink-muted">Adds</dt>
          <dd className="flex flex-wrap gap-2">
            {info.files.map((f) => (
              <InlineCode key={f}>{f.replace(/^src\//, "")}</InlineCode>
            ))}
          </dd>
        </>
      ) : null}
      {dependsOn.length > 0 ? (
        <>
          <dt className="font-type text-xs text-ink-muted">Also installs</dt>
          <dd className="flex flex-wrap gap-2">
            {dependsOn.map((n) => (
              <Chip key={n} tone="outline" plain>
                {n}
              </Chip>
            ))}
          </dd>
        </>
      ) : null}
      {info.dependencies.length > 0 ? (
        <>
          <dt className="font-type text-xs text-ink-muted">npm packages</dt>
          <dd className="flex flex-wrap gap-2">
            {info.dependencies.map((n) => (
              <Chip key={n} tone="outline" plain>
                {n}
              </Chip>
            ))}
          </dd>
        </>
      ) : null}
    </dl>
  )
}
