import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { expect, vi } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { mockBox } from "./helpers"

export function expectSsrStable(ui: React.ReactElement) {
  const a = renderToString(ui)
  const b = renderToString(ui)
  expect(a.length).toBeGreaterThan(0)
  expect(a).toBe(b)
  expect(a.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/NaN|undefined|\[object/)
  return a
}

export function expectHydrates(ui: React.ReactElement, box: [number, number] = [320, 240]) {
  for (const wrap of [(n: React.ReactElement) => n, (n: React.ReactElement) => <InkProvider>{n}</InkProvider>]) {
    const restore = mockBox(box[0], box[1])
    const el = wrap(ui)
    const container = document.createElement("div")
    document.body.appendChild(container)
    container.innerHTML = renderToString(el)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined
    act(() => {
      root = hydrateRoot(container, el)
    })
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
    act(() => root?.unmount())
    container.remove()
    restore()
  }
}

export function expectDrawnClean(ui: React.ReactElement) {
  for (const [w, h] of [[120, 36], [320, 60], [640, 300], [900, 700]] as const) {
    const restore = mockBox(w, h)
    const r = render(ui)
    const html = r.container.innerHTML.replace(/<style[\s\S]*?<\/style>/g, "")
    expect(html, `${w}x${h}`).not.toMatch(/NaN|Infinity|\[object Object\]|="undefined"|undefinedpx/)
    const ids = Array.from(document.querySelectorAll("[id]")).map((n) => n.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i), `${w}x${h} duplicate ids`).toEqual([])
    r.unmount()
    restore()
  }
}
