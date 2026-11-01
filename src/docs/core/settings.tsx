import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { PACKAGE_MANAGERS, type PackageManager } from "./install"
import { readStoredChoice, writeStored } from "./storage"

export const DENSITIES = ["comfortable", "compact", "calm"] as const
export type Density = (typeof DENSITIES)[number]

export const MOTIONS = ["system", "reduced"] as const
export type Motion = (typeof MOTIONS)[number]

export interface Settings {
  density: Density
  motion: Motion
  packageManager: PackageManager
  setDensity(value: Density): void
  setMotion(value: Motion): void
  setPackageManager(value: PackageManager): void
}

const noop = () => {}
const SettingsContext = createContext<Settings>({
  density: "comfortable",
  motion: "system",
  packageManager: "npm",
  setDensity: noop,
  setMotion: noop,
  setPackageManager: noop,
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<Density>(() => readStoredChoice("density", DENSITIES, "comfortable"))
  const [motion, setMotionState] = useState<Motion>(() => readStoredChoice("motion", MOTIONS, "system"))
  const [packageManager, setPackageManagerState] = useState<PackageManager>(() => readStoredChoice("pm", PACKAGE_MANAGERS, "npm"))

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-density", density)
    if (motion === "reduced") root.setAttribute("data-motion", "reduced")
    else root.removeAttribute("data-motion")
  }, [density, motion])

  const setDensity = useCallback((value: Density) => {
    setDensityState(value)
    writeStored("density", value)
  }, [])
  const setMotion = useCallback((value: Motion) => {
    setMotionState(value)
    writeStored("motion", value)
  }, [])
  const setPackageManager = useCallback((value: PackageManager) => {
    setPackageManagerState(value)
    writeStored("pm", value)
  }, [])

  const value = useMemo<Settings>(
    () => ({ density, motion, packageManager, setDensity, setMotion, setPackageManager }),
    [density, motion, packageManager, setDensity, setMotion, setPackageManager],
  )
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): Settings {
  return useContext(SettingsContext)
}
