import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const meta = {
  title: "Ticks and dots",
  description: "Checkbox rows are a pencil box with a felt tick written over it; radio rows are a ring with a bold dot. Both are controlled here, and the rows keep the menu open so you can tick several.",
  layout: "center" as const,
  height: 420,
}

export default function Example() {
  const [status, setStatus] = React.useState(true)
  const [activity, setActivity] = React.useState(false)
  const [panel, setPanel] = React.useState(true)
  const [position, setPosition] = React.useState("bottom")

  return (
    <div className="flex flex-col items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Icon name="sliders-horizontal" /> View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" seed="view">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={status} onCheckedChange={setStatus} onSelect={(e) => e.preventDefault()}>
            Status bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={activity} onCheckedChange={setActivity} onSelect={(e) => e.preventDefault()} disabled>
            Activity bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={panel} onCheckedChange={setPanel} onSelect={(e) => e.preventDefault()}>
            Panel
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Panel position</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-sm text-muted-foreground">
        {[status && "status bar", panel && "panel"].filter(Boolean).join(" + ") || "nothing"} · panel {position}
      </p>
    </div>
  )
}
