import { useEffect, useRef, useState, type ReactNode } from "react"

export function useNearViewport<T extends Element>(rootMargin = "600px 0px", eager = false): [ref: (el: T | null) => void, seen: boolean] {
  const [seen, setSeen] = useState(eager)
  const [el, setEl] = useState<T | null>(null)
  useEffect(() => {
    if (seen || !el) return
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [el, seen, rootMargin])
  return [setEl, seen]
}

export interface LazyMountProps {
  children: ReactNode
  minHeight?: number
  eager?: boolean
  rootMargin?: string
  className?: string
}

export function LazyMount({ children, minHeight = 0, eager = false, rootMargin, className }: LazyMountProps) {
  const [ref, seen] = useNearViewport<HTMLDivElement>(rootMargin, eager)
  return (
    <div ref={ref} className={className} data-lazy={seen ? "drawn" : "waiting"} style={seen ? undefined : { minHeight }}>
      {seen ? children : null}
    </div>
  )
}

export function useColumns(minTile: number, gap: number, fallback = 6): [ref: (el: HTMLElement | null) => void, columns: number] {
  const [columns, setColumns] = useState(fallback)
  const [el, setEl] = useState<HTMLElement | null>(null)
  const latest = useRef({ minTile, gap })
  useEffect(() => {
    latest.current = { minTile, gap }
  })
  useEffect(() => {
    if (!el || typeof ResizeObserver === "undefined") return
    const measure = () => {
      const width = el.clientWidth
      if (!width) return
      const { minTile: m, gap: g } = latest.current
      setColumns(Math.max(1, Math.floor((width + g) / (m + g))))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [el, minTile, gap])
  return [setEl, columns]
}
