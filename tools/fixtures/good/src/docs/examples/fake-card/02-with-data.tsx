import { FakeCard, FakeCardContent, FakeCardHeader, FakeCardTitle } from "@/components/ui/fake-card"

import { rows } from "./_data"
import { usage } from "./_lucide-usage"

export const meta = { title: "With shared data", layout: "stack" as const }

export default function Example() {
  return (
    <FakeCard className="aspect-auto min-h-24 w-80">
      <FakeCardHeader>
        <FakeCardTitle>{usage}</FakeCardTitle>
      </FakeCardHeader>
      <FakeCardContent>
        <ul>
          {rows.map((r) => (
            <li key={r.id}>{r.label}</li>
          ))}
        </ul>
      </FakeCardContent>
    </FakeCard>
  )
}
