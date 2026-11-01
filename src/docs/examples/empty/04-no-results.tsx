import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"

export const meta = {
  title: "Search with no results",
  description: "A real use: a filterable list that turns into an empty state when nothing matches, with an action that puts the list back. Type something that is not a name.",
  layout: "center" as const,
  height: 520,
}

const people = ["Ada Lovelace", "Jo Okafor", "Mika Kobayashi", "Sam Reyes", "Priya Nair", "Tomas Berg"]

export default function Example() {
  const [query, setQuery] = React.useState("ghost pepper")
  const shown = people.filter((p) => p.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <Card seed="contacts" className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Input aria-label="Search contacts" placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} />
        {shown.length ? (
          <ul className="grid gap-2 text-sm" aria-label="Contacts">
            {shown.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : (
          <Empty className="p-2 md:p-4">
            <EmptyHeader>
              <EmptyMedia pose="shrug" size={104} />
              <EmptyTitle>No contacts found</EmptyTitle>
              <EmptyDescription>Nobody is called “{query}”. Check the spelling, or start again.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={() => setQuery("")}>
                Show everyone
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
