import * as React from "react"

import { Combobox, ComboboxContent, ComboboxCreate, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Create what you typed",
  description: "Type a name that is not in the list and the last row offers to add it. Choosing it calls onCreate (you add it to your list) and then chooses it. An exact match, in any case, hides the offer.",
  layout: "center" as const,
  height: 380,
}

export default function Example() {
  const [tags, setTags] = React.useState(["Sourdough", "Focaccia", "Rye", "Brioche"])
  const [value, setValue] = React.useState<string | null>(null)
  return (
    <div className="grid w-64 gap-2 self-start">
      <Label htmlFor="bread">Bread</Label>
      <Combobox items={tags} value={value} onValueChange={setValue} label="Bread">
        <ComboboxTrigger id="bread" className="w-full">
          <ComboboxValue placeholder="Pick or add a bread..." />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search or add..." />
          <ComboboxList>
            <ComboboxEmpty>No bread yet.</ComboboxEmpty>
            {tags.map((t) => (
              <ComboboxItem key={t} value={t}>
                {t}
              </ComboboxItem>
            ))}
            <ComboboxCreate onCreate={(text) => setTags((all) => [...all, text])}>{(text) => `Add "${text}"`}</ComboboxCreate>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
