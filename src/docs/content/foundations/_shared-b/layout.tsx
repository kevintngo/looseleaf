import type { ReactNode } from "react"
import { cx } from "@/docs/kit"

export function DataTable({ label, minWidth = "36rem", className, children }: { label: string; minWidth?: string; className?: string; children: ReactNode }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className={cx("overflow-x-auto", className)}>
      <table
        className={cx(
          "w-full border-collapse text-start text-[15px] leading-snug text-ink",
          "[&_th]:border-b-2 [&_th]:border-pencil-mark [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_th]:font-script [&_th]:text-xl [&_th]:font-bold [&_th]:text-ink-you",
          "[&_td]:border-b [&_td]:border-pencil-mark/40 [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top",
          "[&_tbody_th]:border-b [&_tbody_th]:border-pencil-mark/40 [&_tbody_th]:font-hand [&_tbody_th]:text-[15px] [&_tbody_th]:text-ink",
        )}
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  )
}

export function Specimen({ caption, children, className, onDesk }: { caption: ReactNode; children: ReactNode; className?: string; onDesk?: boolean }) {
  return (
    <figure className={cx("m-0 flex min-w-0 flex-col items-center gap-2 text-ink", className)}>
      {children}
      <figcaption className={cx("text-center text-sm leading-tight", onDesk ? "text-ink-soft" : "text-pencil-text")}>{caption}</figcaption>
    </figure>
  )
}

export function CaveatCard({ title, children, status, className }: { title: string; children: ReactNode; status: string; className?: string }) {
  return (
    <li className={cx("flex min-w-0 flex-col gap-2 border-s-4 border-marker bg-slip px-4 py-3 text-ink shadow-hair", className)}>
      <h3 className="m-0 font-script text-2xl leading-tight">{title}</h3>
      <div className="flex flex-col gap-1.5 [&>p]:m-0">{children}</div>
      <p className="m-0 mt-auto font-type text-sm text-pencil-text">{status}</p>
    </li>
  )
}
