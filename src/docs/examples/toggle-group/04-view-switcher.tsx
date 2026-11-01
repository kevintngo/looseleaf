import * as React from "react"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Paper } from "@/components/ui/paper"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "A view switcher",
  description: "The group in a card header, driving what the card shows. Every item has a name; the current view is also written out in the description.",
  layout: "stack" as const,
}

const sketches = ["Snail on a leaf", "Teapot, three ways", "The corner of the desk", "Rain at 7 a.m."]

export default function Example() {
  const [view, setView] = React.useState("list")
  return (
    <Card className="mx-auto w-full max-w-md" seed="views">
      <CardHeader>
        <CardTitle>Sketchbook</CardTitle>
        <CardDescription>Showing {view === "grid" ? "a grid" : view === "menu" ? "compact rows" : "a list"} of four pages.</CardDescription>
        <CardAction>
          <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && setView(v)} aria-label="View">
            <ToggleGroupItem value="list" aria-label="List">
              <Icon name="list" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid">
              <Icon name="layout-grid" />
            </ToggleGroupItem>
            <ToggleGroupItem value="menu" aria-label="Compact">
              <Icon name="menu" />
            </ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className={view === "grid" ? "grid grid-cols-2 gap-3" : view === "menu" ? "flex flex-col gap-1 text-[15px]" : "flex flex-col gap-3"}>
          {sketches.map((s, i) => (
            <li key={s} className={view === "grid" ? "" : "flex items-baseline gap-3"}>
              {view === "grid" ? (
                <Paper stock="slip" seed={s} className="flex h-16 items-end p-2 text-sm leading-tight">
                  {s}
                </Paper>
              ) : (
                <>
                  <span className="ll-num w-5 text-muted-foreground">{i + 1}</span>
                  {s}
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
