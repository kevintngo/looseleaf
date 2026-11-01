import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export const meta = {
  title: "Spacing between slides",
  description:
    "The gap is padding at the start of each item, pulled back by the same negative margin on the content, so the first slide still meets the edge. The default is `ps-4` with `-ms-4`; here it is `ps-1` with `-ms-1` for a tight row. Use the logical `ms`/`ps` (not `ml`/`pl`) so right-to-left pages work; vertical carousels use `pt` and `-mt`.",
  layout: "center" as const,
  height: 340,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="mx-12 w-full max-w-sm">
      <Carousel aria-label="Numbered cards, tightly spaced" opts={{ align: "start" }} seed="spacing">
        <CarouselContent className="-ms-1">
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselItem key={i} aria-label={`${i + 1} of 5`} className="ps-1 md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card seed={`space${i}`}>
                  <CardContent className="grid aspect-square place-items-center p-6">
                    <span className="font-script text-3xl font-semibold">{i + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
