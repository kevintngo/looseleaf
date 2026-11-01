import { createContext, useContext, type ReactNode } from "react"
import { EMPTY_CATALOG, type Catalog } from "./catalog"

const CatalogContext = createContext<Catalog>(EMPTY_CATALOG)

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
}

export function useCatalog(): Catalog {
  return useContext(CatalogContext)
}
