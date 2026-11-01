import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export const meta = {
  title: "Stubby",
  description: "`pose` asks for Stubby, the pencil stub who does the drawing: `search` for no results, `sleep` for a quiet day, `unplug` for offline, and the rest of the poses as they are drawn (see the props). Media is decorative, so the title carries the meaning.",
  layout: "stack" as const,
}

const states = [
  { pose: "search", title: "No results", text: "Nothing matches “ghost pepper”. Try a shorter word.", action: "Clear search" },
  { pose: "sleep", title: "All quiet", text: "Nothing is scheduled today. Enjoy it." },
  { pose: "unplug", title: "You are offline", text: "Changes are kept on this page and sent when the line is back.", action: "Try again" },
] as const

export default function Example() {
  return (
    <div className="grid w-full gap-2 md:grid-cols-3">
      {states.map((s) => (
        <Empty key={s.pose} seed={s.pose} className="justify-start p-4 md:p-4">
          <EmptyHeader>
            <EmptyMedia pose={s.pose} size={112} />
            <EmptyTitle>{s.title}</EmptyTitle>
            <EmptyDescription>{s.text}</EmptyDescription>
          </EmptyHeader>
          {"action" in s ? (
            <EmptyContent>
              <Button size="sm">{s.action}</Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ))}
    </div>
  )
}
