import * as React from "react"

import { Button } from "@/components/ui/button"
import { Paper } from "@/components/ui/paper"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useDefaultLayout,
  useGroupRef,
  type LayoutStorage,
} from "@/components/ui/resizable"

export const meta = {
  title: "Remembered layout",
  description:
    "`useDefaultLayout` saves and restores a layout through any object with `getItem` and `setItem`. Here that is a plain in-memory Map (no localStorage): resize, press Remount, and the panels come back where you left them. Reset uses the group's imperative `setLayout`.",
  layout: "center" as const,
}

const memory = new Map<string, string>()
const storage: LayoutStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => void memory.set(key, value),
}

function Studio() {
  const group = useGroupRef()
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({ id: "docs-remembered", storage, panelIds: ["notes", "canvas"] })
  return (
    <div className="grid gap-3">
      <Paper stock="slip" tilt={false} seed="remembered">
        <ResizablePanelGroup groupRef={group} orientation="horizontal" id="docs-remembered" defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged} className="h-40">
          <ResizablePanel id="notes" defaultSize="35%" minSize="15%">
            <div className="p-4 font-script text-xl font-semibold">Notes</div>
          </ResizablePanel>
          <ResizableHandle withHandle aria-label="Resize the notes" />
          <ResizablePanel id="canvas" defaultSize="65%" minSize="30%">
            <div className="p-4 font-script text-xl font-semibold">Canvas</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Paper>
      <Button variant="outline" size="sm" className="justify-self-start" onClick={() => group.current?.setLayout({ notes: 35, canvas: 65 })}>
        Reset to 35 / 65
      </Button>
    </div>
  )
}

export default function Example() {
  const [mounted, setMounted] = React.useState(true)
  return (
    <div className="grid w-full max-w-md gap-4">
      {mounted ? <Studio /> : <p className="grid h-40 place-items-center text-sm text-muted-foreground">Unmounted. Bring it back and it will remember.</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setMounted((m) => !m)}>
          {mounted ? "Unmount" : "Remount"}
        </Button>
      </div>
    </div>
  )
}
