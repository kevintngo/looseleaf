import { useState, type ReactNode } from "react"
import { Tabs as TabsRoot, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface TabItem {
  id: string
  label: ReactNode
  ariaLabel?: string
  content: ReactNode | (() => ReactNode)
}

export interface TabsProps {
  label: string
  items: readonly TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  variant?: "underline" | "pill"
  mount?: "lazy" | "always"
  className?: string
}

export function Tabs({ label, items, value, defaultValue, onValueChange, variant = "underline", mount = "lazy", className }: TabsProps) {
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id ?? "")
  const wanted = value ?? inner
  const active = items.some((item) => item.id === wanted) ? wanted : (items[0]?.id ?? "")
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set([active]))

  if (!visited.has(active)) setVisited(new Set(visited).add(active))

  const select = (id: string) => {
    if (value === undefined) setInner(id)
    onValueChange?.(id)
  }

  return (
    <TabsRoot value={active} onValueChange={select} className={cn("min-w-0", className)}>
      <TabsList
        aria-label={label}
        variant={variant === "pill" ? "default" : "line"}
        className="max-w-full flex-wrap justify-start gap-y-2 aria-[orientation=horizontal]:h-auto"
      >
        {items.map((item) => (
          <TabsTrigger key={item.id} value={item.id} aria-label={item.ariaLabel} className="flex-none">
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => {
        const selected = item.id === active
        const mounted = selected || mount === "always" || visited.has(item.id)
        return (
          <TabsContent key={item.id} value={item.id} forceMount className="min-w-0 data-[state=inactive]:hidden">
            <div hidden={!selected} className="min-w-0">
              {mounted ? (typeof item.content === "function" ? item.content() : item.content) : null}
            </div>
          </TabsContent>
        )
      })}
    </TabsRoot>
  )
}
