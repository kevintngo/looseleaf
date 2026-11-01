import * as React from "react"

import { Kbd } from "@/components/ui/kbd"

export const meta = {
  title: "Press the keys",
  description: "data-pressed shows a key as held. Type on your keyboard: the caps you press sink onto their base (or press and hold one with the pointer).",
  layout: "stack" as const,
}

const keys = [
  { label: "Esc", code: "Escape" },
  { label: "Tab", code: "Tab" },
  { label: "Space", code: "Space" },
  { label: "Enter", code: "Enter" },
  { label: "←", code: "ArrowLeft" },
  { label: "↑", code: "ArrowUp" },
  { label: "↓", code: "ArrowDown" },
  { label: "→", code: "ArrowRight" },
] as const

export default function Example() {
  const [down, setDown] = React.useState<string[]>([])
  React.useEffect(() => {
    const press = (e: KeyboardEvent) => {
      if (keys.some((k) => k.code === e.code)) setDown((d) => (d.includes(e.code) ? d : [...d, e.code]))
    }
    const release = (e: KeyboardEvent) => setDown((d) => d.filter((c) => c !== e.code))
    const clear = () => setDown([])
    window.addEventListener("keydown", press)
    window.addEventListener("keyup", release)
    window.addEventListener("blur", clear)
    return () => {
      window.removeEventListener("keydown", press)
      window.removeEventListener("keyup", release)
      window.removeEventListener("blur", clear)
    }
  }, [])
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-center gap-2" aria-label="Keys you are holding" role="group">
        {keys.map((k) => (
          <Kbd key={k.code} data-pressed={down.includes(k.code) ? "" : undefined} className="min-w-9">
            {k.label}
          </Kbd>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Try Space, Enter, Esc and the arrow keys.</p>
    </div>
  )
}
