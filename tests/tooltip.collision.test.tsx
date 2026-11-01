import * as React from "react"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 32)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

function Demo({ content }: { content?: React.ComponentProps<typeof TooltipContent> }) {
  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent {...content}>Add to library</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

describe("Tooltip collision padding", () => {
  it("keeps 8 px between the note and the window edge by default, and lets you change it", async () => {
    const rect = (x: number, y: number, w: number, h: number) => ({ x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, toJSON: () => ({}) }) as DOMRect
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      if (this.matches("[data-radix-popper-content-wrapper], [data-slot=tooltip-content]")) return rect(0, 0, 120, 32)
      if (this.matches("[data-slot=tooltip-trigger]")) return rect(0, 100, 30, 36)
      return rect(0, 0, 0, 0)
    })
    const wide = vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1024)
    const high = vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(768)
    const left = async (content?: React.ComponentProps<typeof TooltipContent>) => {
      const { unmount } = renderUI(<Demo content={content} />)
      const wrapper = (await screen.findAllByRole("tooltip"))[0].closest<HTMLElement>("[data-radix-popper-content-wrapper]")!
      await waitFor(() => expect(wrapper.style.transform).toMatch(/^translate\(/))
      const x = parseFloat(wrapper.style.transform.slice("translate(".length))
      unmount()
      cleanup()
      return x
    }
    try {
      expect(await left({ collisionPadding: 0 })).toBe(0)
      expect(await left()).toBe(8)
      expect(await left({ collisionPadding: 20 })).toBe(20)
    } finally {
      spy.mockRestore()
      wide.mockRestore()
      high.mockRestore()
    }
  })
})
