import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

type Announce = (message: string) => void

const AnnouncerContext = createContext<Announce>(() => {})

export function useAnnounce(): Announce {
  return useContext(AnnouncerContext)
}

export interface AnnouncerState {
  text: string
  announce: Announce
}

export function useAnnouncerState(): AnnouncerState {
  const [state, setState] = useState({ message: "", count: 0 })
  const announce = useCallback((message: string) => setState((s) => ({ message, count: s.count + 1 })), [])
  return { text: state.message ? state.message + (state.count % 2 ? "" : "​") : "", announce }
}

export function AnnouncerProvider({ announce, children }: { announce: Announce; children: ReactNode }) {
  return <AnnouncerContext.Provider value={announce}>{children}</AnnouncerContext.Provider>
}
