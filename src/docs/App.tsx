import type { ComponentType, ReactNode } from "react"
import type { Catalog } from "./core/catalog"
import { CatalogProvider } from "./core/catalog-context"
import { RouterProvider } from "./core/router"
import { SettingsProvider } from "./core/settings"
import { Shell } from "./shell/Shell"

export interface DocsAppProps {
  catalog: Catalog
  Providers?: ComponentType<{ children: ReactNode }>
}

const NoProviders = ({ children }: { children: ReactNode }) => <>{children}</>

export function DocsApp({ catalog, Providers = NoProviders }: DocsAppProps) {
  return (
    <SettingsProvider>
      <RouterProvider>
        <CatalogProvider catalog={catalog}>
          <Providers>
            <Shell />
          </Providers>
        </CatalogProvider>
      </RouterProvider>
    </SettingsProvider>
  )
}
