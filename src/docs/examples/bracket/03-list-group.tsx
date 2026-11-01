import { Bracket } from "@/components/ui/bracket"
import { Callout } from "@/components/ui/callout"

export const meta = {
  title: "Grouping list items",
  description: "A curly brace across three items with a note on the other side: the list is still a list.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex items-center gap-2">
      <Bracket kind="curly" side="end" tone="blue" className="pe-8">
        <ul role="list" className="grid gap-1.5 text-[17px]">
          <li>Flour</li>
          <li>Butter</li>
          <li>Sugar</li>
        </ul>
      </Bracket>
      <Callout direction="left" tone="blue" arrowClassName="h-8 w-12">
        the base
      </Callout>
    </div>
  )
}
