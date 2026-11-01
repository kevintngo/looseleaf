"use client"

import * as React from "react"

import { SidebarLeft } from "@/blocks/sidebar-15/components/sidebar-15-sidebar-left"
import { SidebarRight } from "@/blocks/sidebar-15/components/sidebar-15-sidebar-right"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { formatDay } from "@/blocks/sidebar-shared/sidebar-data"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const START = new Date(2026, 8, 25)
const DEFAULT_VISIBLE = ["Personal", "Work", "Holidays"]

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  const [date, setDate] = React.useState(START)
  const [visible, setVisible] = React.useState(DEFAULT_VISIBLE)

  return (
    <SidebarProvider className={cn("overflow-clip", c.provider)}>
      <SidebarLeft className={c.sidebar} />
      <PageSheet className={c.inset}>
        <PageHeader crumbs={["Project plan & to-dos"]} sticky />
        <PageBody title="Project plan & to-dos" kicker={formatDay(date)}>
          <PageNote title="Two pads, one page" pose="carry">
            Notes on the left, your week on the right. <span className="max-lg:hidden">Pick a day in the month and the kicker above follows.</span>
            <span className="lg:hidden">Widen the window and the week pad opens.</span>
          </PageNote>
        </PageBody>
      </PageSheet>
      <SidebarRight contained={contained} date={date} onDateChange={setDate} visible={visible} onVisibleChange={setVisible} />
    </SidebarProvider>
  )
}
