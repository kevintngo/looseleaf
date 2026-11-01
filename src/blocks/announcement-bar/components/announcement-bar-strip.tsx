"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Paper } from "@/components/ui/paper"
import { Ribbon } from "@/components/ui/ribbon"
import { Tape } from "@/components/ui/tape"
import { cn } from "@/lib/utils"

type AnnouncementBarStripProps = Omit<React.ComponentProps<"section">, "children"> & {
  label?: string
  message: React.ReactNode
  linkLabel?: string
  href?: string
  onDismiss?: () => void
}

function AnnouncementBarStrip({ className, label = "New", message, linkLabel = "Read the notes", href = "#announcement", onDismiss, ...props }: AnnouncementBarStripProps) {
  return (
    <div className="px-4 pt-6">
      <Paper
        as="section"
        stock="kraft"
        tilt={false}
        shadow="slip"
        aria-label="Announcement"
        data-slot="announcement-bar"
        className={cn("px-12 py-2.5", className)}
        {...props}
      >
        <Tape kind="washi-stripes" color="tangerine" length={52} height={18} angle={-32} className="absolute -top-2.5 -start-3 rtl:rotate-[32deg]!" />
        <Tape kind="washi-stripes" color="tangerine" length={52} height={18} angle={32} className="absolute -top-2.5 -end-3 rtl:rotate-[-32deg]!" />
        <div className="relative z-(--ll-z-raised) flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[15px] leading-6 text-ink">
          <Ribbon variant="flag" tone="hi" size="sm">
            {label}
          </Ribbon>
          <p className="text-balance">{message}</p>
          <Button asChild variant="link" size="sm" className="text-link-hover hover:text-ink">
            <a href={href}>
              {linkLabel}
              <Icon name="arrow-right" className="rtl:-scale-x-100" />
            </a>
          </Button>
        </div>
        {onDismiss ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Dismiss announcement"
            onClick={onDismiss}
            className="absolute inset-y-0 end-2 z-(--ll-z-raised) my-auto"
          >
            <Icon name="x" />
          </Button>
        ) : null}
      </Paper>
    </div>
  )
}

export { AnnouncementBarStrip }
export type { AnnouncementBarStripProps }
