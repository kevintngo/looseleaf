"use client"

import * as React from "react"

import { FileBrowser, sortNodes, type SortKey, type View } from "@/blocks/file-explorer/components/file-explorer-browser"
import { countIn, formatSize, nodes as sample, ROOTS, withDescendants, type FileNode } from "@/blocks/file-explorer/components/file-explorer-data"
import { Folder, FolderContent, FolderTab, FolderTabs } from "@/components/ui/folder"
import { Sticker } from "@/components/ui/sticker"

const TODAY = "2026-09-25"

export default function FileExplorer({ as: Root = "main" }: { as?: "main" | "div" } = {}) {
  const [all, setAll] = React.useState<FileNode[]>(sample)
  const [rootId, setRootId] = React.useState(ROOTS[0].id)
  const [paths, setPaths] = React.useState<Record<string, string[]>>({})
  const [view, setView] = React.useState<View>("list")
  const [sort, setSort] = React.useState<SortKey>("name")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set())
  const [undo, setUndo] = React.useState<{ text: string; nodes: FileNode[] } | null>(null)
  const [message, setMessage] = React.useState("")
  const main = React.useRef<HTMLDivElement>(null)
  const landing = React.useRef<{ index: number } | null>(null)
  React.useEffect(() => {
    const to = landing.current
    if (!to) return
    landing.current = null
    const opens = Array.from(main.current?.querySelectorAll<HTMLElement>("[data-file-open]") ?? [])
    ;(opens[Math.min(to.index, opens.length - 1)] ?? main.current?.querySelector<HTMLElement>("[data-file-new]"))?.focus()
  })

  const root = ROOTS.find((r) => r.id === rootId) ?? ROOTS[0]
  const path = paths[root.id] ?? []
  const here = path.at(-1) ?? root.id
  const trail = path.map((id) => ({ id, name: all.find((n) => n.id === id)?.name ?? "" }))

  const inside = React.useMemo(() => all.filter((n) => n.parent === here), [all, here])
  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return sortNodes(q ? inside.filter((n) => n.name.toLowerCase().includes(q)) : inside, sort).map((n) => (n.kind === "folder" ? { ...n, items: countIn(all, n.id) } : n))
  }, [inside, query, sort, all])
  const total = all.reduce((sum, n) => sum + (n.size ?? 0), 0)

  const reset = () => {
    setSelected(new Set())
    setQuery("")
    setUndo(null)
  }
  const go = (next: string[]) => {
    setPaths((p) => ({ ...p, [root.id]: next }))
    reset()
    landing.current = { index: 0 }
  }

  function activate(n: FileNode) {
    if (n.kind === "folder") {
      go([...path, n.id])
      setMessage(`Opened ${n.name}.`)
    } else {
      setSelected((s) => {
        const next = new Set(s)
        if (next.has(n.id)) next.delete(n.id)
        else next.add(n.id)
        return next
      })
    }
  }

  function remove(ids: string[], what: string) {
    const doomed = new Set<string>()
    for (const id of ids) withDescendants(all, id).forEach((d) => doomed.add(d))
    const gone = all.filter((n) => doomed.has(n.id))
    setAll((list) => list.filter((n) => !doomed.has(n.id)))
    setSelected(new Set())
    setUndo({ text: `Deleted ${what}.`, nodes: gone })
    setMessage(`Deleted ${what}. Undo is next to the list.`)
  }

  function newFolder() {
    const taken = new Set(inside.map((n) => n.name))
    let name = "Untitled folder"
    for (let i = 2; taken.has(name); i++) name = `Untitled folder ${i}`
    const next = Math.max(0, ...all.map((n) => Number(n.id.slice(1)) || 0)) + 1
    setAll((list) => [...list, { id: `f${next}`, parent: here, name, kind: "folder", modified: TODAY }])
    setUndo(null)
    setMessage(`Made a folder called ${name}.`)
  }

  return (
    <Root ref={main} className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-type text-sm tracking-wide text-ink-muted">Marigold Paper Co.</p>
            <h1 className="font-script text-4xl leading-none font-bold sm:text-5xl">Filing cabinet</h1>
          </div>
          <Sticker name="pencil-cup" size={68} seed="files-pencils" className="hidden shrink-0 sm:block" />
        </div>
        <p className="text-muted-foreground">
          {all.filter((n) => n.kind !== "folder").length} files, {formatSize(total)}
        </p>
      </header>

      <Folder
        value={rootId}
        onValueChange={(v) => {
          setRootId(v)
          reset()
        }}
        className="max-w-none"
      >
        <FolderTabs aria-label="Places" className="ps-2 pe-2 sm:ps-4 sm:pe-4">
          {ROOTS.map((r) => (
            <FolderTab key={r.id} value={r.id} className="min-w-0 flex-1 max-sm:px-1.5 max-sm:text-sm sm:flex-none">
              {r.name}
            </FolderTab>
          ))}
        </FolderTabs>
        {ROOTS.map((r) => (
          <FolderContent key={r.id} value={r.id} className="px-4 pb-6 sm:px-6">
            <FileBrowser
              rootName={r.name}
              trail={trail}
              items={items}
              view={view}
              onView={setView}
              sort={sort}
              onSort={setSort}
              query={query}
              onQuery={setQuery}
              selected={selected}
              onSelect={(id, on) =>
                setSelected((s) => {
                  const next = new Set(s)
                  if (on) next.add(id)
                  else next.delete(id)
                  return next
                })
              }
              onSelectAll={(on) => setSelected(on ? new Set(items.map((n) => n.id)) : new Set())}
              onClearSelection={() => {
                setSelected(new Set())
                landing.current = { index: 0 }
              }}
              onActivate={activate}
              onDelete={(n) => {
                landing.current = { index: items.findIndex((x) => x.id === n.id) }
                remove([n.id], `“${n.name}”`)
              }}
              onDeleteSelected={() => {
                landing.current = { index: 0 }
                remove([...selected], `${selected.size} ${selected.size === 1 ? "item" : "items"}`)
              }}
              onNewFolder={newFolder}
              onCrumb={(depth) => go(path.slice(0, depth))}
              undo={undo?.text ?? null}
              onUndo={() => {
                if (!undo) return
                setAll((list) => [...list, ...undo.nodes])
                setMessage("Put it back.")
                setUndo(null)
                landing.current = { index: 0 }
              }}
              empty={inside.length === 0}
            />
          </FolderContent>
        ))}
      </Folder>

      <p role="status" aria-label="File updates" className="sr-only">
        {message}
      </p>
    </Root>
  )
}
