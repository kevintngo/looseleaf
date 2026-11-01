import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
class IO {
  readonly root = null
  readonly rootMargin = ""
  readonly thresholds: readonly number[] = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
globalThis.ResizeObserver ??= RO as unknown as typeof ResizeObserver
globalThis.IntersectionObserver ??= IO as unknown as typeof IntersectionObserver
if (typeof window !== "undefined") {
  globalThis.matchMedia ??= ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof matchMedia
  window.scrollTo ??= (() => {}) as typeof window.scrollTo
}
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView ??= () => {}
  Element.prototype.scrollTo ??= () => {}
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
}

afterEach(() => {
  if (typeof document !== "undefined") cleanup()
})
