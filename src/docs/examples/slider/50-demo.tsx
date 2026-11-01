import * as React from "react"

import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export const meta = {
  title: "Demo",
  description:
    "Official `slider-demo`: a single value from 0 to 100 at 60% width, written as a component that forwards its props (so a caller can pass `defaultValue`, `max`, `step` or `className`). The marker range is drawn once and clipped to the value; the only addition is an `aria-label`, which the knob needs.",
  layout: "center" as const,
}

type SliderProps = React.ComponentProps<typeof Slider>

export default function Example({ className, ...props }: SliderProps) {
  return <Slider defaultValue={[50]} max={100} step={1} aria-label="Volume" className={cn("w-[60%]", className)} {...props} />
}
