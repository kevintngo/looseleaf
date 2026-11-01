import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

const opts = { user: { pointerEventsCheck: 0 } }

describe("Escape in stacked overlays", () => {
  it("a tooltip opened by keyboard focus inside a dialog closes first; the dialog closes on the next Escape", async () => {
    const { user } = renderUI(
      <TooltipProvider>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Change things.</DialogDescription>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Help</Button>
              </TooltipTrigger>
              <TooltipContent>Explains the setting</TooltipContent>
            </Tooltip>
          </DialogContent>
        </Dialog>
      </TooltipProvider>,
      opts,
    )
    await screen.findByRole("dialog")
    const help = screen.getByRole("button", { name: "Help" })
    await waitFor(() => expect(help).toHaveFocus())
    if (!screen.queryByRole("tooltip")) {
      await user.tab()
      await user.tab({ shift: true })
    }
    await screen.findByRole("tooltip")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull())
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(help).toHaveFocus()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("a popover opened from a trigger gives the focus back to it on Escape, and a tooltip on that trigger does not fight it", async () => {
    const { user } = renderUI(
      <TooltipProvider>
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="outline">Share</Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Share this page</TooltipContent>
          </Tooltip>
          <PopoverContent aria-label="Share">
            <Button>Copy link</Button>
          </PopoverContent>
        </Popover>
      </TooltipProvider>,
      opts,
    )
    const share = screen.getByRole("button", { name: "Share" })
    share.focus()
    await user.keyboard("{Enter}")
    const popover = await screen.findByRole("dialog", { name: "Share" })
    expect(popover).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Share" })).toBeNull())
    await waitFor(() => expect(share).toHaveFocus())
    expect(document.body).not.toHaveFocus()
  })
})
