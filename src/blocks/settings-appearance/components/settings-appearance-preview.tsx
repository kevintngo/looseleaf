"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Paper } from "@/components/ui/paper"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tally } from "@/components/ui/tally"
import { InkProvider } from "@/lib/ink/react"
import { cn } from "@/lib/utils"
import { providerProps, type Appearance, type PaperChoice } from "@/blocks/settings-appearance/components/settings-appearance-options"

const STOCK: Record<PaperChoice, { stock: "paper" | "graph" | "dot-grid" | "kraft"; rules?: "ruled" | "none" }> = {
  plain: { stock: "paper", rules: "none" },
  ruled: { stock: "paper", rules: "ruled" },
  graph: { stock: "graph" },
  dots: { stock: "dot-grid" },
  kraft: { stock: "kraft", rules: "none" },
}

export function SettingsAppearancePreview({ appearance }: { appearance: Appearance }) {
  const id = React.useId()
  const paper = STOCK[appearance.paper]
  const ruled = paper.rules === "ruled"
  return (
    <InkProvider {...providerProps(appearance)}>
      <div dir={appearance.dir} role="region" aria-label="Preview">
        <Paper stock={paper.stock} rules={paper.rules} seed="appearance-preview" className={cn("grid gap-4 p-5 pt-6", ruled && "pt-4 ps-14 rtl:[&>[data-slot=paper-rules]]:-scale-x-100")} tape="top">
          <div className={cn("grid", !ruled && "gap-4")}>
            <h3 className={cn("font-script text-2xl font-semibold", ruled ? "relative top-[calc(3px-var(--ll-rule-offset,8px))] leading-7 calm:top-[calc(1px-var(--ll-rule-offset,6px))] calm:leading-6" : "leading-none")}>Field notes</h3>
            <p className={cn("text-[15px]", ruled && "leading-7 calm:leading-6")}>Tuesday. Rain on the window, three cups of tea, and one very small plan for a very big week.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Save</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
            <Badge>3 new</Badge>
            <Tally count={7} size="sm" label="7 pages" />
          </div>
          <Input aria-label="Add a tag" placeholder="Add a tag" />
          <div className="flex items-center gap-2">
            <Checkbox id={`${id}-c`} defaultChecked />
            <Label htmlFor={`${id}-c`}>Ink the outline</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id={`${id}-s`} defaultChecked />
            <Label htmlFor={`${id}-s`}>Share with the club</Label>
          </div>
          <Progress value={64} aria-label="Pages done" />
        </Paper>
      </div>
    </InkProvider>
  )
}
