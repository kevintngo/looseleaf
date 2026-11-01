import * as React from "react"

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxLoading, ComboboxTrigger, ComboboxValue } from "@/components/ui/combobox"

export const meta = {
  title: "Results from a server",
  description: "Filtering is off (shouldFilter={false}) and the search text is watched: while a request is in flight the loops show and the empty message waits. Try \"gra\" (two people), then \"zzz\".",
  layout: "center" as const,
  height: 380,
}

const PEOPLE = ["Ada Lovelace", "Grace Hopper", "Graham Bell", "Katherine Johnson", "Alan Turing", "Margaret Hamilton"]

export default function Example() {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<string[]>(PEOPLE.slice(0, 3))
  const [loading, setLoading] = React.useState(false)
  const [value, setValue] = React.useState<string | null>(null)
  React.useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setResults(PEOPLE.filter((p) => p.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5))
      setLoading(false)
    }, 600)
    return () => window.clearTimeout(t)
  }, [query])
  return (
    <div className="self-start">
      <Combobox shouldFilter={false} loading={loading} inputValue={query} onInputValueChange={setQuery} value={value} onValueChange={setValue} label="Assignee">
        <ComboboxTrigger aria-label="Assignee" className="w-64">
          <ComboboxValue placeholder="Assign to..." />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search people..." />
          <ComboboxList>
            {loading && <ComboboxLoading>Searching...</ComboboxLoading>}
            <ComboboxEmpty>Nobody by that name.</ComboboxEmpty>
            {results.map((p) => (
              <ComboboxItem key={p} value={p}>
                {p}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
