import * as React from "react"

import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"

export const meta = {
  title: "Photo stack (composed)",
  description: "A real use: a trip's snapshots as taped-down polaroids. The line under the tally reads the current photo's date from the Embla API (the polaroid already carries its own caption); the tally counts them, and loops keep both arrows alive.",
  layout: "center" as const,
  height: 480,
  stage: "desk" as const,
}

const PHOTOS = [
  ["hills", "Day one: the ridge road", "3 Mar"],
  ["sea", "Lunch by the harbour", "4 Mar"],
  ["house", "The yellow house", "5 Mar"],
  ["night", "Lanterns after dark", "5 Mar"],
  ["hills", "Heading home", "7 Mar"],
  ["sea", "The last swim", "7 Mar"],
] as const

export default function Example() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [at, setAt] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const sync = () => setAt(api.selectedScrollSnap())
    sync()
    api.on("select", sync)
    return () => {
      api.off("select", sync)
    }
  }, [api])

  return (
    <div className="mx-14 w-full max-w-xs">
      <Carousel aria-label="Trip photos" setApi={setApi} opts={{ loop: true }} seed="trip">
        <CarouselContent>
          {PHOTOS.map(([scene, caption, date], i) => (
            <CarouselItem key={caption} aria-label={`${i + 1} of ${PHOTOS.length}`} className="grid place-items-center">
              <Polaroid seed={`p${i}`} tilt={i % 2 ? 1.2 : -1.2}>
                <PolaroidImage scene={scene} date={date} seed={`s${i}`} label={caption} />
                <PolaroidCaption>{caption}</PolaroidCaption>
              </Polaroid>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
      <p className="mt-3 text-center font-script text-xl leading-none text-ink-soft" aria-hidden="true">
        {PHOTOS[at][2]} · {at + 1} of {PHOTOS.length}
      </p>
    </div>
  )
}
