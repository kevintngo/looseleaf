import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"

export const meta = {
  title: "Disabled",
  description:
    "Official `toggle-disabled`: an icon-only toggle with `disabled`. It is drawn as a dashed pencil-grey box and takes no pointer or keyboard. (The original's label says \"italic\" on an underline; this one says what it shows.)",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Toggle aria-label="Toggle underline" disabled>
      <Icon name="underline" />
    </Toggle>
  )
}
