import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./docs.css"
import { DocsApp } from "./App"
import { discoverCatalog } from "./core/discover"
import { LibraryProviders } from "./providers"

const container = document.getElementById("root")
if (!container) throw new Error("index.html needs a <div id=\"root\">")

createRoot(container).render(
  <StrictMode>
    <DocsApp catalog={discoverCatalog()} Providers={LibraryProviders} />
  </StrictMode>,
)
