import { Slider } from "@/components/ui/slider"

export const meta = {
  title: "Vertical",
  description: "A mixing desk: `orientation=\"vertical\"` stands the groove up; the range grows from the bottom. The last fader is disabled.",
  layout: "center" as const,
  height: 300,
}

const bands = [
  ["60", 40],
  ["230", 65],
  ["910", 50],
  ["3k", 80],
  ["14k", 30],
] as const

export default function Example() {
  return (
    <div className="flex h-56 items-stretch gap-8">
      {bands.map(([hz, v], i) => (
        <div key={hz} className="flex flex-col items-center gap-3">
          <Slider orientation="vertical" defaultValue={[v]} disabled={i === bands.length - 1} aria-label={`${hz} Hz`} ticks={4} className="min-h-0 flex-1" />
          <span className="text-sm text-ink-muted">{hz}</span>
        </div>
      ))}
    </div>
  )
}
