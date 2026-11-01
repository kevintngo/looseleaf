"use client"

import * as React from "react"

import type { ChatFile, ChatPart, Conversation } from "@/blocks/chat-app/components/chat-app-data"

export type ChatStatus = "ready" | "submitted" | "streaming"

type Step = { wait: number; apply: (parts: ChatPart[]) => ChatPart[] }

function replySteps(script: ChatPart[]): Step[] {
  return script.flatMap((part): Step[] =>
    part.kind === "text"
      ? part.text.split(" ").map((word, k) => ({
          wait: 85,
          apply: (parts) => {
            const last = parts[parts.length - 1]
            return k > 0 && last?.kind === "text" ? [...parts.slice(0, -1), { kind: "text", text: `${last.text} ${word}` }] : [...parts, { kind: "text", text: word }]
          },
        }))
      : [{ wait: 700, apply: (parts) => [...parts, part] }]
  )
}

export function useChatApp(initial: Conversation[], firstId: string, onSend?: (conversationId: string, text: string, files: ChatFile[]) => void) {
  const [conversations, setConversations] = React.useState(initial)
  const [activeId, setActiveId] = React.useState(firstId)
  const [stream, setStream] = React.useState<{ id: string; phase: "submitted" | "streaming" } | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const timers = React.useRef<number[]>([])
  const counter = React.useRef(0)

  const clear = React.useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])
  React.useEffect(() => clear, [clear])

  const stop = React.useCallback(() => {
    clear()
    setStream(null)
  }, [clear])

  const select = React.useCallback(
    (id: string) => {
      if (id === activeId) return
      stop()
      setActiveId(id)
      setAnnounce("")
      setConversations((all) => all.map((c) => (c.id === id && c.unread ? { ...c, unread: 0 } : c)))
    },
    [stop, activeId]
  )

  const send = React.useCallback(
    (text: string, files: ChatFile[] = []) => {
      const convo = conversations.find((c) => c.id === activeId)
      if (!convo) return
      onSend?.(convo.id, text, files)
      const n = counter.current++
      const mine = `me-${n}`
      const theirs = `re-${n}`
      const who = convo.replyFrom
      setConversations((all) =>
        all.map((c) =>
          c.id === activeId
            ? { ...c, time: "now", turns: [...c.turns, { id: mine, from: "me", time: "now", parts: [{ kind: "text", text: text || "(the files)" }], files: files.length ? files : undefined }] }
            : c
        )
      )
      setStream({ id: activeId, phase: "submitted" })
      setAnnounce("")
      const steps = replySteps(convo.reply)
      let at = 700
      timers.current.push(
        window.setTimeout(() => {
          setStream({ id: activeId, phase: "streaming" })
          setConversations((all) => all.map((c) => (c.id === activeId ? { ...c, turns: [...c.turns, { id: theirs, from: "them", who, time: "now", parts: [] }] } : c)))
        }, at)
      )
      steps.forEach((step, i) => {
        at += step.wait
        timers.current.push(
          window.setTimeout(() => {
            setConversations((all) =>
              all.map((c) => (c.id === activeId ? { ...c, turns: c.turns.map((t) => (t.id === theirs ? { ...t, parts: step.apply(t.parts) } : t)) } : c))
            )
            if (i === steps.length - 1) {
              setStream(null)
              setAnnounce(`${convo.name} replied`)
            }
          }, at)
        )
      })
    },
    [conversations, activeId, onSend]
  )

  const status: ChatStatus = stream && stream.id === activeId ? stream.phase : "ready"
  return { conversations, activeId, active: conversations.find((c) => c.id === activeId), status, announce, select, send, stop }
}
