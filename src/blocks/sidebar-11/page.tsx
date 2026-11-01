"use client"

import * as React from "react"

import { AppSidebar } from "@/blocks/sidebar-11/components/sidebar-11-app-sidebar"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  const [active, setActive] = React.useState("components/ui/button.tsx")
  const parts = active.split("/")
  const file = parts[parts.length - 1]!

  return (
    <SidebarProvider className={cn("overflow-x-clip", c.provider)}>
      <AppSidebar className={c.sidebar} active={active} onPick={setActive} />
      <PageSheet className={c.inset}>
        <PageHeader crumbs={parts} bordered />
        <PageBody title={file} kicker={parts.length > 1 ? parts.slice(0, -1).join(" / ") : "project root"}>
          <PageNote title="No editor here yet" pose="think">
            This is where {file} would open. Pick another file on the pad and the trail above follows you.
          </PageNote>
        </PageBody>
      </PageSheet>
    </SidebarProvider>
  )
}
