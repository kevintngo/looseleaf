import { Squiggle } from "@/components/ui/squiggle"

export const meta = {
  title: "Six kinds, and vertical",
  description: "Wave, zig-zag, loops, scallops, dashes and dots; then the same patterns standing up.",
  layout: "stack" as const,
}

const KINDS = ["wavy", "zigzag", "loops", "scallops", "dashes", "dots"] as const

export default function Example() {
  return (
    <div className="grid max-w-lg gap-4">
      {KINDS.map((k, i) => (
        <div key={k} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-sm text-muted-foreground">
          {k}
          <Squiggle kind={k} tone={i % 2 ? "blue" : "ink"} />
        </div>
      ))}
      <div className="flex h-28 gap-6">
        {KINDS.map((k) => (
          <Squiggle key={k} kind={k} orientation="vertical" tone="pencil" />
        ))}
      </div>
    </div>
  )
}
