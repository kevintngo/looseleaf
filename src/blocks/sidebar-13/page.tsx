"use client"

import * as React from "react"

import { AppSidebar } from "@/blocks/sidebar-13/components/sidebar-13-app-sidebar"
import { SettingsDialog } from "@/blocks/sidebar-13/components/sidebar-13-settings-dialog"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  const [open, setOpen] = React.useState(false)
  const opener = React.useRef<HTMLElement | null>(null)
  const openSettings = (from: HTMLElement) => {
    opener.current = from
    setOpen(true)
  }

  return (
    <SidebarProvider className={cn("overflow-x-clip", c.provider)}>
      <AppSidebar className={c.sidebar} onOpenSettings={openSettings} />
      <PageSheet className={c.inset}>
        <PageHeader crumbs={["Notes", "Untitled"]} bordered>
          <Button variant="outline" size="sm" aria-haspopup="dialog" onClick={(event) => openSettings(event.currentTarget)}>
            <Icon name="settings" />
            Settings
          </Button>
        </PageHeader>
        <PageBody title="Untitled" kicker="Notes">
          <PageNote title="Settings live in a drawer of their own" pose="point">
            Open them from the pad or from the button in the corner. Everything you change is kept while you write.
          </PageNote>
        </PageBody>
      </PageSheet>
      <SettingsDialog
        open={open}
        onOpenChange={setOpen}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          opener.current?.focus()
        }}
      />
    </SidebarProvider>
  )
}
