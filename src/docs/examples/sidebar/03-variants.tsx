import * as React from "react"

import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "Variants and sides",
  description:
    "sidebar docks to the edge and casts its shadow toward the page; floating is set down on the desk and turned a little; inset leaves a margin and makes the page itself a sheet of paper. Either side of the screen works, and the clip and torn edge follow.",
  layout: "full" as const,
  height: 400,
  stage: "desk" as const,
}

const ITEMS = [
  ["Overview", "layout-dashboard"],
  ["Reports", "chart-column"],
  ["Team", "users"],
  ["Billing", "credit-card"],
] as const

export default function Example() {
  const [variant, setVariant] = React.useState<"sidebar" | "floating" | "inset">("floating")
  const [side, setSide] = React.useState<"left" | "right">("left")

  return (
    <div className="relative h-[400px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider className="h-full min-h-0">
        {side === "left" ? <Pad variant={variant} side={side} /> : null}
        <SidebarInset className="gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <SidebarTrigger />
            <ToggleGroup type="single" variant="outline" size="sm" value={variant} onValueChange={(v) => v && setVariant(v as typeof variant)} aria-label="Variant">
              <ToggleGroupItem value="sidebar">sidebar</ToggleGroupItem>
              <ToggleGroupItem value="floating">floating</ToggleGroupItem>
              <ToggleGroupItem value="inset">inset</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" variant="outline" size="sm" value={side} onValueChange={(v) => v && setSide(v as typeof side)} aria-label="Side">
              <ToggleGroupItem value="left">left</ToggleGroupItem>
              <ToggleGroupItem value="right">right</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            {variant === "inset" ? "This page is a sheet of paper set on the desk, beside the pad." : "This page is plain: the pad hangs beside it."}
          </p>
        </SidebarInset>
        {side === "right" ? <Pad variant={variant} side={side} /> : null}
      </SidebarProvider>
    </div>
  )
}

function Pad({ variant, side }: { variant: "sidebar" | "floating" | "inset"; side: "left" | "right" }) {
  return (
    <Sidebar variant={variant} side={side} className="h-full" seed="variants">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map(([title, icon], i) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton isActive={i === 0}>
                    <Icon name={icon} />
                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
