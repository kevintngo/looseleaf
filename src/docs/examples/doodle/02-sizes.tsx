import { Doodle } from "@/components/ui/doodle"

export const meta = {
  title: "Sizes are redrawn",
  description: "Below 72 px a doodle switches to its 48 px drawing: the silhouette and one identifying detail, drawn with a heavier line.",
}

export default function Example() {
  return (
    <div className="flex flex-col gap-4">
      {["sun", "mushroom"].map((name) => (
        <div key={name} className="flex items-end gap-6">
          {[32, 48, 64, 96, 128].map((size) => (
            <figure key={size} className="flex flex-col items-center gap-1">
              <Doodle name={name} size={size} />
              <figcaption className="text-sm text-pencil-text">{size}</figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  )
}
