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
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { CodeBlock } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { Mascot } from "@/components/ui/mascot"
import { Message, MessageAvatar, MessageContent, MessageHeader, MessageText } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Paper } from "@/components/ui/paper"
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHint,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInput,
} from "@/components/ui/prompt-input"
import { TypingIndicator } from "@/components/ui/typing-indicator"

export const meta = {
  title: "A whole chat",
  description:
    "Everything at once: a transcript that pins your message and follows the reply, streaming words that soak in, a tool-call note, a code slip with a diff, attachments, a typing pencil, day markers, and the composer with its paper plane and stop button.",
  layout: "full" as const,
  stage: "desk" as const,
  height: 780,
}

type File = { name: string; size: string }
type Part =
  | { kind: "text"; text: string }
  | { kind: "tool"; title: string; result: string }
  | { kind: "code"; filename: string; code: string }
type Turn = { id: string; role: "user" | "assistant"; parts: Part[]; files?: File[]; time: string }

const DIFF = `-const shown = notes;
+const shown = picked.size
+  ? notes.filter((n) => n.tags.some((t) => picked.has(t)))
+  : notes;`

const SCRIPT: Part[] = [
  { kind: "text", text: "I read src/notes/list.tsx first. Tags become a string array on Note, and the chips sit in a row above the list." },
  { kind: "tool", title: "ran npm test", result: "12 passed" },
  { kind: "code", filename: "src/notes/filter.ts", code: DIFF },
  { kind: "text", text: "Try #recipes first: the list narrows to the notes that carry it, and the count at the top stays honest." },
]

const START: Turn[] = [
  { id: "a0", role: "assistant", time: "9:40", parts: [{ kind: "text", text: "Good morning. What are we making?" }] },
  { id: "u1", role: "user", time: "9:41", parts: [{ kind: "text", text: "Can you add tags to my notes, and a filter row above the list?" }], files: [{ name: "field-notes.pdf", size: "2.4 MB" }] },
  { id: "a1", role: "assistant", time: "9:41", parts: SCRIPT },
]

type Step = { wait: number; apply: (parts: Part[]) => Part[] }
const steps = (): Step[] =>
  SCRIPT.flatMap((p): Step[] =>
    p.kind === "text"
      ? p.text.split(" ").map((word, k) => ({
          wait: 85,
          apply: (parts) => {
            const last = parts[parts.length - 1]
            return k > 0 && last?.kind === "text" ? [...parts.slice(0, -1), { kind: "text", text: `${last.text} ${word}` }] : [...parts, { kind: "text", text: word }]
          },
        }))
      : [{ wait: 700, apply: (parts) => [...parts, p] }]
  )

function ToolNote({ title, result }: { title: string; result: string }) {
  return (
    <Bubble shape="note" variant="muted" className="max-w-full">
      <BubbleContent className="flex items-center gap-2 px-4 py-2 font-type text-[13px] leading-snug" paper={{ tilt: -0.7, curl: false }}>
        <Icon name="terminal" size={14} />
        <span>{title}</span>
        <span className="font-bold text-green">{result}</span>
      </BubbleContent>
    </Bubble>
  )
}

function Files({ files }: { files: File[] }) {
  return (
    <div className="flex flex-wrap justify-end gap-3 pt-2">
      {files.map((f) => (
        <Attachment key={f.name} size="sm" seed={f.name}>
          <AttachmentMedia>
            <Icon name="file-text" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{f.name}</AttachmentTitle>
            <AttachmentDescription>{f.size}</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </div>
  )
}

function TurnView({ turn, live }: { turn: Turn; live: boolean }) {
  if (turn.role === "user")
    return (
      <Message align="end">
        <MessageContent>
          <MessageHeader className="justify-end">you · {turn.time}</MessageHeader>
          <Bubble variant="outline" pen="you">
            <BubbleContent seed={turn.id}>{turn.parts[0].kind === "text" ? turn.parts[0].text : ""}</BubbleContent>
          </Bubble>
          {turn.files ? <Files files={turn.files} /> : null}
        </MessageContent>
      </Message>
    )
  return (
    <Message>
      <MessageAvatar>
        <Mascot pose={live ? "write" : "idle"} size={36} seed="stubby" />
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>Stubby · {turn.time}</MessageHeader>
        {turn.parts.map((p, i) =>
          p.kind === "text" ? (
            <Bubble key={i} variant="ghost" className="max-w-full">
              <BubbleContent>
                <MessageText streaming={live && i === turn.parts.length - 1} seed={`${turn.id}-${i}`}>
                  {p.text}
                </MessageText>
              </BubbleContent>
            </Bubble>
          ) : p.kind === "tool" ? (
            <ToolNote key={i} title={p.title} result={p.result} />
          ) : (
            <CodeBlock key={i} diff language="ts" filename={p.filename} code={p.code} seed={`${turn.id}-${i}`} className="mt-3" />
          )
        )}
      </MessageContent>
    </Message>
  )
}

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

const FILES: File[] = [
  { name: "tags-list.tsx", size: "4 KB" },
  { name: "recipes.csv", size: "18 KB" },
  { name: "harbour.jpg", size: "1.8 MB" },
]

export default function Example() {
  const [turns, setTurns] = React.useState<Turn[]>(START)
  const [status, setStatus] = React.useState<"ready" | "submitted" | "streaming">("ready")
  const [files, setFiles] = React.useState<File[]>([])
  const [announce, setAnnounce] = React.useState("")
  const timers = React.useRef<number[]>([])
  const counter = React.useRef(2)
  const stop = React.useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setStatus("ready")
  }, [])
  React.useEffect(() => stop, [stop])

  const send = (text: string) => {
    const n = counter.current++
    const attached = files
    setFiles([])
    setTurns((t) => [...t, { id: `u${n}`, role: "user", time: "now", parts: [{ kind: "text", text: text || "(the files)" }], files: attached.length ? attached : undefined }])
    setStatus("submitted")
    setAnnounce("")
    const list = steps()
    let at = 700
    timers.current.push(
      window.setTimeout(() => {
        setStatus("streaming")
        setTurns((t) => [...t, { id: `a${n}`, role: "assistant", time: "now", parts: [] }])
      }, at)
    )
    list.forEach((s, i) => {
      at += s.wait
      timers.current.push(
        window.setTimeout(() => {
          setTurns((t) => t.map((x, k) => (k === t.length - 1 ? { ...x, parts: s.apply(x.parts) } : x)))
          if (i === list.length - 1) {
            setStatus("ready")
            setAnnounce("Stubby replied")
          }
        }, at)
      )
    })
  }
  const busy = status !== "ready"

  return (
    <div className="mx-auto flex h-[740px] w-full max-w-2xl flex-col">
      <Paper stock="card" tilt={false} className="flex min-h-0 flex-1 flex-col pt-4 pb-3">
        <div className="flex items-center gap-3 px-6 pb-2">
          <Mascot pose="idle" size={32} seed="header" />
          <h3 className="m-0 font-script text-[1.7rem] leading-none font-semibold">field-notes</h3>
          <span className="text-sm text-muted-foreground">on feature/tags</span>
        </div>
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent aria-live={busy ? "off" : undefined}>
                <Marker variant="separator">
                  <MarkerContent>Today</MarkerContent>
                </Marker>
                {turns.map((t, i) => (
                  <MessageScrollerItem key={t.id} messageId={t.id} scrollAnchor={t.role === "user"}>
                    <TurnView turn={t} live={busy && i === turns.length - 1 && t.role === "assistant"} />
                  </MessageScrollerItem>
                ))}
                {status === "submitted" ? (
                  <MessageScrollerItem messageId="typing">
                    <Message>
                      <MessageContent>
                        <Bubble variant="muted">
                          <BubbleContent seed="typing">
                            <TypingIndicator variant="squiggle" label="Stubby is writing a reply" seed="typing" />
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ) : null}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
        <p role="status" className="sr-only">
          {announce}
        </p>
        <div className="px-3 pt-1">
          <PromptInput seed="chat" status={status} onSubmit={send} onStop={stop} allowEmpty={files.length > 0}>
            <PromptInputAttachments>
              {files.map((f) => (
                <Attachment key={f.name} size="sm" seed={f.name}>
                  <AttachmentMedia>
                    <Icon name="file-text" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{f.name}</AttachmentTitle>
                    <AttachmentDescription>{f.size}</AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <RemoveFile name={f.name} onRemove={() => setFiles((all) => all.filter((x) => x.name !== f.name))} />
                  </AttachmentActions>
                </Attachment>
              ))}
            </PromptInputAttachments>
            <PromptInputBody>
              <PromptInputTextarea aria-label="Message" />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputButton
                  size="icon-sm"
                  aria-label="Attach a file"
                  disabled={files.length >= FILES.length}
                  onClick={() => setFiles((all) => (all.length < FILES.length ? [...all, FILES[all.length]] : all))}
                >
                  <Icon name="paperclip" />
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputHint>{busy ? "Press stop to interrupt" : "Enter to send"}</PromptInputHint>
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </Paper>
    </div>
  )
}
