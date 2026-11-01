import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Dimmed with a disabled control",
  description: "A label after a peer control fades to graphite when the control is disabled: checkbox as a peer, a drawn Input marked peer, or a group with data-disabled.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <div className="flex items-center gap-2">
        <Checkbox id="p1" disabled />
        <Label htmlFor="p1">Sync over cellular (off by admin)</Label>
      </div>
      <div className="grid gap-2">
        <Input id="p2" className="peer order-2" disabled defaultValue="locked@example.com" />
        <Label htmlFor="p2" className="order-1">
          Account email
        </Label>
      </div>
      <div className="group grid gap-2" data-disabled="true">
        <Label>Whole group is disabled</Label>
        <Input aria-label="grouped" disabled placeholder="Nothing to type here" />
      </div>
    </div>
  )
}
