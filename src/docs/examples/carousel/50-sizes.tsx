import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export const meta = {
  title: "Sizes: several slides in view",
  description:
    "A slide is as wide as its `basis-*` class: `basis-1/2` shows two, `basis-1/3` three. Breakpoint variants change it with the screen (here half from md, a third from lg), and `align: \"start\"` lines the first slide up with the left edge instead of centring it.",
  layout: "center" as const,
  height: 340,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="mx-12 w-full max-w-sm">
      <Carousel aria-label="Numbered cards, several at a time" opts={{ align: "start" }} seed="sizes">
        <CarouselContent>
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselItem key={i} aria-label={`${i + 1} of 5`} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card seed={`size${i}`}>
                  <CardContent className="grid aspect-square place-items-center p-6">
                    <span className="font-script text-4xl font-semibold">{i + 1}</span>
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
