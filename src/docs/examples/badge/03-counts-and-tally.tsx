import { Badge } from "@/components/ui/badge"

export const meta = {
  title: "Counts and tally marks",
  description:
    "A number in tabular figures that stops at 99+, and the same number written the way a person keeps score: four uprights and a slash. Screen readers get the digits either way.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge count={3} />
        <Badge count={8} variant="secondary" />
        <Badge count={42} variant="outline" />
        <Badge count={128} variant="destructive" />
        <Badge count={1200} max={999} variant="outline" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge tally count={1} variant="outline" />
        <Badge tally count={3} variant="outline" />
        <Badge tally count={5} variant="outline" />
        <Badge tally count={7} variant="secondary" />
        <Badge tally count={12} />
        <Badge tally count={9} variant="destructive" />
      </div>
    </div>
  )
}
