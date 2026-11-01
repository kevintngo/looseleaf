import type { ComponentProps } from "react"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const meta = {
  title: "Sizes and states",
  description: "Default and sm, invalid (red pencil box, a bang before the chevron), disabled (dashed, pale) and a disabled row inside the list.",
  layout: "stack" as const,
  height: 420,
}

function Pens({ placeholder = "Pick a pen", ...props }: ComponentProps<typeof SelectTrigger> & { placeholder?: string }) {
  return (
    <Select defaultValue={props.disabled ? "felt" : undefined}>
      <SelectTrigger className="w-[190px]" {...props}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="felt">Felt tip</SelectItem>
        <SelectItem value="pencil">Pencil</SelectItem>
        <SelectItem value="marker">Marker</SelectItem>
        <SelectItem value="quill" disabled>
          Quill (out of ink)
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default function Example() {
  return (
    <div className="grid grid-cols-2 items-start gap-x-8 gap-y-5 max-sm:grid-cols-1">
      <div className="grid gap-2">
        <Label>Default</Label>
        <Pens aria-label="Default" />
      </div>
      <div className="grid gap-2">
        <Label>Small</Label>
        <Pens size="sm" aria-label="Small" />
      </div>
      <div className="grid gap-2">
        <Label>Invalid</Label>
        <Pens aria-invalid aria-label="Invalid" />
        <p className="text-sm text-red">Choose a pen to continue.</p>
      </div>
      <div className="grid gap-2">
        <Label>Disabled</Label>
        <Pens disabled aria-label="Disabled" />
      </div>
    </div>
  )
}
