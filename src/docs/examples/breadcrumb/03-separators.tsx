import * as React from "react"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Icon } from "@/components/ui/icon"

export const meta = {
  title: "Separators",
  description: "A pencil slash is the default. Children replace it: a drawn chevron, an arrow, a dot. Links can also be your router's element with asChild.",
  layout: "center" as const,
}

const TRAIL = ["Notebooks", "Field notes", "March"]

function Trail({ separator, label }: { separator?: React.ReactNode; label: string }) {
  return (
    <div className="grid justify-items-start gap-1">
      <span className="font-type text-sm text-ink-muted">{label}</span>
      <Breadcrumb>
        <BreadcrumbList>
          {TRAIL.map((name, i) => (
            <React.Fragment key={name}>
              <BreadcrumbItem>
                {i < TRAIL.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <a href={`#${name}`}>{name}</a>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage seed={label}>{name}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {i < TRAIL.length - 1 ? <BreadcrumbSeparator>{separator}</BreadcrumbSeparator> : null}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

export default function Example() {
  return (
    <div className="grid gap-5">
      <Trail label="slash (default)" />
      <Trail label="chevron" separator={<Icon name="chevron-right" />} />
      <Trail label="arrow" separator={<Icon name="arrow-right" />} />
      <Trail label="dot" separator={<Icon name="dot" size={20} />} />
    </div>
  )
}
