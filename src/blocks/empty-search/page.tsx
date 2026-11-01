"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { EmptySearchList, PEOPLE, findPeople } from "@/blocks/empty-search/components/empty-search-people"

const SUGGESTIONS = ["Ada", "Printer", "Lagos"]

type EmptySearchProps = {
  defaultQuery?: string
}

export default function EmptySearch({ defaultQuery = "ghost pepper" }: EmptySearchProps) {
  const titleId = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState(defaultQuery)
  const people = findPeople(query)
  const set = (value: string) => {
    setQuery(value)
    inputRef.current?.focus()
  }

  return (
    <section aria-labelledby={titleId} className="@container w-full">
      <div className="px-8 py-10 @xl:py-14">
        <Card tape="corner" tapeKind="masking" seed="empty-search" className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>
              <h2 id={titleId}>Contacts</h2>
            </CardTitle>
            <CardDescription>{PEOPLE.length} people in your address book</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            <InputGroup>
              <InputGroupAddon>
                <Icon name="search" />
              </InputGroupAddon>
              <InputGroupInput ref={inputRef} type="search" aria-label="Search contacts" placeholder="Search by name or place" value={query} onChange={(e) => setQuery(e.target.value)} />
              {query ? (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton type="button" size="icon-xs" aria-label="Clear search" onClick={() => set("")}>
                    <Icon name="x" />
                  </InputGroupButton>
                </InputGroupAddon>
              ) : null}
            </InputGroup>

            <p role="status" className="sr-only">
              {people.length === 0 ? "No results." : `${people.length} ${people.length === 1 ? "person" : "people"} found.`}
            </p>

            {people.length > 0 ? (
              <EmptySearchList people={people} />
            ) : (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia pose="search" size={120} />
                  <EmptyTitle className="wrap-anywhere">No results for &ldquo;{query.trim()}&rdquo;</EmptyTitle>
                  <EmptyDescription>Nobody is called that. Check the spelling, or try a shorter word.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button type="button" onClick={() => set("")}>
                    Clear search
                  </Button>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                    <span className="text-sm text-ink-muted">Try</span>
                    {SUGGESTIONS.map((s) => (
                      <Button key={s} type="button" variant="outline" size="sm" onClick={() => set(s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </EmptyContent>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export type { EmptySearchProps }
