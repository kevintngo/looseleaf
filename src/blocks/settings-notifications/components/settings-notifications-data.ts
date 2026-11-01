export type Mode = "all" | "mentions" | "nothing"
export type Channel = "email" | "push" | "app"

export const CHANNELS: { id: Channel; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "push", label: "Push" },
  { id: "app", label: "In the app" },
]

export const EVENTS: { id: string; label: string; help: string; personal: boolean }[] = [
  { id: "comments", label: "Comments on my notes", help: "Someone wrote in your margin.", personal: true },
  { id: "replies", label: "Replies to my questions", help: "An answer to something you asked.", personal: true },
  { id: "follows", label: "New followers", help: "A person started reading your notebooks.", personal: false },
  { id: "shared", label: "Notebooks shared with me", help: "Someone handed you a notebook.", personal: false },
  { id: "news", label: "News from Looseleaf", help: "New pens, about once a month.", personal: false },
]

export const MODES: { id: Mode; title: string; help: string }[] = [
  { id: "all", title: "Everything", help: "Every comment, reply, follower and shared notebook." },
  { id: "mentions", title: "Just me", help: "Only replies to you and comments on your own notes." },
  { id: "nothing", title: "Nothing", help: "Mute it all. Quiet hours and the weekly summary switch off too." },
]

export const DAYS = [
  { id: "mon", label: "Monday", short: "M" },
  { id: "tue", label: "Tuesday", short: "T" },
  { id: "wed", label: "Wednesday", short: "W" },
  { id: "thu", label: "Thursday", short: "T" },
  { id: "fri", label: "Friday", short: "F" },
  { id: "sat", label: "Saturday", short: "S" },
  { id: "sun", label: "Sunday", short: "S" },
]

export type Prefs = {
  mode: Mode
  on: Record<string, Channel[]>
  quiet: { on: boolean; from: string; to: string; days: string[] }
  summary: { day: string; tally: boolean }
}

export const DEFAULT_PREFS: Prefs = {
  mode: "all",
  on: {
    comments: ["email", "push", "app"],
    replies: ["email", "push", "app"],
    follows: ["app"],
    shared: ["email", "app"],
    news: [],
  },
  quiet: { on: true, from: "22:00", to: "07:30", days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
  summary: { day: "fri", tally: true },
}

export const TIMES: { value: string; label: string }[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 ? "30" : "00"
  const twelve = h % 12 === 0 ? 12 : h % 12
  return { value: `${String(h).padStart(2, "0")}:${m}`, label: `${twelve}:${m} ${h < 12 ? "am" : "pm"}` }
})

export const rowEnabled = (mode: Mode, personal: boolean): boolean => mode === "all" || (mode === "mentions" && personal)

export type Problems = { channels?: string; quiet?: string }

export function validate(p: Prefs): Problems {
  const out: Problems = {}
  const reachable = EVENTS.some((e) => rowEnabled(p.mode, e.personal) && (p.on[e.id]?.length ?? 0) > 0)
  if (p.mode !== "nothing" && !reachable) out.channels = "You asked to hear about things, but every box is empty. Tick at least one."
  if (p.mode !== "nothing" && p.quiet.on) {
    if (p.quiet.from === p.quiet.to) out.quiet = "Quiet hours need two different times."
    else if (p.quiet.days.length === 0) out.quiet = "Pick at least one day for quiet hours."
  }
  return out
}
