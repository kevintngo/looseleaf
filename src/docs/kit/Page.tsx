import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import { Page as PageSheet, PageContent, PageDescription, PageHeader, PageTitle } from "@/components/ui/page"
import { Paper } from "@/components/ui/paper"
import { useAnchorHref } from "../core/router"
import { cx } from "./cx"

export interface TocItem {
  id: string
  label: string
}

export interface PageProps {
  kicker?: ReactNode
  title: string
  description?: ReactNode
  meta?: ReactNode
  toc?: readonly TocItem[] | "auto"
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

export function Page({ kicker, title, description, meta, toc, children, footer, className }: PageProps) {
  const article = useRef<HTMLElement>(null)
  const found = useHeadings(toc === "auto", article)
  const items = toc === "auto" ? found : toc
  return (
    <div data-slot="docs-page" className={cx("mx-auto flex w-full max-w-[72rem] items-start justify-center gap-8", className)}>
      <PageSheet as="article" ref={article} width="lg" tape="top" tilt={false} className="dk-article min-w-0 flex-1 gap-10">
        <PageHeader className="gap-3">
          {kicker ? <p className="dk-kicker font-type text-sm text-ink-muted [&_a]:underline-offset-4 [&_a]:hover:underline">{kicker}</p> : null}
          <PageTitle underline="highlight" tabIndex={-1} className="dk-title text-[2.6rem] outline-offset-4 sm:text-5xl">
            {title}
          </PageTitle>
          {description ? <PageDescription className="dk-lede text-lg leading-snug text-ink-soft">{description}</PageDescription> : null}
          {meta ? <div className="dk-page-meta mt-1 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </PageHeader>
        <PageContent className="gap-10">{children}</PageContent>
        {footer}
      </PageSheet>
      {items && items.length > 1 ? <TableOfContents items={items} /> : null}
    </div>
  )
}

const sameItems = (a: readonly TocItem[], b: readonly TocItem[]) => a.length === b.length && a.every((item, i) => item.id === b[i]!.id && item.label === b[i]!.label)

function useHeadings(enabled: boolean, root: RefObject<HTMLElement | null>): readonly TocItem[] {
  const [items, setItems] = useState<readonly TocItem[]>([])
  useEffect(() => {
    const el = root.current
    if (!enabled || !el) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const scan = () => {
      const next = Array.from(el.querySelectorAll<HTMLElement>('[data-slot="page-content"] h2[id]'))
        .filter((h) => !h.closest('[data-slot="stage"]'))
        .map((h) => ({ id: h.id, label: (h.textContent ?? "").trim() }))
        .filter((item) => item.label)
      setItems((prev) => (sameItems(prev, next) ? prev : next))
    }
    scan()
    const observer = new MutationObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(scan, 120)
    })
    observer.observe(el, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [enabled, root])
  return items
}

function useActiveHeading(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join("|")
  useEffect(() => {
    const list = key ? key.split("|") : []
    let frame = 0
    const measure = () => {
      frame = 0
      let current: string | null = null
      let measured = false
      for (const id of list) {
        const box = document.getElementById(id)?.getBoundingClientRect()
        if (!box) continue
        if (box.width > 0 || box.height > 0) measured = true
        if (box.top <= 120) current = id
      }
      if (measured) setActive(current)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [key])
  return active
}

export function TableOfContents({ items }: { items: readonly TocItem[] }) {
  const active = useActiveHeading(items.map((item) => item.id))
  return (
    <div data-slot="docs-toc" className="dk-toc sticky top-24 hidden w-56 shrink-0 xl:block">
      <Paper as="nav" aria-label="On this page" stock="slip" tape="corner" tilt={1} rules="none" className="px-4 pt-5 pb-4">
        <p className="dk-toc-title font-type text-xs text-ink-muted">On this page</p>
        <ul role="list" className="-mx-1 mt-2 flex max-h-[calc(100dvh-14rem)] flex-col overflow-y-auto px-1">
          {items.map((item) => (
            <li key={item.id}>
              <TocLink id={item.id} current={active === item.id}>
                {item.label}
              </TocLink>
            </li>
          ))}
        </ul>
      </Paper>
    </div>
  )
}

function TocLink({ id, current, children }: { id: string; current: boolean; children: ReactNode }) {
  return (
    <a
      href={useAnchorHref(id)}
      aria-current={current ? "location" : undefined}
      className="dk-toc-link block px-1.5 py-1 font-script text-xl leading-tight text-ink-you hover:ll-swipe hover:text-ink aria-[current=location]:ll-swipe aria-[current=location]:font-bold aria-[current=location]:text-ink"
    >
      {children}
    </a>
  )
}
