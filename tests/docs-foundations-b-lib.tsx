import { act } from "@testing-library/react"
import { vi } from "vitest"

interface Watch {
  el: Element
  fire: () => void
}

export class MockIntersectionObserver {
  static all: MockIntersectionObserver[] = []
  private watched: Watch[] = []
  constructor(private readonly cb: IntersectionObserverCallback) {
    MockIntersectionObserver.all.push(this)
  }
  observe = (el: Element) => {
    this.watched.push({ el, fire: () => this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver) })
  }
  unobserve = (el: Element) => {
    this.watched = this.watched.filter((w) => w.el !== el)
  }
  disconnect = () => {
    this.watched = []
  }
  takeRecords = () => []
  get waiting(): Element[] {
    return this.watched.map((w) => w.el)
  }
  fireAll() {
    for (const w of [...this.watched]) w.fire()
  }
}

export function installIntersectionObserver() {
  MockIntersectionObserver.all = []
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
}

export function revealAll() {
  act(() => {
    for (const io of [...MockIntersectionObserver.all]) io.fireAll()
  })
}

export function revealFirst(n: number, root: ParentNode = document) {
  const targets = new Set(Array.from(root.querySelectorAll('[data-lazy="waiting"]')).slice(0, n))
  act(() => {
    for (const io of [...MockIntersectionObserver.all]) if (io.waiting.some((el) => targets.has(el))) io.fireAll()
  })
}
