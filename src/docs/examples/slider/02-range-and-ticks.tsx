import * as React from "react"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export const meta = {
  title: "Range, ticks and tones",
  description: "Two values make a range slider. `ticks` hangs pencil marks under the groove (one per step, or a number of intervals); `tone` swaps the marker for a highlighter or blue felt.",
  layout: "stack" as const,
}

export default function Example() {
  const [price, setPrice] = React.useState([200, 650])
  return (
    <div className="grid w-full max-w-md gap-8">
      <div className="grid gap-3">
        <div className="flex items-baseline justify-between">
          <Label id="price-label">Price</Label>
          <span className="ll-num font-script text-2xl leading-none text-ink-you">
            ${price[0]} to ${price[1]}
          </span>
        </div>
        <Slider value={price} onValueChange={setPrice} min={0} max={1000} step={50} ticks aria-labelledby="price-label" />
      </div>
      <div className="grid gap-3">
        <Label id="hi-label">Highlighter</Label>
        <Slider defaultValue={[3]} min={0} max={5} step={1} ticks tone="hi" aria-labelledby="hi-label" />
      </div>
      <div className="grid gap-3">
        <Label id="felt-label">Felt tip</Label>
        <Slider defaultValue={[40]} ticks={4} tone="blue" aria-labelledby="felt-label" />
      </div>
    </div>
  )
}
