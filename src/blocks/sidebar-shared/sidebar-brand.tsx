import { Icon } from "@/components/ui/icon"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function BrandTile({ icon, small = false, className }: { icon: string; small?: boolean; className?: string }) {
  return (
    <span
      data-slot="brand-tile"
      className={cn(
        "grid shrink-0 place-items-center bg-marker/80 text-ink [border-radius:3px_8px_4px_9px/8px_3px_9px_4px]",
        small ? "size-5" : "size-8",
        className
      )}
    >
      <Icon name={icon} size={small ? 12 : 16} />
    </span>
  )
}

export function BrandText({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <span className="grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
      <span className="truncate font-bold">{title}</span>
      {" "}
      {subtitle ? <span className="truncate text-sm text-muted-foreground">{subtitle}</span> : null}
    </span>
  )
}

export function SidebarBrand({
  title,
  subtitle,
  icon,
  href = "#home",
  className,
}: {
  title: string
  subtitle?: string
  icon: string
  href?: string
  className?: string
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild className={className}>
          <a href={href}>
            <BrandTile icon={icon} />
            <BrandText title={title} subtitle={subtitle} />
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
