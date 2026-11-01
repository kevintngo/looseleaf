"use client"

import * as React from "react"

import { fileChanges, fileTree, type FileNode } from "@/blocks/sidebar-shared/sidebar-data"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"

const OPEN_BY_DEFAULT = new Set(["components", "components/ui"])
const STATE_NAMES: Record<string, string> = { M: "modified", U: "untracked" }

function fileIcon(name: string) {
  if (/\.(tsx?|jsx?|json)$/.test(name) || name.startsWith(".")) return "file-code"
  if (/\.(md|txt)$/.test(name)) return "file-text"
  return "file"
}

function Tree({ node, parent, active, onPick }: { node: FileNode; parent: string; active: string; onPick: (path: string) => void }) {
  const path = parent ? `${parent}/${node.name}` : node.name

  if (!node.children) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={active === path} aria-current={active === path ? "true" : undefined} onClick={() => onPick(path)}>
          <Icon name={fileIcon(node.name)} />
          <span className="truncate">{node.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible asChild defaultOpen={OPEN_BY_DEFAULT.has(path)}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <Icon name="chevron-right" className="transition-transform group-data-[state=open]/collapsible-trigger:rotate-90 rtl:group-data-[state=open]/collapsible-trigger:-rotate-90" />
            <Icon name="folder" className="group-data-[state=open]/collapsible-trigger:hidden" />
            <Icon name="folder-open" className="group-data-[state=closed]/collapsible-trigger:hidden" />
            <span className="truncate">{node.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {node.children.map((child) => (
              <Tree key={child.name} node={child} parent={path} active={active} onPick={onPick} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function AppSidebar({ active, onPick, ...props }: React.ComponentProps<typeof Sidebar> & { active: string; onPick: (path: string) => void }) {
  return (
    <Sidebar role="navigation" aria-label="Files" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Changes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {fileChanges.map((change) => (
                <SidebarMenuItem key={change.file}>
                  <SidebarMenuButton isActive={active === change.file} aria-current={active === change.file ? "true" : undefined} className="group-has-data-[sidebar=menu-badge]/menu-item:pe-8" onClick={() => onPick(change.file)}>
                    <Icon name={fileIcon(change.file)} />
                    <span className="truncate">{change.file}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <span aria-hidden="true">{change.state}</span>
                    <span className="sr-only">{STATE_NAMES[change.state] ?? change.state}</span>
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {fileTree.map((node) => (
                <Tree key={node.name} node={node} parent="" active={active} onPick={onPick} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
