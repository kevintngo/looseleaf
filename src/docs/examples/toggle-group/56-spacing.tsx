import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "Spacing",
  description:
    "Official `toggle-group-spacing`: `spacing={2}` pulls the items apart, so each keeps a box of its own. shadcn fills the icon with a colour when an item is on; here each item keeps its highlighter body and writes its icon in that colour instead (a drawn line has no fill to change).",
  layout: "center" as const,
}

export default function Example() {
  return (
    <ToggleGroup type="multiple" variant="outline" spacing={2} size="sm" aria-label="Reactions">
      <ToggleGroupItem value="star" aria-label="Toggle star" className="data-[state=on]:[&_svg:not(.absolute)]:text-orange-text">
        <Icon name="star" />
        Star
      </ToggleGroupItem>
      <ToggleGroupItem value="heart" aria-label="Toggle heart" className="data-[state=on]:[&_svg:not(.absolute)]:text-red">
        <Icon name="heart" />
        Heart
      </ToggleGroupItem>
      <ToggleGroupItem value="bookmark" aria-label="Toggle bookmark" className="data-[state=on]:[&_svg:not(.absolute)]:text-ink-you">
        <Icon name="bookmark" />
        Bookmark
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
