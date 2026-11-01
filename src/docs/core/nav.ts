import type { Catalog } from "./catalog"
import { FOUNDATIONS, FOUNDATION_BY_SLUG } from "./foundations"
import { paths, slugifyAnchor, type Route } from "./router-core"

export const SITE_NAME = "Looseleaf"
export const SITE_TAGLINE = "shadcn/ui, drawn by hand"

export interface NavLinkModel {
  id: string
  label: string
  to: string
  active: boolean
}

export interface NavGroupModel {
  id: string
  label: string
  count: number
  containsActive: boolean
  links: NavLinkModel[]
}

export interface NavSectionModel {
  id: string
  label: string
  to?: string
  active: boolean
  count?: number
  links: NavLinkModel[]
  groups: NavGroupModel[]
  empty?: string
}

export const categoryAnchor = (category: string) => `category-${slugifyAnchor(category)}`

const isRoute = (route: Route, name: Route["name"]) => route.name === name

export function buildNav(catalog: Catalog, route: Route): NavSectionModel[] {
  const activeComponent = route.name === "components" ? route.slug : null
  const activeBlock = route.name === "blocks" ? route.slug : null
  const activeTopic = route.name === "foundations" ? route.topic : null

  return [
    {
      id: "start",
      label: "Start",
      active: false,
      links: [{ id: "getting-started", label: "Getting started", to: paths.gettingStarted, active: isRoute(route, "getting-started") }],
      groups: [],
    },
    {
      id: "foundations",
      label: "Foundations",
      to: paths.foundations(),
      active: route.name === "foundations" && !activeTopic,
      links: FOUNDATIONS.map((t) => ({ id: t.slug, label: t.title, to: paths.foundations(t.slug), active: activeTopic === t.slug })),
      groups: [],
    },
    {
      id: "components",
      label: "Components",
      to: paths.components(),
      active: route.name === "components" && !activeComponent,
      count: catalog.components.length,
      links: [],
      groups: catalog.groups.map((g) => ({
        id: g.category,
        label: g.category,
        count: g.items.length,
        containsActive: g.items.some((c) => c.slug === activeComponent),
        links: g.items.map((c) => ({ id: c.slug, label: c.doc.title, to: paths.components(c.slug), active: activeComponent === c.slug })),
      })),
      empty: catalog.components.length === 0 ? "No components yet" : undefined,
    },
    {
      id: "blocks",
      label: "Blocks",
      to: paths.blocks(),
      active: route.name === "blocks" && !activeBlock,
      count: catalog.blocks.length,
      links: catalog.blocks.map((b) => ({ id: b.slug, label: b.title, to: paths.blocks(b.slug), active: activeBlock === b.slug })),
      groups: [],
      empty: catalog.blocks.length === 0 ? "No blocks yet" : undefined,
    },
    {
      id: "more",
      label: "More",
      active: false,
      links: [
        { id: "playground", label: "Playground", to: paths.playground, active: isRoute(route, "playground") },
        { id: "changelog", label: "Changelog", to: paths.changelog, active: isRoute(route, "changelog") },
      ],
      groups: [],
    },
  ]
}

export function routeTitle(route: Route, catalog: Catalog): string {
  const page = (() => {
    switch (route.name) {
      case "home":
        return null
      case "getting-started":
        return "Getting started"
      case "foundations":
        if (!route.topic) return "Foundations"
        return FOUNDATION_BY_SLUG.get(route.topic)?.title ?? "Page not found"
      case "components":
        if (!route.slug) return "Components"
        return catalog.bySlug.get(route.slug)?.doc.title ?? "Component not found"
      case "blocks":
        if (!route.slug) return "Blocks"
        return catalog.blockBySlug.get(route.slug)?.title ?? "Block not found"
      case "playground":
        return "Playground"
      case "changelog":
        return "Changelog"
      case "not-found":
        return "Page not found"
    }
  })()
  return page ? `${page} — ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`
}
