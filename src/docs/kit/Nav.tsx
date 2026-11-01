import { createContext, useContext, useId, type ReactNode } from "react"
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar"
import { Link } from "../core/router"
import { cn } from "@/lib/utils"

const NestedContext = createContext(false)

export interface NavItemProps {
  to: string
  active?: boolean
  count?: number
  className?: string
  children: ReactNode
}

export function NavItem({ to, active, count, className, children }: NavItemProps) {
  const nested = useContext(NestedContext)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!active} size={nested ? "sm" : "default"} className={cn(count !== undefined && "pe-9", className)}>
        <Link to={to} aria-current={active ? "page" : undefined}>
          <span>{children}</span>
        </Link>
      </SidebarMenuButton>
      {count !== undefined ? <SidebarMenuBadge>{count}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  )
}

export interface NavGroupProps {
  label: string
  count?: number
  open: boolean
  onToggle: () => void
  containsActive?: boolean
  children: ReactNode
}

export function NavGroup({ label, count, open, onToggle, containsActive, children }: NavGroupProps) {
  return (
    <Collapsible asChild open={open} onOpenChange={() => onToggle()}>
      <SidebarMenuItem data-contains-active={containsActive || undefined}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className={cn("pe-9", containsActive && "font-bold")}>
            <CollapsibleIndicator size={14} className="-rotate-90 group-data-[state=open]/collapsible-trigger:rotate-0" />
            <span>{label}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {count !== undefined ? <SidebarMenuBadge>{count}</SidebarMenuBadge> : null}
        <CollapsibleContent>
          <NestedContext value>
            <SidebarMenuSub>{children}</SidebarMenuSub>
          </NestedContext>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export interface NavSectionProps {
  label: string
  to?: string
  active?: boolean
  count?: number
  children: ReactNode
}

export function NavSection({ label, to, active, count, children }: NavSectionProps) {
  const id = useId()
  return (
    <SidebarGroup>
      <SidebarGroupLabel id={id} className="justify-between pe-1">
        {to ? (
          <Link
            to={to}
            aria-current={active ? "page" : undefined}
            className="ll-ink-room -mx-1 px-1 hover:ll-swipe hover:text-ink aria-[current=page]:font-bold aria-[current=page]:text-ink"
          >
            {label}
          </Link>
        ) : (
          <span>{label}</span>
        )}
        {count !== undefined ? <span className="ll-num font-script text-xl leading-none font-semibold text-ink-you">{count}</span> : null}
      </SidebarGroupLabel>
      <SidebarMenu aria-labelledby={id}>{children}</SidebarMenu>
    </SidebarGroup>
  )
}
