import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LabelTag, LabelTagDescription, LabelTagPrice, LabelTagTitle } from "@/components/ui/label-tag"

export const meta = {
  title: "A shelf of price tags",
  description: "A real use: a product shelf on a kraft card, two tags to a row. Each tag is a labelled group with its price as text; the string hangs from the shelf edge.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 420,
}

const goods = [
  { name: "Felt tips", note: "twelve colours", price: "18.00", twine: "tomato" },
  { name: "Washi tape", note: "dots, of course", price: "3.00", twine: "sky" },
  { name: "Glue stick", note: "acid free", price: "2.10", twine: "grass" },
  { name: "Notebook", note: "spiral, ruled", price: "6.40", twine: "grape" },
] as const

export default function Example() {
  return (
    <Card stock="kraft" seed="shelf" className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>The stationery shelf</CardTitle>
      </CardHeader>
      <CardContent className="mx-auto grid w-fit grid-cols-2 gap-x-16 gap-y-12 pt-6">
        {goods.map((g, i) => (
          <LabelTag key={g.name} twine={g.twine} seed={g.name} tilt={i % 2 ? 2 : -2} role="group" aria-label={`${g.name}, ${g.price}`} stock={i % 2 ? "paper" : "index-card"}>
            <LabelTagTitle className="text-[1.4rem]">{g.name}</LabelTagTitle>
            <LabelTagDescription>{g.note}</LabelTagDescription>
            <LabelTagPrice>{g.price}</LabelTagPrice>
          </LabelTag>
        ))}
      </CardContent>
    </Card>
  )
}
