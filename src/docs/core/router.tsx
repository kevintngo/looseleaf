import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from "react"
import { hrefFor, matchRoute, parseHash, type Route } from "./router-core"

export interface LocationState {
  path: string
  anchor: string
  search: string
  route: Route
}

function readLocation(hash: string, prev?: LocationState): LocationState {
  const parsed = parseHash(hash)
  const path = parsed.anchorOnly ? (prev?.path ?? "/") : parsed.path
  const search = parsed.anchorOnly ? (prev?.search ?? "") : parsed.search
  return { path, anchor: parsed.anchor, search, route: matchRoute(path) }
}

export interface HashStore {
  getState(): LocationState
  subscribe(listener: () => void): () => void
}

export function createHashStore(win: Pick<Window, "location" | "addEventListener" | "removeEventListener"> = window): HashStore {
  let state = readLocation(win.location.hash)
  const listeners = new Set<() => void>()

  const refresh = () => {
    const next = readLocation(win.location.hash, state)
    if (next.path === state.path && next.anchor === state.anchor && next.search === state.search) return
    state = next
    listeners.forEach((l) => l())
  }

  return {
    getState: () => state,
    subscribe(listener) {
      if (listeners.size === 0) win.addEventListener("hashchange", refresh)
      listeners.add(listener)
      refresh()
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) win.removeEventListener("hashchange", refresh)
      }
    },
  }
}

const HOME: LocationState = { path: "/", anchor: "", search: "", route: { name: "home" } }
const LocationContext = createContext<LocationState>(HOME)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createHashStore())
  const location = useSyncExternalStore(store.subscribe, store.getState, () => HOME)
  return <LocationContext.Provider value={location}>{children}</LocationContext.Provider>
}

export function useLocation(): LocationState {
  return useContext(LocationContext)
}

export function useRoute(): Route {
  return useLocation().route
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const href = hrefFor(to)
  if (options.replace) window.location.replace(href)
  else window.location.hash = href.slice(1)
}

export type LinkProps = Omit<ComponentProps<"a">, "href"> & { to: string }

export function Link({ to, ...props }: LinkProps) {
  return <a href={hrefFor(to)} {...props} />
}

export function useAnchorHref(anchor: string): string {
  const { path } = useLocation()
  return hrefFor(`${path}#${anchor}`)
}

export function scrollToAnchor(id: string, timeoutMs = 2500): () => void {
  let cancelled = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const started = Date.now()
  const attempt = () => {
    if (cancelled) return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ block: "start" })
      if (el.hasAttribute("tabindex")) el.focus({ preventScroll: true })
      return
    }
    if (Date.now() - started < timeoutMs) timer = setTimeout(attempt, 60)
  }
  attempt()
  return () => {
    cancelled = true
    if (timer) clearTimeout(timer)
  }
}

function useTraversal() {
  const traversing = useRef(false)
  useEffect(() => {
    const nav = (window as unknown as { navigation?: EventTarget }).navigation
    if (!nav?.addEventListener) return
    const onNavigate = (event: Event) => {
      traversing.current = (event as Event & { navigationType?: string }).navigationType === "traverse"
    }
    nav.addEventListener("navigate", onNavigate)
    return () => nav.removeEventListener("navigate", onNavigate)
  }, [])
  return traversing
}

export function useRouteEffects(location: LocationState) {
  const previousPath = useRef<string | null>(null)
  const traversing = useTraversal()
  const { path, anchor } = location

  useEffect(() => {
    const first = previousPath.current === null
    const pathChanged = previousPath.current !== path
    previousPath.current = path

    if (anchor) return scrollToAnchor(anchor)
    if (first || !pathChanged) return
    if (!traversing.current) {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" })
      } catch {
      }
    }
    const heading = document.querySelector<HTMLElement>("#main h1")
    heading?.focus({ preventScroll: true })
  }, [path, anchor, traversing])
}
