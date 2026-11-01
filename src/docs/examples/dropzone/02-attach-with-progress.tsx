import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dropzone, DropzoneArea, DropzoneDescription, DropzoneIcon, DropzoneItem, DropzoneList, DropzoneRejections, DropzoneTitle } from "@/components/ui/dropzone"

export const meta = {
  title: "Attach files, with progress",
  description: "No upload is built in: you drive each row from your own request. Here a timer stands in for the network: rows fill their highlighter line, finish with a green tick, and one file is made to fail so you can see the red rule and its wavy line.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 640,
}

type Status = { progress: number; state: "uploading" | "done" | "error" }

export default function Example() {
  const [files, setFiles] = React.useState<File[]>([])
  const [status, setStatus] = React.useState<Map<File, Status>>(new Map())
  const started = React.useRef(new Set<File>())
  const timers = React.useRef(new Map<File, number>())

  React.useEffect(() => {
    for (const [f, id] of timers.current) {
      if (!files.includes(f)) {
        window.clearInterval(id)
        timers.current.delete(f)
      }
    }
    for (const f of files) {
      if (started.current.has(f)) continue
      started.current.add(f)
      let progress = 0
      setStatus((m) => new Map(m).set(f, { progress, state: "uploading" }))
      const id = window.setInterval(() => {
        progress = Math.min(100, progress + 8 + (f.size % 7))
        const state = progress >= 100 ? (f.name.includes("fail") ? "error" : "done") : "uploading"
        setStatus((m) => new Map(m).set(f, { progress, state }))
        if (progress >= 100) {
          window.clearInterval(id)
          timers.current.delete(f)
        }
      }, 240)
      timers.current.set(f, id)
    }
  }, [files])
  React.useEffect(() => {
    const running = timers.current
    return () => running.forEach((id) => window.clearInterval(id))
  }, [])

  const busy = files.some((f) => status.get(f)?.state === "uploading")
  return (
    <Card seed="attach" tape="top" className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Attach to this note</CardTitle>
        <CardDescription>Photos and PDFs, up to 3 MB each. A file with &quot;fail&quot; in its name will fail.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 py-4">
        <Dropzone accept="image/*,.pdf" maxSize={3 * 1024 * 1024} files={files} onFilesChange={setFiles}>
          <DropzoneArea className="min-h-32">
            <DropzoneIcon />
            <DropzoneTitle />
            <DropzoneDescription />
          </DropzoneArea>
          <DropzoneRejections />
          <DropzoneList>
            {(file) => {
              const s = status.get(file)
              return <DropzoneItem file={file} status={s?.state ?? "idle"} progress={s?.progress} error={s?.state === "error" ? "The upload failed. Remove it and try again." : undefined} />
            }}
          </DropzoneList>
        </Dropzone>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t">
        <p className="font-hand text-sm text-ink-muted" aria-live="polite">
          {files.length === 0 ? "Nothing attached." : busy ? "Sending..." : `${files.length} attached.`}
        </p>
        <Button disabled={files.length === 0 || busy}>Save note</Button>
      </CardFooter>
    </Card>
  )
}
