import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"

export const meta = {
  title: "Small",
  description: "Official `toggle-sm`: `size=\"sm\"`, 32 px tall, for dense toolbars.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Toggle size="sm" aria-label="Toggle italic">
      <Icon name="italic" />
    </Toggle>
  )
}
