import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Sizes, icons and tones",
  description: "Three heights, an icon slot in front of the label (the icon keeps its own 14 px drawing), and the stationery accents for the marker fill.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <Badge size="sm">Small</Badge>
        <Badge>Default</Badge>
        <Badge size="lg">Large</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Badge variant="secondary">
          <Icon name="badge-check" />
          Verified
        </Badge>
        <Badge variant="destructive">
          <Icon name="triangle-alert" />
          Overdue
        </Badge>
        <Badge variant="outline">
          <Icon name="bell" />
          Following
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="hi">hi</Badge>
        <Badge tone="tangerine">tangerine</Badge>
        <Badge tone="lemon">lemon</Badge>
        <Badge tone="grass">grass</Badge>
        <Badge tone="teal">teal</Badge>
        <Badge tone="sky">sky</Badge>
        <Badge tone="bubblegum">bubblegum</Badge>
      </div>
    </div>
  )
}
