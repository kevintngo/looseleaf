import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"

export const meta = {
  title: "Large",
  description: "Official `toggle-lg`: `size=\"lg\"`, 40 px tall (36 in compact density, 32 in calm), for touch-first toolbars.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Toggle size="lg" aria-label="Toggle italic">
      <Icon name="italic" />
    </Toggle>
  )
}
