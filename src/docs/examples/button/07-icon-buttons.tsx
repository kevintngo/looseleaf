import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Icon buttons",
  description: "Square buttons for one glyph, in the four icon sizes. Give each an aria-label; the drawing is decorative. The last one is a real toggle that swaps its icon.",
  layout: "stack" as const,
}

export default function Example() {
  const [shown, setShown] = React.useState(false)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="icon-xs" variant="outline" aria-label="Close">
        <Icon name="x" size={12} />
      </Button>
      <Button size="icon-sm" variant="secondary" aria-label="Notifications">
        <Icon name="bell" />
      </Button>
      <Button size="icon" aria-label="Add">
        <Icon name="plus" />
      </Button>
      <Button size="icon-lg" variant="outline" aria-label="Settings">
        <Icon name="settings" size={20} />
      </Button>
      <Button size="icon" variant="ghost" aria-label="Delete" >
        <Icon name="trash" />
      </Button>
      <Button size="icon" variant="outline" aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown} onClick={() => setShown((s) => !s)}>
        <Icon name={shown ? "eye-off" : "eye"} />
      </Button>
    </div>
  )
}
