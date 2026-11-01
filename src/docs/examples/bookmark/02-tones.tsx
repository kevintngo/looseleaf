import { Bookmark } from "@/components/ui/bookmark"

export const meta = {
  title: "Eight ribbons",
  description: "Every stationery accent. Each ribbon is woven and edge-stitched, lit from the upper left, a hair off straight.",
  layout: "center" as const,
  stage: "desk" as const,
}

const tones = ["tomato", "tangerine", "lemon", "grass", "teal", "sky", "grape", "bubblegum"] as const

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-6">
      {tones.map((tone) => (
        <Bookmark key={tone} tone={tone} defaultPressed seed={tone}>
          {tone}
        </Bookmark>
      ))}
    </div>
  )
}
