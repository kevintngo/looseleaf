import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"

export const meta = {
  title: "Demo",
  description:
    "Official `toggle-demo`: a small outline toggle with a bookmark and a word. shadcn fills the bookmark blue when it is on; this one keeps its highlighter body and writes the bookmark in blue felt tip, because a drawn line has no fill to change. Space or Enter toggles it.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <Toggle aria-label="Toggle bookmark" size="sm" variant="outline" className="data-[state=on]:[&_svg:not(.absolute)]:text-ink-you">
      <Icon name="bookmark" />
      Bookmark
    </Toggle>
  )
}
