import * as React from "react"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandLoading } from "@/components/ui/command"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Empty and loading",
  description: "Results that come from a server: filtering is off (`shouldFilter={false}`), the loops show while a search is on its way, and Stubby comes out with his magnifier when the answer is nothing. Try \"inv\", then \"zzz\".",
  layout: "center" as const,
  stage: "desk" as const,
  height: 330,
}

const DOCS = ["Invoice 0142", "Invoice 0143", "Invoice 0150", "Inventory count", "Invitation list"]

export default function Example() {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<string[]>([])
  const [busy, setBusy] = React.useState(false)
  React.useEffect(() => {
    if (!query) {
      setResults([])
      setBusy(false)
      return
    }
    setBusy(true)
    const t = window.setTimeout(() => {
      setResults(DOCS.filter((d) => d.toLowerCase().includes(query.toLowerCase())))
      setBusy(false)
    }, 700)
    return () => window.clearTimeout(t)
  }, [query])
  return (
    <Command shouldFilter={false} className="h-auto w-[22rem]" label="Search documents">
      <CommandInput value={query} onValueChange={setQuery} placeholder="Search documents..." />
      <CommandList>
        {busy && <CommandLoading>Searching...</CommandLoading>}
        {!busy && query && results.length === 0 && <CommandEmpty>No documents found.</CommandEmpty>}
        {!busy && results.length > 0 && (
          <CommandGroup heading="Documents">
            {results.map((d) => (
              <CommandItem key={d} value={d}>
                <Icon name="file-text" />
                <span>{d}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      {!query && <p className="px-3 py-6 text-center font-script text-xl text-ink-muted">Type to search.</p>}
    </Command>
  )
}
