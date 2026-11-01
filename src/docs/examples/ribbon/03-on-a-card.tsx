import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ribbon } from "@/components/ui/ribbon"

export const meta = {
  title: "On cards and as links",
  description: "A flag pinned to a card edge, a banner as a section heading, and a ribbon that is a link: `asChild` puts the drawing on your element, which lifts on hover and takes the drawn focus ring.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-3xl gap-8 md:grid-cols-2">
      <Card className="relative mt-3 overflow-visible">
        <Ribbon variant="flag" tone="tangerine" size="sm" className="absolute -top-3 -left-3 z-(--ll-z-prop)">
          New
        </Ribbon>
        <CardHeader>
          <CardTitle>Twelve felt tips</CardTitle>
          <CardDescription>Assorted, water based, no bleed.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="ll-num text-xl font-bold">$ 14.00</span>
          <Ribbon asChild variant="swallow" tone="lemon" size="sm">
            <a href="#felt-tips">See details</a>
          </Ribbon>
        </CardContent>
      </Card>
      <div className="flex flex-col items-start gap-3">
        <Ribbon size="lg" tone="teal">
          Spring stationery
        </Ribbon>
        <p className="max-w-xs text-foreground">Notebooks, washi tape and the good pencils, in the shop until the end of April.</p>
        <Ribbon asChild tone="sky">
          <button type="button">Shop the collection</button>
        </Ribbon>
      </div>
    </div>
  )
}
