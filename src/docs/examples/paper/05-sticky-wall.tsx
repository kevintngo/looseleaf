import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "A wall of sticky notes",
  description: "Sticky notes are turned a little more than pages, cast a shadow that lifts at the foot, and can curl a corner. One note per meaning; the first word says what it is.",
  layout: "stack" as const,
}

const notes = [
  { stock: "sticky-yellow", head: "todo", body: "buy more ink", curl: true },
  { stock: "sticky-green", head: "done", body: "book the venue", curl: false },
  { stock: "sticky-orange", head: "careful", body: "the glue is wet", curl: false },
  { stock: "sticky-pink", head: "urgent", body: "call mum", curl: true },
  { stock: "sticky-blue", head: "tip", body: "tape it down first", curl: false },
] as const

export default function Example() {
  return (
    <div className="flex flex-wrap justify-center gap-6 p-4">
      {notes.map((n) => (
        <Paper key={n.head} stock={n.stock} curl={n.curl} seed={n.head} className="size-36 p-4">
          <p className="font-script text-2xl font-bold leading-none">{n.head}</p>
          <p className="mt-2 text-sm">{n.body}</p>
        </Paper>
      ))}
    </div>
  )
}
