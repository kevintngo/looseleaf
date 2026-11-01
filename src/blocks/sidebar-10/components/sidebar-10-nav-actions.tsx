"use client"

import * as React from "react"

import { pageActions } from "@/blocks/sidebar-shared/sidebar-data"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function NavActions({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [starred, setStarred] = React.useState(false)
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-hand text-muted-foreground md:inline-block">Edited just now</div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-pressed={starred}
        aria-label={starred ? "Remove from favorites" : "Add to favorites"}
        onClick={() => setStarred((value) => !value)}
      >
        <Icon name="star" tone={starred ? "doodle" : "ui"} />
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="More actions" className="data-[state=open]:ll-swipe">
            <Icon name="ellipsis" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="end" tilt={false} aria-label="Page actions">
          {pageActions.map((group, index) => (
            <SidebarGroup key={index} className="border-b border-sidebar-border last:border-none">
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton onClick={() => setOpen(false)}>
                        <Icon name={item.icon} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}
