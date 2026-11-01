"use client"

import * as React from "react"

import type { CalendarGroup } from "@/blocks/sidebar-shared/sidebar-data"
import { Calendar } from "@/components/ui/calendar"
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Icon } from "@/components/ui/icon"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function DatePicker({ selected, onSelect, defaultMonth }: { selected?: Date; onSelect?: (date: Date | undefined) => void; defaultMonth?: Date }) {
  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          required={false}
          selected={selected}
          onSelect={onSelect}
          defaultMonth={defaultMonth ?? selected}
          className="mx-auto p-0 [--cell:2rem] compact:[--cell:1.875rem]"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function Calendars({ groups, value, onValueChange }: { groups: CalendarGroup[]; value: string[]; onValueChange: (next: string[]) => void }) {
  const toggle = (name: string) => onValueChange(value.includes(name) ? value.filter((v) => v !== name) : [...value, name])

  return (
    <>
      {groups.map((group, index) => (
        <React.Fragment key={group.name}>
          <SidebarGroup className="py-0">
            <Collapsible defaultOpen={index === 0}>
              <SidebarGroupLabel asChild className="w-full text-sm text-sidebar-foreground hover:ll-swipe focus-visible:ll-swipe">
                <CollapsibleTrigger>
                  {group.name}
                  <CollapsibleIndicator className="ms-auto" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const on = value.includes(item.name)
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton role="checkbox" aria-checked={on} onClick={() => toggle(item.name)}>
                            <Icon name={on ? "square-check" : "square"} className={cn(item.tone, !on && "opacity-70")} />
                            <span>{item.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          <SidebarSeparator className="mx-0" />
        </React.Fragment>
      ))}
    </>
  )
}
