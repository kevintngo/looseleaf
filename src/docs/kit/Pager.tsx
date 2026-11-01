import { useEffect } from "react"
import { Arrow } from "@/components/ui/arrow"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { Link, navigate } from "../core/router"

export interface PagerLink {
  to: string
  title: string
}

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
    target.closest('[role="combobox"], [role="textbox"], [role="searchbox"], [role="spinbutton"]') !== null)

function usePagerKeys(prev: PagerLink | null | undefined, next: PagerLink | null | undefined) {
  const prevTo = prev?.to
  const nextTo = next?.to
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return
      const to = event.key === "[" ? prevTo : event.key === "]" ? nextTo : undefined
      if (!to) return
      event.preventDefault()
      navigate(to)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [prevTo, nextTo])
}

function PagerItem({ link, dir }: { link: PagerLink; dir: "prev" | "next" }) {
  const back = dir === "prev"
  return (
    <Link
      to={link.to}
      rel={dir}
      data-dir={dir}
      aria-keyshortcuts={back ? "[" : "]"}
      className={
        "dk-pager-link group/pager flex min-w-0 items-center gap-3 px-2 py-2 outline-offset-2 hover:ll-swipe " +
        (back ? "text-start" : "flex-row-reverse text-end sm:col-start-2")
      }
    >
      <Arrow
        aria-hidden
        direction={back ? "left" : "right"}
        curve="curved"
        tone="blue"
        className={
          "h-8 w-14 shrink-0 transition-transform duration-(--ll-dur-hover) ease-settle " + (back ? "group-hover/pager:-translate-x-1" : "group-hover/pager:translate-x-1")
        }
      />
      <span className="flex min-w-0 flex-col">
        <span className={"dk-pager-label flex items-center gap-1.5 font-type text-xs text-ink-muted " + (back ? "" : "justify-end")}>
          {back ? "Previous" : "Next"}
          <Kbd aria-hidden="true" className="max-sm:hidden">
            {back ? "[" : "]"}
          </Kbd>
        </span>
        <span className="dk-pager-title truncate font-script text-2xl leading-tight font-bold text-ink-you">{link.title}</span>
      </span>
    </Link>
  )
}

export function Pager({ label, prev, next }: { label: string; prev?: PagerLink | null; next?: PagerLink | null }) {
  usePagerKeys(prev, next)
  if (!prev && !next) return null
  return (
    <nav aria-label={label} className="dk-pager mt-4 flex flex-col gap-3 print:hidden">
      <Separator variant="dashed" />
      <div className="grid gap-2 sm:grid-cols-2">
        {prev ? <PagerItem link={prev} dir="prev" /> : null}
        {next ? <PagerItem link={next} dir="next" /> : null}
      </div>
    </nav>
  )
}
