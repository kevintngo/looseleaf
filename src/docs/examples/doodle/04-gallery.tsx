import { Doodle } from "@/components/ui/doodle"
import { doodles } from "@/lib/ink/art/doodles"

export const meta = {
  title: "Every doodle drawn so far",
  description: "Grows by itself as the doodle batches land.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <ul className="grid w-full grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4">
      {Object.keys(doodles).map((name) => (
        <li key={name} className="flex flex-col items-center gap-1">
          <Doodle name={name} size={72} />
          <span className="text-sm text-pencil-text">{name}</span>
        </li>
      ))}
    </ul>
  )
}
