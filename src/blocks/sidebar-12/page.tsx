"use client"

import * as React from "react"

import { AppSidebar } from "@/blocks/sidebar-12/components/sidebar-12-app-sidebar"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { calendarGroups, formatDay, formatMonth } from "@/blocks/sidebar-shared/sidebar-data"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const START = new Date(2026, 8, 25)
const ALL = calendarGroups.flatMap((group) => group.items.map((item) => item.name))
const DEFAULT_VISIBLE = ["Personal", "Work", "Holidays"]

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  const [date, setDate] = React.useState(START)
  const [visible, setVisible] = React.useState(DEFAULT_VISIBLE)

  return (
    <SidebarProvider className={cn("overflow-x-clip", c.provider)}>
      <AppSidebar className={c.sidebar} date={date} onDateChange={setDate} visible={visible} onVisibleChange={setVisible} />
      <PageSheet className={c.inset}>
        <PageHeader crumbs={[formatMonth(date)]} sticky bordered />
        <PageBody title={formatDay(date)} kicker="Calendar">
          <PageNote title="A quiet day" pose="sleep">
            Nothing pencilled in. Showing {visible.length} of {ALL.length} calendars, so it may be busier elsewhere.
          </PageNote>
        </PageBody>
      </PageSheet>
    </SidebarProvider>
  )
}
