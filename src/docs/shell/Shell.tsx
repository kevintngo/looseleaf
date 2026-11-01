import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import { Desk, DeskObjects, type DeskObject } from "@/components/ui/desk"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { AnnouncerProvider, useAnnouncerState } from "../core/announcer"
import { useCatalog } from "../core/catalog-context"
import { useIdle } from "../core/hooks"
import { routeTitle } from "../core/nav"
import { useLocation, useRouteEffects } from "../core/router"
import { ErrorBoundary } from "../widgets/ErrorBoundary"
import { DeskKnobProvider, useDeskKnob } from "./desk-knob"
import { MobileNav, NavPad } from "./NavPad"
import { Outlet } from "./Outlet"
import { TopBar } from "./TopBar"

const ON_THE_DESK: readonly DeskObject[] = ["clips", "coffee"]

const SiteFooter = lazy(() => import("./SiteFooter").then((m) => ({ default: m.SiteFooter })))

const CommandPalette = lazy(() => import("./CommandPalette").then((m) => ({ default: m.CommandPalette })))

const nothing = () => null

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.closest('[role="combobox"], [role="textbox"], [role="searchbox"], [role="spinbutton"]') !== null
}

export function Shell() {
  return (
    <DeskKnobProvider>
      <SidebarProvider className="block min-h-0">
        <ShellFrame />
      </SidebarProvider>
    </DeskKnobProvider>
  )
}

function ShellFrame() {
  const catalog = useCatalog()
  const location = useLocation()
  const { isMobile, open, setOpenMobile } = useSidebar()
  const { clutter } = useDeskKnob()
  const homeOwnsFooter = location.route.name === "home" && catalog.content.has("home")
  const idle = useIdle()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const main = useRef<HTMLElement>(null)

  useRouteEffects(location)

  const title = routeTitle(location.route, catalog)
  const { text: announcement, announce } = useAnnouncerState()
  const shownTitle = useRef<string | null>(null)
  useEffect(() => {
    document.title = title
    if (shownTitle.current !== null && shownTitle.current !== title) announce(`Navigated to ${title}`)
    shownTitle.current = title
  }, [title, announce])

  useEffect(() => setOpenMobile(false), [location.path, setOpenMobile])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setPaletteOpen((o) => !o)
      } else if (event.key === "/" && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target)) {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])

  return (
    <AnnouncerProvider announce={announce}>
      <Desk className="dk-app min-h-svh">
        {clutter ? <DeskObjects objects={ON_THE_DESK} seed="docs-desk" className="fixed print:hidden" /> : null}
        <a
          className="dk-skip sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-(--ll-z-splash) focus:ll-swipe focus:px-4 focus:py-2 focus:font-bold focus:shadow-lift"
          href="#main"
          onClick={(event) => {
            event.preventDefault()
            main.current?.focus()
            main.current?.scrollIntoView()
          }}
        >
          Skip to content
        </a>
        <TopBar onSearch={openPalette} />
        <div className="dk-layout mx-auto flex w-full max-w-[100rem] items-start gap-2 px-2 sm:px-4">
          <ErrorBoundary fallback={nothing}>{!isMobile && open ? <NavPad /> : null}</ErrorBoundary>
          <main id="main" ref={main} tabIndex={-1} className="dk-main min-w-0 flex-1 px-4 pt-6 pb-20 outline-none lg:px-10 lg:pt-9 lg:pb-24">
            <Outlet />
          </main>
        </div>
        {homeOwnsFooter || !idle ? null : (
          <Suspense fallback={null}>
            <SiteFooter />
          </Suspense>
        )}
        <ErrorBoundary fallback={nothing}>
          <MobileNav />
        </ErrorBoundary>
        <ErrorBoundary fallback={nothing}>
          {paletteOpen || idle ? (
            <Suspense fallback={null}>
              <CommandPalette open={paletteOpen} onClose={closePalette} />
            </Suspense>
          ) : null}
        </ErrorBoundary>
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </Desk>
    </AnnouncerProvider>
  )
}
