import * as React from "react"

import { Rating } from "@/components/ui/rating"

export const meta = {
  title: "Survey rows",
  description: "Several ratings side by side with their own labels and a running summary. Each row is labelled with aria-labelledby; the value text is your own.",
  layout: "stack" as const,
}

const rows = [
  ["pace", "Pace", "star"],
  ["snacks", "Snacks", "heart"],
  ["sun", "Sunshine", "sun"],
] as const

export default function Example() {
  const [v, setV] = React.useState<Record<string, number>>({ pace: 4, snacks: 5, sun: 2 })
  const total = Object.values(v).reduce((a, b) => a + b, 0)
  return (
    <div className="grid w-full max-w-sm gap-3">
      {rows.map(([key, label, icon]) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <span id={`sv-${key}`} className="text-[15px] font-bold">
            {label}
          </span>
          <Rating icon={icon} value={v[key]} onValueChange={(n) => setV((s) => ({ ...s, [key]: n }))} aria-labelledby={`sv-${key}`} clearable />
        </div>
      ))}
      <p className="ll-num text-sm text-ink-muted">Total: {total} of 15</p>
    </div>
  )
}
