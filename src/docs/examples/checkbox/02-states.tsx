import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "States and sizes",
  description: "Off, on, partly on, invalid and disabled in 16, 20 and 28 px. The label of a disabled box fades with it (peer-disabled).",
  layout: "stack" as const,
}

const sizes = [
  ["size-4", "16 px"],
  ["size-5", "20 px"],
  ["size-7", "28 px"],
] as const

export default function Example() {
  return (
    <div className="grid gap-5">
      {sizes.map(([size, name]) => (
        <div key={size} className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="w-14 text-sm text-ink-muted">{name}</span>
          <Checkbox className={size} aria-label={`${name} off`} />
          <Checkbox className={size} defaultChecked aria-label={`${name} on`} />
          <Checkbox className={size} checked="indeterminate" onCheckedChange={() => {}} aria-label={`${name} partly`} />
          <Checkbox className={size} aria-invalid aria-label={`${name} invalid`} />
          <Checkbox className={size} disabled aria-label={`${name} disabled`} />
          <Checkbox className={size} disabled defaultChecked aria-label={`${name} disabled on`} />
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Checkbox id="locked" disabled defaultChecked />
        <Label htmlFor="locked">Locked by your admin</Label>
      </div>
    </div>
  )
}
