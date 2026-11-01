import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Controlled({ contentProps, moveOn }: { contentProps?: React.ComponentProps<typeof PopoverContent>; moveOn?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [went, setWent] = React.useState(false)
  React.useEffect(() => {
    if (went && !open) document.getElementById("elsewhere")?.focus()
  }, [went, open])
  return (
    <>
      <button onClick={() => setOpen(true)}>Share</button>
      <button id="elsewhere">Elsewhere</button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <span>anchor</span>
        </PopoverAnchor>
        <PopoverContent aria-label="Share" {...contentProps}>
          <Button
            onClick={() => {
              if (moveOn) setWent(true)
              setOpen(false)
            }}
          >
            Copy link
          </Button>
        </PopoverContent>
      </Popover>
    </>
  )
}

const share = () => screen.getByRole("button", { name: "Share" })

describe("a popover without a trigger", () => {
  it("gives the focus back to whoever opened it on Escape", async () => {
    const { user } = renderUI(<Controlled />, opts)
    await user.click(share())
    await screen.findByRole("dialog", { name: "Share" })
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(share()).toHaveFocus())
  })

  it("and after a choice made inside it", async () => {
    const { user } = renderUI(<Controlled />, opts)
    await user.click(share())
    await user.click(await screen.findByRole("button", { name: "Copy link" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(share()).toHaveFocus())
  })

  it("leaves the focus where the person clicked outside, on a control or on nothing", async () => {
    const { user } = renderUI(<Controlled />, opts)
    await user.click(share())
    await screen.findByRole("dialog")
    await user.click(screen.getByRole("button", { name: "Elsewhere" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await new Promise((r) => setTimeout(r, 30))
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus()

    await user.click(share())
    await screen.findByRole("dialog")
    await user.click(document.body)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await new Promise((r) => setTimeout(r, 30))
    expect(share()).not.toHaveFocus()
  })

  it("does not pull the focus back when the app moved it on while the popover was closing", async () => {
    const { user } = renderUI(<Controlled moveOn />, opts)
    await user.click(share())
    await user.click(await screen.findByRole("button", { name: "Copy link" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await new Promise((r) => setTimeout(r, 30))
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus()
    expect(share()).not.toHaveFocus()
  })

  it("respects a onCloseAutoFocus that prevents the default, and still calls the handlers you pass", async () => {
    const onOpenAutoFocus = vi.fn()
    const onInteractOutside = vi.fn()
    const onCloseAutoFocus = vi.fn((e: Event) => e.preventDefault())
    const { user } = renderUI(<Controlled contentProps={{ onOpenAutoFocus, onCloseAutoFocus, onInteractOutside }} />, opts)
    await user.click(share())
    await screen.findByRole("dialog")
    expect(onOpenAutoFocus).toHaveBeenCalledTimes(1)
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await new Promise((r) => setTimeout(r, 30))
    expect(onCloseAutoFocus).toHaveBeenCalledTimes(1)
    expect(share()).not.toHaveFocus()
    await user.click(share())
    await screen.findByRole("dialog")
    await user.click(screen.getByRole("button", { name: "Elsewhere" }))
    expect(onInteractOutside).toHaveBeenCalled()
  })
})

describe("a popover with a trigger", () => {
  it("still returns the focus to the trigger (Radix does; nothing is done twice)", async () => {
    const onCloseAutoFocus = vi.fn()
    const { user } = renderUI(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Share</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Share" onCloseAutoFocus={onCloseAutoFocus}>
          <Button>Copy link</Button>
        </PopoverContent>
      </Popover>,
      opts,
    )
    share().focus()
    await user.keyboard("{Enter}")
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(share()).toHaveFocus())
    expect(onCloseAutoFocus).toHaveBeenCalledTimes(1)
  })
})
