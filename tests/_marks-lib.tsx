import { vi } from "vitest"

export interface LineRect {
  left: number
  top: number
  width: number
  height: number
}

export function mockLines(slot: string | string[], rects: LineRect[]): () => void {
  const slots = Array.isArray(slot) ? slot : [slot]
  const spy = vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    const list = slots.includes(this.getAttribute("data-slot") ?? "") ? rects : []
    return Object.assign(
      list.map((r) => ({ ...r, x: r.left, y: r.top, right: r.left + r.width, bottom: r.top + r.height, toJSON: () => r })),
      { item: (i: number) => list[i] },
    ) as unknown as DOMRectList
  })
  return () => spy.mockRestore()
}

export const THREE_LINES: LineRect[] = [
  { left: 120, top: 4, width: 180, height: 27 },
  { left: 0, top: 30, width: 300, height: 27 },
  { left: 0, top: 57, width: 96, height: 27 },
]

interface FakeObserver {
  cb: IntersectionObserverCallback
  targets: Element[]
}
const observers: FakeObserver[] = []

export function installIntersection(): () => void {
  const prev = globalThis.IntersectionObserver
  class FakeIO {
    root = null
    rootMargin = ""
    thresholds = []
    private o: FakeObserver
    constructor(cb: IntersectionObserverCallback) {
      this.o = { cb, targets: [] }
      observers.push(this.o)
    }
    observe(el: Element) {
      this.o.targets.push(el)
    }
    unobserve() {}
    disconnect() {
      this.o.targets = []
    }
    takeRecords() {
      return []
    }
  }
  globalThis.IntersectionObserver = FakeIO as unknown as typeof IntersectionObserver
  observers.length = 0
  return () => {
    globalThis.IntersectionObserver = prev
    observers.length = 0
  }
}

export function fireIntersection(el: Element, isIntersecting = true): void {
  for (const o of observers) {
    if (o.targets.includes(el)) o.cb([{ target: el, isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
  }
}

export const inkSvgs = (host: Element): SVGElement[] => Array.from(host.children).filter((c): c is SVGElement => c.tagName.toLowerCase() === "svg" && c.hasAttribute("data-ink"))
