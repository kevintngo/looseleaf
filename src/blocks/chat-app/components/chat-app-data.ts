export type ChatPart =
  | { kind: "text"; text: string }
  | { kind: "tool"; title: string; result: string }
  | { kind: "code"; filename: string; code: string }

export type ChatFile = { name: string; size: string }

export type ChatTurn = {
  id: string
  from: "me" | "them"
  who?: string
  time: string
  parts: ChatPart[]
  files?: ChatFile[]
}

export type Conversation = {
  id: string
  name: string
  kind: "assistant" | "person" | "group"
  subtitle: string
  time: string
  unread: number
  turns: ChatTurn[]
  reply: ChatPart[]
  replyFrom?: string
  attachable: ChatFile[]
}

const DIFF = `-const shown = notes;
+const shown = picked.size
+  ? notes.filter((n) => n.tags.some((t) => picked.has(t)))
+  : notes;`

export const CONVERSATIONS: Conversation[] = [
  {
    id: "stubby",
    name: "Stubby",
    kind: "assistant",
    subtitle: "the pencil stub, writing with you",
    time: "9:43",
    unread: 0,
    turns: [
      { id: "s0", from: "them", time: "9:40", parts: [{ kind: "text", text: "Good morning. What are we making?" }] },
      {
        id: "s1",
        from: "me",
        time: "9:41",
        parts: [{ kind: "text", text: "Can you add tags to my notes, and a filter row above the list?" }],
        files: [{ name: "field-notes.pdf", size: "2.4 MB" }],
      },
      {
        id: "s2",
        from: "them",
        time: "9:41",
        parts: [
          { kind: "text", text: "I read src/notes/list.tsx first. Tags become a string array on Note, and the chips sit in a row above the list." },
          { kind: "tool", title: "ran npm test", result: "12 passed" },
          { kind: "code", filename: "src/notes/filter.ts", code: DIFF },
          { kind: "text", text: "Try #recipes first: the list narrows to the notes that carry it, and the count at the top stays honest." },
        ],
      },
    ],
    reply: [
      { kind: "text", text: "Good catch. The count came from the unfiltered list, so it lied for one render. I moved it below the filter." },
      { kind: "tool", title: "ran npm test", result: "14 passed" },
      { kind: "text", text: "Twelve notes, eleven shown, and the number agrees with the page now." },
    ],
    attachable: [
      { name: "tags-list.tsx", size: "4 KB" },
      { name: "recipes.csv", size: "18 KB" },
      { name: "harbour.jpg", size: "1.8 MB" },
    ],
  },
  {
    id: "nell",
    name: "Nell Okafor",
    kind: "person",
    subtitle: "letterpress, mostly",
    time: "9:05",
    unread: 2,
    turns: [
      { id: "n0", from: "them", time: "8:52", parts: [{ kind: "text", text: "did you see the proofs? the blue is almost right" }] },
      { id: "n1", from: "me", time: "8:58", parts: [{ kind: "text", text: "Almost is doing a lot of work in that sentence." }] },
      {
        id: "n2",
        from: "them",
        time: "9:05",
        parts: [{ kind: "text", text: "it is. bringing the good tape on saturday, and the small guillotine" }],
        files: [{ name: "proofs-saturday.pdf", size: "812 KB" }],
      },
    ],
    reply: [{ kind: "text", text: "Saturday, ten o'clock. I will save you the stool by the window." }],
    attachable: [{ name: "blue-swatch.jpg", size: "640 KB" }],
  },
  {
    id: "club",
    name: "Tuesday club",
    kind: "group",
    subtitle: "Nell, Mo, Ines and 2 more",
    time: "Tue",
    unread: 0,
    turns: [
      { id: "c0", from: "them", who: "Mo", time: "18:20", parts: [{ kind: "text", text: "The proofs are drying on the line. Come and look." }] },
      { id: "c1", from: "them", who: "Ines", time: "18:24", parts: [{ kind: "text", text: "Photo or it did not happen." }] },
      { id: "c2", from: "me", time: "18:31", parts: [{ kind: "text", text: "On my way, with biscuits." }] },
    ],
    reply: [{ kind: "text", text: "Biscuits get you the stool by the window. Nell says hello." }],
    replyFrom: "Mo",
    attachable: [{ name: "drying-line.jpg", size: "2.1 MB" }],
  },
  {
    id: "jo",
    name: "Jo Delacroix",
    kind: "person",
    subtitle: "paper supplier, very patient",
    time: "Mon",
    unread: 0,
    turns: [
      {
        id: "j0",
        from: "them",
        time: "11:02",
        parts: [{ kind: "text", text: "Sent you the receipt for the paper order. Twelve reams, one damaged corner, no charge." }],
        files: [{ name: "receipt-0925.pdf", size: "96 KB" }],
      },
      { id: "j1", from: "me", time: "11:10", parts: [{ kind: "text", text: "Thank you! Paid on my side." }] },
    ],
    reply: [{ kind: "text", text: "Lovely. I put a sheet of the good stock in the box for you." }],
    attachable: [{ name: "order-list.csv", size: "3 KB" }],
  },
  {
    id: "mum",
    name: "Mum",
    kind: "person",
    subtitle: "always has the kettle on",
    time: "Sun",
    unread: 1,
    turns: [{ id: "m0", from: "them", time: "16:40", parts: [{ kind: "text", text: "Call me when you land? No rush, the kettle is on." }] }],
    reply: [{ kind: "text", text: "Lovely. The kettle is still on." }],
    attachable: [{ name: "boarding-pass.pdf", size: "120 KB" }],
  },
]

export function snippet(c: Conversation): string {
  const last = c.turns[c.turns.length - 1]
  if (!last) return "Nothing written yet"
  const text = [...last.parts].reverse().find((p) => p.kind === "text")
  const line = text && text.kind === "text" ? text.text : last.files?.[0]?.name ?? "An attachment"
  const who = last.from === "me" ? "You: " : last.who ? `${last.who}: ` : ""
  return who + line
}
