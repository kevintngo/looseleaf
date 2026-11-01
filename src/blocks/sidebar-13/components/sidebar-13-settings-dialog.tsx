"use client"

import * as React from "react"

import { settingsSections } from "@/blocks/sidebar-shared/sidebar-data"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

const initial = () => Object.fromEntries(settingsSections.flatMap((section) => section.toggles.map((toggle) => [toggle.id, toggle.on])))

export function SettingsDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  defaultSection = "Messages & media",
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCloseAutoFocus?: React.ComponentProps<typeof DialogContent>["onCloseAutoFocus"]
  defaultSection?: string
}) {
  const [section, setSection] = React.useState(defaultSection)
  const [values, setValues] = React.useState<Record<string, boolean>>(initial)
  const current = settingsSections.find((s) => s.name === section) ?? settingsSections[0]!
  const selectId = React.useId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent tilt={false} onCloseAutoFocus={onCloseAutoFocus} className="max-w-none gap-0 p-0 compact:p-0 calm:p-0 md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">Customize your settings here.</DialogDescription>
        <div className="overflow-hidden">
          <SidebarProvider className="min-h-0 items-start">
            <Sidebar collapsible="none" role="navigation" aria-label="Settings sections" className="hidden h-auto self-stretch md:flex">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {settingsSections.map((item) => (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton isActive={item.name === section} aria-current={item.name === section ? "true" : undefined} onClick={() => setSection(item.name)}>
                            <Icon name={item.icon} />
                            <span className="truncate">{item.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <div className="flex h-[480px] max-h-[calc(100svh-4rem)] min-w-0 flex-1 flex-col overflow-hidden">
              <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#settings">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{current.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </header>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
                <div className="grid gap-1.5 md:hidden">
                  <Label htmlFor={selectId}>Section</Label>
                  <NativeSelect id={selectId} value={section} onChange={(event) => setSection(event.target.value)} className="w-full">
                    {settingsSections.map((item) => (
                      <NativeSelectOption key={item.name} value={item.name}>
                        {item.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <h2 className="font-script text-2xl leading-tight font-semibold">{current.name}</h2>
                <p className="-mt-2 text-sm text-muted-foreground">{current.intro}</p>
                <ul className="max-w-xl">
                  {current.toggles.map((toggle) => (
                    <li key={toggle.id} className="flex items-start justify-between gap-4 border-b border-pencil-mark/40 py-3 last:border-b-0">
                      <div className="grid gap-1">
                        <Label htmlFor={toggle.id}>{toggle.label}</Label>
                        <p id={`${toggle.id}-hint`} className="text-sm text-muted-foreground">
                          {toggle.hint}
                        </p>
                      </div>
                      <Switch
                        id={toggle.id}
                        aria-describedby={`${toggle.id}-hint`}
                        checked={values[toggle.id] ?? false}
                        onCheckedChange={(checked) => setValues((prev) => ({ ...prev, [toggle.id]: checked }))}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SidebarProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
