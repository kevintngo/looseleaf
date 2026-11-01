import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { expect, vi } from "vitest"

import { getInkLayers } from "./helpers"

export function expectSsrStable(ui: React.ReactElement): string {
  const a = renderToString(ui)
  expect(a).toBe(renderToString(ui))
  expect(a.length).toBeGreaterThan(200)
  const markup = a.replace(/<style[\s\S]*?<\/style>/g, "")
  expect(markup).not.toMatch(/="[^"]*\b(NaN|undefined|Infinity)\b[^"]*"/)
  expect(markup).not.toMatch(/>[^<]*(\bNaN\b|\[object Object\]|undefined%|NaNpx)[^<]*</)
  return a
}

export async function expectHydrates(ui: React.ReactElement): Promise<void> {
  const html = renderToString(ui)
  const err = vi.spyOn(console, "error").mockImplementation(() => {})
  const div = document.createElement("div")
  div.innerHTML = html
  document.body.appendChild(div)
  await act(async () => {
    hydrateRoot(div, ui)
  })
  const calls = err.mock.calls.map((c) => c.map(String).join(" ").slice(0, 300))
  err.mockRestore()
  div.remove()
  expect(calls).toEqual([])
}

export function expectDecorativeInk(container: ParentNode): void {
  for (const svg of getInkLayers(container)) {
    const hidden = svg.getAttribute("aria-hidden") === "true" || svg.closest("[aria-hidden=true]") !== null
    const named = svg.getAttribute("role") === "img" && !!svg.getAttribute("aria-label")
    expect(hidden || named, `${svg.getAttribute("data-ink")} svg must be aria-hidden or a named image`).toBe(true)
    expect(svg.querySelector("a,button,input,[tabindex]")).toBeNull()
  }
}

export function headingOutline(container: ParentNode): Array<[number, string]> {
  return Array.from(container.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => [Number(h.tagName[1]), (h.textContent ?? "").trim()])
}

const PHYSICAL = /^(?:ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|text-left|text-right|float-left|float-right)(?:-|$)/

export function expectLogicalClasses(container: ParentNode): void {
  const bad: string[] = []
  for (const el of Array.from(container.querySelectorAll("[class]"))) {
    if (el.closest("svg") || el.closest("[data-slot=kbd]")) continue
    for (const token of (el.getAttribute("class") ?? "").split(/\s+/)) {
      const bare = token.replace(/^!/, "").replace(/^(?:[^:\[]*(?:\[[^\]]*\])?[^:\[]*:)+/, "").replace(/!$/, "")
      if (PHYSICAL.test(bare)) bad.push(token)
    }
  }
  expect(bad).toEqual([])
}
