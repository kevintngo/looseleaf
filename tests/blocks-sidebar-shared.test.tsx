import * as React from "react"
import { describe, expect, it } from "vitest"

import { PageBody, PageHeader, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar"
import { opts, useBlockHarness } from "./_blocks-sidebar"
import { renderUI } from "./helpers"

function Shell({ variant = "sidebar", children }: { variant?: "sidebar" | "floating" | "inset"; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar variant={variant}>
        <SidebarContent />
      </Sidebar>
      {children}
    </SidebarProvider>
  )
}

describe("sidebar-shared PageHeader", () => {
  useBlockHarness()

  it("a bordered header clips its rule's 12 px of drawing box along x (overflow-x-clip), so the page cannot scroll sideways; y stays visible for the bleed and the strip's shadow", () => {
    const { container } = renderUI(
      <Shell>
        <PageSheet>
          <PageHeader crumbs={["Docs", "Margins"]} bordered />
        </PageSheet>
      </Shell>,
      opts
    )
    const header = container.querySelector<HTMLElement>('[data-slot="page-header"]')!
    expect(header).toHaveClass("relative", "overflow-x-clip")
    expect(header.className).not.toMatch(/(^|\s)overflow-(hidden|clip|auto)(\s|$)/)
    const rule = header.querySelector<HTMLElement>(':scope > [data-slot="separator"][data-orientation="horizontal"]')!
    expect(rule).toHaveClass("absolute", "inset-x-0", "bottom-0", "data-[orientation=horizontal]:overflow-x-clip")
  })

  it("a sticky header is clipped too (it is a strip of paper with a rule of its own), and a plain one has nothing to clip", () => {
    const { container, rerender } = renderUI(
      <Shell>
        <PageSheet>
          <PageHeader crumbs={["Docs", "Margins"]} sticky />
        </PageSheet>
      </Shell>,
      opts
    )
    const header = () => container.querySelector<HTMLElement>('[data-slot="page-header"]')!
    expect(header()).toHaveClass("sticky", "top-0", "ll-paper", "overflow-x-clip")
    rerender(
      <Shell>
        <PageSheet>
          <PageHeader crumbs={["Docs", "Margins"]} />
        </PageSheet>
      </Shell>
    )
    expect(header()).not.toHaveClass("overflow-x-clip")
    expect(header().querySelector('[data-slot="separator"][data-orientation="horizontal"]')).toBeNull()
  })

  it("a block's own className still lands after the defaults (they merge harmlessly with a local overflow-x-clip)", () => {
    const { container } = renderUI(
      <Shell>
        <PageSheet>
          <PageHeader crumbs={["Docs", "Margins"]} bordered className="overflow-x-clip px-6" />
        </PageSheet>
      </Shell>,
      opts
    )
    expect(container.querySelector('[data-slot="page-header"]')).toHaveClass("overflow-x-clip", "px-6")
  })
})

describe("sidebar-shared PageSheet", () => {
  useBlockHarness()

  it.each(["sidebar", "floating", "inset"] as const)("is a sheet of paper beside a %s pad: SidebarInset switches its own sheet off there, so the page turns it back on", (variant) => {
    const { container } = renderUI(
      <Shell variant={variant}>
        <PageSheet>
          <PageBody title="Margins" />
        </PageSheet>
      </Shell>,
      opts
    )
    const page = container.querySelector<HTMLElement>('[data-slot="sidebar-inset"]')!
    expect(page).toHaveClass("ll-paper", "ll-stock-paper", "ll-tooth-cold", "before:block")
    expect(page).not.toHaveClass("before:hidden")
  })
})
