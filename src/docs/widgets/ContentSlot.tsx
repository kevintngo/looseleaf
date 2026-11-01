import { lazy, Suspense, type ComponentType, type ReactNode } from "react"
import type { ContentModule, Loader } from "../core/catalog"
import { useCatalog } from "../core/catalog-context"
import { Skeleton } from "../kit"
import { ErrorBoundary } from "./ErrorBoundary"

const lazyCache = new WeakMap<Loader<ContentModule>, ComponentType>()

function lazyBody(loader: Loader<ContentModule>): ComponentType {
  let component = lazyCache.get(loader)
  if (!component) {
    component = lazy(async () => {
      const mod = await loader()
      if (typeof mod.default !== "function") throw new Error("A content module must `export default` a component.")
      return { default: mod.default }
    })
    lazyCache.set(loader, component)
  }
  return component
}

export function useHasContent(key: string): boolean {
  return useCatalog().content.has(key)
}

export function ContentSlot({ contentKey, fallback = null }: { contentKey: string; fallback?: ReactNode }) {
  const loader = useCatalog().content.get(contentKey)
  if (!loader) return <>{fallback}</>
  const Body = lazyBody(loader)
  return (
    <ErrorBoundary resetKey={contentKey} title="This page body crashed">
      <Suspense fallback={<Skeleton height={240} />}>
        <Body />
      </Suspense>
    </ErrorBoundary>
  )
}
