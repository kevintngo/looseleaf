import type { ReactNode } from "react"
import { InkProvider } from "@/lib/ink/react"
import { useSettings } from "./core/settings"

export function LibraryProviders({ children }: { children: ReactNode }) {
  const { density, motion } = useSettings()
  return (
    <InkProvider tier="lo" density={density} motion={motion === "reduced" ? "reduced" : "system"}>
      {children}
    </InkProvider>
  )
}
