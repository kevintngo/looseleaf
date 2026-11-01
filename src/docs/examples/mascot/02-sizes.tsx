import { Mascot } from "@/components/ui/mascot"

export const meta = {
  title: "Sizes are redrawn",
  description: "Under 28 px he is a face on a silhouette (two dots and a smile), 32 and 48 px add the blush, the wood and the graphite tip, 96 px is the master, 160 px adds a shine and a ferrule line.",
}

export default function Example() {
  return (
    <div className="flex items-end gap-8">
      {[24, 32, 48, 96, 160].map((size) => (
        <figure key={size} className="flex flex-col items-center gap-1">
          <Mascot pose="idle" size={size} />
          <figcaption className="text-sm text-pencil-text">{size}</figcaption>
        </figure>
      ))}
    </div>
  )
}
