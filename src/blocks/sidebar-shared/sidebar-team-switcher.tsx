"use client"

import * as React from "react"

import { BrandTile, BrandText } from "@/blocks/sidebar-shared/sidebar-brand"
import type { Team } from "@/blocks/sidebar-shared/sidebar-data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

export function TeamSwitcher({ teams, compact = false }: { teams: Team[]; compact?: boolean }) {
  const { isMobile } = useSidebar()
  const [activeName, setActiveName] = React.useState(teams[0]?.name)
  const active = teams.find((team) => team.name === activeName) ?? teams[0]
  if (!active) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {compact ? (
              <SidebarMenuButton className="w-fit px-1.5 data-[state=open]:ll-swipe" aria-label={`Team: ${active.name}`}>
                <BrandTile icon={active.icon} small />
                <span className="truncate font-bold">{active.name}</span>
                <Icon name="chevron-down" className="opacity-60" />
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton size="lg" tooltip={isMobile ? undefined : active.name} className="data-[state=open]:ll-swipe">
                <BrandTile icon={active.icon} />
                <BrandText title={active.name} subtitle={active.plan} />
                <Icon name="chevrons-up-down" className="ms-auto group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={compact ? "w-64" : "w-(--radix-dropdown-menu-trigger-width) min-w-56"}
            align="start"
            side={compact || isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel>Teams</DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem key={team.name} onSelect={() => setActiveName(team.name)}>
                <Icon name={team.icon} />
                {team.name}
                {team.name === active.name ? <Icon name="check" className="ms-auto" label="Current team" /> : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icon name="plus" />
              Add team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
