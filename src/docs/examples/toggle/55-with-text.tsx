import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"

export const meta = {
  title: "With text",
  description: "Official `toggle-with-text`: an icon and a word. With a visible word the toggle needs no `aria-label`, and the highlighter body stretches to fit both.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Toggle>
      <Icon name="italic" />
      Italic
    </Toggle>
  )
}
