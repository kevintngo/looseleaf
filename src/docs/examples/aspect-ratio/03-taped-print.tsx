import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Doodle } from "@/components/ui/doodle"
import { Tape } from "@/components/ui/tape"

export const meta = {
  title: "Taped at the corners",
  description:
    "A 4:3 print with no border, held by four strips of masking tape laid across its corners. The tape is placed with className (absolute, a little outside, turned), like any element.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 320,
}

export default function Example() {
  return (
    <div className="flex justify-center p-10">
      <div className="relative w-80">
        <AspectRatio ratio={4 / 3} className="grid place-items-center overflow-hidden bg-slip shadow-slip">
          <svg viewBox="0 0 80 60" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full">
            <path d="M-2 44 Q14 35 30 41 T60 39 T82 42 V62 H-2Z" className="fill-grass/35 stroke-ink" strokeWidth={1.4} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d="M-2 52 Q18 44 38 50 T82 48 V62 H-2Z" className="fill-grass/60 stroke-ink" strokeWidth={1.4} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d="M12 56 l.6 -2.2 m1.6 2.2 l1.4 -2 M56 54 l.6 -2.2 m1.6 2.2 l1.2 -2 M33 58 l.6 -2.2 m1.6 2.2 l1.2 -2" fill="none" className="stroke-ink" strokeWidth={1.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <Doodle name="sun" size={96} className="relative -mt-8" />
        </AspectRatio>
        <Tape kind="masking" length={72} height={22} angle={-42} className="absolute -top-2 -left-7" seed="c1" />
        <Tape kind="masking" length={72} height={22} angle={41} className="absolute -top-2 -right-7" seed="c2" />
        <Tape kind="masking" length={72} height={22} angle={40} className="absolute -bottom-2 -left-7" seed="c3" />
        <Tape kind="masking" length={72} height={22} angle={-43} className="absolute -right-7 -bottom-2" seed="c4" />
      </div>
    </div>
  )
}
