import { TallyChart } from "@/components/ui/chart"

export const meta = {
  title: "Tally chart",
  description: "Counts as hand-tallied marks: four uprights and a slash across for every five, in the colour of the row. When a row is too long for the width, each mark starts to stand for more and says so.",
  layout: "stack" as const,
}

const cups = [
  { drink: "Tea", cups: 23 },
  { drink: "Coffee", cups: 14 },
  { drink: "Cocoa", cups: 8 },
  { drink: "Water", cups: 31 },
]

export default function Example() {
  return <TallyChart data={cups} nameKey="drink" valueKey="cups" label="Cups drunk today" className="mx-auto aspect-[16/8] max-w-lg" />
}
