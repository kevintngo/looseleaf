import * as React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export const meta = {
  title: "Brush settings",
  description: "Three controlled sliders in a panel, each with its own readout, and a reset that puts every knob back where it started. The values are the only state; the drawings do not change.",
  layout: "stack" as const,
}

const initial = { size: 12, opacity: 85, hardness: 40 }
const rows = [
  ["size", "Size", "px", 1, 48],
  ["opacity", "Opacity", "%", 0, 100],
  ["hardness", "Hardness", "%", 0, 100],
] as const

export default function Example() {
  const [v, setV] = React.useState(initial)
  return (
    <div className="grid w-full max-w-sm gap-5">
      {rows.map(([key, label, unit, min, max]) => (
        <div key={key} className="grid gap-2.5">
          <div className="flex items-baseline justify-between">
            <Label id={`${key}-label`}>{label}</Label>
            <output className="ll-num text-sm text-ink-muted">
              {v[key]}
              {unit}
            </output>
          </div>
          <Slider aria-labelledby={`${key}-label`} getValueText={(n) => `${n} ${unit === "%" ? "percent" : "pixels"}`} min={min} max={max} value={[v[key]]} onValueChange={([n]) => setV((s) => ({ ...s, [key]: n }))} tone={key === "hardness" ? "blue" : "marker"} />
        </div>
      ))}
      <div>
        <Button variant="outline" size="sm" onClick={() => setV(initial)}>
          Reset
        </Button>
      </div>
    </div>
  )
}
