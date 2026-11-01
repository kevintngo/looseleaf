import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentProgress,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"

export const meta = {
  title: "A live upload",
  description: "Progress is a CSS variable: the hatched fill is drawn once and clipped to the value, so a fast upload never redraws anything. The finished slip gets its clip and becomes pressable.",
  layout: "stack" as const,
}

export default function Example() {
  const [value, setValue] = React.useState(0)
  const [run, setRun] = React.useState(0)
  React.useEffect(() => {
    setValue(0)
    const id = window.setInterval(() => setValue((v) => (v >= 100 ? v : Math.min(100, v + 7))), 220)
    return () => window.clearInterval(id)
  }, [run])
  const done = value >= 100
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-start gap-4 px-4 pt-3 pb-4">
      <Attachment state={done ? "done" : "uploading"} seed="live" className="w-full">
        <AttachmentMedia>
          <Icon name="file-code" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>tags-list.tsx</AttachmentTitle>
          <AttachmentDescription>{done ? "Uploaded" : `Uploading ${value} %`}</AttachmentDescription>
          {done ? null : <AttachmentProgress value={value} aria-label="Upload progress" />}
        </AttachmentContent>
        {done ? <AttachmentTrigger aria-label="Open tags-list.tsx" onClick={() => setRun((r) => r + 1)} /> : null}
        <AttachmentActions>
          <AttachmentAction aria-label={done ? "Remove tags-list.tsx" : "Cancel upload"}>
            <Icon name="x" />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Button variant="ghost" size="sm" onClick={() => setRun((r) => r + 1)}>
        Upload again
      </Button>
    </div>
  )
}
