import * as React from "react"

import { Label } from "@/components/ui/label"
import { Stepper } from "@/components/ui/stepper"

export const meta = {
  title: "Steps, decimals and units",
  description: "A step of 0.5 on a price (no float drift, shown with two places), a temperature in whole degrees with the wheel opt-in (click into it and scroll), and a value that snaps to multiples of five.",
  layout: "stack" as const,
  height: 320,
}

export default function Example() {
  const [price, setPrice] = React.useState<number | undefined>(4.5)
  const [temp, setTemp] = React.useState<number | undefined>(20)
  const [grams, setGrams] = React.useState<number | undefined>(250)
  return (
    <div className="mx-auto grid w-full max-w-xs gap-7">
      <div className="grid justify-items-start gap-2">
        <Label htmlFor="price">Price</Label>
        <Stepper id="price" value={price} onValueChange={setPrice} min={0} step={0.5} precision={2} format={(n) => `$${n.toFixed(2)}`} parse={(t) => Number.parseFloat(t.replace("$", ""))} className="w-44" />
      </div>
      <div className="grid justify-items-start gap-2">
        <Label htmlFor="temp">Oven (wheel steps it while focused)</Label>
        <Stepper id="temp" value={temp} onValueChange={setTemp} min={-10} max={250} wheel format={(n) => `${n} C`} parse={(t) => Number.parseInt(t, 10)} className="w-44" />
      </div>
      <div className="grid justify-items-start gap-2">
        <Label htmlFor="grams">Flour, in fives</Label>
        <Stepper id="grams" value={grams} onValueChange={setGrams} min={0} max={1000} step={5} largeStep={50} snap format={(n) => `${n} g`} parse={(t) => Number.parseInt(t, 10)} className="w-44" />
      </div>
    </div>
  )
}
