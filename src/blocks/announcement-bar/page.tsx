"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { AnnouncementBarHeader } from "@/blocks/announcement-bar/components/announcement-bar-header"
import { AnnouncementBarStrip } from "@/blocks/announcement-bar/components/announcement-bar-strip"

export default function AnnouncementBarBlock() {
  const [open, setOpen] = React.useState(true)
  const strip = React.useRef<HTMLElement>(null)
  const bringBack = React.useRef<HTMLButtonElement>(null)
  const handOver = React.useRef(false)
  React.useEffect(() => {
    if (!handOver.current) return
    handOver.current = false
    if (open) strip.current?.focus()
    else bringBack.current?.focus()
  }, [open])
  const toggle = (next: boolean) => {
    handOver.current = true
    setOpen(next)
  }

  return (
    <div className="@container w-full">
      {open ? (
        <AnnouncementBarStrip
          ref={strip}
          tabIndex={-1}
          message="Penmark 2.0 is here: tape you can peel, and pages that turn."
          linkLabel="Read the notes"
          href="#notes"
          onDismiss={() => toggle(false)}
          className="outline-none"
        />
      ) : (
        <div className="flex justify-center px-3 pt-3">
          <Button ref={bringBack} type="button" variant="link" size="sm" onClick={() => toggle(true)}>
            Bring the announcement back
          </Button>
        </div>
      )}
      <AnnouncementBarHeader />
    </div>
  )
}
