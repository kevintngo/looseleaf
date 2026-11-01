import * as React from "react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export const meta = {
  title: "Sizes and states",
  description: "Default and sm, off and on, invalid (red pencil outline that stays red when it is on) and disabled (dashed pencil, graphite fill). Off carries a pencil o, on a felt bar, so the state never rests on color alone.",
  layout: "stack" as const,
}

const rows = [
  ["default", {}],
  ["sm", { size: "sm" as const }],
] as const

const columns = ["off", "on", "invalid", "invalid on", "disabled", "disabled on"]

export default function Example() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-x-3 gap-y-3.5 [grid-template-columns:3.5rem_repeat(6,5rem)]">
        <span aria-hidden="true" />
        {columns.map((c) => (
          <span key={c} aria-hidden="true" className="text-[13px] leading-tight whitespace-nowrap text-ink-muted">
            {c}
          </span>
        ))}
        {rows.map(([name, props]) => (
          <React.Fragment key={name}>
            <span className="self-center text-sm text-ink-muted">{name}</span>
            <Switch {...props} aria-label={`${name} off`} />
            <Switch {...props} defaultChecked aria-label={`${name} on`} />
            <Switch {...props} aria-invalid aria-label={`${name} invalid`} />
            <Switch {...props} aria-invalid defaultChecked aria-label={`${name} invalid on`} />
            <Switch {...props} disabled aria-label={`${name} disabled`} />
            <Switch {...props} disabled defaultChecked aria-label={`${name} disabled on`} />
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Switch id="locked" disabled defaultChecked />
        <Label htmlFor="locked">Locked by your administrator</Label>
      </div>
    </div>
  )
}
