import { FakeCard, FakeCardContent, FakeCardHeader, FakeCardTitle } from "../../good/src/components/ui/fake-card"

export const meta = { title: "Card" }

export default function Example() {
  return (
    <FakeCard>
      <FakeCardHeader>
        <FakeCardTitle>Field notes</FakeCardTitle>
      </FakeCardHeader>
      <FakeCardContent>Sketched at the kitchen table.</FakeCardContent>
    </FakeCard>
  )
}
