"use client"

import type { NavSection } from "@/blocks/sidebar-shared/sidebar-data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

export function NavMain({ items }: { items: NavSection[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((section) => {
          const holdsCurrent = section.items.some((item) => item.isActive)
          return (
            <SidebarMenuItem key={section.title}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton isActive={holdsCurrent} aria-current={holdsCurrent ? "true" : undefined} className="data-[state=open]:ll-swipe">
                    {section.title}
                    <Icon name="ellipsis" className="ms-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                {section.items.length ? (
                  <DropdownMenuContent side={isMobile ? "bottom" : "right"} align={isMobile ? "end" : "start"} className="min-w-56">
                    {section.items.map((item) => (
                      <DropdownMenuItem asChild key={item.title}>
                        <a href={item.url} aria-current={item.isActive ? "page" : undefined} className={item.isActive ? "font-bold" : undefined}>
                          {item.title}
                          {item.isActive ? <Icon name="check" className="ms-auto" /> : null}
                        </a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                ) : null}
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
