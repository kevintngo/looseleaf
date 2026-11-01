import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Stepper, StepperDecrement, StepperIncrement, StepperInput, StepperTally } from "@/components/ui/stepper"

export const meta = {
  title: "Cart lines with tally marks",
  description: "The stepper in a cart: each line counts its quantity in tally marks next to the number, the total follows, and a line at zero says so. The tally is decoration; the number is the truth.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 520,
}

const LINES = [
  { id: "pencils", name: "Beeswax pencils", price: 4.5, qty: 7 },
  { id: "tape", name: "Washi tape", price: 3, qty: 2 },
  { id: "paper", name: "Graph paper pad", price: 6.25, qty: 1 },
]

export default function Example() {
  const [qty, setQty] = React.useState<Record<string, number | undefined>>(Object.fromEntries(LINES.map((l) => [l.id, l.qty])))
  const total = LINES.reduce((sum, l) => sum + (qty[l.id] ?? 0) * l.price, 0)
  return (
    <Card seed="cart" tape="top" className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Your basket</CardTitle>
        <CardDescription>Hold the plus to run up a big order.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4">
        {LINES.map((l) => (
          <div key={l.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
            <div>
              <p className="font-hand text-base font-bold">{l.name}</p>
              <p className="font-hand text-sm text-ink-muted">${l.price.toFixed(2)} each{(qty[l.id] ?? 0) === 0 ? " (none)" : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <StepperTally value={qty[l.id]} className="hidden sm:inline-block" />
              <Stepper aria-label={`${l.name} quantity`} value={qty[l.id]} onValueChange={(v) => setQty((q) => ({ ...q, [l.id]: v }))} min={0} max={99}>
                <StepperDecrement aria-label={`Fewer ${l.name}`} />
                <StepperInput />
                <StepperIncrement aria-label={`More ${l.name}`} />
              </Stepper>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t">
        <p className="font-script text-2xl font-bold" aria-live="polite">
          Total ${total.toFixed(2)}
        </p>
        <Button disabled={total === 0}>Check out</Button>
      </CardFooter>
    </Card>
  )
}
