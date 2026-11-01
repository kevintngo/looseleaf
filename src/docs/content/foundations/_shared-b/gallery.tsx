import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { copyText } from "@/docs/core/hooks"
import { cx } from "@/docs/kit"
import { LazyMount, useColumns } from "./lazy"

export const GAP = 8

export function useCopyStatus(ms = 1600) {
  const [copied, setCopied] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const count = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = useCallback(
    async (id: string, text: string) => {
      const ok = await copyText(text)
      count.current += 1
      const tail = count.current % 2 ? "" : "​"
      setMessage((ok ? `Copied ${text}` : `Copying was blocked. The code is ${text}`) + tail)
      clearTimeout(timer.current)
      if (ok) {
        setCopied(id)
        timer.current = setTimeout(() => setCopied(null), ms)
      }
      return ok
    },
    [ms],
  )
  return { copied, message, copy }
}

export function CopyStatus({ message }: { message: string }) {
  return (
    <p role="status" className="sr-only">
      {message}
    </p>
  )
}

const RovingContext = createContext<{ tabbable: string | undefined }>({ tabbable: undefined })

function neighbour(tiles: HTMLElement[], from: HTMLElement, dir: 1 | -1): HTMLElement | undefined {
  const r = from.getBoundingClientRect()
  let best: HTMLElement | undefined
  let bestDy = Number.POSITIVE_INFINITY
  let bestDx = Number.POSITIVE_INFINITY
  for (const t of tiles) {
    if (t === from) continue
    const b = t.getBoundingClientRect()
    const dy = (b.top - r.top) * dir
    if (dy <= 1) continue
    const dx = Math.abs(b.left - r.left)
    if (dy < bestDy - 1 || (Math.abs(dy - bestDy) <= 1 && dx < bestDx)) {
      best = t
      bestDy = dy
      bestDx = dx
    }
  }
  return best
}

export interface RovingGroupProps {
  label: string
  describedBy?: string
  ids: readonly string[]
  className?: string
  children: ReactNode
}

export function RovingGroup({ label, describedBy, ids, className, children }: RovingGroupProps) {
  const [active, setActive] = useState<string | undefined>(undefined)
  const rootRef = useRef<HTMLDivElement>(null)
  const tabbable = active !== undefined && ids.includes(active) ? active : ids[0]

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || root.querySelector('[data-tile][tabindex="0"]')) return
    const first = root.querySelector<HTMLElement>("[data-tile]")?.dataset.tile
    if (first) setActive(first)
  })

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (!target.hasAttribute("data-tile") || event.altKey || event.ctrlKey || event.metaKey) return
    const root = rootRef.current
    if (!root) return
    const tiles = Array.from(root.querySelectorAll<HTMLElement>("[data-tile]"))
    const at = tiles.indexOf(target)
    const rtl = getComputedStyle(root).direction === "rtl"
    let next: HTMLElement | undefined
    switch (event.key) {
      case "ArrowRight":
        next = tiles[at + (rtl ? -1 : 1)]
        break
      case "ArrowLeft":
        next = tiles[at + (rtl ? 1 : -1)]
        break
      case "ArrowDown":
        next = neighbour(tiles, target, 1)
        break
      case "ArrowUp":
        next = neighbour(tiles, target, -1)
        break
      case "Home":
        next = tiles[0]
        break
      case "End":
        next = tiles[tiles.length - 1]
        break
      default:
        return
    }
    event.preventDefault()
    next?.focus()
  }

  return (
    <RovingContext.Provider value={{ tabbable }}>
      <div
        ref={rootRef}
        role="group"
        aria-label={label}
        aria-describedby={describedBy}
        className={className}
        onKeyDown={onKeyDown}
        onFocus={(event) => {
          const id = (event.target as HTMLElement).dataset?.tile
          if (id) setActive(id)
        }}
      >
        {children}
      </div>
    </RovingContext.Provider>
  )
}

export interface TileProps {
  id: string
  name: string
  selected?: boolean
  copied?: boolean
  hint?: string
  onPress: () => void
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function Tile({ id, name, selected, copied, hint, onPress, className, style, children }: TileProps) {
  const { tabbable } = useContext(RovingContext)
  return (
    <button
      type="button"
      data-tile={id}
      tabIndex={tabbable === id ? 0 : -1}
      data-selected={selected ? "" : undefined}
      data-copied={copied ? "" : undefined}
      onClick={onPress}
      className={cx(
        "group relative flex min-w-0 scroll-mt-28 md:scroll-mb-44 flex-col items-center justify-start gap-1.5 px-1.5 pt-2.5 pb-2 text-ink",
        "hover:ll-swipe data-[selected]:shadow-[inset_0_0_0_2px_var(--ll-ink-you)]",
        className,
      )}
      style={style}
    >
      {children}
      <span className="text-center text-sm leading-tight text-pencil-text [overflow-wrap:anywhere] group-hover:text-inherit group-data-[selected]:text-ink">{name}</span>
      {hint ? (
        <span aria-hidden="true" className="-mt-1 text-center font-type text-sm leading-tight text-ink-you [overflow-wrap:anywhere]">
          {hint}
        </span>
      ) : null}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-1 top-1 hidden bg-hi px-1.5 font-type text-xs leading-5 text-ink group-data-[copied]:inline-block"
      >
        copied
      </span>
    </button>
  )
}

export interface TileGridProps<T> {
  items: readonly T[]
  getId: (item: T) => string
  renderTile: (item: T) => ReactNode
  minTile: number
  tileHeight: number
  chunk?: number
  eager?: boolean
  className?: string
}

export function TileGrid<T>({ items, getId, renderTile, minTile, tileHeight, chunk = 24, eager = false, className }: TileGridProps<T>) {
  const [measure, columns] = useColumns(minTile, GAP)
  const blocks = useMemo(() => {
    const out: T[][] = []
    for (let i = 0; i < items.length; i += chunk) out.push(items.slice(i, i + chunk))
    return out
  }, [items, chunk])
  return (
    <div ref={measure} className={className}>
      {blocks.map((block, index) => {
        const rows = Math.ceil(block.length / columns)
        return (
          <LazyMount key={getId(block[0]!)} eager={eager && index === 0} className={index ? "pt-2" : undefined} minHeight={rows * tileHeight + (rows - 1) * GAP + (index ? GAP : 0)}>
            <div className="grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${minTile}px, 100%), 1fr))`, gap: GAP }}>
              {block.map((item) => (
                <Fragment key={getId(item)}>{renderTile(item)}</Fragment>
              ))}
            </div>
          </LazyMount>
        )
      })}
    </div>
  )
}

export function ResultCount({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  return (
    <p role="status" className="text-[15px] text-muted-foreground m-0 whitespace-nowrap">
      {shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`}
    </p>
  )
}
