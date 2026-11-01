import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { opts, screen, useBlockHarness } from "./_blocks-sidebar"
import { axeCheck, renderUI } from "./helpers"

const previews = import.meta.glob<{ default: React.ComponentType }>("/src/docs/content/blocks/sidebar-*.tsx", { eager: true })
const names = Object.keys(previews)
  .map((path) => /sidebar-[a-z0-9]+(?=\.tsx$)/.exec(path)![0])
  .sort()

describe("sidebar block previews (docs)", () => {
  useBlockHarness()

  it("has a preview for each of the sixteen blocks and for the shared parts", () => {
    const expected = Array.from({ length: 16 }, (_, i) => `sidebar-${String(i + 1).padStart(2, "0")}`)
    expect(names).toEqual([...expected, "sidebar-shared"])
  })

  for (const name of ["sidebar-01", "sidebar-04", "sidebar-07", "sidebar-08", "sidebar-09", "sidebar-12", "sidebar-13", "sidebar-15", "sidebar-16", "sidebar-shared"]) {
    it(`${name}: mounts in the desk frame, contained, without a console error`, async () => {
      const Preview = previews[`/src/docs/content/blocks/${name}.tsx`]!.default
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      const { container } = renderUI(<Preview />, opts)
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      const frame = container.querySelector('[data-slot="desk"]')!
      expect(frame).toHaveClass("overflow-hidden", "[transform:translateZ(0)]")
      expect(frame.querySelector('[data-slot="sidebar-wrapper"]')).toHaveClass("h-full", "min-h-0")
      expect(screen.getAllByRole("main")).toHaveLength(1)
      await axeCheck(container)
    })
  }
})
