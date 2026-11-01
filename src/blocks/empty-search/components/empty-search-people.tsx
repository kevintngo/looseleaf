import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type EmptySearchPerson = { name: string; role: string }

const PEOPLE: EmptySearchPerson[] = [
  { name: "Ada Lovelace", role: "Editor, London" },
  { name: "Jo Okafor", role: "Illustrator, Lagos" },
  { name: "Mika Kobayashi", role: "Bookbinder, Osaka" },
  { name: "Sam Reyes", role: "Printer, Lisbon" },
  { name: "Priya Nair", role: "Operations, Pune" },
  { name: "Tomas Berg", role: "Finance, Malmö" },
]

function findPeople(query: string, people: EmptySearchPerson[] = PEOPLE): EmptySearchPerson[] {
  const q = query.trim().toLowerCase()
  if (!q) return people
  return people.filter((p) => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q))
}

function EmptySearchList({ people }: { people: EmptySearchPerson[] }) {
  return (
    <ul className="grid list-none gap-1" aria-label="Contacts">
      {people.map((p) => (
        <li key={p.name} className="flex items-center gap-3 py-1.5">
          <Avatar>
            <AvatarFallback name={p.name} />
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[17px] leading-6 font-bold">{p.name}</p>
            <p className="truncate text-sm leading-5 text-ink-muted">{p.role}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export { EmptySearchList, PEOPLE, findPeople }
export type { EmptySearchPerson }
