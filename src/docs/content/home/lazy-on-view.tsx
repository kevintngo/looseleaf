import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Slip({ height, label = "sharpening a pencil...", className }: { height: number; label?: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-slot="home-slip"
      className={cn("grid place-items-center border-2 border-dashed border-ink/25 bg-paper/35 px-4 text-center font-script text-2xl text-ink-muted", className)}
      style={{ minHeight: `${height}rem` }}
    >
      {label}
    </div>
  )
}

export interface LazyOnViewProps {
  children: ReactNode
  height: number
  order?: number
  delay?: number
  label?: string
  className?: string
  slip?: boolean
  eager?: boolean
}

const BASE_DELAY = 1400
const STEP = 260
const MAX_DELAY = 5200

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void }

export function LazyOnView({ children, height, order = 0, delay, label, className, slip = true, eager = false }: LazyOnViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(eager)

  useEffect(() => {
    if (on) return
    let done = false
    const go = () => {
      if (done) return
      done = true
      setOn(true)
    }
    const el = ref.current
    let io: IntersectionObserver | undefined
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) go()
        },
        { rootMargin: "400px 0px" },
      )
      io.observe(el)
    }
    const win = window as IdleWindow
    let idle: number | undefined
    const timer = setTimeout(
      () => {
        if (win.requestIdleCallback) idle = win.requestIdleCallback(go, { timeout: 1500 })
        else go()
      },
      delay ?? Math.min(MAX_DELAY, BASE_DELAY + order * STEP),
    )
    return () => {
      done = true
      io?.disconnect()
      clearTimeout(timer)
      if (idle !== undefined) win.cancelIdleCallback?.(idle)
    }
  }, [on, order, delay])

  const holder = slip ? <Slip height={height} label={label} /> : null
  return (
    <div ref={ref} data-slot="lazy-on-view" data-ready={on || undefined} className={className}>
      {on ? <Suspense fallback={holder}>{children}</Suspense> : holder}
    </div>
  )
}
