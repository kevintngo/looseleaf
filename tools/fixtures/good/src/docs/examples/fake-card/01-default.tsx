import { FakeCard, FakeCardContent, FakeCardHeader, FakeCardTitle } from "@/components/ui/fake-card"
import { FakeButton } from "@/components/ui/fake-button"

export const meta = { title: "Card with action" }

export default function Example() {
  return (
    <FakeCard className="w-80">
      <FakeCardHeader>
        <FakeCardTitle>Field notes</FakeCardTitle>
      </FakeCardHeader>
      <FakeCardContent>Sketched at the kitchen table, third coffee.</FakeCardContent>
      <FakeButton seed="card-action" variant="outline">
        Open
      </FakeButton>
    </FakeCard>
  )
}
