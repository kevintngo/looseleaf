import * as React from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { ScrollArea } from "@/components/ui/scroll-area"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 120)
})
afterEach(() => restore())

const viewport = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!

describe("ScrollArea content wrapper", () => {
  it("is a block, not Radix's table, when the area scrolls down only (the default)", () => {
    const { container } = renderUI(
      <ScrollArea className="h-24">
        <p className="truncate">A title that is far too long for the pad it is in and must be cut with an ellipsis, not push the pad open</p>
      </ScrollArea>,
    )
    expect(viewport(container).className).toContain("[&>div]:block!")
    const wrapper = viewport(container).firstElementChild as HTMLElement
    expect(wrapper.tagName).toBe("DIV")
    expect(wrapper.style.display).toBe("table")
  })

  it("keeps the table when it scrolls sideways", () => {
    for (const orientation of ["horizontal", "both"] as const) {
      const { container, unmount } = renderUI(
        <ScrollArea orientation={orientation} className="h-24 w-40">
          <div className="flex gap-4">
            <span>one</span>
            <span>two</span>
          </div>
        </ScrollArea>,
      )
      expect(viewport(container).className).not.toContain("[&>div]:block!")
      unmount()
    }
  })
})
