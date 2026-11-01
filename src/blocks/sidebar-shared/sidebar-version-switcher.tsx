"use client"

import * as React from "react"

import { BrandTile, BrandText } from "@/blocks/sidebar-shared/sidebar-brand"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function VersionSwitcher({ versions, defaultVersion, title = "Field guide", icon = "book-open" }: { versions: string[]; defaultVersion: string; title?: string; icon?: string }) {
  const [selected, setSelected] = React.useState(defaultVersion)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:ll-swipe">
              <BrandTile icon={icon} />
              <BrandText title={title} subtitle={`v${selected}`} />
              <Icon name="chevrons-up-down" className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
            <DropdownMenuLabel>Editions</DropdownMenuLabel>
            {versions.map((version) => (
              <DropdownMenuItem key={version} onSelect={() => setSelected(version)}>
                v{version}
                {version === selected ? <Icon name="check" className="ms-auto" label="Current edition" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
