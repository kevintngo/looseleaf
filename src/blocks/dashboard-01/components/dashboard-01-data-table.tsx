"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AreaChart, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { monthly, REVIEWERS, SECTION_TYPES, UNASSIGNED, type Section } from "@/blocks/dashboard-01/components/dashboard-01-data"

type ColumnId = "header" | "type" | "status" | "target" | "limit" | "reviewer"

const COLUMNS: ReadonlyArray<{ id: ColumnId; label: string }> = [
  { id: "header", label: "Header" },
  { id: "type", label: "Section type" },
  { id: "status", label: "Status" },
  { id: "target", label: "Target" },
  { id: "limit", label: "Limit" },
  { id: "reviewer", label: "Reviewer" },
]

const PAGE_SIZES = [5, 10, 20]

const VIEWS = [
  { value: "outline", label: "Outline" },
  { value: "past-performance", label: "Past performance", count: 3 },
  { value: "key-personnel", label: "Key personnel", count: 2 },
  { value: "focus-documents", label: "Focus documents" },
] as const

const STATUS_ICON: Record<Section["status"], { icon: string; className?: string }> = {
  Done: { icon: "circle-check", className: "text-green" },
  "In Process": { icon: "loader" },
  "Not Started": { icon: "circle" },
}

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

function SectionViewer({ item, onSave }: { item: Section; onSave: (next: Section) => void }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(item)
  const uid = React.useId()
  const id = (name: string) => `${uid}-${name}`
  const set = <K extends keyof Section>(key: K, value: Section[K]) => setDraft((d) => ({ ...d, [key]: value }))

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(item)
        setOpen(next)
      }}
    >
      <DrawerTrigger asChild>
        <Button variant="link" title={item.header} className="h-9 w-fit max-w-full min-w-0 shrink justify-start px-0 text-start text-foreground">
          <span className="truncate">{item.header}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>Visitors to this section over the last six months</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-3 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
                <AreaChart data={monthly} xKey="month" stacked xFormatter={(m) => String(m).slice(0, 3)} label="Visitors per month, January to June" />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-bold">
                  Up 5.2% this month <Icon name="trending-up" className="size-4" />
                </div>
                <p className="text-muted-foreground">People are reading this section all the way to the end, which is more than we hoped for.</p>
              </div>
              <Separator />
            </>
          )}
          <form
            id={id("form")}
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              onSave(draft)
              setOpen(false)
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor={id("header")}>Header</Label>
              <Input id={id("header")} value={draft.header} onChange={(e) => set("header", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor={id("type")}>Type</Label>
                <Select value={draft.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger id={id("type")} className="w-full">
                    <SelectValue placeholder="Pick a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                    {SECTION_TYPES.includes(draft.type as (typeof SECTION_TYPES)[number]) ? null : <SelectItem value={draft.type}>{draft.type}</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={id("status")}>Status</Label>
                <Select value={draft.status} onValueChange={(v) => set("status", v as Section["status"])}>
                  <SelectTrigger id={id("status")} className="w-full">
                    <SelectValue placeholder="Pick a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="In Process">In process</SelectItem>
                    <SelectItem value="Not Started">Not started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor={id("target")}>Target</Label>
                <Input id={id("target")} inputMode="numeric" value={draft.target} onChange={(e) => set("target", e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={id("limit")}>Limit</Label>
                <Input id={id("limit")} inputMode="numeric" value={draft.limit} onChange={(e) => set("limit", e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={id("reviewer")}>Reviewer</Label>
              <Select value={draft.reviewer} onValueChange={(v) => set("reviewer", v)}>
                <SelectTrigger id={id("reviewer")} className="w-full">
                  <SelectValue placeholder="Pick a reviewer" />
                </SelectTrigger>
                <SelectContent>
                  {REVIEWERS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                  <SelectItem value={UNASSIGNED}>Not assigned yet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button type="submit" form={id("form")}>
            Save changes
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function DataTable({ data: initialData }: { data: Section[] }) {
  const uid = React.useId()
  const [rows, setRows] = React.useState<Section[]>(() => initialData)
  const [selected, setSelected] = React.useState<ReadonlySet<number>>(() => new Set())
  const [favorites, setFavorites] = React.useState<ReadonlySet<number>>(() => new Set())
  const [hidden, setHidden] = React.useState<ReadonlySet<ColumnId>>(() => new Set())
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [view, setView] = React.useState<string>("outline")
  const [note, setNote] = React.useState("")
  const pager = React.useRef<HTMLDivElement>(null)
  const pressed = React.useRef<"first" | "prev" | "next" | "last" | null>(null)
  React.useLayoutEffect(() => {
    const key = pressed.current
    pressed.current = null
    if (!key || !pager.current) return
    if (!pager.current.querySelector<HTMLButtonElement>(`[data-pager="${key}"]`)?.disabled) return
    pager.current.querySelector<HTMLButtonElement>(`[data-pager="${key === "first" || key === "prev" ? "next" : "prev"}"]`)?.focus()
  })
  const goTo = (to: number, key: NonNullable<typeof pressed.current>) => {
    pressed.current = key
    setPageIndex(to)
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const page = Math.min(pageIndex, pageCount - 1)
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize)
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))
  const someOnPage = pageRows.some((r) => selected.has(r.id))
  const visible = (id: ColumnId) => !hidden.has(id)
  const columnCount = 2 + COLUMNS.filter((c) => visible(c.id)).length

  const update = (id: number, patch: Partial<Section>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const toggle = <T,>(set: ReadonlySet<T>, value: T, on: boolean): Set<T> => {
    const next = new Set(set)
    if (on) next.add(value)
    else next.delete(value)
    return next
  }

  return (
    <Tabs value={view} onValueChange={setView} className="w-full flex-col justify-start gap-6">
      <h2 className="sr-only">Document sections</h2>
      <div className="flex items-center justify-between gap-2 px-4 lg:px-6">
        <Label htmlFor={`${uid}-view`} className="sr-only">
          View
        </Label>
        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id={`${uid}-view`}>
            <SelectValue placeholder="Pick a view" />
          </SelectTrigger>
          <SelectContent>
            {VIEWS.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex">
          {VIEWS.map((v) => (
            <TabsTrigger key={v.value} value={v.value}>
              {v.label}
              {"count" in v ? <Badge variant="secondary" size="sm" count={v.count} /> : null}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Icon name="layout-grid" />
                <span className="hidden lg:inline">Customize columns</span>
                <span className="lg:hidden">Columns</span>
                <Icon name="chevron-down" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {COLUMNS.map((c) => (
                <DropdownMenuCheckboxItem key={c.id} checked={visible(c.id)} onCheckedChange={(on) => setHidden((h) => toggle(h, c.id, !on))}>
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            aria-label="Add section"
            onClick={() => {
              const id = Math.max(0, ...rows.map((r) => r.id)) + 1
              setRows((rs) => [...rs, { id, header: "Untitled section", type: "Narrative", status: "Not Started", target: "0", limit: "0", reviewer: UNASSIGNED }])
              setPageIndex(Math.ceil((rows.length + 1) / pageSize) - 1)
              setNote("Added a blank section at the end of the table.")
            }}
          >
            <Icon name="plus" />
            <span className="hidden lg:inline">Add section</span>
          </Button>
        </div>
      </div>

      <TabsContent value="outline" className="relative flex flex-col gap-4 px-4 lg:px-6">
        <Table aria-label="Document sections" className="[&_td]:px-2 [&_th]:px-2">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all rows on this page"
                  checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                  onCheckedChange={(on) => setSelected((s) => pageRows.reduce((acc, r) => toggle(acc, r.id, on === true), s))}
                />
              </TableHead>
              {visible("header") && <TableHead>Header</TableHead>}
              {visible("type") && <TableHead className="hidden @4xl/main:table-cell">Section type</TableHead>}
              {visible("status") && <TableHead>Status</TableHead>}
              {visible("target") && <TableHead className="hidden w-20 text-end @2xl/main:table-cell">Target</TableHead>}
              {visible("limit") && <TableHead className="hidden w-20 text-end @2xl/main:table-cell">Limit</TableHead>}
              {visible("reviewer") && <TableHead className="hidden @3xl/main:table-cell">Reviewer</TableHead>}
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((row) => (
                <TableRow key={row.id} data-state={selected.has(row.id) ? "selected" : undefined}>
                  <TableCell className="w-10">
                    <Checkbox aria-label={`Select ${row.header}`} checked={selected.has(row.id)} onCheckedChange={(on) => setSelected((s) => toggle(s, row.id, on === true))} />
                  </TableCell>
                  {visible("header") && (
                    <TableCell>
                      <span className="flex max-w-40 items-center gap-1.5 @2xl/main:max-w-48">
                        <SectionViewer item={row} onSave={(next) => update(row.id, next)} />
                        {favorites.has(row.id) ? <Icon name="star" size={14} label="Favorite" className="text-hi-deep" /> : null}
                      </span>
                    </TableCell>
                  )}
                  {visible("type") && (
                    <TableCell className="hidden @4xl/main:table-cell">
                      <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {row.type}
                      </Badge>
                    </TableCell>
                  )}
                  {visible("status") && (
                    <TableCell>
                      <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        <Icon name={STATUS_ICON[row.status].icon} className={STATUS_ICON[row.status].className} />
                        {row.status === "Done" ? "Done" : row.status === "In Process" ? "In process" : "Not started"}
                      </Badge>
                    </TableCell>
                  )}
                  {visible("target") && (
                    <TableCell className="hidden text-end @2xl/main:table-cell">
                      <Input aria-label={`Target for ${row.header}`} inputMode="numeric" className="ms-auto h-8 w-16 text-end" value={row.target} onChange={(e) => update(row.id, { target: e.target.value })} />
                    </TableCell>
                  )}
                  {visible("limit") && (
                    <TableCell className="hidden text-end @2xl/main:table-cell">
                      <Input aria-label={`Limit for ${row.header}`} inputMode="numeric" className="ms-auto h-8 w-16 text-end" value={row.limit} onChange={(e) => update(row.id, { limit: e.target.value })} />
                    </TableCell>
                  )}
                  {visible("reviewer") && (
                    <TableCell className="hidden @3xl/main:table-cell">
                      {row.reviewer !== UNASSIGNED ? (
                        row.reviewer
                      ) : (
                        <Select value="" onValueChange={(v) => update(row.id, { reviewer: v })}>
                          <SelectTrigger size="sm" className="w-40" aria-label={`Assign a reviewer to ${row.header}`}>
                            <SelectValue placeholder="Assign reviewer" />
                          </SelectTrigger>
                          <SelectContent align="end">
                            {REVIEWERS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="w-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                          <Icon name="ellipsis-vertical" />
                          <span className="sr-only">Actions for {row.header}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onSelect={() => {
                            const id = Math.max(0, ...rows.map((r) => r.id)) + 1
                            setRows((rs) => {
                              const at = rs.findIndex((r) => r.id === row.id)
                              return [...rs.slice(0, at + 1), { ...row, id, header: `${row.header} (copy)` }, ...rs.slice(at + 1)]
                            })
                            setNote(`Made a copy of ${row.header}.`)
                          }}
                        >
                          <Icon name="copy" />
                          Make a copy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            const on = !favorites.has(row.id)
                            setFavorites((f) => toggle(f, row.id, on))
                            setNote(on ? `${row.header} is a favorite now.` : `${row.header} is no longer a favorite.`)
                          }}
                        >
                          <Icon name="star" />
                          {favorites.has(row.id) ? "Unfavorite" : "Favorite"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => {
                            setRows((rs) => rs.filter((r) => r.id !== row.id))
                            setSelected((s) => toggle(s, row.id, false))
                            setNote(`Deleted ${row.header}.`)
                          }}
                        >
                          <Icon name="trash" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  Nothing here. Add a section to start the outline.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-1">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {selected.size} of {rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor={`${uid}-rows-per-page`} className="text-sm font-bold">
                Rows per page
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v))
                  setPageIndex(0)
                }}
              >
                <SelectTrigger size="sm" className="w-20" id={`${uid}-rows-per-page`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {PAGE_SIZES.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-bold" aria-live="polite">
              Page {page + 1} of {pageCount}
            </div>
            <div ref={pager} className="ms-auto flex items-center gap-2 lg:ms-0">
              <Button variant="outline" size="icon" data-pager="first" className="hidden lg:flex" onClick={() => goTo(0, "first")} disabled={page === 0}>
                <span className="sr-only">Go to first page</span>
                <Icon name="chevrons-left" />
              </Button>
              <Button variant="outline" size="icon" data-pager="prev" onClick={() => goTo(page - 1, "prev")} disabled={page === 0}>
                <span className="sr-only">Go to previous page</span>
                <Icon name="chevron-left" />
              </Button>
              <Button variant="outline" size="icon" data-pager="next" onClick={() => goTo(page + 1, "next")} disabled={page >= pageCount - 1}>
                <span className="sr-only">Go to next page</span>
                <Icon name="chevron-right" />
              </Button>
              <Button variant="outline" size="icon" data-pager="last" className="hidden lg:flex" onClick={() => goTo(pageCount - 1, "last")} disabled={page >= pageCount - 1}>
                <span className="sr-only">Go to last page</span>
                <Icon name="chevrons-right" />
              </Button>
            </div>
          </div>
        </div>
        <p role="status" aria-label="Table updates" className="sr-only">
          {note}
        </p>
      </TabsContent>

      {VIEWS.filter((v) => v.value !== "outline").map((v) => (
        <TabsContent key={v.value} value={v.value} className="flex flex-col px-4 lg:px-6">
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia pose="sleep" size={88} />
              <EmptyTitle>Nothing filed under {v.label.toLowerCase()} yet</EmptyTitle>
              <EmptyDescription>Sections you tag this way will turn up here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TabsContent>
      ))}
    </Tabs>
  )
}
