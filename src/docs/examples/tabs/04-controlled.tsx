import * as React from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const meta = {
  title: "Controlled, manual activation",
  description: "`value` and `onValueChange` drive the tabs from outside; `activationMode=\"manual\"` moves focus with the arrow keys and only opens a tab on Enter or Space, which suits panels that are slow to load.",
  layout: "center" as const,
}

const days = ["Mon", "Tue", "Wed", "Thu"] as const

export default function Example() {
  const [day, setDay] = React.useState<string>("Tue")
  const at = days.indexOf(day as (typeof days)[number])
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Tabs value={day} onValueChange={setDay} activationMode="manual">
        <TabsList>
          {days.map((d) => (
            <TabsTrigger key={d} value={d}>
              {d}
            </TabsTrigger>
          ))}
        </TabsList>
        {days.map((d) => (
          <TabsContent key={d} value={d} className="text-sm text-muted-foreground">
            Nothing planned on {d}. A good day for a very small plan.
          </TabsContent>
        ))}
      </Tabs>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={at === 0} onClick={() => setDay(days[at - 1])}>
          Earlier
        </Button>
        <Button variant="outline" size="sm" disabled={at === days.length - 1} onClick={() => setDay(days[at + 1])}>
          Later
        </Button>
      </div>
    </div>
  )
}
