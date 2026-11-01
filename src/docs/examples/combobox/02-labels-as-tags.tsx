import * as React from "react"

import { Combobox, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Labels as hang-tags",
  description: "A multi-select whose choices are tags on a string: each a little different, a punched hole at the point, the x wearing the highlighter when you reach for it. Click anywhere in the field to type; Backspace in the empty input takes the last tag back. tone=\"auto\" gives each label its own color.",
  layout: "center" as const,
  height: 440,
}

const LABELS = ["Design", "Garden", "Travel", "Recipes", "Field notes", "Ideas", "Reading", "Music"]

export default function Example() {
  const [value, setValue] = React.useState<string[]>(["Design", "Garden", "Travel"])
  return (
    <div className="grid w-96 gap-2 self-start">
      <Label htmlFor="labels">Labels</Label>
      <Combobox multiple items={LABELS} value={value} onValueChange={setValue} label="Labels">
        <ComboboxChips tone="auto">
          <ComboboxChipsInput id="labels" placeholder={value.length ? "" : "Add a label..."} />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No label like that.</ComboboxEmpty>
            {LABELS.map((l) => (
              <ComboboxItem key={l} value={l}>
                {l}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
