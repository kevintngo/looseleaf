import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Progress } from "@/components/ui/progress"

export const meta = {
  title: "Upload queue",
  description: "A real-world use: three files at different speeds, an indeterminate bar while one is being checked, a green bar and a tick when it is done. Progress is announced through aria-valuenow; the percentage is text.",
  layout: "stack" as const,
}

type Upload = { name: string; size: string; pct: number | null }

const start: Upload[] = [
  { name: "field-notes.pdf", size: "2.4 MB", pct: 8 },
  { name: "garden-plan.png", size: "860 KB", pct: 52 },
  { name: "receipts.zip", size: "14 MB", pct: null },
]

export default function Example() {
  const [files, setFiles] = React.useState(start)
  const [running, setRunning] = React.useState(false)
  React.useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setFiles((fs) => fs.map((f, i) => (f.pct === null ? { ...f, pct: 0 } : { ...f, pct: Math.min(100, f.pct + 9 + i * 5) })))
    }, 500)
    return () => clearInterval(t)
  }, [running])
  const done = files.every((f) => f.pct === 100)
  return (
    <div className="grid w-full max-w-md gap-5">
      {files.map((f) => (
        <div key={f.name} className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[15px] font-bold">
              {f.pct === 100 && <Icon name="check" size={16} className="text-green" />}
              {f.name}
            </span>
            <span className="ll-num text-sm text-ink-muted">{f.pct === null ? "checking" : f.pct === 100 ? f.size : `${f.pct}% of ${f.size}`}</span>
          </div>
          <Progress value={f.pct} tone={f.pct === 100 ? "green" : "marker"} size="sm" aria-label={f.name} />
        </div>
      ))}
      <div className="flex gap-3">
        <Button size="sm" onClick={() => setRunning((r) => !r)}>
          {done ? "All done" : running ? "Pause" : "Start"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRunning(false)
            setFiles(start)
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
