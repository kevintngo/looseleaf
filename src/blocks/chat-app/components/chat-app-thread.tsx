"use client"

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
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent } from "@/components/ui/marker"
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
import { ChatAppFace } from "@/blocks/chat-app/components/chat-app-face"
import type { ChatFile, ChatPart, ChatTurn, Conversation } from "@/blocks/chat-app/components/chat-app-data"
import type { ChatStatus } from "@/blocks/chat-app/components/chat-app-state"
import { cn } from "@/lib/utils"

function FileChip({ file, children }: { file: ChatFile; children?: React.ReactNode }) {
  return (
    <Attachment size="sm" seed={file.name}>
      <AttachmentMedia>
        <Icon name="file-text" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        <AttachmentDescription>{file.size}</AttachmentDescription>
      </AttachmentContent>
      {children}
    </Attachment>
  )
}

function ToolNote({ title, result }: { title: string; result: string }) {
  return (
    <Bubble shape="note" variant="muted" className="max-w-full">
      <BubbleContent className="flex items-center gap-2 px-4 py-2 font-type text-sm leading-snug" paper={{ tilt: -0.7, curl: false }}>
        <Icon name="terminal" size={14} />
        <span>{title}</span>
        <span className="font-bold text-green">{result}</span>
      </BubbleContent>
    </Bubble>
  )
}

function Parts({ turn, conversation, live }: { turn: ChatTurn; conversation: Conversation; live: boolean }) {
  const prose = conversation.kind === "assistant"
  return (
    <>
      {turn.parts.map((p: ChatPart, i) => {
        if (p.kind === "tool") return <ToolNote key={i} title={p.title} result={p.result} />
        if (p.kind === "code") return <CodeBlock key={i} diff language="ts" filename={p.filename} code={p.code} seed={`${turn.id}-${i}`} className="mt-1" />
        return (
          <Bubble key={i} variant={prose ? "ghost" : "muted"} className="max-w-full">
            <BubbleContent seed={`${turn.id}-${i}`}>
              <MessageText streaming={live && i === turn.parts.length - 1} seed={`${turn.id}-${i}`}>
                {p.text}
              </MessageText>
            </BubbleContent>
          </Bubble>
        )
      })}
    </>
  )
}

function TurnView({ turn, conversation, live }: { turn: ChatTurn; conversation: Conversation; live: boolean }) {
  if (turn.from === "me") {
    const first = turn.parts[0]
    return (
      <Message align="end">
        <MessageContent>
          <MessageHeader className="justify-end">you · {turn.time}</MessageHeader>
          <Bubble variant="outline" pen="you">
            <BubbleContent seed={turn.id}>{first?.kind === "text" ? first.text : ""}</BubbleContent>
          </Bubble>
          {turn.files ? (
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              {turn.files.map((f) => (
                <FileChip key={f.name} file={f} />
              ))}
            </div>
          ) : null}
        </MessageContent>
      </Message>
    )
  }
  const name = turn.who ?? conversation.name
  return (
    <Message>
      <MessageAvatar>
        <ChatAppFace conversation={conversation} name={name} size={conversation.kind === "assistant" ? 36 : 32} />
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          {name} · {turn.time}
        </MessageHeader>
        <Parts turn={turn} conversation={conversation} live={live} />
        {turn.files ? (
          <div className="flex flex-wrap gap-3 pt-2">
            {turn.files.map((f) => (
              <FileChip key={f.name} file={f} />
            ))}
          </div>
        ) : null}
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

type Props = {
  conversation: Conversation
  status: ChatStatus
  announce: string
  onSend: (text: string, files: ChatFile[]) => void
  onStop: () => void
  onBack: () => void
  className?: string
}

export function ChatAppThread({ conversation, status, announce, onSend, onStop, onBack, className }: Props) {
  const [files, setFiles] = React.useState<ChatFile[]>([])
  const heading = React.useId()
  const busy = status !== "ready"
  const attachable = conversation.attachable

  return (
    <Paper
      as="section"
      stock="card"
      tilt={0.25}
      tape="top"
      tapeKind="washi-dots"
      seed="chat-thread"
      aria-labelledby={heading}
      data-slot="chat-app-thread"
      className={cn("flex min-h-0 flex-col pt-5 pb-3", className)}
    >
      <header className="flex items-center gap-3 px-4 pb-2 sm:px-6">
        <Button variant="ghost" size="icon-sm" className="@3xl/chat:hidden" onClick={onBack} aria-label="Back to chats">
          <Icon name="arrow-left" className="rtl:-scale-x-100" />
        </Button>
        <ChatAppFace conversation={conversation} size={40} />
        <div className="min-w-0">
          <h2 id={heading} tabIndex={-1} className="truncate font-script text-[1.7rem] leading-none font-semibold outline-offset-4 focus-visible:outline-2 focus-visible:outline-focus">
            {conversation.name}
          </h2>
          <p className="truncate text-sm text-muted-foreground">{conversation.subtitle}</p>
        </div>
      </header>

      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport aria-label={`Messages with ${conversation.name}`}>
            <MessageScrollerContent aria-live={busy ? "off" : undefined}>
              <Marker variant="separator">
                <MarkerContent>Today</MarkerContent>
              </Marker>
              {conversation.turns.map((t, i) => (
                <MessageScrollerItem key={t.id} messageId={t.id} scrollAnchor={t.from === "me"}>
                  <TurnView turn={t} conversation={conversation} live={status === "streaming" && i === conversation.turns.length - 1 && t.from === "them"} />
                </MessageScrollerItem>
              ))}
              {status === "submitted" ? (
                <MessageScrollerItem messageId="typing">
                  <Message>
                    <MessageContent>
                      <Bubble variant="muted">
                        <BubbleContent seed="typing">
                          <TypingIndicator variant={conversation.kind === "assistant" ? "squiggle" : "dots"} label={`${conversation.replyFrom ?? conversation.name} is writing a reply`} seed="typing" />
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
        <PromptInput
          seed="chat-composer"
          status={status}
          allowEmpty={files.length > 0}
          onStop={onStop}
          onSubmit={(text) => {
            onSend(text, files)
            setFiles([])
          }}
        >
          <PromptInputAttachments>
            {files.map((f) => (
              <FileChip key={f.name} file={f}>
                <AttachmentActions>
                  <RemoveFile name={f.name} onRemove={() => setFiles((all) => all.filter((x) => x.name !== f.name))} />
                </AttachmentActions>
              </FileChip>
            ))}
          </PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea aria-label={`Message ${conversation.name}`} placeholder="write something kind" />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputButton
                size="icon-sm"
                aria-label="Attach a file"
                disabled={files.length >= attachable.length}
                onClick={() => setFiles((all) => (all.length < attachable.length ? [...all, attachable[all.length]] : all))}
              >
                <Icon name="paperclip" />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputHint className="@max-3xl/chat:sr-only">{busy ? "Press stop to interrupt" : "Enter to send, Shift+Enter for a new line"}</PromptInputHint>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </Paper>
  )
}
