import { Doodle } from "@/components/ui/doodle"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"

export const meta = {
  title: "Image",
  description:
    "shadcn's `item-image`: a list of tracks, each a link row with a small picture (`variant=\"image\"`), a title with the album in muted type, the artist below and the running time at the far end. The pictures are doodles, pasted in a little crooked; the original's `role=\"listitem\"` is not needed, the group already makes each link one.",
  layout: "center" as const,
}

const music = [
  {
    title: "Midnight City Lights",
    artist: "Neon Dreams",
    album: "Electric Nights",
    duration: "3:45",
    doodle: "moon",
  },
  {
    title: "Coffee Shop Conversations",
    artist: "The Morning Brew",
    album: "Urban Stories",
    duration: "4:05",
    doodle: "cup",
  },
  {
    title: "Digital Rain",
    artist: "Cyber Symphony",
    album: "Binary Beats",
    duration: "3:30",
    doodle: "rain-cloud",
  },
] as const

export default function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ItemGroup className="gap-4">
        {music.map((song) => (
          <Item key={song.title} variant="outline" asChild>
            <a href="#track">
              <ItemMedia variant="image">
                <Doodle name={song.doodle} size={36} className="mx-auto mt-0.5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">
                  {song.title} - <span className="text-muted-foreground">{song.album}</span>
                </ItemTitle>
                <ItemDescription>{song.artist}</ItemDescription>
              </ItemContent>
              <ItemContent className="flex-none text-center">
                <ItemDescription>{song.duration}</ItemDescription>
              </ItemContent>
            </a>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
