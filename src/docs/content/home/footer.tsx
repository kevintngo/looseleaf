import { lazy } from "react"
import { Link } from "../../core/router"
import { paths } from "../../core/router-core"
import { LazyOnView } from "./lazy-on-view"
import type { DecoItem } from "./deco"

const Deco = lazy(() => import("./deco"))

const STAMP: readonly DecoItem[] = [
  { kind: "stamp", name: "made-by-hand", text: "Made by hand", sub: "Looseleaf 0.1.0", shape: "rect", ink: "red", w: 196, h: 76, rotate: -5, className: "top-0 left-0" },
]

const LINKS = [
  { to: paths.gettingStarted, label: "Get started" },
  { to: paths.components(), label: "Components" },
  { to: paths.playground, label: "Playground" },
  { to: paths.changelog, label: "Changelog" },
]

const linkClass = "text-ink underline decoration-ink/40 decoration-2 underline-offset-4 hover:decoration-ink focus-visible:decoration-ink"

export function Footer() {
  return (
    <footer data-slot="home-footer" className="mt-28 flex flex-wrap items-end justify-between gap-x-10 gap-y-8 border-t-2 border-dashed border-ink/25 pt-9">
      <div className="min-w-0">
        <p className="font-script text-4xl leading-none font-bold text-ink">Looseleaf</p>
        <p className="mt-2 max-w-md text-ink">shadcn/ui, drawn by hand. MIT licensed, with accessible parts and a pencil.</p>
        <nav aria-label="Footer" className="mt-4">
          <ul role="list" className="flex flex-wrap gap-x-6 gap-y-2 text-[17px]">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="relative h-24 w-56" aria-hidden="true">
        <LazyOnView height={0} slip={false} delay={900} className="contents">
          <Deco items={STAMP} />
        </LazyOnView>
      </div>
    </footer>
  )
}
