import { Paper } from "@/components/ui/paper"
import { Tape } from "@/components/ui/tape"

export const meta = {
  title: "Holding a card",
  description: "Tape is placed with className, like any element: absolute, a little outside the sheet, turned. The strip's own angle is seeded and never more than a few degrees.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Paper stock="index-card" seed="taped" className="relative mx-auto mt-6 min-h-[120px] w-72 px-6 pt-3.5 pb-4">
      <Tape kind="washi-stripes" angle={-36} className="absolute -top-2 -left-7" seed="l" />
      <Tape kind="washi-zigzag" angle={34} className="absolute -top-2 -right-7" seed="r" />
      <p className="font-script text-[1.7rem] leading-[30px] font-bold">Taped at an angle</p>
      <p className="text-[15px] leading-[30px]">Two strips of washi, no pins.</p>
    </Paper>
  )
}
