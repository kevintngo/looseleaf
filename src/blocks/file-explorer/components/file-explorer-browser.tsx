"use client"

import * as React from "react"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Paper } from "@/components/ui/paper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { formatDay, formatSize, KIND_ICON, KIND_LABEL, type FileNode } from "@/blocks/file-explorer/components/file-explorer-data"

export type SortKey = "name" | "modified" | "size"
export type View = "list" | "grid"

export const SORTS: ReadonlyArray<{ id: SortKey; label: string }> = [
  { id: "name", label: "Name" },
  { id: "modified", label: "Last changed" },
  { id: "size", label: "Size" },
]

export function sortNodes(list: readonly FileNode[], key: SortKey): FileNode[] {
  return [...list].sort((a, b) => {
    if ((a.kind === "folder") !== (b.kind === "folder")) return a.kind === "folder" ? -1 : 1
    if (key === "modified") return b.modified.localeCompare(a.modified) || a.name.localeCompare(b.name)
    if (key === "size") return (b.size ?? 0) - (a.size ?? 0) || a.name.localeCompare(b.name)
    return a.name.localeCompare(b.name, "en", { numeric: true })
  })
}

type Item = FileNode & { items?: number }

const meta = (n: Item) => (n.kind === "folder" ? `${n.items ?? 0} ${n.items === 1 ? "item" : "items"}` : `${formatSize(n.size ?? 0)} · ${formatDay(n.modified)}`)

const spoken = (n: Item) => (n.kind === "folder" ? `, folder, ${meta(n)}` : `, ${KIND_LABEL[n.kind]}, ${formatSize(n.size ?? 0)}, changed ${formatDay(n.modified)}`)

type ListProps = {
  items: Item[]
  selected: ReadonlySet<string>
  onActivate: (n: Item) => void
  onSelect: (id: string, on: boolean) => void
  onSelectAll: (on: boolean) => void
  onDelete: (n: Item) => void
  label: string
}

function ListView({ items, selected, onActivate, onSelect, onSelectAll, onDelete, label }: ListProps) {
  const all = items.length > 0 && items.every((n) => selected.has(n.id))
  const some = items.some((n) => selected.has(n.id))
  return (
    <Table aria-label={label}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox aria-label="Select everything in this folder" checked={all ? true : some ? "indeterminate" : false} onCheckedChange={(on) => onSelectAll(on === true)} />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Last changed</TableHead>
          <TableHead className="hidden text-end sm:table-cell">Size</TableHead>
          <TableHead className="w-10">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((n) => (
          <TableRow key={n.id} data-state={selected.has(n.id) ? "selected" : undefined}>
            <TableCell className="w-10">
              <Checkbox aria-label={`Select ${n.name}`} checked={selected.has(n.id)} onCheckedChange={(on) => onSelect(n.id, on === true)} />
            </TableCell>
            <TableCell className="max-w-56 sm:max-w-80">
              <button type="button" data-file-open="" className="flex w-full min-w-0 items-center gap-2.5 text-start hover:ll-swipe focus-visible:ll-swipe" onClick={() => onActivate(n)}>
                <Icon name={KIND_ICON[n.kind]} size={20} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate", n.kind === "folder" && "font-bold")}>
                    {n.name}
                    <span className="sr-only">{spoken(n)}</span>
                  </span>
                  <span aria-hidden="true" className="block truncate text-sm text-muted-foreground sm:hidden">
                    {meta(n)}
                  </span>
                </span>
              </button>
            </TableCell>
            <TableCell className="ll-num hidden sm:table-cell">{formatDay(n.modified)}</TableCell>
            <TableCell className="ll-num hidden text-end sm:table-cell">{n.kind === "folder" ? meta(n) : formatSize(n.size ?? 0)}</TableCell>
            <TableCell className="w-10">
              <RowMenu n={n} onActivate={onActivate} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function RowMenu({ n, onActivate, onDelete }: { n: Item; onActivate: (n: Item) => void; onDelete: (n: Item) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Icon name="ellipsis-vertical" />
          <span className="sr-only">Actions for {n.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={() => onActivate(n)}>
          <Icon name={n.kind === "folder" ? "folder-open" : "check"} />
          {n.kind === "folder" ? "Open" : "Pick"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(n)}>
          <Icon name="trash" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function GridView({ items, selected, onActivate, onSelect, onDelete, label }: Omit<ListProps, "onSelectAll">) {
  return (
    <ul role="list" aria-label={label} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((n) => {
        const on = selected.has(n.id)
        return (
          <li key={n.id} className="min-w-0">
            <Paper stock="index-card" rules="none" seed={n.id} data-state={on ? "selected" : undefined} className="relative flex min-h-0 w-full flex-col items-center gap-2 px-3 pt-8 pb-3 text-center">
              <Checkbox className="absolute start-2.5 top-2.5" aria-label={`Select ${n.name}`} checked={on} onCheckedChange={(v) => onSelect(n.id, v === true)} />
              <span className="absolute end-1 top-1">
                <RowMenu n={n} onActivate={onActivate} onDelete={onDelete} />
              </span>
              <button type="button" data-file-open="" className={cn("flex w-full min-w-0 flex-col items-center gap-1.5 py-2 hover:ll-swipe focus-visible:ll-swipe", on && "ll-swipe")} onClick={() => onActivate(n)}>
                <Icon name={KIND_ICON[n.kind]} size={44} tone="doodle" />
                <span className={cn("block w-full truncate text-[15px] leading-tight", n.kind === "folder" && "font-bold")}>
                  {n.name}
                  <span className="sr-only">{spoken(n)}</span>
                </span>
                <span aria-hidden="true" className="block w-full truncate text-sm text-muted-foreground">
                  {meta(n)}
                </span>
              </button>
            </Paper>
          </li>
        )
      })}
    </ul>
  )
}

export function FileBrowser({
  rootName,
  trail,
  items,
  view,
  onView,
  sort,
  onSort,
  query,
  onQuery,
  selected,
  onSelect,
  onSelectAll,
  onClearSelection,
  onActivate,
  onDelete,
  onDeleteSelected,
  onNewFolder,
  onCrumb,
  undo,
  onUndo,
  empty,
}: {
  rootName: string
  trail: ReadonlyArray<{ id: string; name: string }>
  items: Item[]
  view: View
  onView: (v: View) => void
  sort: SortKey
  onSort: (s: SortKey) => void
  query: string
  onQuery: (q: string) => void
  selected: ReadonlySet<string>
  onSelect: (id: string, on: boolean) => void
  onSelectAll: (on: boolean) => void
  onClearSelection: () => void
  onActivate: (n: Item) => void
  onDelete: (n: Item) => void
  onDeleteSelected: () => void
  onNewFolder: () => void
  onCrumb: (depth: number) => void
  undo: string | null
  onUndo: () => void
  empty: boolean
}) {
  const here = trail.at(-1)?.name ?? rootName
  const label = `Everything in ${here}`
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb aria-label={`Where you are in ${rootName}`}>
        <BreadcrumbList>
          {trail.length === 0 ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{rootName}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button type="button" onClick={() => onCrumb(0)}>
                    {rootName}
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {trail.map((t, i) => (
                <React.Fragment key={t.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {i === trail.length - 1 ? (
                      <BreadcrumbPage>{t.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <button type="button" onClick={() => onCrumb(i + 1)}>
                          {t.name}
                        </button>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center gap-3">
        <Input type="search" aria-label={`Search in ${here}`} placeholder="Search this folder" className="min-w-40 flex-1 sm:max-w-64" value={query} onChange={(e) => onQuery(e.target.value)} />
        <Select value={sort} onValueChange={(v) => onSort(v as SortKey)}>
          <SelectTrigger size="sm" className="w-40" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && onView(v as View)} aria-label="View">
          <ToggleGroupItem value="list" aria-label="List view">
            <Icon name="list" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Icon name="layout-grid" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Button variant="outline" size="sm" data-file-new="" onClick={onNewFolder}>
          <Icon name="folder-plus" />
          New folder
        </Button>
      </div>

      {selected.size ? (
        <div role="group" aria-label="Selected items" className="flex flex-wrap items-center gap-3 bg-hi-select/50 px-3 py-1.5">
          <span className="font-bold">{selected.size} picked</span>
          <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
            <Icon name="trash" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
        </div>
      ) : null}

      {undo ? (
        <div className="flex flex-wrap items-center gap-2 text-sm" data-slot="file-explorer-undo">
          <span>{undo}</span>
          <Button variant="link" size="sm" onClick={onUndo}>
            Undo
          </Button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia pose={empty ? "peek" : "search"} size={84} />
            <EmptyTitle>{empty ? "This folder is empty" : "Nothing matches"}</EmptyTitle>
            <EmptyDescription>{empty ? "Nothing filed here yet. Make a new folder to begin." : "Try another word."}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === "list" ? (
        <ListView items={items} selected={selected} onActivate={onActivate} onSelect={onSelect} onSelectAll={onSelectAll} onDelete={onDelete} label={label} />
      ) : (
        <GridView items={items} selected={selected} onActivate={onActivate} onSelect={onSelect} onDelete={onDelete} label={label} />
      )}
    </div>
  )
}
