import { useMemo } from "react"
import { useCatalog } from "../core/catalog-context"
import { buildSearchIndex, search } from "../core/search"
import { Link } from "../core/router"
import { paths } from "../core/router-core"
import { Mascot } from "@/components/ui/mascot"
import { ButtonLink, Kbd, Page, Prose } from "../kit"

export interface NotFoundPageProps {
  what?: string
  missing?: string
}

export function NotFoundPage({ what = "page", missing }: NotFoundPageProps) {
  const catalog = useCatalog()
  const guesses = useMemo(() => {
    if (!missing) return []
    const term = missing.split("/").filter(Boolean).pop() ?? missing
    return search(buildSearchIndex(catalog), term, 5)
  }, [catalog, missing])

  return (
    <Page kicker="404" title={`We could not find that ${what}`} description={missing ? `Nothing is filed under "${missing}".` : undefined}>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
        <Mascot pose="search" size={128} label="Stubby looking for the page with a magnifying glass" />
        <Prose className="min-w-0 flex-1 basis-64">
          {guesses.length > 0 ? (
            <>
              <p>Did you mean one of these?</p>
              <ul>
                {guesses.map((g) => (
                  <li key={g.entry.id}>
                    <Link to={g.entry.to}>{g.entry.title}</Link> <span className="dk-hint">{g.entry.group}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>
              Try the search (press <Kbd>/</Kbd>) or start from the overview.
            </p>
          )}
          <p className="dk-actions">
            <ButtonLink to={paths.components()}>All components</ButtonLink>
            <ButtonLink to={paths.home} variant="quiet">
              Home
            </ButtonLink>
          </p>
        </Prose>
      </div>
    </Page>
  )
}
