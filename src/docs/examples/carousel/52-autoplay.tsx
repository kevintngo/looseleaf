import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { Icon } from "@/components/ui/icon"
import { useReducedMotion } from "@/hooks/use-live-motion"

export const meta = {
  title: "Autoplay (an Embla plugin)",
  description:
    "Anything Embla understands goes in `plugins`; this small autoplay is written inline, so no extra package. It holds still while the pointer, focus or a finger is on the carousel, keeps a Pause through a resize, never starts for readers who asked for less motion, and has a real Pause button (WCAG 2.2.2).",
  layout: "center" as const,
  height: 420,
  stage: "desk" as const,
}

type Embla = NonNullable<CarouselApi>

export function autoplay(delay: number) {
  let embla: Embla | undefined
  let timer: number | undefined
  let bound = false
  let wanted = true
  const holds = new Set<string>()
  const stop = () => {
    window.clearInterval(timer)
    timer = undefined
  }
  const sync = () => {
    stop()
    if (!embla || !wanted || holds.size > 0) return
    timer = window.setInterval(() => (embla?.canScrollNext() ? embla.scrollNext() : embla?.scrollTo(0)), delay)
  }
  const self = {
    name: "autoplay",
    options: {},
    init(api: Embla) {
      embla = api
      if (!bound) {
        bound = true
        api.on("pointerDown", () => self.hold("drag", true))
        api.on("pointerUp", () => self.hold("drag", false))
      }
      sync()
    },
    destroy: stop,
    want(on: boolean) {
      wanted = on
      sync()
    },
    hold(why: string, on: boolean) {
      if (on) holds.add(why)
      else holds.delete(why)
      sync()
    },
  }
  return self
}

export default function Example() {
  const [autoplayer] = React.useState(() => autoplay(2200))
  const [paused, setPaused] = React.useState(false)
  const reduced = useReducedMotion()
  const playing = !paused && !reduced

  React.useEffect(() => autoplayer.want(playing), [autoplayer, playing])

  return (
    <div className="mx-12 flex w-full max-w-xs flex-col gap-3">
      <Carousel
        aria-label="Numbered cards, playing by themselves"
        plugins={[autoplayer]}
        seed="autoplay"
        onMouseEnter={() => autoplayer.hold("pointer", true)}
        onMouseLeave={() => autoplayer.hold("pointer", false)}
        onFocus={() => autoplayer.hold("focus", true)}
        onBlur={() => autoplayer.hold("focus", false)}
      >
        <CarouselContent>
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselItem key={i} aria-label={`${i + 1} of 5`}>
              <div className="p-1">
                <Card seed={`auto${i}`}>
                  <CardContent className="grid aspect-square place-items-center p-6">
                    <span className="font-script text-6xl font-semibold">{i + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {reduced ? (
        <p className="text-center text-sm text-muted-foreground">Autoplay is off because you asked for less motion. Use the arrows.</p>
      ) : (
        <Button variant="ghost" size="sm" className="self-center" onClick={() => setPaused(!paused)}>
          <Icon name={playing ? "pause" : "play"} />
          {playing ? "Pause autoplay" : "Play autoplay"}
        </Button>
      )}
    </div>
  )
}
