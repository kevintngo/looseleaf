import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Doodle } from "@/components/ui/doodle"

export const meta = {
  title: "A photo album",
  description:
    "Thumbnails that stay 4:3 whatever the columns do, each with its caption underneath. Resize the window: the grid reflows and every picture keeps its shape.",
  layout: "stack" as const,
}

const photos = [
  { title: "The lake", doodle: "sun", tint: "bg-sky/35" },
  { title: "First tulip", doodle: "flower", tint: "bg-lemon/40" },
  { title: "The ring behind the shed", doodle: "mushroom", tint: "bg-bubblegum/35" },
  { title: "Night walk", doodle: "star", tint: "bg-grape/25" },
  { title: "Picnic", doodle: "sun", tint: "bg-tangerine/25" },
  { title: "Bread", doodle: "flower", tint: "bg-grass/30" },
] as const

export default function Example() {
  return (
    <Card className="mx-auto w-full max-w-2xl" seed="album">
      <CardHeader>
        <CardTitle>Field trip, June</CardTitle>
        <CardDescription>Six photographs, none of them straight.</CardDescription>
        <CardAction>
          <Badge variant="secondary">6 photos</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((p) => (
            <figure key={p.title} className="flex flex-col gap-1.5">
              <AspectRatio ratio={4 / 3} className={`grid place-items-center overflow-hidden ${p.tint}`}>
                <Doodle name={p.doodle} size={56} />
              </AspectRatio>
              <figcaption className="text-sm leading-tight">{p.title}</figcaption>
            </figure>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
