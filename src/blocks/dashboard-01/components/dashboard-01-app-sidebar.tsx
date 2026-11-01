"use client"

import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { user } from "@/blocks/dashboard-01/components/dashboard-01-data"

const navMain = [
  { title: "Dashboard", icon: "layout-dashboard", active: true },
  { title: "Lifecycle", icon: "list" },
  { title: "Analytics", icon: "chart-column" },
  { title: "Projects", icon: "folder" },
  { title: "Team", icon: "users" },
]

const documents = [
  { name: "Data library", icon: "archive" },
  { name: "Reports", icon: "file-text" },
  { name: "Writing helper", icon: "bot" },
]

const navSecondary = [
  { title: "Settings", icon: "settings" },
  { title: "Get help", icon: "life-buoy" },
  { title: "Search", icon: "search" },
]

function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Button className="min-w-0 flex-1 justify-start">
              <Icon name="circle-plus" />
              Quick create
            </Button>
            <Button size="icon" variant="outline" className="shrink-0">
              <Icon name="mail" />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <nav aria-label="Main">
          <SidebarMenu>
            {navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton isActive={item.active} aria-current={item.active ? "page" : undefined}>
                  <Icon name={item.icon} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavDocuments() {
  const { isMobile } = useSidebar()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {documents.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton>
              <Icon name={item.icon} />
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover aria-label={`More for ${item.name}`}>
                  <Icon name="ellipsis" />
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" side={isMobile ? "bottom" : "right"} align={isMobile ? "end" : "start"}>
                <DropdownMenuItem>
                  <Icon name="folder-open" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="share" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Icon name="trash" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/80">
            <Icon name="ellipsis" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavSecondary({ className }: { className?: string }) {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <nav aria-label="Secondary">
          <SidebarMenu>
            {navSecondary.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton>
                  <Icon name={item.icon} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavUser() {
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar aria-hidden="true">
                <AvatarFallback name={user.name} />
              </Avatar>
              <span className="grid flex-1 text-start leading-tight">
                <span className="truncate font-bold">{user.name}</span>
                <span className="truncate text-sm text-muted-foreground">{user.email}</span>
              </span>
              <Icon name="ellipsis-vertical" className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon name="circle-user" />
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

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" className={className} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="grid size-8 shrink-0 place-items-center bg-marker/80 text-ink">
                <Icon name="pencil" />
              </span>
              <span className="grid flex-1 text-start leading-tight">
                <span className="truncate font-script text-xl font-semibold">Inkwell &amp; Co.</span>
                <span className="truncate text-sm text-muted-foreground">Proposal desk</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavDocuments />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
