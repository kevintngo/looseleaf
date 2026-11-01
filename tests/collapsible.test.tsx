import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/ui/collapsible"
import { InkProvider } from "@/lib/ink/react"
import Repositories from "@/docs/examples/collapsible/01-repositories"
import Bracket from "@/docs/examples/collapsible/02-bracket"
import ShowMore from "@/docs/examples/collapsible/03-show-more"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 60)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

function Sample(props: React.ComponentProps<typeof Collapsible> & { bracket?: "curly" | "square" | false }) {
  const { bracket, ...rest } = props
  return (
    <Collapsible {...rest}>
      <CollapsibleTrigger>Details</CollapsibleTrigger>
      <CollapsibleContent bracket={bracket}>Folded text</CollapsibleContent>
    </Collapsible>
  )
}

describe("Collapsible", () => {
  it("has upstream's three parts with their data-slots", () => {
    const { container } = render(<Sample defaultOpen />)
    for (const slot of ["collapsible", "collapsible-trigger", "collapsible-content"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
  })

  it("toggles with the mouse, Enter and Space, and tells assistive technology", async () => {
    const { user, getByRole, queryByText } = renderUI(<Sample />)
    const trigger = getByRole("button", { name: "Details" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(queryByText("Folded text")).toBeNull()
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(queryByText("Folded text")).not.toBeNull()
    expect(trigger).toHaveAttribute("aria-controls", queryByText("Folded text")!.closest("[data-slot=collapsible-content]")!.id)
    trigger.focus()
    await user.keyboard("{Enter}")
    expect(queryByText("Folded text")).toBeNull()
    await user.keyboard(" ")
    expect(queryByText("Folded text")).not.toBeNull()
  })

  it("is controlled and uncontrolled, and can be disabled", async () => {
    const seen: boolean[] = []
    function C() {
      const [open, setOpen] = React.useState(true)
      return <Sample open={open} onOpenChange={(o) => (seen.push(o), setOpen(o))} />
    }
    const c = renderUI(<C />)
    await c.user.click(c.getByRole("button", { name: "Details" }))
    expect(seen).toEqual([false])
    c.unmount()
    const d = renderUI(<Sample disabled />)
    expect(d.getByRole("button", { name: "Details" })).toBeDisabled()
  })

  it("slides with its own keyframes, clipped only while it slides, so rings inside an open panel are whole", () => {
    const { container } = render(<Sample defaultOpen />)
    const panel = container.querySelector("[data-slot=collapsible-content]")!
    expect(panel).not.toHaveClass("overflow-hidden")
    expect(panel.className).toContain("data-[state=open]:animate-[ll-collapsible-down_")
    expect(panel.className).toContain("data-[state=closed]:animate-[ll-collapsible-up_")
    const sheet = document.head.querySelector('style[data-href="ll-collapsible"]')!.textContent!
    expect(sheet).toContain("@keyframes ll-collapsible-up")
    expect(sheet).toContain("--radix-collapsible-content-height")
    expect(panel.querySelector("svg, [data-slot=collapsible-bracket]")).toBeNull()
    expect(panel.textContent).toBe("Folded text")
  })

  it("bracket draws a margin brace on a decorative host and lets the text soak in", () => {
    for (const bracket of ["curly", "square"] as const) {
      const { container, unmount } = render(<Sample defaultOpen bracket={bracket} />)
      const brace = container.querySelector("[data-slot=collapsible-bracket]")!
      expect(brace).toHaveAttribute("aria-hidden", "true")
      expect(brace.querySelector('svg[data-ink="bracket"]')).not.toBeNull()
      expect(brace.parentElement).toHaveClass("ps-5")
      expect(brace.parentElement!.className).toContain("animate-soak")
      unmount()
    }
  })

  it("is marked touched by a click, so a brace is only written on a panel a person opened", async () => {
    const { user, container, getByRole } = renderUI(<Sample defaultOpen bracket="curly" />)
    const root = container.querySelector("[data-slot=collapsible]")!
    expect(root).not.toHaveAttribute("data-touched")
    await user.click(getByRole("button", { name: "Details" }))
    expect(root).toHaveAttribute("data-touched")
  })

  it("the indicator turns over with the Collapsible's state", () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          Details <CollapsibleIndicator />
        </CollapsibleTrigger>
      </Collapsible>,
    )
    const ind = container.querySelector("[data-slot=collapsible-indicator]")!
    expect(ind).toHaveAttribute("data-icon", "chevron-down")
    expect(ind.getAttribute("class")).toContain("group-data-[state=open]/collapsible-trigger:rotate-180")
    expect(container.querySelector("[data-slot=collapsible-trigger]")).toHaveClass("group/collapsible-trigger")
    expect(container.querySelector("[data-slot=collapsible]")).toHaveClass("group/collapsible")
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<Sample defaultOpen bracket="curly" />)
    await axeCheck(container)
  })

  it("renders identical markup twice and hydrates cleanly", () => {
    expect(renderToString(<Sample defaultOpen bracket="curly" />)).toBe(renderToString(<Sample defaultOpen bracket="curly" />))
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      const ui = wrap(<Sample defaultOpen bracket="curly" />)
      const container = document.createElement("div")
      document.body.appendChild(container)
      container.innerHTML = renderToString(ui)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("examples", () => {
  it("Starred repositories reveals two more items", async () => {
    const { user, getByRole, queryByText } = renderUI(<Repositories />)
    expect(queryByText("shadcn-ui/ui")).toBeNull()
    await user.click(getByRole("button", { name: "Toggle" }))
    expect(queryByText("shadcn-ui/ui")).not.toBeNull()
    await axeCheck()
  })

  it("Margin bracket starts open and folds", async () => {
    const { user, getByRole, container } = renderUI(<Bracket />)
    expect(container.querySelector("[data-slot=collapsible-bracket]")).not.toBeNull()
    await user.click(getByRole("button", { name: /What is in the box/ }))
    expect(container.querySelector("[data-slot=collapsible-bracket]")).toBeNull()
    await axeCheck()
  })

  it("Show more counts what is folded and says what it will do", async () => {
    const { user, getByRole, queryByText } = renderUI(<ShowMore />)
    expect(getByRole("button", { name: /Show 4 more/ })).toBeTruthy()
    expect(queryByText("Bird by Bird")).toBeNull()
    await user.click(getByRole("button", { name: /Show 4 more/ }))
    expect(getByRole("button", { name: /Show fewer/ })).toBeTruthy()
    expect(queryByText("Bird by Bird")).not.toBeNull()
    await axeCheck()
  })
})
