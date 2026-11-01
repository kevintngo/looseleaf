import { Arrow } from "@/components/ui/arrow"

export const meta = {
  title: "Directions, shafts and heads",
  description: "Eight directions, each straight and curved; then the curl and the five heads.",
  layout: "stack" as const,
}

const DIRS = ["right", "left", "up", "down", "up-right", "up-left", "down-right", "down-left"] as const

export default function Example() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-4 gap-x-4 gap-y-2 sm:grid-cols-8">
        {DIRS.map((d) => (
          <Arrow key={d} direction={d} className="h-12 w-16" />
        ))}
        {DIRS.map((d) => (
          <Arrow key={`c-${d}`} direction={d} curve="curved" tone="blue" className="h-12 w-16" />
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <figure className="grid justify-items-center gap-1">
          <Arrow direction="right" curve="curl" tone="red" className="h-12 w-40" />
          <figcaption className="font-type text-[11px] tracking-[0.18em] text-pencil-text uppercase">curl</figcaption>
        </figure>
        {(["v", "two", "open", "solid", "none"] as const).map((h) => (
          <figure key={h} className="grid justify-items-center gap-1">
            <Arrow direction="up-right" curve="curved" head={h} tone="ink" className="h-12 w-20" />
            <figcaption className="font-type text-[11px] tracking-[0.18em] text-pencil-text uppercase">{h}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
