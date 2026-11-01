import * as React from "react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Icon } from "@/components/ui/icon"
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInput,
} from "@/components/ui/prompt-input"

export const meta = {
  title: "With attachments",
  description: "Chips in the row above the text, a file button in the tools, a send that also works with no words when `allowEmpty` is set. Pick a file to add a chip; the remove button takes it away again.",
  layout: "stack" as const,
  stage: "desk" as const,
}

type File = { id: number; name: string; size: string }

function RemoveFile({ name, onRemove }: { name: string; onRemove: () => void }) {
  const { focus } = usePromptInput()
  return (
    <AttachmentAction
      aria-label={`Remove ${name}`}
      onClick={() => {
        onRemove()
        focus()
      }}
    >
      <Icon name="x" />
    </AttachmentAction>
  )
}

export default function Example() {
  const [files, setFiles] = React.useState<File[]>([{ id: 1, name: "field-notes.pdf", size: "2.4 MB" }])
  const pick = React.useRef<HTMLInputElement>(null)
  const next = React.useRef(2)
  return (
    <div className="mx-auto w-full max-w-xl px-2 pb-3">
      <PromptInput seed="attach" allowEmpty={files.length > 0} onSubmit={() => setFiles([])}>
        <PromptInputAttachments>
          {files.map((f) => (
            <Attachment key={f.id} size="sm" seed={f.name}>
              <AttachmentMedia>
                <Icon name="file-text" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{f.name}</AttachmentTitle>
                <AttachmentDescription>{f.size}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <RemoveFile name={f.name} onRemove={() => setFiles((all) => all.filter((x) => x.id !== f.id))} />
              </AttachmentActions>
            </Attachment>
          ))}
        </PromptInputAttachments>
        <PromptInputBody>
          <PromptInputTextarea aria-label="Message" placeholder="Say something about them..." />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <input
              ref={pick}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const chosen = Array.from(e.currentTarget.files ?? [])
                setFiles((all) => [...all, ...chosen.map((f) => ({ id: next.current++, name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` }))])
                e.currentTarget.value = ""
              }}
            />
            <PromptInputButton size="icon-sm" aria-label="Attach a file" onClick={() => pick.current?.click()}>
              <Icon name="paperclip" />
            </PromptInputButton>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
