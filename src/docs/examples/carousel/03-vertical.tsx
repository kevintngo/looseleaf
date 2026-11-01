import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export const meta = {
  title: "Vertical",
  description: "orientation=\"vertical\": the slides scroll up and down, the arrows sit above and below with up and down arrows, and the keys are ArrowUp and ArrowDown. Give the track a fixed height and offset the gap with -mt on the content and pt on the items.",
  layout: "center" as const,
  height: 420,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="my-12 w-full max-w-xs">
      <Carousel aria-label="Reminders" orientation="vertical" opts={{ align: "start" }} seed="vertical">
        <CarouselContent className="-mt-1 h-[200px]">
          {["Water the plants", "Call the printer", "Sharpen pencils", "Post the letters"].map((t, i) => (
            <CarouselItem key={t} className="pt-1 md:basis-1/2" aria-label={`${i + 1} of 4`}>
              <Card seed={`r${i}`} className="gap-0 py-3">
                <CardContent className="flex items-center justify-center p-4">
                  <span className="font-script text-2xl font-semibold">{t}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
