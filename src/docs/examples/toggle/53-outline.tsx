import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"

export const meta = {
  title: "Outline",
  description: "Official `toggle-outline`: `variant=\"outline\"` keeps a felt-tip box around the toggle whether it is on or off; the default variant is only a whisper of pencil until it is pressed.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Toggle variant="outline" aria-label="Toggle italic">
      <Icon name="italic" />
    </Toggle>
  )
}
