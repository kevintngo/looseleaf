import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "An editable field in a form",
  description: "ComboboxInput on its own is the field: it shows the chosen country until you type, opens as you type, and puts the country back if you close without choosing. The hidden input (name) submits the code.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 580,
}

const COUNTRIES = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "nz", label: "New Zealand" },
]

export default function Example() {
  const [sent, setSent] = React.useState<string | null>(null)
  return (
    <Card seed="ship" tape="top" className="w-full max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSent(String(new FormData(e.currentTarget).get("country") || "nothing"))
        }}
      >
        <CardHeader>
          <CardTitle>Shipping</CardTitle>
          <CardDescription>Where should it go?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 py-4">
          <Label htmlFor="country">Country</Label>
          <Combobox items={COUNTRIES} name="country" defaultValue="nz" label="Country" required>
            <ComboboxInput id="country" placeholder="Start typing a country..." showClear />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxEmpty>No such country.</ComboboxEmpty>
                {COUNTRIES.map((c) => (
                  <ComboboxItem key={c.value} value={c.value} label={c.label}>
                    {c.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <p className="font-hand text-sm text-ink-muted" aria-live="polite">
            {sent ? `Sent country code: ${sent}` : "Nothing sent yet."}
          </p>
          <Button type="submit">Ship</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
