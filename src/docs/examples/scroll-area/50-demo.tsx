import * as React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export const meta = {
  title: "Demo",
  description:
    "Official `scroll-area-demo`: fifty version tags with a Separator between each. The box is a dashed pencil edge rather than `rounded-md border`, and the scroll mark is a graphite pull in a faint gutter. Scroll with the wheel, drag the mark, or focus the list and use the arrow keys.",
  layout: "center" as const,
  height: 320,
}

const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`)

export default function Example() {
  return (
    <ScrollArea className="h-72 w-48 border-y border-dashed border-pencil-mark/60">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
        {tags.map((tag) => (
          <React.Fragment key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  )
}
