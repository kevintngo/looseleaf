import { NotebookCover, NotebookCoverLabel } from "@/components/ui/notebook"

export const meta = {
  title: "On the shelf",
  description: "The closed notebook: cloth over board, a darker spine stitched to it, an elastic band, and a paper label. Any stationery colour, or black.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const shelf = [
  { tone: "tomato", name: "Field notes" },
  { tone: "teal", name: "Recipes" },
  { tone: "sky", name: "Sketches" },
  { tone: "grape", name: "Letters", band: false },
  { tone: "ink", name: "Accounts" },
] as const

export default function Example() {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 p-2">
      {shelf.map((n) => (
        <NotebookCover key={n.name} tone={n.tone} band={"band" in n ? n.band : true} seed={n.name} role="group" aria-label={`${n.name} notebook`}>
          <NotebookCoverLabel>{n.name}</NotebookCoverLabel>
        </NotebookCover>
      ))}
    </div>
  )
}
