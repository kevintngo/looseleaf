import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export const meta = {
  title: "Shipping form",
  description: "A real-world use: a native select next to inputs in a form. It submits and resets like any select, `required` stops an empty submit, and the second select follows the first.",
  layout: "stack" as const,
}

const regions: Record<string, string[]> = {
  is: ["Reykjavik", "Akureyri"],
  pt: ["Lisbon", "Porto", "Faro"],
  ca: ["Ontario", "Quebec", "Alberta"],
}

export default function Example() {
  const [country, setCountry] = React.useState("")
  const [sent, setSent] = React.useState("")
  return (
    <form
      className="grid w-full max-w-md gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const d = new FormData(e.currentTarget)
        setSent(`Ships to ${d.get("region")}, ${d.get("country")}`)
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="ship-name">Name</Label>
        <Input id="ship-name" name="name" placeholder="Ada Lovelace" />
      </div>
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <div className="grid gap-2">
          <Label htmlFor="ship-country" required>
            Country
          </Label>
          <NativeSelect id="ship-country" name="country" required className="w-full" value={country} onChange={(e) => setCountry(e.target.value)}>
            <NativeSelectOption value="">Choose…</NativeSelectOption>
            <NativeSelectOption value="is">Iceland</NativeSelectOption>
            <NativeSelectOption value="pt">Portugal</NativeSelectOption>
            <NativeSelectOption value="ca">Canada</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ship-region">Region</Label>
          <NativeSelect id="ship-region" name="region" className="w-full" disabled={!country}>
            {(regions[country] ?? ["Choose a country first"]).map((r) => (
              <NativeSelectOption key={r} value={r}>
                {r}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit">Ship it</Button>
        <span role="status" className="text-sm text-ink-muted">
          {sent}
        </span>
      </div>
    </form>
  )
}
