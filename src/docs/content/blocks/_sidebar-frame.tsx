import * as React from "react"

import { Desk } from "@/components/ui/desk"

export function SidebarFrame({ height = 640, children }: { height?: number; children: React.ReactNode }) {
  return (
    <Desk className="w-full overflow-hidden [transform:translateZ(0)]" style={{ height }}>
      {children}
    </Desk>
  )
}
