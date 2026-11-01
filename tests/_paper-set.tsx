import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { expect, vi } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe, type Recipe, type RunRequest } from "@/lib/ink/recipes"
import { mockBox } from "./helpers"

export function expectClean(svg: string) {
  expect(svg).not.toMatch(/NaN|undefined|Infinity|\[object/)
  expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  expect(svg).not.toMatch(new RegExp(["<filter", "fe" + "Turbulence", "fe" + "GaussianBlur", "fe" + "DisplacementMap"].join("|")))
  for (const m of svg.matchAll(/(?:fill|stroke|stop-color)="([^"]+)"/g)) {
    const v = m[1]
    expect(v === "none" || v.startsWith("url(#") || /^var\(--ll-[a-z-]+\)$/.test(v) || v === "currentColor", `colour ${v}`).toBe(true)
  }
}

export const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask|rect|circle|ellipse|line|linearGradient)\b/g) ?? []).length

const REQ = { tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }

export function run<P>(recipe: Recipe<P>, params: P, w: number, h: number, extra: Partial<RunRequest<P>> = {}) {
  return runRecipe(recipe, { ...REQ, box: { w, h }, params, seed: "t", ...extra })
}

export function expectSsrStable(ui: React.ReactElement) {
  const a = renderToString(ui)
  const b = renderToString(ui)
  expect(a.length).toBeGreaterThan(0)
  expect(a).toBe(b)
  expect(a.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/NaN|undefined|\[object/)
  return a
}

export function expectHydrates(ui: React.ReactElement, drawn?: string, box: [number, number] = [320, 240]) {
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
    if (drawn) expect(container.querySelector(drawn)).toBeTruthy()
    act(() => root?.unmount())
    container.remove()
    restore()
  }
}
