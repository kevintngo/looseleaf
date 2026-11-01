import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Tally } from "@/components/ui/tally"

export const meta = {
  title: "Counts, sizes and pens",
  description: "Add a mark and watch the bundles build. Sizes sm, md, lg; ink, blue, red and pencil pens.",
  layout: "stack" as const,
}

export default function Example() {
  const [n, setN] = React.useState(13)
  return (
    <div className="grid max-w-lg gap-5">
      <div className="flex items-center gap-4">
        <Button size="icon-sm" variant="outline" onClick={() => setN((v) => Math.max(0, v - 1))} aria-label="One fewer">
          <Icon name="minus" />
        </Button>
        <Tally count={n} size="lg" />
        <Button size="icon-sm" onClick={() => setN((v) => Math.min(99, v + 1))} aria-label="One more">
          <Icon name="plus" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Tally count={9} size="sm" />
        <Tally count={9} tone="blue" />
        <Tally count={9} tone="red" size="lg" />
        <Tally count={9} tone="pencil" weight="fine" />
      </div>
    </div>
  )
}
