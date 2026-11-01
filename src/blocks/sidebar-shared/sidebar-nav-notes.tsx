"use client"

import type { AppNavItem, NotesPage, NotesWorkspace } from "@/blocks/sidebar-shared/sidebar-data"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavLinks({ items }: { items: AppNavItem[] }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive} className="group-has-data-[sidebar=menu-badge]/menu-item:pe-8">
            <a href={item.url}>
              <Icon name={item.icon} />
              <span className="truncate">{item.title}</span>
            </a>
          </SidebarMenuButton>
          {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

export function NavFavorites({ favorites }: { favorites: NotesPage[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        {favorites.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url} title={item.name}>
                <Icon name={item.icon} />
                <span className="truncate">{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover aria-label={`Actions for ${item.name}`}>
                  <Icon name="ellipsis" />
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side={isMobile ? "bottom" : "right"} align={isMobile ? "end" : "start"}>
                <DropdownMenuItem>
                  <Icon name="star" />
                  <span>Remove from favorites</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Icon name="link" />
                  <span>Copy link</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="arrow-up-right" />
                  <span>Open in new tab</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Icon name="trash" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-ink-soft">
            <Icon name="ellipsis" />
            <span className="truncate">More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function NavWorkspaces({ workspaces }: { workspaces: NotesWorkspace[] }) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {workspaces.map((workspace) => (
            <Collapsible key={workspace.name} asChild>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={`#${workspace.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Icon name={workspace.icon} />
                    <span className="truncate">{workspace.name}</span>
                  </a>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction showOnHover className="start-1 bg-sidebar data-[state=open]:rotate-90 rtl:data-[state=open]:-rotate-90">
                    <Icon name="chevron-right" />
                    <span className="sr-only">Show pages in {workspace.name}</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <SidebarMenuAction showOnHover aria-label={`Add a page to ${workspace.name}`}>
                  <Icon name="plus" />
                </SidebarMenuAction>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {workspace.pages.map((page) => (
                      <SidebarMenuSubItem key={page.name}>
                        <SidebarMenuSubButton asChild>
                          <a href={page.url}>
                            <Icon name={page.icon} />
                            <span className="truncate">{page.name}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-ink-soft">
              <Icon name="ellipsis" />
              <span className="truncate">More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
