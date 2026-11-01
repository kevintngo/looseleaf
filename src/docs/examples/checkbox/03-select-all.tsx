import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Select all",
  description: "A parent box that shows the dash when only some children are ticked, and a Field-like row whose hover lights the box.",
  layout: "stack" as const,
}

const items = ["Pencils", "Highlighters", "Washi tape", "Index cards"]

export default function Example() {
  const [picked, setPicked] = React.useState<string[]>(["Pencils"])
  const all = picked.length === items.length ? true : picked.length === 0 ? false : "indeterminate"

  return (
    <div className="grid gap-3">
      <div className="group/field flex items-center gap-2">
        <Checkbox
          id="all"
          checked={all}
          onCheckedChange={(v) => setPicked(v === true ? items : [])}
        />
        <Label htmlFor="all">Everything on the desk</Label>
      </div>
      <div className="grid gap-3 ps-7">
        {items.map((item) => (
          <div key={item} className="group/field flex items-center gap-2">
            <Checkbox
              id={item}
              checked={picked.includes(item)}
              onCheckedChange={(v) => setPicked((p) => (v === true ? [...p, item] : p.filter((x) => x !== item)))}
            />
            <Label htmlFor={item}>{item}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}
