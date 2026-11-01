"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const canMatchMedia = typeof window !== "undefined" && typeof window.matchMedia === "function"

const PanelContext = React.createContext<{ open: boolean } | null>(null)

function FakePanel({ className, open = false, ...props }: React.ComponentProps<"section"> & { open?: boolean }) {
  return (
    <PanelContext.Provider value={{ open }}>
      <section data-slot="fake-panel" data-open={open} data-motion={canMatchMedia ? "auto" : "static"} className={cn("group/panel relative", className)} {...props} />
    </PanelContext.Provider>
  )
}

function FakePanelBody({ className, ...props }: React.ComponentProps<"div">) {
  const ctx = React.useContext(PanelContext)
  return <div data-slot="fake-panel-body" hidden={!ctx?.open} className={cn("group-data-[open=true]/panel:block", className)} {...props} />
}

export { FakePanel, FakePanelBody }
