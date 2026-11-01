import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "Joined, separate, vertical",
  description:
    "Outline items that touch share one box. Give them spacing and each keeps its own. Borderless items only whisper their seams. Vertical groups stack and use the up and down arrows.",
  layout: "stack" as const,
}

const items = (
  <>
    <ToggleGroupItem value="list" aria-label="List">
      <Icon name="list" />
    </ToggleGroupItem>
    <ToggleGroupItem value="menu" aria-label="Menu">
      <Icon name="menu" />
    </ToggleGroupItem>
    <ToggleGroupItem value="search" aria-label="Search">
      <Icon name="search" />
    </ToggleGroupItem>
  </>
)

function Case({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid justify-items-start gap-2">
      {children}
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
      <Case label="joined">
        <ToggleGroup type="single" variant="outline" defaultValue="menu" aria-label="Joined outline">
          {items}
        </ToggleGroup>
      </Case>
      <Case label="spacing 2">
        <ToggleGroup type="single" variant="outline" spacing={2} defaultValue="menu" aria-label="Separate outline">
          {items}
        </ToggleGroup>
      </Case>
      <Case label="borderless">
        <ToggleGroup type="single" defaultValue="menu" aria-label="Borderless">
          {items}
        </ToggleGroup>
      </Case>
      <Case label="marker, sm">
        <ToggleGroup type="single" variant="outline" tone="marker" size="sm" defaultValue="menu" aria-label="Marker, small">
          {items}
        </ToggleGroup>
      </Case>
      <Case label="vertical">
        <ToggleGroup type="single" variant="outline" orientation="vertical" defaultValue="menu" aria-label="Vertical">
          {items}
        </ToggleGroup>
      </Case>
      <Case label="disabled">
        <ToggleGroup type="single" variant="outline" disabled defaultValue="menu" aria-label="Disabled">
          {items}
        </ToggleGroup>
      </Case>
    </div>
  )
}
