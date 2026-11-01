import * as React from "react"

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "File path (composed)",
  description: "A real use: the crumbs are the folders you have opened. Click one to go back up; when the path is longer than four names the middle folds into an ellipsis whose menu takes you there too.",
  layout: "center" as const,
  height: 260,
  stage: "desk" as const,
}

const TREE: Record<string, string[]> = {
  Notebooks: ["Field notes", "Garden", "Recipes"],
  "Field notes": ["2026", "2025"],
  "2026": ["March", "April"],
  March: ["Week 1", "Week 2"],
  Garden: ["Beds", "Seeds"],
  Recipes: ["Soups", "Bread"],
}

export default function Example() {
  const [path, setPath] = React.useState(["Notebooks", "Field notes", "2026", "March"])
  const here = path[path.length - 1]
  const folded = path.length > 4
  const shown = folded ? [path[0], ...path.slice(-2)] : path
  const hidden = folded ? path.slice(1, -2) : []

  return (
    <Paper stock="paper" seed="path" className="w-full max-w-md p-5">
      <Breadcrumb>
        <BreadcrumbList>
          {shown.map((name, i) => {
            const at = folded && i > 0 ? path.length - (shown.length - i) : i
            const last = i === shown.length - 1
            return (
              <React.Fragment key={`${name}-${at}`}>
                <BreadcrumbItem>
                  {last ? (
                    <BreadcrumbPage seed={`p-${at}`}>{name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={`#${name}`}
                      onClick={(e) => {
                        e.preventDefault()
                        setPath((p) => p.slice(0, at + 1))
                      }}
                    >
                      {name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {i === 0 && folded ? (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="-mx-1 flex items-center gap-1 px-1 hover:ll-swipe focus-visible:ll-swipe data-[state=open]:ll-swipe" aria-label="Show hidden folders">
                          <BreadcrumbEllipsis className="size-6" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {hidden.map((h, k) => (
                            <DropdownMenuItem key={h} onSelect={() => setPath((p) => p.slice(0, k + 2))}>
                              <Icon name="folder" /> {h}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>
                  </>
                ) : null}
                {!last ? <BreadcrumbSeparator /> : null}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <ul role="list" className="mt-4 grid gap-1">
        {(TREE[here] ?? []).map((child) => (
          <li key={child}>
            <button type="button" className="-mx-1 flex w-full items-center gap-2 px-2 py-1 text-start hover:ll-swipe focus-visible:ll-swipe" onClick={() => setPath((p) => [...p, child])}>
              <Icon name="folder" /> {child}
            </button>
          </li>
        ))}
        {(TREE[here] ?? []).length === 0 ? <li className="text-sm text-muted-foreground">This folder is empty. Go back up with the path above.</li> : null}
      </ul>
    </Paper>
  )
}
