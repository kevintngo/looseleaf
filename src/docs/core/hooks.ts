import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react"

export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener?.("change", onChange)
      return () => mql.removeEventListener?.("change", onChange)
    },
    [query],
  )
  const get = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : fallback)
  return useSyncExternalStore(subscribe, get, () => fallback)
}

export function useIdle(): boolean {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number }).requestIdleCallback
    const cancel = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
    if (ric) {
      const id = ric.call(window, () => setIdle(true), { timeout: 2000 })
      return () => cancel?.call(window, id)
    }
    const timer = setTimeout(() => setIdle(true), 250)
    return () => clearTimeout(timer)
  }, [])
  return idle
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),summary'

export function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("hidden") && el.getAttribute("aria-hidden") !== "true" && !el.closest("[hidden],[inert]"),
  )
}

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  options: { onEscape?: () => void; initialFocus?: string } = {},
) {
  const onEscape = useRef(options.onEscape)
  useEffect(() => {
    onEscape.current = options.onEscape
  })
  const initialFocus = options.initialFocus

  useEffect(() => {
    if (!active) return
    const root = ref.current
    if (!root) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const target = (initialFocus ? root.querySelector<HTMLElement>(initialFocus) : null) ?? focusableWithin(root)[0] ?? root
    target.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        onEscape.current?.()
        return
      }
      if (event.key !== "Tab") return
      const items = focusableWithin(root)
      if (items.length === 0) {
        event.preventDefault()
        root.focus()
        return
      }
      const first = items[0]!
      const last = items[items.length - 1]!
      const current = document.activeElement
      if (event.shiftKey && (current === first || !root.contains(current))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (current === last || !root.contains(current))) {
        event.preventDefault()
        first.focus()
      }
    }
    root.addEventListener("keydown", onKeyDown)
    return () => {
      root.removeEventListener("keydown", onKeyDown)
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true })
    }
  }, [ref, active, initialFocus])
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const root = document.documentElement
    root.setAttribute("data-scroll-locked", "")
    return () => root.removeAttribute("data-scroll-locked")
  }, [active])
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
  }
  try {
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    area.remove()
    return ok
  } catch {
    return false
  }
}

export function useCopy(ms = 1600) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text)
      if (!ok) return false
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), ms)
      return true
    },
    [ms],
  )
  return { copied, copy }
}
