"use client"

import type { Person } from "@/blocks/sidebar-shared/sidebar-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

function Face({ user }: { user: Person }) {
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <Avatar aria-hidden="true" className="size-8">
      <AvatarFallback tone="sky">{initials}</AvatarFallback>
    </Avatar>
  )
}

function Who({ user }: { user: Person }) {
  return (
    <span className="grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
      <span className="truncate font-bold">{user.name}</span>{" "}
      <span className="truncate text-sm text-muted-foreground">{user.email}</span>
    </span>
  )
}

export function NavUser({ user, align = "end", iconOnly = false }: { user: Person; align?: "start" | "end"; iconOnly?: boolean }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {iconOnly ? (
              <SidebarMenuButton tooltip={isMobile ? undefined : user.name} aria-label={user.name} className="h-8 justify-center p-0 data-[state=open]:ll-swipe">
                <Face user={user} />
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton size="lg" tooltip={isMobile ? undefined : user.name} className="data-[state=open]:ll-swipe">
                <Face user={user} />
                <Who user={user} />
                <Icon name="chevrons-up-down" className="ms-auto group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56" side={isMobile ? "bottom" : "right"} align={align} sideOffset={4}>
            <DropdownMenuLabel className="flex items-center gap-2 py-1.5 font-normal">
              <Face user={user} />
              <Who user={user} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon name="sparkles" />
                Upgrade to Studio
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon name="badge-check" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="credit-card" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="bell" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icon name="log-out" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
