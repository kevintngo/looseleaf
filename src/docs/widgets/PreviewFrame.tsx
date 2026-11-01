import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { cx } from "../kit"

export const MIN_WIDTH = 240
const PRESETS = [
  { label: "Phone", width: 375 },
  { label: "Tablet", width: 768 },
  { label: "Full", width: null },
] as const

export function PreviewFrame({ children, className }: { children: ReactNode; className?: string }) {
  const [width, setWidth] = useState<number | null>(null)
  const [room, setRoom] = useState(1200)
  const track = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; start: number; dir: 1 | -1 } | null>(null)

  useEffect(() => {
    const el = track.current
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry?.contentRect.width ?? 0)
      if (w > 0) setRoom(w)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const set = (next: number | null) => setWidth(next === null || next >= room - 2 ? null : Math.max(MIN_WIDTH, Math.round(next)))
  const current = () => width ?? Math.round(frame.current?.getBoundingClientRect().width || room)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 64 : 16
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault()
      set(current() + ((event.key === "ArrowRight") !== rtl ? step : -step))
    } else if (event.key === "Home") {
      event.preventDefault()
      set(MIN_WIDTH)
    } else if (event.key === "End") {
      event.preventDefault()
      set(null)
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    drag.current = { x: event.clientX, start: current(), dir: getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1 }
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (d) set(d.start + d.dir * (event.clientX - d.x))
  }
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <div role="group" aria-label="Preview width" className="hidden items-center gap-1 sm:flex print:hidden">
        {PRESETS.map((p) => (
          <Button key={p.label} type="button" variant="ghost" size="xs" aria-pressed={p.width === width} onClick={() => set(p.width)} className="aria-pressed:font-bold">
            {p.label}
            {p.width ? <span className="font-normal text-ink-muted"> {p.width}</span> : null}
          </Button>
        ))}
        <span className="ms-auto ll-num font-type text-xs tracking-wide text-ink-muted">
          {width ? `${width} px wide` : "full width"}
        </span>
      </div>
      <div ref={track} className="relative min-w-0">
        <div ref={frame} data-slot="preview-frame" style={width ? { width } : undefined} className="relative max-w-full min-w-0">
          {children}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize preview"
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={room}
            aria-valuenow={width ?? room}
            aria-valuetext={width ? `${width} pixels wide` : "Full width"}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="absolute inset-y-0 -end-6 z-(--ll-z-raised) hidden w-6 cursor-ew-resize touch-none items-center justify-center text-ink-muted outline-offset-[-2px] hover:ll-swipe hover:text-ink sm:flex"
          >
            <Icon name="grip-vertical" size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}
