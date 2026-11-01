import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"

export const meta = {
  title: "The tally, several at a time",
  description:
    "CarouselDots keeps count like a tally: a stroke per slide, the fifth of each group struck across the four before it, the current one in blue felt (click any to go there). Seven slides, two per view on wide screens, and the API from setApi drives the caption.",
  layout: "center" as const,
  height: 380,
  stage: "desk" as const,
}

const STOCKS = ["sticky-yellow", "index-card", "kraft", "paper", "sticky-blue", "graph", "sticky-pink"] as const
const NOTES = ["Ink", "A good eraser", "Tape", "Index cards", "Washi (dots)", "A ruler", "Stamp pad"]

export default function Example() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const update = () => setCurrent(api.selectedScrollSnap())
    update()
    api.on("select", update)
    return () => {
      api.off("select", update)
    }
  }, [api])

  return (
    <div className="mx-12 w-full max-w-md">
      <Carousel aria-label="Shopping notes" setApi={setApi} seed="tally" opts={{ align: "start" }}>
        <CarouselContent>
          {NOTES.map((n, i) => (
            <CarouselItem key={n} className="basis-1/2" aria-label={`${i + 1} of ${NOTES.length}`}>
              <Card seed={`n${i}`} stock={STOCKS[i % STOCKS.length]}>
                <CardContent className="grid aspect-[4/3] place-items-center p-4 text-center">
                  <span className="font-script text-2xl leading-tight font-semibold">{n}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
      <p className="mt-3 text-center text-sm text-muted-foreground" aria-hidden="true">
        Slide {current + 1} of {api?.scrollSnapList().length ?? NOTES.length}
      </p>
    </div>
  )
}
