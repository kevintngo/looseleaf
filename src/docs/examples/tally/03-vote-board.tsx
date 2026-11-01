import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tally } from "@/components/ui/tally"

export const meta = {
  title: "A vote board",
  description: "Tallies beside the words they count. Each has its own accessible name (\"12 votes for tea\").",
  layout: "center" as const,
  stage: "desk" as const,
}

const VOTES: Array<[string, number]> = [
  ["Tea", 12],
  ["Coffee", 7],
  ["Hot chocolate", 4],
  ["Water, thanks", 1],
]

export default function Example() {
  return (
    <Card className="w-full max-w-sm" stock="index-card" tilt>
      <CardHeader>
        <CardTitle className="font-script text-2xl">What shall we drink?</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2.5">
          {VOTES.map(([name, n]) => (
            <li key={name} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-[17px]">
              {name}
              <Tally count={n} label={`${n} votes for ${name}`} animate />
              <span className="ll-num text-sm text-muted-foreground" aria-hidden="true">
                {n}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
