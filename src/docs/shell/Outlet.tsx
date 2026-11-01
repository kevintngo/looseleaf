import { useLocation } from "../core/router"
import { BlockPage, BlocksIndexPage } from "../pages/BlocksPage"
import { ComponentPage } from "../pages/ComponentPage"
import { ComponentsIndexPage } from "../pages/ComponentsIndexPage"
import { FoundationPage, FoundationsIndexPage } from "../pages/FoundationsPage"
import { GettingStartedPage } from "../pages/GettingStartedPage"
import { HomePage } from "../pages/HomePage"
import { ChangelogPage, PlaygroundPage } from "../pages/MiscPages"
import { NotFoundPage } from "../pages/NotFoundPage"
import { ErrorBoundary } from "../widgets/ErrorBoundary"

export function Outlet() {
  const { route, path } = useLocation()
  return (
    <ErrorBoundary resetKey={path} title="This page crashed">
      {(() => {
        switch (route.name) {
          case "home":
            return <HomePage />
          case "getting-started":
            return <GettingStartedPage />
          case "foundations":
            return route.topic ? <FoundationPage topic={route.topic} /> : <FoundationsIndexPage />
          case "components":
            return route.slug ? <ComponentPage slug={route.slug} /> : <ComponentsIndexPage />
          case "blocks":
            return route.slug ? <BlockPage slug={route.slug} /> : <BlocksIndexPage />
          case "playground":
            return <PlaygroundPage />
          case "changelog":
            return <ChangelogPage />
          case "not-found":
            return <NotFoundPage missing={route.path} />
        }
      })()}
    </ErrorBoundary>
  )
}
