import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export const meta = {
  title: "Horizontal demo",
  description:
    "Official `scroll-area-horizontal-demo`: a strip of figures that scrolls sideways under an explicit `ScrollBar orientation=\"horizontal\"`. shadcn shows three stock photographs; here they are polaroids of drawn scenes, so nothing is fetched. `bleed` gives the viewport 12 px so the photos' shadows are not cut at the edge.",
  layout: "center" as const,
  stage: "desk" as const,
}

interface Artwork {
  artist: string
  scene: "hills" | "sea" | "night"
}

const works: Artwork[] = [
  { artist: "Mira", scene: "hills" },
  { artist: "Tom", scene: "sea" },
  { artist: "Vlad", scene: "night" },
]

export default function Example() {
  return (
    <ScrollArea bleed className="w-96 whitespace-nowrap">
      <div className="flex w-max space-x-4 p-4">
        {works.map((artwork) => (
          <Polaroid key={artwork.artist} seed={artwork.artist} className="w-52 shrink-0 whitespace-normal">
            <PolaroidImage scene={artwork.scene} label={`Drawing by ${artwork.artist}`} seed={artwork.scene} />
            <PolaroidCaption className="text-2xl">Drawn by {artwork.artist}</PolaroidCaption>
          </Polaroid>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
