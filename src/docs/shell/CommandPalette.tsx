import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCatalog } from "../core/catalog-context"
import { navigate, useLocation } from "../core/router"
import { hrefFor, parseHash } from "../core/router-core"
import { buildSearchIndex, search, suggestions, type SearchResult } from "../core/search"
import { Kbd } from "../kit"

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function highlight(text: string, positions: readonly number[]): ReactNode {
  if (positions.length === 0) return text
  const marked = new Set(positions)
  const out: ReactNode[] = []
  let run = ""
  let inMark = false
  const flush = () => {
    if (!run) return
    out.push(
      inMark ? (
        <mark key={out.length} className="bg-transparent px-0 font-bold underline decoration-marker decoration-2 underline-offset-2">
          {run}
        </mark>
      ) : (
        run
      ),
    )
    run = ""
  }
  for (let i = 0; i < text.length; i++) {
    const isMarked = marked.has(i)
    if (isMarked !== inMark) {
      flush()
      inMark = isMarked
    }
    run += text[i]
  }
  flush()
  return out
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const opener = useRef<Element | null>(null)
  const chosen = useRef(false)
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        stock="napkin"
        showCloseButton={false}
        onOpenAutoFocus={() => {
          opener.current = document.activeElement
          chosen.current = false
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const el = opener.current
          opener.current = null
          if (chosen.current) return
          if (el instanceof HTMLElement && el !== document.body && el.isConnected) el.focus({ preventScroll: true })
        }}
        className="dk-palette-dialog mt-[12dvh] mb-auto max-w-xl gap-0 p-3 compact:p-2.5 calm:p-2 max-sm:mt-2 max-sm:mb-auto"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search documentation</DialogTitle>
          <DialogDescription>Search components, parts and topics. Use the arrow keys, then Enter.</DialogDescription>
        </DialogHeader>
        <Command sheet={false} shouldFilter={false} loop label="Search components, parts and topics">
          <PaletteBody
            onChoose={(movesFocus) => {
              chosen.current = movesFocus
              onClose()
            }}
          />
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function useFreshActiveDescendant(key: string) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const input = document.querySelector("[cmdk-input]")
      const selected = document.querySelector('[cmdk-item][aria-selected="true"]')
      if (!input) return
      if (selected?.id) input.setAttribute("aria-activedescendant", selected.id)
      else input.removeAttribute("aria-activedescendant")
    })
    return () => cancelAnimationFrame(frame)
  }, [key])
}

function PaletteBody({ onChoose }: { onChoose: (movesFocus: boolean) => void }) {
  const catalog = useCatalog()
  const location = useLocation()
  const index = useMemo(() => buildSearchIndex(catalog), [catalog])
  const [query, setQuery] = useState("")
  const trimmed = query.trim()
  const results: SearchResult[] = useMemo(() => (trimmed ? search(index, trimmed) : suggestions(index)), [index, trimmed])
  useFreshActiveDescendant(trimmed)

  const go = (result: SearchResult) => {
    const target = parseHash(hrefFor(result.entry.to))
    onChoose(target.path !== location.path || target.anchor !== "")
    navigate(result.entry.to)
  }

  return (
    <>
      <CommandInput placeholder="Search components, parts, topics..." value={query} onValueChange={setQuery} />
      <CommandList label={trimmed ? "Results" : "Suggestions"} className="max-h-[min(24rem,55dvh)]">
        <CommandEmpty>{`Nothing matches "${trimmed}". Try a component name, a part like CardHeader, or a topic like focus.`}</CommandEmpty>
        <CommandGroup heading={trimmed ? "Results" : "Suggestions"}>
          {results.map((result) => (
            <CommandItem key={result.entry.id} value={result.entry.id} onSelect={() => go(result)} className="items-baseline gap-3">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="dk-palette-title truncate font-bold">{highlight(result.entry.title, result.titlePositions)}</span>
                <span className="dk-palette-sub truncate text-sm font-normal text-ink-muted">{result.entry.subtitle}</span>
              </span>
              <span className="dk-palette-group shrink-0 font-type text-xs tracking-wide text-ink-muted uppercase">{result.entry.group}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <p className="dk-palette-foot flex flex-wrap max-sm:hidden items-center gap-x-4 gap-y-1 px-3 pt-2 pb-1 text-sm text-ink-muted" aria-hidden="true">
        <span className="inline-flex items-center gap-1">
          <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>↵</Kbd> open
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>esc</Kbd> close
        </span>
      </p>
    </>
  )
}
