import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"

export const meta = {
  title: "Sizes, tones and disabled",
  description: "Three heights, the terracotta marker for a louder switch, and disabled toggles: a dashed pencil box, and a pale wash if it is on.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <Toggle variant="outline" size="sm" defaultPressed aria-label="List, small">
          <Icon name="list" />
        </Toggle>
        <Toggle variant="outline" defaultPressed aria-label="List">
          <Icon name="list" />
        </Toggle>
        <Toggle variant="outline" size="lg" defaultPressed aria-label="List, large">
          <Icon name="list" />
        </Toggle>
        <Toggle variant="outline" size="lg" tone="marker" defaultPressed>
          <Icon name="pencil" />
          Draw
        </Toggle>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Toggle disabled>
          <Icon name="eye-off" />
          Hidden
        </Toggle>
        <Toggle disabled defaultPressed>
          <Icon name="eye-off" />
          Hidden
        </Toggle>
        <Toggle variant="outline" disabled>
          Locked
        </Toggle>
        <Toggle variant="outline" disabled defaultPressed>
          Locked
        </Toggle>
      </div>
    </div>
  )
}
