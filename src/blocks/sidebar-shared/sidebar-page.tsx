"use client"

import * as React from "react"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Handwritten } from "@/components/ui/handwritten"
import type { MascotPose } from "@/components/ui/mascot"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { InkTiles } from "@/lib/ink/react"
import { cn } from "@/lib/utils"

const SHEET = "ll-paper ll-stock-paper ll-tooth-cold"
const SHEET_TILES = ["fibre", "relief", "cloud"] as const
const STRIP = `${SHEET} [--ll-sheet-shadow:var(--ll-shadow-hair)]`

export function PageSheet({ className, children, ...props }: React.ComponentProps<typeof SidebarInset>) {
  return (
    <SidebarInset
      className={cn(
        SHEET,
        "before:block min-w-0 md:peer-data-[variant=floating]:m-2 md:peer-data-[variant=floating]:ms-0 md:peer-data-[variant=floating]:peer-data-[state=collapsed]:ms-2",
        className
      )}
      {...props}
    >
      <InkTiles tiles={SHEET_TILES} />
      {children}
    </SidebarInset>
  )
}

export interface Crumb {
  label: string
  href?: string
}

export function PageHeader({
  crumbs,
  bordered = false,
  sticky = false,
  trigger = "start",
  className,
  children,
}: {
  crumbs: (string | Crumb)[]
  bordered?: boolean
  sticky?: boolean
  trigger?: "start" | "end" | false
  className?: string
  children?: React.ReactNode
}) {
  const items = crumbs.map((c) => (typeof c === "string" ? { label: c } : c))
  const last = items.length - 1
  return (
    <header data-slot="page-header" className={cn("flex h-16 shrink-0 items-center gap-2 px-4 compact:h-14 calm:h-12", (bordered || sticky) && "relative overflow-x-clip", sticky && cn("sticky top-0 z-10", STRIP), className)}>
      {trigger === "start" ? (
        <>
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-2 data-[orientation=vertical]:h-4" />
        </>
      ) : null}
      <Breadcrumb className="min-w-0">
        <BreadcrumbList>
          {items.map((item, i) =>
            i === last ? (
              <BreadcrumbItem key={item.label} className="min-w-0">
                <BreadcrumbPage className="line-clamp-1">{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <React.Fragment key={item.label}>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={item.href ?? `#${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{item.label}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </React.Fragment>
            )
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {children ? <div className="ms-auto flex items-center gap-2">{children}</div> : null}
      {trigger === "end" ? <SidebarTrigger className="-me-1 ms-auto" /> : null}
      {bordered ? <Separator className="absolute inset-x-0 bottom-0 w-auto" /> : null}
    </header>
  )
}

export function PageBody({ title, kicker, className, children }: { title: string; kicker?: string; className?: string; children?: React.ReactNode }) {
  return (
    <div data-slot="page-body" className={cn("flex flex-1 flex-col gap-4 p-4 pt-2 md:px-8", className)}>
      <div>
        {kicker ? <p className="font-type text-sm tracking-wide text-ink-muted">{kicker}</p> : null}
        <h1 className="font-script text-3xl leading-tight font-semibold">{title}</h1>
      </div>
      {children}
    </div>
  )
}

export function PageNote({
  title,
  pose,
  doodle,
  className,
  children,
}: {
  title: string
  pose?: MascotPose
  doodle?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div data-slot="page-note" className={cn("flex flex-1 items-center justify-center", className)}>
      <Empty className="max-w-sm p-4 md:p-6">
        <EmptyHeader>
          {pose || doodle ? <EmptyMedia pose={pose} doodle={doodle} size={72} /> : null}
          <EmptyTitle className="text-2xl">{title}</EmptyTitle>
          {children ? (
            <EmptyDescription>
              <Handwritten as="span">{children}</Handwritten>
            </EmptyDescription>
          ) : null}
        </EmptyHeader>
      </Empty>
    </div>
  )
}
