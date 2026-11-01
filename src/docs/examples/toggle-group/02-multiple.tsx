import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "Pick several",
  description:
    "type=multiple: any of the items can be on at once, and each one knows its own state. Icon items need names; hand-lettered items are just text in the script font. The sample line follows the group.",
  layout: "stack" as const,
}

export default function Example() {
  const [styles, setStyles] = React.useState<string[]>(["bold"])
  const sample = `text-xl ${styles.includes("bold") ? "font-bold" : "font-normal"} ${styles.includes("italic") ? "italic" : ""} ${styles.includes("underline") ? "underline decoration-wavy underline-offset-4" : ""}`
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <ToggleGroup type="multiple" variant="outline" value={styles} onValueChange={setStyles} aria-label="Text style">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <Icon name="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <Icon name="italic" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <Icon name="underline" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" variant="outline" tone="marker" value={styles} onValueChange={setStyles} aria-label="Text style, hand-lettered">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <span className="font-script text-2xl leading-none font-bold">B</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <span className="font-script text-2xl leading-none font-bold italic">I</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <span className="font-script text-2xl leading-none font-bold underline underline-offset-4">U</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <p className={sample}>The quick brown fox, written down.</p>
    </div>
  )
}
