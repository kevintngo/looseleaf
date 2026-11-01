import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Stepper } from "@/components/ui/stepper"

export const meta = {
  title: "In a form",
  description: "name puts the number in FormData; required refuses an empty field (a blank is put back); Reset returns an uncontrolled stepper to its default. The third one is invalid, the fourth disabled.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 560,
}

export default function Example() {
  const [sent, setSent] = React.useState<string | null>(null)
  return (
    <Card seed="party" tape="corner" className="w-full max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const d = new FormData(e.currentTarget)
          setSent(`${d.get("adults")} adults, ${d.get("kids")} kids`)
        }}
        onReset={() => setSent(null)}
      >
        <CardHeader>
          <CardTitle>Party of ...</CardTitle>
          <CardDescription>How many are coming?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="adults">Adults</Label>
            <Stepper id="adults" name="adults" defaultValue={2} min={1} max={12} required />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="kids">Kids</Label>
            <Stepper id="kids" name="kids" defaultValue={0} min={0} max={12} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="highchairs">High chairs (we have two)</Label>
            <Stepper id="highchairs" defaultValue={3} min={0} max={5} invalid aria-describedby="hc-msg" />
          </div>
          <p id="hc-msg" role="alert" className="-mt-2 text-end font-hand text-sm text-red">
            We only have two.
          </p>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="closed">Rooftop seats</Label>
            <Stepper id="closed" defaultValue={0} disabled />
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <p className="font-hand text-sm text-ink-muted" aria-live="polite">
            {sent ?? "Nothing sent yet."}
          </p>
          <div className="flex gap-2">
            <Button type="reset" variant="ghost">
              Reset
            </Button>
            <Button type="submit">Book</Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
