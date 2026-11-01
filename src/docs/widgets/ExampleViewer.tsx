import { Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import type { ExampleEntry, Loader } from "../core/catalog"
import { useLocation } from "../core/router"
import { Callout, CodeBlock, Section, Skeleton, Stage, Tabs } from "../kit"
import { PreviewFrame } from "./PreviewFrame"
import { ErrorBoundary } from "./ErrorBoundary"
import type { ExampleModule } from "../types"
import { exampleLoader, useLoaded, type Loaded } from "./use-loaded"

export interface ExampleViewerProps {
  entry: ExampleEntry
  slug: string
  headingLevel?: 2 | 3
  lazy?: boolean
}

const FETCH_MARGIN = 2400
const MOUNT_MARGIN = 600
const DEFAULT_ROOM = 240
const CHROME = 48

const measured = new Map<string, number>()

function useSeenNear(ref: RefObject<Element | null>, watching: boolean, margin: number): boolean {
  const [seen, setSeen] = useState(typeof IntersectionObserver === "undefined")
  useEffect(() => {
    const el = ref.current
    if (seen || !watching || !el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { rootMargin: `${margin}px 0px` },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [seen, watching, ref, margin])
  return seen
}

function browserAnchorsScroll(): boolean {
  return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("overflow-anchor", "auto")
}

function useHoldScroll(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el || typeof ResizeObserver === "undefined" || browserAnchorsScroll()) return
    let last = el.getBoundingClientRect().height
    const observer = new ResizeObserver(() => {
      const box = el.getBoundingClientRect()
      const grew = box.height - last
      last = box.height
      if (grew !== 0 && box.bottom <= 0) window.scrollBy({ top: grew, left: 0, behavior: "instant" })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, enabled])
}

export function ExampleViewer({ entry, slug, headingLevel = 3, lazy = false }: ExampleViewerProps) {
  const root = useRef<HTMLDivElement>(null)
  const id = `example-${entry.id}`
  const linked = useLocation().anchor === id
  const [pinned, setPinned] = useState(false)
  if (linked && !pinned) setPinned(true)
  const watching = lazy && !pinned
  const nearFetch = useSeenNear(root, watching, FETCH_MARGIN)
  const nearMount = useSeenNear(root, watching, MOUNT_MARGIN)
  const mount = !lazy || pinned || nearMount
  const state = useLoaded(mount || nearFetch ? exampleLoader(entry) : null)
  useHoldScroll(root, lazy)
  const meta = state.status === "ready" ? state.value.meta : undefined
  const title = meta?.title || entry.title

  return (
    <Section id={id} title={title} level={headingLevel} description={meta?.description} className="dk-example">
      <div ref={root}>
        <Tabs
          label={`${title}: preview or code`}
          variant="pill"
          items={[
            {
              id: "preview",
              label: "Preview",
              content: () => <ExamplePreview state={state} mount={mount} title={title} path={entry.path} />,
            },
            {
              id: "code",
              label: "Code",
              content: () => <ExampleSource source={entry.source} title={`examples/${slug}/${entry.fileName}`} />,
            },
          ]}
        />
      </div>
    </Section>
  )
}

function ExamplePreview({ state, mount, title, path }: { state: Loaded<ExampleModule>; mount: boolean; title: string; path: string }) {
  const room = measured.get(path) ?? (state.status === "ready" && state.value.meta.height ? state.value.meta.height + CHROME : DEFAULT_ROOM)
  if (!mount) return <Skeleton quiet height={room} />
  if (state.status === "loading") return <Skeleton height={room} label={`Loading ${title}`} />
  if (state.status === "error") {
    return (
      <Callout tone="error" title="This example could not be loaded">
        <p>{state.error.message}</p>
      </Callout>
    )
  }
  const { default: Example, meta } = state.value
  return (
    <Remembered path={path}>
      <PreviewFrame className="mt-1">
        <Stage layout={meta.layout} height={meta.height} label={`${title} preview`} surface={meta.stage === "desk" ? "desk" : "paper"} contain={meta.contain}>
          <ErrorBoundary resetKey={path} title="This example crashed">
            <Suspense fallback={<Skeleton height={80} />}>
              <Example />
            </Suspense>
          </ErrorBoundary>
        </Stage>
      </PreviewFrame>
    </Remembered>
  )
}

function Remembered({ path, children }: { path: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      const height = Math.round(el.getBoundingClientRect().height)
      if (height > 0) measured.set(path, height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [path])
  return <div ref={box}>{children}</div>
}

function ExampleSource({ source, title }: { source: Loader<string>; title: string }) {
  const state = useLoaded(source)
  if (state.status === "loading") return <Skeleton height={120} label="Loading source" />
  if (state.status === "error") {
    return (
      <Callout tone="error" title="Could not load the source">
        <p>{state.error.message}</p>
      </Callout>
    )
  }
  if (!state.value) return <Callout tone="warn">The source for this example is not available in this build.</Callout>
  return <CodeBlock code={state.value} lang="tsx" title={title} lineNumbers />
}
