import { useEffect, useMemo, useRef, useState } from "react"
import { SidebarContent } from "@/components/ui/sidebar"
import { useCatalog } from "../core/catalog-context"
import { buildNav } from "../core/nav"
import { useLocation } from "../core/router"
import { readStored, writeStored } from "../core/storage"
import { NavGroup, NavItem, NavSection } from "../kit"

function readCollapsed(): Set<string> | null {
  try {
    const raw = readStored("nav-collapsed")
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [])
  } catch {
    return null
  }
}

const COLLAPSE_ABOVE = 40

export function SideNav() {
  const catalog = useCatalog()
  const { route, path } = useLocation()
  const sections = useMemo(() => buildNav(catalog, route), [catalog, route])
  const activeGroup = sections.flatMap((s) => s.groups).find((g) => g.containsActive)?.id
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const initial = readCollapsed() ?? new Set(catalog.components.length > COLLAPSE_ABOVE ? catalog.groups.map((g) => g.category) : [])
    if (activeGroup) initial.delete(activeGroup)
    return initial
  })
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeGroup) return
    setCollapsed((prev) => {
      if (!prev.has(activeGroup)) return prev
      const next = new Set(prev)
      next.delete(activeGroup)
      return next
    })
  }, [activeGroup])

  const groupOpen = activeGroup ? !collapsed.has(activeGroup) : true
  useEffect(() => {
    const box = scroller.current
    const item = box?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!box || !item) return
    const b = box.getBoundingClientRect()
    const r = item.getBoundingClientRect()
    if (r.top < b.top + 8) box.scrollTop += r.top - b.top - 8
    else if (r.bottom > b.bottom - 8) box.scrollTop += r.bottom - b.bottom + 8
  }, [path, groupOpen])

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeStored("nav-collapsed", JSON.stringify([...next]))
      return next
    })

  return (
    <nav aria-label="Documentation" className="dk-nav flex min-h-0 flex-1 flex-col">
      <SidebarContent ref={scroller}>
        {sections.map((section) => (
          <NavSection key={section.id} label={section.label} to={section.to} active={section.active} count={section.count}>
            {section.links.map((link) => (
              <NavItem key={link.id} to={link.to} active={link.active}>
                {link.label}
              </NavItem>
            ))}
            {section.groups.map((group) => (
              <NavGroup
                key={group.id}
                label={group.label}
                count={group.count}
                open={!collapsed.has(group.id)}
                containsActive={group.containsActive}
                onToggle={() => toggle(group.id)}
              >
                {group.links.map((link) => (
                  <NavItem key={link.id} to={link.to} active={link.active}>
                    {link.label}
                  </NavItem>
                ))}
              </NavGroup>
            ))}
            {section.empty ? <li className="px-2 py-1.5 text-sm text-muted-foreground">{section.empty}</li> : null}
          </NavSection>
        ))}
      </SidebarContent>
    </nav>
  )
}
