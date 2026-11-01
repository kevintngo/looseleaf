import * as React from "react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Placeholder frame",
  description:
    "`border` in `className` asks for the sketched dashed frame, with a tick at each corner where the hand marked out the rectangle first. It replaces the CSS border. Here it is a working drop target: drag files over it (it lights up), or use the button; a doodle is the media, and `doodle` takes any name from the Doodle component.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 400,
}

export default function Example() {
  const [files, setFiles] = React.useState<File[]>([])
  const [over, setOver] = React.useState(false)
  const picker = React.useRef<HTMLInputElement>(null)
  const take = (list: FileList | null) => {
    if (list?.length) setFiles(Array.from(list))
  }
  return (
    <Paper stock="paper" tape="top" tapeKind="washi-dots" seed="drop" className="w-full max-w-lg p-5">
      <Empty
        seed="dropzone"
        className="border transition-colors duration-(--ll-dur-fade) data-[over]:bg-hi-select/40"
        data-over={over ? "" : undefined}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          take(e.dataTransfer.files)
        }}
      >
        <EmptyHeader>
          <EmptyMedia doodle="paper-plane" size={88} />
          <EmptyTitle>{files.length ? "Ready to send" : "Drop files here"}</EmptyTitle>
          <EmptyDescription aria-live="polite">
            {files.length ? files.map((f) => f.name).join(", ") : "or choose them from your computer. PNG, JPG or PDF, up to 10 MB."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <input ref={picker} type="file" multiple hidden onChange={(e) => take(e.target.files)} />
          <Button type="button" onClick={() => picker.current?.click()}>
            <Icon name="upload" />
            {files.length ? "Choose others" : "Choose files"}
          </Button>
        </EmptyContent>
      </Empty>
    </Paper>
  )
}
