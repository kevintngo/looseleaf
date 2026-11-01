import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { readStored, writeStored } from "../core/storage"

interface DeskKnob {
  clutter: boolean
  setClutter(value: boolean): void
}

const DeskKnobContext = createContext<DeskKnob>({ clutter: true, setClutter: () => {} })

export function DeskKnobProvider({ children }: { children: ReactNode }) {
  const [clutter, setState] = useState(() => readStored("desk-clutter") !== "off")
  const setClutter = useCallback((value: boolean) => {
    setState(value)
    writeStored("desk-clutter", value ? "on" : "off")
  }, [])
  const value = useMemo(() => ({ clutter, setClutter }), [clutter, setClutter])
  return <DeskKnobContext.Provider value={value}>{children}</DeskKnobContext.Provider>
}

export function useDeskKnob(): DeskKnob {
  return useContext(DeskKnobContext)
}
