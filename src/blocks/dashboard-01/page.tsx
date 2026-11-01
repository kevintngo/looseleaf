import * as React from "react"

import { AppSidebar } from "@/blocks/dashboard-01/components/dashboard-01-app-sidebar"
import { ChartAreaInteractive } from "@/blocks/dashboard-01/components/dashboard-01-chart-area-interactive"
import { DataTable } from "@/blocks/dashboard-01/components/dashboard-01-data-table"
import { sections } from "@/blocks/dashboard-01/components/dashboard-01-data"
import { SectionCards } from "@/blocks/dashboard-01/components/dashboard-01-section-cards"
import { SiteHeader } from "@/blocks/dashboard-01/components/dashboard-01-site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { InkTiles } from "@/lib/ink/react"
import { cn } from "@/lib/utils"

const SHEET = "ll-paper ll-stock-paper ll-tooth-cold before:block min-w-0"
const SHEET_TILES = ["fibre", "relief", "cloud"] as const

export default function Page({ contained = false }: { contained?: boolean }) {
  return (
    <SidebarProvider
      className={cn(contained && "h-full min-h-0")}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" className={cn(contained && "h-full")} />
      <SidebarInset className={SHEET}>
        <InkTiles tiles={SHEET_TILES} />
        <div className={cn("flex flex-1 flex-col", contained && "min-h-0 overflow-x-clip overflow-y-auto")}>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={sections} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
