import { Handwritten } from "@/components/ui/handwritten"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "A sticky note",
  description: "Handwritten inside a sticky note: the sheet turns a little, the words only jitter.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Paper stock="sticky-yellow" tilt seed="sticky" curl className="w-56 p-5">
      <Handwritten as="p" className="font-script text-[26px] leading-[1.15]">
        call mum before six, and bring the good umbrella!
      </Handwritten>
    </Paper>
  )
}
