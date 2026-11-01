import { Tape, type TapeProps } from "@/components/ui/tape"

export const meta = {
  title: "Ends and sizes",
  description: "Tear it, pink it, cut it straight. Any length and width; the middle stretches, the ends keep their teeth.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const strips: { label: string; props: TapeProps }[] = [
  { label: "saw", props: { kind: "masking", ends: "saw", length: 160, height: 24 } },
  { label: "torn", props: { kind: "masking", ends: "torn", length: 160, height: 24 } },
  { label: "scissor", props: { kind: "washi-dots", ends: "scissor", length: 160, height: 24, color: "sky" } },
  { label: "straight", props: { kind: "washi-dots", ends: "straight", length: 160, height: 24, color: "grape" } },
  { label: "short, 64 x 18", props: { kind: "washi-stripes", length: 64, height: 18, color: "grass" } },
  { label: "wide, 220 x 34", props: { kind: "kraft", length: 220, height: 34 } },
]

export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-7 p-4 sm:grid-cols-3">
      {strips.map(({ label, props }) => (
        <div key={label} className="flex flex-col items-start gap-2">
          <Tape {...props} seed={label} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
