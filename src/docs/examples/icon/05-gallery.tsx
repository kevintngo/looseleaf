import { Icon } from "@/components/ui/icon"
import { icons } from "@/lib/ink/art/icons"

export const meta = {
  title: "Every icon drawn so far",
  description: "The gallery grows by itself as icon batches land. Names are the lucide ids; hover-free, so it doubles as a search list.",
  layout: "stack" as const,
}

export default function Example() {
  const names = Object.keys(icons)
  return (
    <ul className="grid w-full grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3 text-ink">
      {names.map((name) => (
        <li key={name} className="flex flex-col items-center gap-1 py-2">
          <Icon name={name} size={24} />
          <span className="text-sm text-pencil-text">{name}</span>
        </li>
      ))}
    </ul>
  )
}
